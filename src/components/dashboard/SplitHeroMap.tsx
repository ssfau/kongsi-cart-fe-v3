import { useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, TrendingUp, Compass } from "lucide-react";
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
  searchQuery?: string;
}

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

/** Resolve display name: prioritize backend itemName, fall back to category displayName */
const getDisplayName = (item: ListingItem): string => {
  // If itemName exists and isn't just the raw category key, use it
  if (item.itemName && item.itemName !== item.category) {
    return item.itemName;
  }
  const cat = shopItemCategories.find((c) => c.name === item.category);
  return cat?.displayName || item.itemName || item.category;
};

const SplitHeroMap = ({ listings, userLat, userLng, onSelectItem, searchQuery = "" }: SplitHeroMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const navigate = useNavigate();

  const enriched = useMemo(() => {
    let items = listings;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter((item) => {
        const name = getDisplayName(item);
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
        const coords = getListingCoords(item.district, item.state, item.collectionPoint || item.collection_point);
        const distance = getDistanceKm(userLat, userLng, coords.lat, coords.lng);
        return { ...item, _distance: distance, _coords: coords } as EnrichedItem;
      })
      .sort((a, b) => a._distance - b._distance);
  }, [listings, userLat, userLng, searchQuery]);

  // Group by coordinate key (rounded to ~100m)
  const groups = useMemo(() => {
    const map = new Map<string, LocationGroup>();
    enriched.forEach((item) => {
      const key = `${item._coords.lat.toFixed(3)},${item._coords.lng.toFixed(3)}`;
      if (!map.has(key)) {
        map.set(key, { key, lat: item._coords.lat, lng: item._coords.lng, items: [] });
      }
      map.get(key)!.items.push(item);
    });
    return Array.from(map.values());
  }, [enriched]);

  const top3 = enriched.slice(0, 3);

  const buildClusterHtml = useCallback((group: LocationGroup) => {
    const { items } = group;
    const size = items.length === 1 ? 44 : 56;

    if (items.length === 1) {
      const img = produceImages[items[0].category] || "";
      return `<div style="width:${size}px;height:${size}px;border-radius:50%;overflow:hidden;border:3px solid hsl(90,55%,51%);box-shadow:0 0 12px hsl(90,55%,51%,0.4);background:#1a1a1a;cursor:pointer;transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">${img ? `<img src="${img}" style="width:100%;height:100%;object-fit:cover;" />` : `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:white;font-size:18px;">?</div>`}</div>`;
    }

    const visible = items.slice(0, Math.min(items.length, 3));
    const overflow = items.length > 4 ? items.length - 3 : 0;
    const showFourth = items.length === 4;
    const totalCircles = visible.length + (overflow > 0 ? 1 : (showFourth ? 1 : 0));
    const circleSize = 28;
    const overlap = 8;
    const totalWidth = circleSize + (totalCircles - 1) * (circleSize - overlap);

    let html = `<div style="display:flex;cursor:pointer;position:relative;width:${totalWidth}px;height:${circleSize}px;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">`;

    visible.forEach((item, i) => {
      const img = produceImages[item.category] || "";
      const left = i * (circleSize - overlap);
      html += `<div style="position:absolute;left:${left}px;top:0;width:${circleSize}px;height:${circleSize}px;border-radius:50%;overflow:hidden;border:2px solid hsl(90,55%,51%);background:#1a1a1a;z-index:${totalCircles - i};">${img ? `<img src="${img}" style="width:100%;height:100%;object-fit:cover;" />` : `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:white;font-size:12px;">?</div>`}</div>`;
    });

    if (overflow > 0) {
      const left = visible.length * (circleSize - overlap);
      html += `<div style="position:absolute;left:${left}px;top:0;width:${circleSize}px;height:${circleSize}px;border-radius:50%;background:hsl(32,93%,54%);border:2px solid white;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:11px;z-index:1;">+${overflow}</div>`;
    } else if (showFourth) {
      const img4 = produceImages[items[3].category] || "";
      const left = visible.length * (circleSize - overlap);
      html += `<div style="position:absolute;left:${left}px;top:0;width:${circleSize}px;height:${circleSize}px;border-radius:50%;overflow:hidden;border:2px solid hsl(90,55%,51%);background:#1a1a1a;z-index:1;">${img4 ? `<img src="${img4}" style="width:100%;height:100%;object-fit:cover;" />` : `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:white;font-size:12px;">?</div>`}</div>`;
    }

    html += `</div>`;
    return html;
  }, []);

  const buildPopupHtml = useCallback((group: LocationGroup) => {
    const location = group.items[0]?.district || group.items[0]?.state || "Collection Point";
    let html = `<div style="min-width:200px;max-width:260px;font-family:system-ui,sans-serif;">
      <div style="font-weight:700;font-size:13px;margin-bottom:6px;color:#222;">${location}</div>
      <div style="font-size:10px;color:#888;margin-bottom:8px;">${group.items.length} Kongsi Pool${group.items.length > 1 ? "s" : ""} available</div>`;

    group.items.forEach((item) => {
      // Use real backend name in popup
      const name = getDisplayName(item);
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

  useEffect(() => {
    if (!mapRef.current || groups.length === 0) return;

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

    groups.forEach((group) => {
      const html = buildClusterHtml(group);
      const iconWidth = group.items.length === 1 ? 44 : Math.min(120, 28 + (Math.min(group.items.length, 4) - 1) * 20);
      const iconHeight = group.items.length === 1 ? 44 : 28;

      const icon = L.divIcon({
        className: "",
        html,
        iconSize: [iconWidth, iconHeight],
        iconAnchor: [iconWidth / 2, iconHeight / 2],
      });

      const marker = L.marker([group.lat, group.lng], { icon }).addTo(map);

      if (group.items.length > 1) {
        const popup = L.popup({ closeButton: true, className: "kongsi-cluster-popup", maxWidth: 280 })
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
                if (item) onSelectItem(item);
              });
            });
          }
        });
      } else {
        marker.on("click", () => onSelectItem(group.items[0]));
      }
    });

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [groups, userLat, userLng, onSelectItem, buildClusterHtml, buildPopupHtml]);

  return (
    <div className="flex flex-col h-full">
      {/* Map */}
      <div className="flex-1 min-h-0 relative">
        <div ref={mapRef} className="w-full h-full" style={{ zIndex: 0 }} />

        {/* Explore FAB */}
        <button
          onClick={() => navigate("/explore")}
          className="absolute bottom-3 right-3 z-[500] w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:shadow-xl hover:scale-110 transition-all duration-200"
          title="Explore all listings"
        >
          <Compass className="h-5 w-5 text-primary" />
        </button>

        <style>{`
          @keyframes heroMapPulse {
            0%, 100% { transform: scale(1); opacity: 0.6; }
            50% { transform: scale(1.8); opacity: 0; }
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

      {/* Top 3 closest list */}
      <div className="p-3 space-y-1.5 bg-card border-t border-border">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
          <MapPin className="h-3 w-3 text-primary" /> Closest to you
        </p>
        {top3.map((item) => {
          const displayName = getDisplayName(item);
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
