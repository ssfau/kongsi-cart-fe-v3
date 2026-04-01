import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ArrowLeft, MapPin, TrendingUp, Users, Leaf, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface EnrichedItem extends ListingItem {
  _distance: number;
  _coords: { lat: number; lng: number };
}

interface LocationGroup {
  key: string;
  lat: number;
  lng: number;
  items: EnrichedItem[];
}

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
  const [searchQuery, setSearchQuery] = useState("");
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await api.get("/listings");
        console.log("Explore API Raw Response:", response.data);
        const rawData = Array.isArray(response.data) ? response.data : (response.data?.data || response.data?.listings || []);
        console.log("Explore API Parsed Data:", rawData);
        if (!Array.isArray(rawData) || rawData.length === 0) {
          throw new Error("No listings from backend");
        }
        const enriched = rawData.map((item: any) => ({
          _id: item._id || item.id || crypto.randomUUID(),
          category: item.category || "Tomato",
          itemName: item.itemName || item.name || item.title || item.category || "Fresh Produce",
          companyName: item.companyName || item.company_name,
          depositPerUnit: Number(item.depositPerUnit ?? item.deposit_per_unit ?? 0),
          estimatedPriceMax: Number(item.estimatedPriceMax ?? item.estimated_price_max ?? 0),
          state: item.state || "Unspecified Location",
          district: item.district || "Unspecified District",
          collectionPoint: item.collectionPoint || item.collection_point || "Main Hub",
          currentDemand: item.currentDemand ?? item.current_demand ?? Math.floor(Math.random() * 100),
          targetDemand: item.targetDemand ?? item.target_demand ?? 100,
        }));
        console.log("Explore API Enriched Listings:", enriched);
        setListings(enriched);
      } catch (err) {
        console.error("Explore API Error:", err);
        setListings(fakeListings);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  const enrichedListings = useMemo(() => {
    let items = listings;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter((item) => {
        const cat = shopItemCategories.find((c) => c.name === item.category);
        const name = cat?.displayName || item.itemName;
        return (
          name.toLowerCase().includes(q) ||
          item.itemName.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          (item.district || "").toLowerCase().includes(q) ||
          (item.state || "").toLowerCase().includes(q)
        );
      });
    }
    return items
      .map((item) => {
        const coords = getListingCoords(item.district, item.state);
        const distance = getDistanceKm(userLocation.lat, userLocation.lng, coords.lat, coords.lng);
        return { ...item, _distance: distance, _coords: coords } as EnrichedItem;
      })
      .sort((a, b) => a._distance - b._distance);
  }, [listings, userLocation.lat, userLocation.lng, searchQuery]);

  // Group by coordinate key (rounded to ~100m)
  const groups = useMemo(() => {
    const map = new Map<string, LocationGroup>();
    enrichedListings.forEach((item) => {
      const key = `${item._coords.lat.toFixed(3)},${item._coords.lng.toFixed(3)}`;
      if (!map.has(key)) {
        map.set(key, { key, lat: item._coords.lat, lng: item._coords.lng, items: [] });
      }
      map.get(key)!.items.push(item);
    });
    return Array.from(map.values());
  }, [enrichedListings]);

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

  const buildClusterHtml = useCallback((group: LocationGroup) => {
    const { items } = group;

    if (items.length === 1) {
      const img = produceImages[items[0].category] || "";
      return `<div style="width:52px;height:52px;border-radius:50%;overflow:hidden;border:3px solid hsl(90,55%,51%);box-shadow:0 0 16px hsl(90,55%,51%,0.4);background:#222;cursor:pointer;transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">${img ? `<img src="${img}" style="width:100%;height:100%;object-fit:cover;" />` : `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:white;font-size:20px;">?</div>`}</div>`;
    }

    const visible = items.slice(0, Math.min(items.length, 3));
    const overflow = items.length > 4 ? items.length - 3 : 0;
    const showFourth = items.length === 4;
    const totalCircles = visible.length + (overflow > 0 ? 1 : (showFourth ? 1 : 0));
    const circleSize = 32;
    const overlap = 10;
    const totalWidth = circleSize + (totalCircles - 1) * (circleSize - overlap);

    let html = `<div style="display:flex;cursor:pointer;position:relative;width:${totalWidth}px;height:${circleSize}px;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">`;

    visible.forEach((item, i) => {
      const img = produceImages[item.category] || "";
      const left = i * (circleSize - overlap);
      html += `<div style="position:absolute;left:${left}px;top:0;width:${circleSize}px;height:${circleSize}px;border-radius:50%;overflow:hidden;border:2px solid hsl(90,55%,51%);background:#1a1a1a;z-index:${totalCircles - i};">${img ? `<img src="${img}" style="width:100%;height:100%;object-fit:cover;" />` : `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:white;font-size:14px;">?</div>`}</div>`;
    });

    if (overflow > 0) {
      const left = visible.length * (circleSize - overlap);
      html += `<div style="position:absolute;left:${left}px;top:0;width:${circleSize}px;height:${circleSize}px;border-radius:50%;background:hsl(32,93%,54%);border:2px solid white;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:12px;z-index:1;">+${overflow}</div>`;
    } else if (showFourth) {
      const img4 = produceImages[items[3].category] || "";
      const left = visible.length * (circleSize - overlap);
      html += `<div style="position:absolute;left:${left}px;top:0;width:${circleSize}px;height:${circleSize}px;border-radius:50%;overflow:hidden;border:2px solid hsl(90,55%,51%);background:#1a1a1a;z-index:1;">${img4 ? `<img src="${img4}" style="width:100%;height:100%;object-fit:cover;" />` : `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:white;font-size:14px;">?</div>`}</div>`;
    }

    html += `</div>`;
    return html;
  }, []);

  const buildPopupHtml = useCallback((group: LocationGroup) => {
    const location = group.items[0]?.district || group.items[0]?.state || "Collection Point";
    let html = `<div style="min-width:220px;max-width:280px;font-family:system-ui,sans-serif;">
      <div style="font-weight:700;font-size:13px;margin-bottom:6px;color:#222;">${location}</div>
      <div style="font-size:10px;color:#888;margin-bottom:8px;">${group.items.length} Kongsi Pool${group.items.length > 1 ? "s" : ""} available</div>`;

    group.items.forEach((item) => {
      const cat = shopItemCategories.find((c) => c.name === item.category);
      const name = cat?.displayName || item.itemName;
      const demand = item.currentDemand ? Math.min(100, (item.currentDemand / (item.targetDemand || 100)) * 100) : 0;
      html += `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-top:1px solid #eee;">
        <div style="font-size:12px;font-weight:600;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${name}</div>
        <div style="font-size:10px;color:#666;">${Math.round(demand)}%</div>
        <div style="background:hsl(90,55%,51%);color:white;font-size:10px;font-weight:600;padding:2px 8px;border-radius:6px;cursor:pointer;" data-item-id="${item._id}">Join</div>
      </div>`;
    });

    html += `</div>`;
    return html;
  }, []);

  // Initialize map with clustering
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

    // Grouped markers
    groups.forEach((group) => {
      const html = buildClusterHtml(group);
      const isMulti = group.items.length > 1;
      const iconWidth = group.items.length === 1 ? 52 : Math.min(140, 32 + (Math.min(group.items.length, 4) - 1) * 22);
      const iconHeight = group.items.length === 1 ? 52 : 32;

      const icon = L.divIcon({
        className: "",
        html,
        iconSize: [iconWidth, iconHeight],
        iconAnchor: [iconWidth / 2, iconHeight / 2],
      });

      const marker = L.marker([group.lat, group.lng], { icon }).addTo(map);

      if (isMulti) {
        const popup = L.popup({ closeButton: true, className: "kongsi-cluster-popup", maxWidth: 300 })
          .setContent(buildPopupHtml(group));

        marker.bindPopup(popup);
        marker.on("click", () => marker.openPopup());

        marker.on("popupopen", () => {
          const container = marker.getPopup()?.getElement();
          if (container) {
            container.querySelectorAll("[data-item-id]").forEach((btn) => {
              (btn as HTMLElement).addEventListener("click", (e) => {
                e.stopPropagation();
                const id = (btn as HTMLElement).getAttribute("data-item-id");
                const item = group.items.find((i) => i._id === id);
                if (item) setSelectedItem(item);
              });
            });
          }
        });
      } else {
        marker.on("click", () => {
          setHighlightedId(group.items[0]._id);
          const el = itemRefs.current[group.items[0]._id];
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        });
      }
    });

    map.on("moveend", () => {
      setShowSearchArea(true);
    });

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [loading, groups, userLocation.lat, userLocation.lng, buildClusterHtml, buildPopupHtml]);

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

        {/* Search bar */}
        <div className="relative ml-4 flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search produce..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 bg-muted/50 border-none rounded-xl text-xs"
          />
        </div>

        <Badge variant="outline" className="ml-auto text-[10px] border-primary/30 text-primary shrink-0">
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
            .kongsi-cluster-popup .leaflet-popup-content-wrapper {
              border-radius: 12px;
              box-shadow: 0 8px 32px rgba(0,0,0,0.15);
            }
            .kongsi-cluster-popup .leaflet-popup-tip {
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
          `}</style>
        </div>

        {/* Sidebar — 30% */}
        <div className="flex-[3] border-l border-border bg-card flex flex-col">
          <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
              <MapPin className="h-3 w-3" />
              Sorted by: Closest to You
            </div>
            {searchQuery.trim() && (
              <span className="text-[10px] text-accent ml-auto">"{searchQuery}"</span>
            )}
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
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? `No results for "${searchQuery}"` : "No listings in this area"}
                  </p>
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
                          <div className="w-full h-full bg-muted flex items-center justify-center text-sm">?</div>
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
