import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getListingCoords } from "@/data/locationCoordinates";

interface CollectionPointMapProps {
  district?: string;
  state?: string;
  collectionPoint?: string;
}

const CollectionPointMap = ({ district, state, collectionPoint }: CollectionPointMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const coords = getListingCoords(district, state, collectionPoint);

    if (mapInstance.current) {
      mapInstance.current.remove();
    }

    const map = L.map(mapRef.current, {
      center: [coords.lat, coords.lng],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });

    // Dark / minimal tile layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    // Glowing green marker
    const greenIcon = L.divIcon({
      className: "",
      html: `<div style="
        width: 20px; height: 20px;
        background: hsl(90, 55%, 51%);
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 12px hsl(90, 55%, 51%), 0 0 24px hsl(90, 55%, 40%);
      "></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    L.marker([coords.lat, coords.lng], { icon: greenIcon })
      .addTo(map)
      .bindPopup(
        `<div style="font-size:12px;font-weight:600;">${collectionPoint || "Collection Hub"}</div>
         <div style="font-size:11px;color:#888;">${[district, state].filter(Boolean).join(", ")}</div>`,
        { closeButton: false, className: "kongsi-popup" }
      );

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [district, state, collectionPoint]);

  return (
    <div
      ref={mapRef}
      className="rounded-xl overflow-hidden border border-border/50 h-44 w-full"
      style={{ zIndex: 0 }}
    />
  );
};

export default CollectionPointMap;
