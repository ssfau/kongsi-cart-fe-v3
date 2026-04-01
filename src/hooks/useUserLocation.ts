import { useState, useEffect } from "react";
import { DEFAULT_LOCATION } from "@/data/locationCoordinates";

interface UserLocation {
  lat: number;
  lng: number;
  isDefault: boolean;
  error?: string;
}

export function useUserLocation(): UserLocation {
  const [location, setLocation] = useState<UserLocation>({
    ...DEFAULT_LOCATION,
    isDefault: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation({ ...DEFAULT_LOCATION, isDefault: true, error: "Geolocation not supported" });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          isDefault: false,
        });
      },
      () => {
        setLocation({
          ...DEFAULT_LOCATION,
          isDefault: true,
          error: "Location access denied. Using default location to show listings near you.",
        });
      },
      { timeout: 8000, maximumAge: 300000 }
    );
  }, []);

  return location;
}
