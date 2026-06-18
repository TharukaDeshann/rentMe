"use client"
import { X, Star, Users, Shield, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { dummyVehicles } from "@/lib/dummy-data"

interface VehicleDetailProps {
  vehicleId: string
  onClose: () => void
  onBooking: (vehicleId: string) => void
  onChat: (vehicleId: string) => void
}

export function VehicleDetail({ vehicleId, onClose, onBooking, onChat }: VehicleDetailProps) {
  const vehicle = dummyVehicles.find((v) => v.id === vehicleId)

  if (!vehicle) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
        {/* Header with Close Button */}
        <div className="flex items-center justify-between border-b border-border p-6">
          <h2 className="text-2xl font-bold">
            {vehicle.make} {vehicle.model}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-6 w-6" />
          </button>
        </div>

        <CardContent className="space-y-6 p-6">
          {/* Large Image */}
          <div className="relative h-80 w-full overflow-hidden rounded-lg bg-muted">
            <img
              src={vehicle.image_url || "/placeholder.svg"}
              alt={`${vehicle.make} ${vehicle.model}`}
              onError={(e) => (e.currentTarget.src = "/fallback.jpg")}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Specs Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-0 bg-muted/50">
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">Make</p>
                <p className="font-semibold">{vehicle.make}</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-muted/50">
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">Model</p>
                <p className="font-semibold">{vehicle.model}</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-muted/50">
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">Year</p>
                <p className="font-semibold">{vehicle.year}</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-muted/50">
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">License Plate</p>
                <p className="font-semibold">{vehicle.license_plate.replace(/[0-9]/g, "*")}</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-muted/50">
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">Capacity</p>
                <p className="font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {vehicle.capacity} Seats
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-muted/50">
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">Daily Price</p>
                <p className="font-semibold">${vehicle.daily_price}</p>
              </CardContent>
            </Card>
          </div>

          {/* Owner Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Owner Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={vehicle.owner.profile_picture || "/placeholder.svg"}
                  alt={vehicle.owner.full_name}
                  onError={(e) => (e.currentTarget.src = "/fallback.jpg")}
                  className="h-16 w-16 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{vehicle.owner.full_name}</h3>
                    {vehicle.owner.isVerified && (
                      <Badge className="gap-1 bg-secondary text-secondary-foreground">
                        <Shield className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{vehicle.owner.rating} Rating</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid gap-3 md:grid-cols-2">
            <Button size="lg" className="gap-2" onClick={() => onBooking(vehicle.id)}>
              <Users className="h-4 w-4" />
              Request Booking
            </Button>
            <Button size="lg" variant="outline" className="gap-2 bg-transparent" onClick={() => onChat(vehicle.id)}>
              <MessageSquare className="h-4 w-4" />
              Chat with Owner
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
