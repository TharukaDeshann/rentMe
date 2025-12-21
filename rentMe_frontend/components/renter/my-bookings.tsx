"use client"

import { Calendar, MapPin, DollarSign } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { dummyBookings } from "@/lib/dummy-data"

export function MyBookings() {
  const renterBookings = dummyBookings.filter((b) => b.renter.id === "renter-1")

  // Generate more sample bookings for demonstration
  const allBookings = [
    ...renterBookings,
    {
      id: "booking-2",
      vehicle: {
        id: "vehicle-2",
        make: "Honda",
        model: "CR-V",
        image_url: "/honda-crv-suv.png",
      },
      pickup_date: "2025-01-20",
      pickup_time: "09:00",
      return_date: "2025-01-25",
      return_time: "09:00",
      pickup_location: { name: "Airport Terminal" },
      status: "confirmed",
      total_price: 349.95,
    },
    {
      id: "booking-3",
      vehicle: {
        id: "vehicle-3",
        make: "BMW",
        model: "3 Series",
        image_url: "/bmw-3-series-luxury-car.jpg",
      },
      pickup_date: "2024-12-15",
      pickup_time: "14:00",
      return_date: "2024-12-18",
      return_time: "14:00",
      pickup_location: { name: "Downtown Center" },
      status: "completed",
      total_price: 299.97,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
      case "confirmed":
        return "bg-secondary/50 text-secondary-foreground"
      case "completed":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      case "cancelled":
        return "bg-destructive/10 text-destructive border-destructive/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">My Bookings</h2>
        <p className="text-sm text-muted-foreground mt-1">View and manage your vehicle rental history</p>
      </div>

      {allBookings.length > 0 ? (
        <div className="grid gap-4">
          {allBookings.map((booking: any) => (
            <Card key={booking.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-[200px_1fr] gap-0">
                  {/* Vehicle Image */}
                  <div className="relative h-48 md:h-auto overflow-hidden bg-muted">
                    <img
                      src={booking.vehicle.image_url || "/placeholder.svg"}
                      alt={`${booking.vehicle.make} ${booking.vehicle.model}`}
                      onError={(e) => (e.currentTarget.src = "/fallback.jpg")}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Booking Details */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold">
                          {booking.vehicle.make} {booking.vehicle.model}
                        </h3>
                        <p className="text-sm text-muted-foreground">Booking ID: {booking.id}</p>
                      </div>
                      <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          Pickup
                        </div>
                        <p className="font-medium">{booking.pickup_date}</p>
                        <p className="text-sm text-muted-foreground">{booking.pickup_time}</p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          Return
                        </div>
                        <p className="font-medium">{booking.return_date}</p>
                        <p className="text-sm text-muted-foreground">{booking.return_time}</p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          Location
                        </div>
                        <p className="font-medium">{booking.pickup_location.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                        <span className="text-2xl font-bold">${booking.total_price}</span>
                      </div>

                      {booking.status === "confirmed" && (
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          <Button variant="destructive" size="sm">
                            Cancel
                          </Button>
                        </div>
                      )}

                      {booking.status === "pending" && (
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      )}

                      {booking.status === "completed" && (
                        <Button variant="outline" size="sm">
                          Book Again
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No Bookings Yet</h3>
            <p className="text-muted-foreground">Start browsing vehicles to make your first booking!</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
