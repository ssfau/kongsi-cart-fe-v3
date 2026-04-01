import { useEffect, useRef, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { produceImages } from "@/assets/produce";
import { shopItemCategories } from "@/data/shopItems";
import { getListingCoords, getDistanceKm } from "@/data/locationCoordinates";
import type { ListingItem } from "./ShopPage";

interface SplitHeroMapProps {
  listings: ListingItem[];
  userLat: number;
  userLng: number;
  onSelectItem: (item: ListingItem) => void;
}

const SplitHeroMap = ({ listings, userLat, userLng, onSelectItem }: SplitHeroMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  const nearby = useMemo(() => {
    return listings
      .map((item) => {
        const coords = getListingCoords(item.district, item.state);
        const distance = getDistanceKm(userLat, userLng, coords.lat, coords.lng);
        return { ...item, _distance: distance, _coords: coords };
      })
      .sort((a, b) => a._distance - b._distance);
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
      zoom: 11,
      zoomControl: false,
      attributionControl: false,
      dragging: true,
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
        <div style="position:absolute;inset:-8px;background:hsl(90,55%,51%,0.3);border-radius:50%;animation:heroMapPulse 2s infinite;"></div>
      </div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
    L.marker([userLat, userLng], { icon: userIcon }).addTo(map);

    // Product blobs — hottest product gets glow
    const hottestId = nearby[0]?._id;
    nearby.slice(0, 8).forEach((item) => {
      const img = produceImages[item.category] || "";
      const isHot = item._id === hottestId;
      const blobIcon = L.divIcon({
        className: "",
        html: `<div style="
          width:44px;height:44px;border-radius:50%;overflow:hidden;
          border:3px solid ${isHot ? 'hsl(32,93%,54%)' : 'hsl(90,55%,51%)'};
          box-shadow:0 0 ${isHot ? '20px hsl(32,93%,54%,0.6)' : '12px hsl(90,55%,51%,0.4)'};
          background:#1a1a1a;position:relative;cursor:pointer;
          transition:transform 0.2s;
        " onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">
          ${img ? `<img src="${img}" style="width:100%;height:100%;object-fit:cover;" />` : `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:20px;color:white;">?</div>`}
        </div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      const marker = L.marker([item._coords.lat, item._coords.lng], { icon: blobIcon }).addTo(map);
      marker.on("click", () => onSelectItem(item));
    });

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [nearby, userLat, userLng, onSelectItem]);

  return (
    <div className="flex flex-col h-full">
      {/* Map */}
      <div className="flex-1 min-h-0 relative">
        <div ref={mapRef} className="w-full h-full" style={{ zIndex: 0 }} />
        <style>{`
          @keyframes heroMapPulse {
            0%, 100% { transform: scale(1); opacity: 0.6; }
            50% { transform: scale(1.8); opacity: 0; }
          }
        `}</style>
      </div>

      {/* Top 3 closest list */}
      <div className="p-3 space-y-1.5 bg-card border-t border-border">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
          <MapPin className="h-3 w-3 text-primary" /> Closest to you
        </p>
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
              className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border-2 border-primary/30">
                {produceImages[item.category] ? (
                  <img src={produceImages[item.category]} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-xs">?</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{displayName}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-muted-foreground">{item._distance.toFixed(1)}km</span>
                  <Progress value={demandPercent} className="h-1 flex-1 max-w-[60px]" />
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <TrendingUp className="h-2 w-2" />{Math.round(demandPercent)}%
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SplitHeroMap;
