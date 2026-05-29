"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, MapPin } from "lucide-react";

interface MapLocationSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialLat?: number;
  initialLng?: number;
  onSelect: (data: { address: string; latitude: number; longitude: number }) => void;
}

declare global {
  interface Window {
    L: any;
  }
}

export function MapLocationSelectorModal({
  open,
  onOpenChange,
  initialLat = 6.9271, // Colombo default
  initialLng = 79.8612,
  onSelect,
}: MapLocationSelectorModalProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMap = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string;
    latitude: number;
    longitude: number;
  }>({
    address: "",
    latitude: initialLat,
    longitude: initialLng,
  });

  // 1. Dynamic Script Loader for Leaflet
  useEffect(() => {
    if (!open) return;

    let isMounted = true;
    const loadLeaflet = async () => {
      if (window.L) {
        if (isMounted) setScriptLoaded(true);
        return;
      }

      try {
        // Load CSS
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);

        // Load JS
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.async = true;
        script.onload = () => {
          if (isMounted) {
            // Fix Leaflet's default marker icons in Next.js
            const L = window.L;
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
              iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
              iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
              shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            });
            setScriptLoaded(true);
          }
        };
        document.body.appendChild(script);
      } catch (err) {
        console.error("Failed to load Leaflet maps CDN", err);
      }
    };

    loadLeaflet();

    return () => {
      isMounted = false;
    };
  }, [open]);

  // 2. Initialize Leaflet Map
  useEffect(() => {
    if (!open || !scriptLoaded || !mapRef.current) return;

    const L = window.L;

    // Destory existing map if re-initializing
    if (leafletMap.current) {
      leafletMap.current.remove();
      leafletMap.current = null;
      markerRef.current = null;
    }

    const map = L.map(mapRef.current).setView(
      [selectedLocation.latitude, selectedLocation.longitude],
      13
    );
    leafletMap.current = map;

    // Use a beautiful modern light tile layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 20,
    }).addTo(map);

    // Create marker
    const marker = L.marker([selectedLocation.latitude, selectedLocation.longitude], {
      draggable: true,
    }).addTo(map);
    markerRef.current = marker;

    // Handle marker drag end
    marker.on("dragend", async () => {
      const position = marker.getLatLng();
      await updateCoords(position.lat, position.lng);
    });

    // Handle click on map to move marker
    map.on("click", async (e: any) => {
      const position = e.latlng;
      marker.setLatLng(position);
      await updateCoords(position.lat, position.lng);
    });

    // Initial reverse geocode to fetch address
    updateCoords(selectedLocation.latitude, selectedLocation.longitude);

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
        markerRef.current = null;
      }
    };
  }, [open, scriptLoaded]);

  // 3. Geocoding helpers
  const updateCoords = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      // Build a clean readable location name
      let addressName = "";
      if (data && data.display_name) {
        // nominatim address is often very long, let's extract the city/suburb/road
        const addr = data.address;
        const mainLocation = addr.road || addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.city;
        const cityRegion = addr.city || addr.town || addr.state || addr.country;
        
        if (mainLocation && cityRegion && mainLocation !== cityRegion) {
          addressName = `${mainLocation}, ${cityRegion}`;
        } else {
          addressName = data.display_name.split(",").slice(0, 3).join(",").trim();
        }
      } else {
        addressName = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
      }

      setSelectedLocation({
        address: addressName,
        latitude: lat,
        longitude: lng,
      });
    } catch (err) {
      console.error("Reverse geocoding failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=1`
      );
      const results = await response.json();
      if (results && results.length > 0) {
        const first = results[0];
        const lat = parseFloat(first.lat);
        const lon = parseFloat(first.lon);
        
        // Update states
        setSelectedLocation({
          address: first.display_name.split(",").slice(0, 3).join(",").trim(),
          latitude: lat,
          longitude: lon,
        });

        // Pan map and move marker
        if (leafletMap.current && markerRef.current) {
          leafletMap.current.setView([lat, lon], 15);
          markerRef.current.setLatLng([lat, lon]);
        }
      }
    } catch (err) {
      console.error("Search geocoding failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    onSelect(selectedLocation);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl w-full flex flex-col h-[500px]">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary animate-bounce" />
            Select Pickup Location
          </DialogTitle>
        </DialogHeader>

        {/* Address Search Bar */}
        <div className="flex gap-2 shrink-0">
          <Input
            placeholder="Search city, town, street..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={loading} size="icon">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Map Container */}
        <div className="flex-1 border rounded-lg overflow-hidden bg-muted relative min-h-[220px] my-2">
          {!scriptLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm">Loading map tiles...</p>
            </div>
          )}
          <div ref={mapRef} className="w-full h-full z-10" />
        </div>

        {/* Selected Address Display */}
        <div className="rounded-lg bg-muted/50 border p-3 flex items-start gap-2.5 text-sm shrink-0">
          <MapPin className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">
              {loading ? "Locating..." : selectedLocation.address || "Click on the map to choose location"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
              Lat: {selectedLocation.latitude.toFixed(6)}, Lng: {selectedLocation.longitude.toFixed(6)}
            </p>
          </div>
        </div>

        <DialogFooter className="pt-2 shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={loading || !selectedLocation.address}>
            Confirm Location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
