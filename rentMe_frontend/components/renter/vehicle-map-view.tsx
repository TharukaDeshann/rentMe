"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
  InfoWindow,
} from "@vis.gl/react-google-maps";
import {
  MapPin,
  Car,
  Users,
  X,
  ChevronRight,
  Locate,
  Layers,
} from "lucide-react";
import { Vehicle } from "@/types/booking";
import { formatLKR } from "@/utils/currency";
import { Badge } from "@/components/ui/badge";

// ─── Vehicle type emoji map ─────────────────────────────────────────────────

const VEHICLE_EMOJI: Record<string, string> = {
  SEDAN: "🚗",
  SUV: "🚙",
  TRUCK: "🚛",
  VAN: "🚐",
  MOTORCYCLE: "🏍️",
  HATCHBACK: "🚘",
  COUPE: "🏎️",
  CONVERTIBLE: "🚘",
  MINIVAN: "🚐",
  PICKUP: "🛻",
};

// ─── Custom vehicle pin component ───────────────────────────────────────────

interface VehiclePinProps {
  vehicle: Vehicle;
  isSelected: boolean;
  onClick: () => void;
}

function VehiclePin({ vehicle, isSelected, onClick }: VehiclePinProps) {
  const emoji = VEHICLE_EMOJI[vehicle.type] || "🚗";
  return (
    <AdvancedMarker
      position={{ lat: vehicle.latitude, lng: vehicle.longitude }}
      onClick={onClick}
      zIndex={isSelected ? 999 : 1}
    >
      <div
        className={`
          relative flex flex-col items-center cursor-pointer select-none
          transition-all duration-200
          ${isSelected ? "scale-125" : "scale-100 hover:scale-110"}
        `}
      >
        {/* Bubble */}
        <div
          className={`
            flex items-center gap-1 px-2 py-1.5 rounded-full shadow-lg
            font-semibold text-xs whitespace-nowrap
            border-2 transition-all duration-200
            ${
              isSelected
                ? "bg-blue-600 text-white border-white shadow-blue-400/60 shadow-xl"
                : "bg-white text-gray-800 border-blue-500 hover:bg-blue-50"
            }
          `}
          style={{ boxShadow: isSelected ? "0 4px 20px rgba(37,99,235,0.5)" : undefined }}
        >
          <span className="text-sm">{emoji}</span>
          <span>{formatLKR(vehicle.dailyPrice)}</span>
        </div>
        {/* Tail */}
        <div
          className={`
            w-0 h-0
            border-l-4 border-r-4 border-t-8
            border-l-transparent border-r-transparent
            ${isSelected ? "border-t-blue-600" : "border-t-blue-500"}
          `}
        />
      </div>
    </AdvancedMarker>
  );
}

// ─── Map controller – handles auto-fit and user location ────────────────────

interface MapControllerProps {
  vehicles: Vehicle[];
  userLocation: google.maps.LatLngLiteral | null;
}

function MapController({ vehicles, userLocation }: MapControllerProps) {
  const map = useMap();

  useEffect(() => {
    if (!map || vehicles.length === 0) return;
    const bounds = new google.maps.LatLngBounds();
    vehicles.forEach((v) => {
      if (v.latitude && v.longitude) {
        bounds.extend({ lat: v.latitude, lng: v.longitude });
      }
    });
    if (userLocation) bounds.extend(userLocation);
    map.fitBounds(bounds, 80);
  }, [map, vehicles, userLocation]);

  return null;
}

// ─── Sidebar vehicle card ────────────────────────────────────────────────────

interface SidebarCardProps {
  vehicle: Vehicle;
  isSelected: boolean;
  onSelect: () => void;
  onViewDetails: () => void;
  firstPicture: (p?: string[] | string) => string;
}

function SidebarCard({
  vehicle,
  isSelected,
  onSelect,
  onViewDetails,
  firstPicture,
}: SidebarCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`
        group flex gap-3 p-3 rounded-xl cursor-pointer border transition-all duration-200
        ${
          isSelected
            ? "bg-blue-50 border-blue-400 shadow-md shadow-blue-100"
            : "bg-white border-gray-100 hover:border-blue-300 hover:shadow-sm"
        }
      `}
    >
      {/* Thumbnail */}
      <div className="relative h-20 w-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
        <img
          src={firstPicture(vehicle.pictures)}
          alt={`${vehicle.make} ${vehicle.model}`}
          onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <Badge className="absolute top-1 right-1 text-[9px] px-1 py-0 bg-blue-600 text-white border-0">
          {vehicle.type}
        </Badge>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <p className="font-semibold text-gray-900 text-sm truncate leading-tight">
            {vehicle.make} {vehicle.model}
          </p>
          <p className="text-xs text-gray-500 flex items-center gap-0.5 mt-0.5 truncate">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            {vehicle.pickupLocation}
          </p>
        </div>

        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="flex items-center gap-0.5">
              <Users className="h-3 w-3" />
              {vehicle.capacity}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-blue-700">
              {formatLKR(vehicle.dailyPrice)}/day
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails();
              }}
              className="ml-1 flex items-center gap-0.5 text-[10px] font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              View <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main map component ──────────────────────────────────────────────────────

interface VehicleMapViewProps {
  vehicles: Vehicle[];
  onViewDetails: (vehicleId: number) => void;
}

export function VehicleMapView({ vehicles, onViewDetails }: VehicleMapViewProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [locating, setLocating] = useState(false);
  const [mapType, setMapType] = useState<"roadmap" | "satellite">("roadmap");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Sri Lanka centre as fallback
  const defaultCenter = { lat: 7.8731, lng: 80.7718 };

  const firstPicture = (pictures?: string[] | string): string => {
    if (!pictures) return "/placeholder.jpg";
    if (Array.isArray(pictures)) return pictures[0] || "/placeholder.jpg";
    return pictures.split(",")[0].trim() || "/placeholder.jpg";
  };

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  const handleSelectVehicle = useCallback((vehicle: Vehicle) => {
    setSelectedVehicle((prev) =>
      prev?.vehicleId === vehicle.vehicleId ? null : vehicle
    );
    // Auto-scroll to vehicle in sidebar
    setTimeout(() => {
      const el = sidebarRef.current?.querySelector(
        `[data-vehicle-id="${vehicle.vehicleId}"]`
      );
      el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 50);
  }, []);

  const validVehicles = vehicles.filter(
    (v) => v.latitude && v.longitude && v.isAvailable
  );

  if (!apiKey || apiKey === "YOUR_GOOGLE_MAPS_API_KEY_HERE") {
    return (
      <div className="relative h-[600px] w-full rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm px-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
            <MapPin className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">Google Maps API Key Required</h3>
          <p className="text-sm text-gray-500">
            Add your{" "}
            <code className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-mono text-xs">
              NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
            </code>{" "}
            to{" "}
            <code className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-mono text-xs">
              .env.local
            </code>{" "}
            to enable the interactive map.
          </p>
          <p className="text-xs text-blue-600 font-medium">
            {validVehicles.length} vehicles with location data available
          </p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <div className="relative w-full rounded-2xl overflow-hidden shadow-xl border border-gray-200" style={{ height: "680px" }}>
        {/* ── Sidebar ── */}
        <div
          className={`
            absolute left-0 top-0 bottom-0 z-20 flex flex-col
            bg-white/95 backdrop-blur-md border-r border-gray-200
            transition-all duration-300 ease-in-out
            ${sidebarOpen ? "w-80" : "w-0 overflow-hidden"}
          `}
        >
          {/* Sidebar header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Available Vehicles</h3>
              <p className="text-xs text-gray-400">{validVehicles.length} on the map</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Vehicle list */}
          <div ref={sidebarRef} className="flex-1 overflow-y-auto p-3 space-y-2">
            {validVehicles.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                No vehicles with location data
              </div>
            ) : (
              validVehicles.map((v) => (
                <div key={v.vehicleId} data-vehicle-id={v.vehicleId}>
                  <SidebarCard
                    vehicle={v}
                    isSelected={selectedVehicle?.vehicleId === v.vehicleId}
                    onSelect={() => handleSelectVehicle(v)}
                    onViewDetails={() => onViewDetails(v.vehicleId)}
                    firstPicture={firstPicture}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Map ── */}
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={8}
          mapId="rentme-vehicle-map"
          mapTypeId={mapType}
          disableDefaultUI={false}
          gestureHandling="greedy"
          style={{ width: "100%", height: "100%" }}
          onClick={() => setSelectedVehicle(null)}
        >
          <MapController vehicles={validVehicles} userLocation={userLocation} />

          {/* Vehicle markers */}
          {validVehicles.map((vehicle) => (
            <VehiclePin
              key={vehicle.vehicleId}
              vehicle={vehicle}
              isSelected={selectedVehicle?.vehicleId === vehicle.vehicleId}
              onClick={() => handleSelectVehicle(vehicle)}
            />
          ))}

          {/* User location marker */}
          {userLocation && (
            <AdvancedMarker position={userLocation} zIndex={1000}>
              <div className="relative">
                <div
                  className="w-5 h-5 rounded-full bg-blue-500 shadow-lg shadow-blue-400/60"
                  style={{ border: "3px solid white" }}
                />
                <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-60" />
              </div>
            </AdvancedMarker>
          )}

          {/* Info window for selected vehicle */}
          {selectedVehicle && (
            <InfoWindow
              position={{
                lat: selectedVehicle.latitude,
                lng: selectedVehicle.longitude,
              }}
              onCloseClick={() => setSelectedVehicle(null)}
            >
              <div className="w-64 font-sans">
                {/* Image */}
                <div className="relative h-32 -mx-3 -mt-3 mb-3 overflow-hidden rounded-t-lg">
                  <img
                    src={firstPicture(selectedVehicle.pictures)}
                    alt={`${selectedVehicle.make} ${selectedVehicle.model}`}
                    onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <Badge className="absolute bottom-2 left-2 bg-blue-600 text-white border-0 text-[10px]">
                    {selectedVehicle.type}
                  </Badge>
                </div>

                {/* Details */}
                <h4 className="font-bold text-gray-900 text-sm mb-1">
                  {selectedVehicle.make} {selectedVehicle.model}
                </h4>
                <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                  <MapPin className="h-3 w-3 flex-shrink-0 text-blue-500" />
                  {selectedVehicle.pickupLocation}
                </p>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {selectedVehicle.capacity} seats
                    </span>
                  </div>
                  <span className="text-sm font-bold text-blue-700">
                    {formatLKR(selectedVehicle.dailyPrice)}/day
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onViewDetails(selectedVehicle.vehicleId)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <Car className="h-3.5 w-3.5" />
                    View Details
                  </button>
                </div>

                <p className="text-[10px] text-gray-400 mt-2 text-center">
                  Owner: {selectedVehicle.ownerName}
                </p>
              </div>
            </InfoWindow>
          )}
        </Map>

        {/* ── Floating controls ── */}
        {/* Sidebar toggle */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute left-3 top-3 z-30 flex items-center gap-2 bg-white/90 backdrop-blur border border-gray-200 shadow-lg text-gray-700 text-xs font-semibold px-3 py-2 rounded-xl hover:bg-white transition-all"
          >
            <Layers className="h-4 w-4 text-blue-600" />
            {validVehicles.length} Vehicles
          </button>
        )}

        {/* Locate me button */}
        <button
          onClick={handleLocate}
          disabled={locating}
          className={`
            absolute right-3 bottom-24 z-30 flex items-center gap-1.5
            bg-white/90 backdrop-blur border border-gray-200 shadow-lg
            text-gray-700 text-xs font-semibold px-3 py-2.5 rounded-xl
            hover:bg-white transition-all disabled:opacity-60
          `}
        >
          <Locate
            className={`h-4 w-4 text-blue-600 ${locating ? "animate-spin" : ""}`}
          />
          {locating ? "Locating…" : "My Location"}
        </button>

        {/* Map type toggle */}
        <button
          onClick={() =>
            setMapType((t) => (t === "roadmap" ? "satellite" : "roadmap"))
          }
          className="absolute right-3 bottom-[88px] z-30 -translate-y-12 flex items-center gap-1.5 bg-white/90 backdrop-blur border border-gray-200 shadow-lg text-gray-700 text-xs font-semibold px-3 py-2.5 rounded-xl hover:bg-white transition-all"
        >
          <Layers className="h-4 w-4 text-blue-600" />
          {mapType === "roadmap" ? "Satellite" : "Map"}
        </button>

        {/* Vehicle count badge (top-right) */}
        <div className="absolute top-3 right-3 z-30 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
          {validVehicles.length} available
        </div>
      </div>
    </APIProvider>
  );
}
