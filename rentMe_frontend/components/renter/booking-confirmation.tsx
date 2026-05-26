"use client";

import { CheckCircle2, Calendar, MapPin, DollarSign, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Booking } from "@/types/booking";

interface BookingConfirmationProps {
  booking: Booking;
  onClose: () => void;
  onViewBookings: () => void;
}

export function BookingConfirmation({
  booking,
  onClose,
  onViewBookings,
}: BookingConfirmationProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md">
        <div className="flex items-center justify-between border-b border-border p-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Booking Requested!</h2>
              <p className="text-sm text-muted-foreground">
                Awaiting owner approval
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <CardContent className="space-y-4 p-6">
          {/* Status */}
          <div className="flex items-center justify-between rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-4 py-3">
            <span className="text-sm font-medium text-yellow-700">Status</span>
            <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">
              PENDING
            </Badge>
          </div>

          {/* Vehicle */}
          <div className="rounded-lg bg-muted/50 p-4 space-y-3">
            <h3 className="font-semibold">
              {booking.vehicleMake} {booking.vehicleModel}
            </h3>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 shrink-0" />
                <div>
                  <p className="font-medium text-foreground">
                    {booking.startDate}
                  </p>
                  <p>Start date</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 shrink-0" />
                <div>
                  <p className="font-medium text-foreground">
                    {booking.endDate}
                  </p>
                  <p>End date</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                <MapPin className="h-4 w-4 shrink-0" />
                <p className="font-medium text-foreground">
                  {booking.vehiclePickupLocation}
                </p>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-center justify-between border-t border-border pt-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              {booking.numberOfDays} days × ${booking.dailyPrice}/day
            </div>
            <span className="text-xl font-bold">
              ${Number(booking.totalAmount).toFixed(2)}
            </span>
          </div>

          {booking.notes && (
            <div className="text-sm">
              <p className="text-muted-foreground mb-1">Your notes:</p>
              <p className="text-foreground italic">"{booking.notes}"</p>
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>
              Browse More
            </Button>
            <Button onClick={onViewBookings}>View My Bookings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}