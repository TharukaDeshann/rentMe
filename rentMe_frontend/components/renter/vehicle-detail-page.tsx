"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Users,
  Shield,
  MessageSquare,
  Calendar,
  MapPin,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { getVehicleById } from "@/services/booking.service";
import { Vehicle } from "@/types/booking";

interface VehicleDetailPageProps {
  vehicleId: number;
  onBack: () => void;
  onBooking: (vehicle: Vehicle) => void;
  onChat: () => void;
}

export function VehicleDetailPage({
  vehicleId,
  onBack,
  onBooking,
  onChat,
}: VehicleDetailPageProps) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getVehicleById(vehicleId);
        setVehicle(data);
      } catch (err: any) {
        setError(err.message || "Failed to load vehicle details.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [vehicleId]);

  const firstPicture = (pictures?: string) => {
    if (!pictures) return "/placeholder.jpg";
    return pictures.split(",")[0].trim();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-96 w-full rounded-lg" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Browse
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || "Vehicle not found."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Browse
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {vehicle.make} {vehicle.model}
          </h1>
          <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {vehicle.pickupLocation}
            </div>
            {!vehicle.isAvailable && (
              <Badge variant="destructive">Currently Unavailable</Badge>
            )}
          </div>
        </div>
        <Badge className="text-base px-4 py-2">{vehicle.type}</Badge>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          <div className="relative h-96 w-full overflow-hidden rounded-lg bg-muted">
            <img
              src={firstPicture(vehicle.pictures)}
              alt={`${vehicle.make} ${vehicle.model}`}
              onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Description */}
          {vehicle.description && (
            <Card>
              <CardHeader>
                <CardTitle>About this vehicle</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {vehicle.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Make</p>
                  <p className="font-semibold">{vehicle.make}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Model</p>
                  <p className="font-semibold">{vehicle.model}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-semibold">{vehicle.type}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Capacity</p>
                  <p className="font-semibold flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {vehicle.capacity} Seats
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Daily Price</p>
                  <p className="font-semibold">${vehicle.dailyPrice}/day</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Availability</p>
                  <Badge
                    className={
                      vehicle.isAvailable
                        ? "bg-green-500/10 text-green-600 border-green-500/20"
                        : "bg-destructive/10 text-destructive border-destructive/20"
                    }
                  >
                    {vehicle.isAvailable ? "Available" : "Not Available"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Pricing & Booking Card */}
          <Card className="sticky top-4">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">
                    ${vehicle.dailyPrice}
                  </span>
                  <span className="text-muted-foreground">/ day</span>
                </div>

                {vehicle.isAvailable ? (
                  <Button
                    size="lg"
                    className="w-full gap-2"
                    onClick={() => onBooking(vehicle)}
                  >
                    <Calendar className="h-4 w-4" />
                    Request Booking
                  </Button>
                ) : (
                  <Button size="lg" className="w-full" disabled>
                    Not Available
                  </Button>
                )}

                <p className="text-xs text-muted-foreground text-center">
                  Total is calculated once you choose dates
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Owner Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Owner Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  {vehicle.ownerName.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{vehicle.ownerName}</h3>
                    <Badge className="gap-1 bg-secondary text-secondary-foreground text-xs">
                      <Shield className="h-3 w-3" />
                      Verified
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {vehicle.ownerEmail}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full gap-2 bg-transparent"
                onClick={onChat}
              >
                <MessageSquare className="h-4 w-4" />
                Chat with Owner
              </Button>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pickup Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">{vehicle.pickupLocation}</p>
                  <p className="text-sm text-muted-foreground">
                    {vehicle.latitude.toFixed(4)},{" "}
                    {vehicle.longitude.toFixed(4)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}