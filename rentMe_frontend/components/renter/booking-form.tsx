"use client";

import { useEffect, useState } from "react";
import { X, Calendar, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import bookingService from "@/services/booking.service";
import vehicleService from "@/services/vehicle.service";
import { Vehicle, Booking } from "@/types/booking";

interface BookingFormProps {
  vehicle?: Vehicle;
  vehicleId?: number;
  onClose: () => void;
  onSuccess?: (booking: Booking) => void;
}

export function BookingForm({ vehicle, vehicleId, onClose, onSuccess }: BookingFormProps) {
  const today = new Date().toISOString().split("T")[0];

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [vehicleLoading, setVehicleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle | null>(vehicle ?? null);

  useEffect(() => {
    if (vehicle) {
      setCurrentVehicle(vehicle);
      return;
    }
    if (!vehicleId) return;

    const fetchVehicle = async () => {
      try {
        setVehicleLoading(true);
        setError(null);
        const data = await vehicleService.getVehicleById(vehicleId);
        setCurrentVehicle(data);
      } catch (err: any) {
        setError(err.message || "Failed to load vehicle details.");
      } finally {
        setVehicleLoading(false);
      }
    };

    fetchVehicle();
  }, [vehicle, vehicleId]);

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const diff =
      new Date(endDate).getTime() - new Date(startDate).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const days = calculateDays();
  const totalPrice =
    days > 0 && currentVehicle ? days * currentVehicle.dailyPrice : 0;

  const isValid = startDate && endDate && days >= 1 && currentVehicle;

  const handleSubmit = async () => {
    if (!isValid) return;
    try {
      setLoading(true);
      setError(null);
      const booking = await bookingService.createBooking({
        vehicleId: currentVehicle!.vehicleId,
        startDate,
        endDate,
        notes: notes.trim() || undefined,
      });
      if (onSuccess) {
        onSuccess(booking);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to submit booking request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-6 shrink-0">
          <h2 className="text-xl font-bold">Request Booking</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <ScrollArea className="flex-1 overflow-hidden">
          <CardContent className="space-y-5 p-6">
            {vehicleLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading vehicle details...
              </div>
            )}
            {/* Vehicle Summary */}
            {currentVehicle && (
              <div className="rounded-lg bg-muted/50 p-3 space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Vehicle
              </p>
              <p className="font-semibold">
                {currentVehicle.make} {currentVehicle.model}
              </p>
              <p className="text-sm text-muted-foreground">
                ${currentVehicle.dailyPrice}/day · {currentVehicle.pickupLocation}
              </p>
            </div>
            )}

            {/* Error */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Start Date */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4" />
                Start Date
              </label>
              <Input
                type="date"
                min={today}
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  // Reset end date if it's before new start date
                  if (endDate && e.target.value >= endDate) setEndDate("");
                }}
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4" />
                End Date
              </label>
              <Input
                type="date"
                min={
                  startDate
                    ? new Date(new Date(startDate).getTime() + 86400000)
                        .toISOString()
                        .split("T")[0]
                    : today
                }
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={!startDate}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Notes{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </label>
              <Textarea
                placeholder="Any special requests for the owner..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
                rows={3}
              />
              <p className="text-xs text-muted-foreground text-right">
                {notes.length}/500
              </p>
            </div>

            {/* Price Summary */}
            {days > 0 && currentVehicle && (
              <Card className="border-0 bg-muted/50">
                <CardContent className="space-y-2 pt-4 pb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {days} {days === 1 ? "day" : "days"} ×
                    </span>
                    <span className="font-medium">
                      ${currentVehicle.dailyPrice}/day
                    </span>
                  </div>
                  <div className="border-t border-border pt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold">Estimated Total</span>
                      <span className="text-lg font-bold text-primary">
                        ${totalPrice.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Final amount confirmed by the owner
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-border p-6 bg-card shrink-0">
          <div className="grid gap-2 grid-cols-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              className="gap-2"
              disabled={!isValid || loading}
              onClick={handleSubmit}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Confirm Request
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}