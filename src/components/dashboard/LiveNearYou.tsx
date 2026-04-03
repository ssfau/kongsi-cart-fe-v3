import { useEffect, useRef, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { produceImages } from "@/assets/produce";
import { shopItemCategories } from "@/data/shopItems";
import { getListingCoords, getDistanceKm } from "@/data/locationCoordinates";
import type { ListingItem } from "./ShopPage";

interface LiveNearYouProps {
  listings: ListingItem[];
  userLat: number;
  userLng: number;
  onExplore: () => void;
  onSelectItem: (item: ListingItem) => void;
}

const LiveNearYou = ({ listings, userLat, userLng, onExplore, onSelectItem }: LiveNearYouProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  const nearby = useMemo(() => {
    return listings
      .map((item) => {
        const coords = getListingCoords(item.district, item.state, item.collectionPoint || item.collection_point);
        const distance = getDistanceKm(userLat, userLng, coords.lat, coords.lng);
        return { ...item, _distance: distance, _coords: coords };
      })
      .sort((a, b) => a._distance - b._distance)
      .slice(0, 4);
  }, [listings, userLat, userLng]);

  const top3 = nearby.slice(0, 3);

  useEffect(() => {
    if (!mapRef.current || nearby.length === 0) return;

    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    const map = L.map(mapRef.current, {
      center: [userLat, userLng],
      zoom: 12,
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    // User location pulse
    const userIcon = L.divIcon({
      className: "",
      html: `<div style="position:relative;width:16px;height:16px;">
        <div style="position:absolute;inset:0;background:hsl(90,55%,51%);border-radius:50%;border:2px solid white;z-index:2;"></div>
        <div style="position:absolute;inset:-8px;background:hsl(90,55%,51%,0.3);border-radius:50%;animation:pulse 2s infinite;"></div>
      </div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
    L.marker([userLat, userLng], { icon: userIcon }).addTo(map);

    // Product blobs
    nearby.forEach((item) => {
      const img = produceImages[item.category] || "";
      const blobIcon = L.divIcon({
        className: "",
        html: `<div style="
          width:44px;height:44px;border-radius:50%;overflow:hidden;
          border:3px solid hsl(90,55%,51%);
          box-shadow:0 0 12px hsl(90,55%,51%,0.5);
          background:#1a1a1a;
          position:relative;
        ">
          ${img ? `<img src="${img}" style="width:100%;height:100%;object-fit:cover;" />` : `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:20px;">🥬</div>`}
          <div style="position:absolute;inset:-6px;border-radius:50%;animation:pulse 3s infinite;border:2px solid hsl(90,55%,51%,0.3);"></div>
        </div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });
      L.marker([item._coords.lat, item._coords.lng], { icon: blobIcon }).addTo(map);
    });

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [nearby, userLat, userLng]);

  if (nearby.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden mb-8">
      <div className="px-6 pt-5 pb-3 flex items-center gap-2">
        <MapPin className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground tracking-tight">Live Near You</h3>
        <span className="text-[10px] text-muted-foreground ml-auto">Within 50km</span>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Map */}
        <div className="md:w-[300px] md:h-[300px] h-[220px] shrink-0 relative">
          <div ref={mapRef} className="w-full h-full" style={{ zIndex: 0 }} />
          {/* Pulse keyframe injection */}
          <style>{`
            @keyframes pulse {
              0%, 100% { transform: scale(1); opacity: 0.6; }
              50% { transform: scale(1.8); opacity: 0; }
            }
          `}</style>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex flex-col p-5 gap-3">
          {top3.map((item) => {
            const categoryData = shopItemCategories.find((c) => c.name === item.category);
            const displayName = categoryData?.displayName || item.itemName;
            const demandPercent = item.currentDemand
              ? Math.min(100, (item.currentDemand / (item.targetDemand || 100)) * 100)
              : 0;

            return (
              <button
                key={item._id}
                onClick={() => onSelectItem(item)}
                className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-primary/30">
                  {produceImages[item.category] ? (
                    <img src={produceImages[item.category]} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-lg">🥬</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <MapPin className="h-2.5 w-2.5" /> {item._distance.toFixed(1)}km
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <TrendingUp className="h-2.5 w-2.5" /> {Math.round(demandPercent)}%
                    </span>
                  </div>
                  <Progress value={demandPercent} className="h-1 mt-1.5" />
                </div>
              </button>
            );
          })}

          <Button
            onClick={onExplore}
            className="w-full mt-auto rounded-xl h-11 font-bold kongsi-gradient text-white border-0 gap-2"
          >
            See What's Around You <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LiveNearYou;
