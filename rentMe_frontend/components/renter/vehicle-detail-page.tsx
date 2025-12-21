"use client"

import { ArrowLeft, Star, Users, Shield, MessageSquare, Calendar, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { dummyVehicles } from "@/lib/dummy-data"

interface VehicleDetailPageProps {
  vehicleId: string
  onBack: () => void
  onBooking: () => void
  onChat: () => void
}

export function VehicleDetailPage({ vehicleId, onBack, onBooking, onChat }: VehicleDetailPageProps) {
  const vehicle = dummyVehicles.find((v) => v.id === vehicleId)

  if (!vehicle) return null

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
              {vehicle.location.name}
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              {vehicle.rating} Rating
            </div>
          </div>
        </div>
        <Badge className="text-lg px-4 py-2">{vehicle.type}</Badge>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Images and Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Large Image */}
          <div className="relative h-96 w-full overflow-hidden rounded-lg bg-muted">
            <img
              src={vehicle.image_url || "/placeholder.svg"}
              alt={`${vehicle.make} ${vehicle.model}`}
              onError={(e) => (e.currentTarget.src = "/fallback.jpg")}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Vehicle Specifications */}
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
                  <p className="text-sm text-muted-foreground">Year</p>
                  <p className="font-semibold">{vehicle.year}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-semibold">{vehicle.type}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Capacity</p>
                  <p className="font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {vehicle.capacity} Seats
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">License Plate</p>
                  <p className="font-semibold">{vehicle.license_plate}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ratings Section */}
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Ratings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Star className="h-8 w-8 fill-yellow-400 text-yellow-400" />
                    <span className="text-3xl font-bold">{vehicle.rating}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Based on 24 reviews</p>
                    <p>Excellent condition</p>
                  </div>
                </div>

                {/* Rating Breakdown */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm w-20">Cleanliness</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-secondary" style={{ width: "95%" }} />
                    </div>
                    <span className="text-sm font-medium">4.9</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm w-20">Comfort</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-secondary" style={{ width: "90%" }} />
                    </div>
                    <span className="text-sm font-medium">4.7</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm w-20">Performance</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-secondary" style={{ width: "88%" }} />
                    </div>
                    <span className="text-sm font-medium">4.6</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Pricing and Owner Info */}
        <div className="space-y-6">
          {/* Pricing Card */}
          <Card className="sticky top-4">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">${vehicle.daily_price}</span>
                  <span className="text-muted-foreground">/ day</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">3 days rental</span>
                    <span className="font-medium">${(vehicle.daily_price * 3).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Service fee</span>
                    <span className="font-medium">$15.00</span>
                  </div>
                  <div className="border-t border-border pt-2 flex items-center justify-between font-semibold">
                    <span>Total</span>
                    <span>${(vehicle.daily_price * 3 + 15).toFixed(2)}</span>
                  </div>
                </div>

                <Button size="lg" className="w-full gap-2" onClick={onBooking}>
                  <Calendar className="h-4 w-4" />
                  Request Booking
                </Button>
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
                <img
                  src={vehicle.owner.profile_picture || "/placeholder.svg"}
                  alt={vehicle.owner.full_name}
                  onError={(e) => (e.currentTarget.src = "/fallback.jpg")}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{vehicle.owner.full_name}</h3>
                    {vehicle.owner.isVerified && (
                      <Badge className="gap-1 bg-secondary text-secondary-foreground">
                        <Shield className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{vehicle.owner.rating} Rating</span>
                  </div>
                </div>
              </div>

              <Button variant="outline" className="w-full gap-2 bg-transparent" onClick={onChat}>
                <MessageSquare className="h-4 w-4" />
                Chat with Owner
              </Button>
            </CardContent>
          </Card>

          {/* Location Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pickup Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">{vehicle.location.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {vehicle.location.latitude.toFixed(4)}, {vehicle.location.longitude.toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
