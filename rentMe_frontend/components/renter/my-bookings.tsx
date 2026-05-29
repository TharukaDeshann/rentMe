"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  MapPin,
  DollarSign,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  getMyBookingsAsRenter,
  cancelBookingAsRenter,
} from "@/services/booking.service";
import { Booking, BookingStatus } from "@/types/booking";

const STATUS_STYLES: Record<BookingStatus, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  APPROVED: "bg-secondary/50 text-secondary-foreground",
  ONGOING: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  COMPLETED: "bg-green-500/10 text-green-600 border-green-500/20",
  CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
};

export function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cancel dialog state
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyBookingsAsRenter();
      setBookings(data);
    } catch (err: any) {
      setError(err.message || "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancelConfirm = async () => {
    if (cancellingId === null) return;
    try {
      setCancelLoading(true);
      setCancelError(null);
      const updated = await cancelBookingAsRenter(
        cancellingId,
        cancelReason.trim() || undefined
      );
      // Replace booking in list
      setBookings((prev) =>
        prev.map((b) => (b.bookingId === cancellingId ? updated : b))
      );
      setCancellingId(null);
      setCancelReason("");
    } catch (err: any) {
      setCancelError(err.message || "Failed to cancel booking.");
    } finally {
      setCancelLoading(false);
    }
  };

  const firstPicture = (pictures?: string[] | string) => {
    if (!pictures) return "/placeholder.jpg";
    if (Array.isArray(pictures)) return pictures[0] || "/placeholder.jpg";
    return pictures.split(",")[0].trim();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading bookings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Bookings</h2>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage your vehicle rental history
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchBookings}>
          Refresh
        </Button>
      </div>

      {bookings.length > 0 ? (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <Card key={booking.bookingId} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-[200px_1fr] gap-0">
                  {/* Vehicle Image */}
                  <div className="relative h-48 md:h-auto overflow-hidden bg-muted">
                    <img
                      src={firstPicture(booking.vehiclePictures)}
                      alt={`${booking.vehicleMake} ${booking.vehicleModel}`}
                      onError={(e) =>
                        (e.currentTarget.src = "/placeholder.jpg")
                      }
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Booking Details */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold">
                          {booking.vehicleMake} {booking.vehicleModel}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Booking #{booking.bookingId}
                        </p>
                      </div>
                      <Badge className={STATUS_STYLES[booking.status]}>
                        {booking.status}
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          Start Date
                        </div>
                        <p className="font-medium">{booking.startDate}</p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          End Date
                        </div>
                        <p className="font-medium">{booking.endDate}</p>
                        <p className="text-xs text-muted-foreground">
                          {booking.numberOfDays} days
                        </p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          Pickup
                        </div>
                        <p className="font-medium text-sm">
                          {booking.vehiclePickupLocation}
                        </p>
                      </div>
                    </div>

                    {/* Cancellation reason */}
                    {booking.status === "CANCELLED" &&
                      booking.cancellationReason && (
                        <p className="text-sm text-muted-foreground italic">
                          Reason: {booking.cancellationReason}
                        </p>
                      )}

                    {/* Notes */}
                    {booking.notes && (
                      <p className="text-sm text-muted-foreground">
                        Note: {booking.notes}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                        <span className="text-2xl font-bold">
                          ${Number(booking.totalAmount).toFixed(2)}
                        </span>
                      </div>

                      {/* Actions */}
                      {booking.status === "PENDING" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setCancellingId(booking.bookingId);
                            setCancelError(null);
                            setCancelReason("");
                          }}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel Request
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
            <p className="text-muted-foreground">
              Start browsing vehicles to make your first booking!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={cancellingId !== null}
        onOpenChange={(open) => !open && setCancellingId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to cancel this booking request? This action
              cannot be undone.
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Reason{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </label>
              <Textarea
                placeholder="Let the owner know why you're cancelling..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
              />
            </div>
            {cancelError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{cancelError}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancellingId(null)}
              disabled={cancelLoading}
            >
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelConfirm}
              disabled={cancelLoading}
            >
              {cancelLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Yes, Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}