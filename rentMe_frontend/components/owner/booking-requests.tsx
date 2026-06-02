"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Check,
  X,
  Calendar,
  Tag,
  Loader2,
  AlertCircle,
  MapPin,
  Clock,
} from "lucide-react";
import { formatLKR } from "@/utils/currency";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getMyBookingsAsOwner,
  getPendingBookingRequests,
  updateBookingStatusAsOwner,
} from "@/services/booking.service";
import { Booking, BookingStatus } from "@/types/booking";

const STATUS_STYLES: Record<BookingStatus, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  APPROVED: "bg-secondary/50 text-secondary-foreground",
  ONGOING: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  COMPLETED: "bg-green-500/10 text-green-600 border-green-500/20",
  CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
};

export function BookingRequests() {
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reject dialog
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [pending, all] = await Promise.all([
        getPendingBookingRequests(),
        getMyBookingsAsOwner(),
      ]);
      setPendingBookings(pending);
      setAllBookings(all);
    } catch (err: any) {
      setError(err.message || "Failed to load booking data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApprove = async (bookingId: number) => {
    try {
      setActionLoading(true);
      setActionError(null);
      const updated = await updateBookingStatusAsOwner(bookingId, {
        newStatus: "APPROVED",
      });
      // Update both lists
      const update = (prev: Booking[]) =>
        prev.map((b) => (b.bookingId === bookingId ? updated : b));
      setPendingBookings((prev) =>
        prev.filter((b) => b.bookingId !== bookingId)
      );
      setAllBookings(update);
    } catch (err: any) {
      setActionError(err.message || "Failed to approve booking.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (rejectingId === null) return;
    try {
      setActionLoading(true);
      setActionError(null);
      const updated = await updateBookingStatusAsOwner(rejectingId, {
        newStatus: "CANCELLED",
        cancellationReason: rejectReason.trim() || undefined,
      });
      setPendingBookings((prev) =>
        prev.filter((b) => b.bookingId !== rejectingId)
      );
      setAllBookings((prev) =>
        prev.map((b) => (b.bookingId === rejectingId ? updated : b))
      );
      setRejectingId(null);
      setRejectReason("");
    } catch (err: any) {
      setActionError(err.message || "Failed to reject booking.");
    } finally {
      setActionLoading(false);
    }
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
        <h2 className="text-2xl font-bold">Booking Requests</h2>
        <Button variant="outline" size="sm" onClick={fetchData}>
          Refresh
        </Button>
      </div>

      {actionError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending
            {pendingBookings.length > 0 && (
              <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-yellow-500 text-white">
                {pendingBookings.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">All Bookings</TabsTrigger>
        </TabsList>

        {/* Pending Tab */}
        <TabsContent value="pending" className="mt-6">
          {pendingBookings.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {pendingBookings.map((booking) => (
                <Card key={booking.bookingId} className="border-0 shadow-sm">
                  <CardContent className="pt-6 space-y-4">
                    {/* Renter Info */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                          {booking.renterName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold">{booking.renterName}</p>
                          <p className="text-xs text-muted-foreground">
                            {booking.renterEmail}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {booking.renterContactNumber}
                          </p>
                        </div>
                      </div>
                      <Badge className={STATUS_STYLES["PENDING"]}>PENDING</Badge>
                    </div>

                    {/* Vehicle */}
                    <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm">
                      <p className="font-medium">
                        {booking.vehicleMake} {booking.vehicleModel}
                      </p>
                      <p className="text-muted-foreground text-xs flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" />
                        {booking.vehiclePickupLocation}
                      </p>
                    </div>

                    {/* Trip Dates */}
                    <div className="space-y-2 border-t border-border pt-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {booking.startDate} → {booking.endDate}
                        </span>
                        <span className="text-muted-foreground">
                          ({booking.numberOfDays} days)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        {formatLKR(booking.totalAmount)}
                      </div>
                      {booking.notes && (
                        <p className="text-xs text-muted-foreground italic">
                          "{booking.notes}"
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="grid gap-2 pt-3 grid-cols-2">
                      <Button
                        size="sm"
                        className="gap-1 bg-secondary hover:bg-secondary/90"
                        disabled={actionLoading}
                        onClick={() => handleApprove(booking.bookingId)}
                      >
                        {actionLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="gap-1"
                        disabled={actionLoading}
                        onClick={() => {
                          setRejectingId(booking.bookingId);
                          setRejectReason("");
                          setActionError(null);
                        }}
                      >
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
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="font-semibold">No pending requests</p>
                <p className="text-sm text-muted-foreground mt-1">
                  New booking requests from renters will appear here
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* All Bookings Tab */}
        <TabsContent value="all" className="mt-6">
          {allBookings.length > 0 ? (
            <div className="grid gap-3">
              {allBookings.map((booking) => (
                <Card key={booking.bookingId} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Renter Avatar */}
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold shrink-0">
                        {booking.renterName.charAt(0)}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium">{booking.renterName}</p>
                          <span className="text-muted-foreground">→</span>
                          <p className="font-medium">
                            {booking.vehicleMake} {booking.vehicleModel}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {booking.startDate} – {booking.endDate}
                          </span>
                          <span>·</span>
                          <span>{booking.numberOfDays} days</span>
                        </div>
                      </div>

                      {/* Price & Status */}
                      <div className="text-right shrink-0">
                        <p className="font-bold">
                          {formatLKR(booking.totalAmount)}
                        </p>
                        <Badge className={`mt-1 ${STATUS_STYLES[booking.status]}`}>
                          {booking.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Cancellation reason */}
                    {booking.status === "CANCELLED" &&
                      booking.cancellationReason && (
                        <p className="text-xs text-muted-foreground mt-2 ml-14 italic">
                          Reason: {booking.cancellationReason}
                        </p>
                      )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-sm">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No bookings yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog
        open={rejectingId !== null}
        onOpenChange={(open) => !open && setRejectingId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Booking Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              This will notify the renter that their request was not accepted.
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Reason{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </label>
              <Textarea
                placeholder="e.g. Vehicle under maintenance on those dates..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
              />
            </div>
            {actionError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{actionError}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectingId(null)}
              disabled={actionLoading}
            >
              Go Back
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={actionLoading}
            >
              {actionLoading && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}