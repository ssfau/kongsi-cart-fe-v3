import { useEffect, useState, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "@/lib/axios";
import { getListingCoords } from "@/data/locationCoordinates";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function SellerMapPage() {
  const [listings, setListings] = useState<any[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await api.get("/my-listings");
        const data = response.data.data || [];
        setListings(data);
      } catch (err) {
        console.error("Failed to fetch listings", err);
      }
    };
    fetchListings();
  }, []);

  useEffect(() => {
    if (!mapRef.current || listings.length === 0) return;

    if (mapInstance.current) {
      mapInstance.current.remove();
    }

    const map = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: false,
    });

    // Dark carto map tile layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    const bounds = L.latLngBounds([]);

    listings.forEach((listing) => {
      const cp = listing.collectionPoint || listing.collection_point || "Main Hub";
      const coords = getListingCoords(listing.district, listing.state, cp);
      
      bounds.extend([coords.lat, coords.lng]);

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
          `<div style="font-size:12px;font-weight:600;margin-bottom:4px;">${listing.itemName}</div>
           <div style="font-size:11px;color:#888;">Dist: ${listing.district || 'N/A'}, State: ${listing.state || 'N/A'}</div>
           <strong style="color:hsl(90, 55%, 51%);font-size:11px;">Point: ${cp}</strong>`,
          { closeButton: false, className: "kongsi-popup" }
        );
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      map.setView([3.1390, 101.6869], 6); // Default KL if no valid points
    }

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [listings]);

  return (
    <div className="space-y-6 h-[calc(100vh-80px)] flex flex-col p-4 md:p-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/handler/listings")} className="shrink-0 bg-muted/20 hover:bg-muted/50 rounded-xl">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold m-0 text-foreground">Delivery Destinations</h1>
      </div>
      
      <div className="flex-1 relative rounded-2xl overflow-hidden border border-border shadow-sm">
        <div ref={mapRef} className="absolute inset-0 z-0 bg-muted/20" />
      </div>
    </div>
  );
}