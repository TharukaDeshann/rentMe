"use client"

import { Check, X, User, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { dummyBookings } from "@/lib/dummy-data"

export function BookingRequests() {
  const pendingBookings = dummyBookings.filter((b) => b.status === "pending")

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Booking Requests</h2>

      {pendingBookings.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {pendingBookings.map((booking) => (
            <Card key={booking.id} className="border-0 shadow-sm">
              <CardContent className="pt-6 space-y-4">
                {/* Renter Info */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={booking.renter.profile_picture || "/placeholder.svg"}
                      alt={booking.renter.full_name}
                      onError={(e) => (e.currentTarget.src = "/fallback.jpg")}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold">{booking.renter.full_name}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        Age: {booking.renter.age}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">★ {booking.renter.rating}</Badge>
                </div>

                {/* Trip Dates */}
                <div className="space-y-2 border-t border-border pt-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {booking.pickup_date} to {booking.return_date}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-primary">${booking.total_price.toFixed(2)}</p>
                </div>

                {/* Actions */}
                <div className="grid gap-2 pt-3 grid-cols-2">
                  <Button size="sm" className="gap-1 bg-secondary hover:bg-secondary/90">
                    <Check className="h-4 w-4" />
                    Accept
                  </Button>
                  <Button size="sm" variant="destructive" className="gap-1">
                    <X className="h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No pending booking requests</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
