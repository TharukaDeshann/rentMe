"use client"

import { useState } from "react"
import { X, Calendar, Clock, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { dummyVehicles, dummyLocations } from "@/lib/dummy-data"

interface BookingFormProps {
  vehicleId: string
  onClose: () => void
}

export function BookingForm({ vehicleId, onClose }: BookingFormProps) {
  const vehicle = dummyVehicles.find((v) => v.id === vehicleId)
  const [pickupDate, setPickupDate] = useState("")
  const [pickupTime, setPickupTime] = useState("10:00")
  const [returnDate, setReturnDate] = useState("")
  const [returnTime, setReturnTime] = useState("10:00")

  if (!vehicle) return null

  const calculateDays = () => {
    if (!pickupDate || !returnDate) return 0
    const pickup = new Date(pickupDate)
    const returnDay = new Date(returnDate)
    return Math.ceil((returnDay.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24))
  }

  const totalPrice = calculateDays() * vehicle.daily_price

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-border p-6">
          <h2 className="text-xl font-bold">Request Booking</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-6 w-6" />
          </button>
        </div>

        <ScrollArea className="flex-1 overflow-hidden">
          <CardContent className="space-y-4 p-6">
            {/* Vehicle Summary */}
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-sm text-muted-foreground">Vehicle</p>
              <p className="font-semibold">
                {vehicle.make} {vehicle.model} • ${vehicle.daily_price}/day
              </p>
            </div>

            {/* Pickup Date & Time */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4" />
                Pickup Date
              </label>
              <Input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Clock className="h-4 w-4" />
                Pickup Time
              </label>
              <Input type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} />
            </div>

            {/* Return Date & Time */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4" />
                Return Date
              </label>
              <Input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Clock className="h-4 w-4" />
                Return Time
              </label>
              <Input type="time" value={returnTime} onChange={(e) => setReturnTime(e.target.value)} />
            </div>

            {/* Pickup Location */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <MapPin className="h-4 w-4" />
                Pickup Location
              </label>
              <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                {dummyLocations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Summary */}
            {calculateDays() > 0 && (
              <Card className="border-0 bg-muted/50">
                <CardContent className="space-y-2 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{calculateDays()} days</span>
                    <span className="font-medium">${vehicle.daily_price}/day</span>
                  </div>
                  <div className="border-t border-border pt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold">Total Price</span>
                      <span className="text-lg font-bold text-primary">${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </ScrollArea>

        <div className="border-t border-border p-6 bg-card">
          <div className="grid gap-2 grid-cols-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="gap-2"
              disabled={!pickupDate || !returnDate}
              onClick={() => {
                alert(`Booking request sent! Total: $${totalPrice.toFixed(2)}`)
                onClose()
              }}
            >
              Confirm Booking
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
