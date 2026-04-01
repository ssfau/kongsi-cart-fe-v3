import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ArrowLeft, MapPin, TrendingUp, Users, Leaf, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { shopItemCategories } from "@/data/shopItems";
import { fakeListings } from "@/data/fakeListings";
import { produceImages } from "@/assets/produce";
import { useUserLocation } from "@/hooks/useUserLocation";
import { getListingCoords, getDistanceKm } from "@/data/locationCoordinates";
import api from "@/lib/axios";
import ItemDetail from "@/components/dashboard/ItemDetail";
import type { ListingItem } from "@/components/dashboard/ShopPage";

const Explore = () => {
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const userLocation = useUserLocation();
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ListingItem | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);
  const [showSearchArea, setShowSearchArea] = useState(false);
  const [useMapFilter, setUseMapFilter] = useState(false);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await api.get("/listings");
        const enriched = response.data.data.map((item: ListingItem) => ({
          ...item,
          state: item.state || "Unspecified Location",
          district: item.district || "Unspecified District",
          collectionPoint: item.collectionPoint || "Main Hub",
          currentDemand: item.currentDemand || Math.floor(Math.random() * 100),
          targetDemand: item.targetDemand || 100,
        }));
        setListings(enriched);
      } catch {
        setListings(fakeListings);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  const enrichedListings = useMemo(() => {
    return listings
      .map((item) => {
        const coords = getListingCoords(item.district, item.state);
        const distance = getDistanceKm(userLocation.lat, userLocation.lng, coords.lat, coords.lng);
        return { ...item, _distance: distance, _coords: coords };
      })
      .sort((a, b) => a._distance - b._distance);
  }, [listings, userLocation.lat, userLocation.lng]);

  const visibleListings = useMemo(() => {
    if (!useMapFilter || !mapBounds) return enrichedListings;
    return enrichedListings.filter((item) =>
      mapBounds.contains(L.latLng(item._coords.lat, item._coords.lng))
    );
  }, [enrichedListings, mapBounds, useMapFilter]);

  const handleSearchArea = useCallback(() => {
    if (!mapInstance.current) return;
    setMapBounds(mapInstance.current.getBounds());
    setUseMapFilter(true);
    setShowSearchArea(false);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || loading) return;

    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    const map = L.map(mapRef.current, {
      center: [userLocation.lat, userLocation.lng],
      zoom: 11,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    // User marker
    const userIcon = L.divIcon({
      className: "",
      html: `<div style="position:relative;width:18px;height:18px;">
        <div style="position:absolute;inset:0;background:hsl(90,55%,51%);border-radius:50%;border:2px solid white;z-index:2;"></div>
        <div style="position:absolute;inset:-10px;background:hsl(90,55%,51%,0.25);border-radius:50%;animation:explorePulse 2s infinite;"></div>
      </div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });
    L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map);

    // Product markers
    enrichedListings.forEach((item) => {
      const img = produceImages[item.category] || "";
      const blobIcon = L.divIcon({
        className: "",
        html: `<div style="
          width:52px;height:52px;border-radius:50%;overflow:hidden;
          border:3px solid hsl(90,55%,51%);
          box-shadow:0 0 16px hsl(90,55%,51%,0.4);
          background:#222;cursor:pointer;
          transition:transform 0.2s;
        " onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">
          ${img ? `<img src="${img}" style="width:100%;height:100%;object-fit:cover;" />` : `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:white;font-size:24px;">🥬</div>`}
        </div>`,
        iconSize: [52, 52],
        iconAnchor: [26, 26],
      });

      const marker = L.marker([item._coords.lat, item._coords.lng], { icon: blobIcon }).addTo(map);
      marker.on("click", () => {
        setHighlightedId(item._id);
        const el = itemRefs.current[item._id];
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });

    map.on("moveend", () => {
      setShowSearchArea(true);
    });

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [loading, enrichedListings, userLocation.lat, userLocation.lng]);

  if (selectedItem) {
    return <ItemDetail item={selectedItem} onBack={() => setSelectedItem(null)} />;
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card shrink-0 z-10">
        <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <MapPin className="h-4 w-4 text-primary" />
        <h1 className="text-base font-bold text-foreground">Explore Nearby</h1>
        <Badge variant="outline" className="ml-auto text-[10px] border-primary/30 text-primary">
          {visibleListings.length} listings
        </Badge>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Map — 70% */}
        <div className="relative flex-[7]">
          <div ref={mapRef} className="w-full h-full" style={{ zIndex: 0 }} />

          {showSearchArea && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]">
              <Button
                onClick={handleSearchArea}
                size="sm"
                className="rounded-full shadow-lg kongsi-gradient text-white border-0 gap-1.5 px-5"
              >
                <Search className="h-3.5 w-3.5" /> Search this area
              </Button>
            </div>
          )}

          <style>{`
            @keyframes explorePulse {
              0%, 100% { transform: scale(1); opacity: 0.5; }
              50% { transform: scale(2); opacity: 0; }
            }
          `}</style>
        </div>

        {/* Sidebar — 30% */}
        <div className="flex-[3] border-l border-border bg-card flex flex-col">
          <div className="px-4 py-3 border-b border-border/50">
            <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
              <MapPin className="h-3 w-3" />
              Sorted by: Closest to You
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
                ))
              ) : visibleListings.length === 0 ? (
                <div className="text-center py-12">
                  <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No listings in this area</p>
                </div>
              ) : (
                visibleListings.map((item) => {
                  const categoryData = shopItemCategories.find((c) => c.name === item.category);
                  const displayName = categoryData?.displayName || item.itemName;
                  const demandPercent = item.currentDemand
                    ? Math.min(100, (item.currentDemand / (item.targetDemand || 100)) * 100)
                    : 0;
                  const isHighlighted = highlightedId === item._id;

                  return (
                    <div
                      key={item._id}
                      ref={(el) => { itemRefs.current[item._id] = el; }}
                      onClick={() => setSelectedItem(item)}
                      className={`flex gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-300 ${
                        isHighlighted
                          ? "border-primary bg-primary/10 shadow-md ring-1 ring-primary/30"
                          : "border-border/50 hover:border-primary/30 hover:bg-muted/30"
                      }`}
                    >
                      <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-border/50">
                        {produceImages[item.category] ? (
                          <img src={produceImages[item.category]} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">🥬</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {item._distance.toFixed(1)}km
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Leaf className="h-2.5 w-2.5 text-primary" />
                          {item.companyName || "Independent Seller"}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs font-bold text-foreground">
                            RM {item.depositPerUnit.toFixed(2)}/kg
                          </span>
                          <span className="text-[10px] text-muted-foreground line-through">
                            RM {item.estimatedPriceMax.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Progress value={demandPercent} className="h-1 flex-1" />
                          <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                            <Users className="h-2 w-2" /> {Math.round(demandPercent)}%
                          </span>
                        </div>

                        {isHighlighted && (
                          <Button
                            size="sm"
                            className="mt-2 h-7 text-[10px] rounded-lg kongsi-gradient text-white border-0 w-full font-bold"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedItem(item);
                            }}
                          >
                            Join Pool — RM {item.depositPerUnit.toFixed(2)}/kg
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default Explore;
