"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  MapPin,
  Users,
  DollarSign,
  Star,
  Calendar,
  MapPinIcon,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getAvailableVehicles } from "@/services/vehicle.service";
import { Vehicle, VehicleType, VEHICLE_TYPES } from "@/types/booking";

interface BrowseVehiclesProps {
  onViewDetails: (vehicleId: number) => void;
}


export function BrowseVehicles({ onViewDetails }: BrowseVehiclesProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedType, setSelectedType] = useState<VehicleType | "">("");
  const [priceRange, setPriceRange] = useState(200);
  const [view, setView] = useState<"list" | "map">("list");

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAvailableVehicles(
        selectedType || undefined,
        priceRange < 200 ? priceRange : undefined
      );
      setVehicles(data);
    } catch (err: any) {
      setError(err.message || "Failed to load vehicles. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [selectedType, priceRange]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // Client-side location filter (API doesn't support text search yet)
  const filteredVehicles = vehicles.filter((v) => {
    if (!searchLocation) return true;
    return v.pickupLocation
      .toLowerCase()
      .includes(searchLocation.toLowerCase());
  });

  const firstPicture = (pictures?: string[] | string) => {
    if (!pictures) return "/placeholder.jpg";
    if (Array.isArray(pictures)) return pictures[0] || "/placeholder.jpg";
    return pictures.split(",")[0].trim();
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search location..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative md:col-span-2" />
            <Button className="w-full gap-2" onClick={fetchVehicles}>
              <Search className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filter & View Toggle */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {VEHICLE_TYPES.map((type) => (
            <Button
              key={type}
              variant={selectedType === type ? "default" : "outline"}
              size="sm"
              onClick={() =>
                setSelectedType(selectedType === type ? "" : type)
              }
            >
              {type.charAt(0) + type.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("list")}
          >
            List
          </Button>
          <Button
            variant={view === "map" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("map")}
          >
            Map
          </Button>
        </div>
      </div>

      {/* Price Filter */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Daily Price Range</label>
              <span className="text-sm font-semibold text-primary">
                {priceRange >= 200 ? "Any" : `$${priceRange}`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              step="5"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">
            Loading vehicles...
          </span>
        </div>
      )}

      {/* List View */}
      {!loading && view === "list" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredVehicles.length > 0 ? (
            filteredVehicles.map((vehicle) => (
              <Card
                key={vehicle.vehicleId}
                className="overflow-hidden transition-all hover:shadow-lg"
              >
                {/* Vehicle Image */}
                <div className="relative h-48 w-full overflow-hidden bg-muted">
                  <img
                    src={firstPicture(vehicle.pictures)}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    onError={(e) =>
                      (e.currentTarget.src = "/placeholder.jpg")
                    }
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                  <Badge className="absolute right-2 top-2 bg-secondary text-secondary-foreground">
                    {vehicle.type}
                  </Badge>
                  {!vehicle.isAvailable && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <Badge variant="destructive">Not Available</Badge>
                    </div>
                  )}
                </div>

                <CardContent className="space-y-3 pt-4">
                  {/* Vehicle Title */}
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {vehicle.make} {vehicle.model}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {vehicle.pickupLocation}
                    </p>
                  </div>

                  {/* Info Row */}
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{vehicle.capacity} Seats</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span>${vehicle.dailyPrice} / day</span>
                    </div>
                  </div>

                  {/* Owner Info */}
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <div className="text-sm">
                      <p className="font-medium text-foreground">
                        {vehicle.ownerName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Verified Owner
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onViewDetails(vehicle.vehicleId)}
                      disabled={!vehicle.isAvailable}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <p className="text-muted-foreground">
                No vehicles found matching your criteria.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Map View */}
      {!loading && view === "map" && (
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="relative h-96 w-full rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="space-y-2 text-center">
                  <MapPinIcon className="mx-auto h-12 w-12 text-primary/50" />
                  <p className="text-sm text-muted-foreground">
                    {filteredVehicles.length} vehicles available in the area
                  </p>
                  <div className="flex flex-col gap-2">
                    {filteredVehicles.slice(0, 3).map((vehicle) => (
                      <button
                        key={vehicle.vehicleId}
                        onClick={() => onViewDetails(vehicle.vehicleId)}
                        className="rounded-lg border border-border bg-card p-2 text-xs text-foreground hover:bg-muted text-left"
                      >
                        {vehicle.make} {vehicle.model} • $
                        {vehicle.dailyPrice}/day •{" "}
                        <span className="text-muted-foreground">
                          {vehicle.pickupLocation}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}