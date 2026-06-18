'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Search,
  RefreshCw,
  Calendar,
  AlertCircle,
  Loader2,
  FileCheck,
  Ban,
  CircleCheck,
  PlayCircle,
  CheckCircle,
  XCircle,
  Eye,
  SlidersHorizontal,
  Mail,
  Phone,
  User,
  Car
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  getAllBookingsAdmin,
  adminUpdateBookingStatus
} from '@/services/booking.service';
import { Booking, BookingStatus } from '@/types/booking';
import { formatLKR } from '@/utils/currency';

// Stats card
interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent: string;
}

function StatCard({ label, value, icon, accent }: StatCardProps) {
  return (
    <Card className="border border-border shadow-none">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${accent}`}>
            {icon}
          </div>
        </div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}

export default function AdminBookingsPage() {
  const { toast } = useToast();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modal / Action states
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isActionPending, setIsActionPending] = useState(false);

  // Fetch
  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllBookingsAdmin();
      // Sort: newest first
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setBookings(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Derived metrics
  const totalCount = bookings.length;
  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length;
  const ongoingCount = bookings.filter((b) => b.status === 'ONGOING').length;
  const totalVolume = bookings
    .filter((b) => b.status !== 'CANCELLED')
    .reduce((acc, b) => acc + Number(b.totalAmount), 0);

  const filtered = bookings.filter((b) => {
    const q = query.toLowerCase();
    const matchesQuery =
      !q ||
      b.bookingId.toString().includes(q) ||
      b.renterName?.toLowerCase().includes(q) ||
      b.renterEmail?.toLowerCase().includes(q) ||
      b.ownerName?.toLowerCase().includes(q) ||
      b.vehicleMake?.toLowerCase().includes(q) ||
      b.vehicleModel?.toLowerCase().includes(q);

    const matchesStatus = selectedStatus === 'ALL' || b.status === selectedStatus;

    return matchesQuery && matchesStatus;
  });

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400">
            Pending
          </Badge>
        );
      case 'APPROVED':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400">
            Approved
          </Badge>
        );
      case 'ONGOING':
        return (
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400">
            Ongoing
          </Badge>
        );
      case 'COMPLETED':
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400">
            Completed
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400">
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleUpdateStatus = async (booking: Booking, newStatus: 'APPROVED' | 'COMPLETED') => {
    setIsActionPending(true);
    try {
      const updated = await adminUpdateBookingStatus(booking.bookingId, {
        newStatus
      });
      setBookings((prev) => prev.map((b) => (b.bookingId === booking.bookingId ? updated : b)));
      if (selectedBooking?.bookingId === booking.bookingId) {
        setSelectedBooking(updated);
      }
      toast({
        title: 'Booking Updated',
        description: `Booking #${booking.bookingId} status is now ${newStatus}.`
      });
    } catch (err: any) {
      toast({
        title: 'Failed to Update',
        description: err.message || 'Could not update status.',
        variant: 'destructive'
      });
    } finally {
      setIsActionPending(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!bookingToCancel) return;
    setIsActionPending(true);
    try {
      const updated = await adminUpdateBookingStatus(bookingToCancel.bookingId, {
        newStatus: 'CANCELLED',
        cancellationReason: cancellationReason || 'Cancelled by Administrator'
      });
      setBookings((prev) => prev.map((b) => (b.bookingId === bookingToCancel.bookingId ? updated : b)));
      if (selectedBooking?.bookingId === bookingToCancel.bookingId) {
        setSelectedBooking(updated);
      }
      toast({
        title: 'Booking Cancelled',
        description: `Booking #${bookingToCancel.bookingId} has been cancelled by admin.`
      });
    } catch (err: any) {
      toast({
        title: 'Cancellation Failed',
        description: err.message || 'Could not cancel booking.',
        variant: 'destructive'
      });
    } finally {
      setIsActionPending(false);
      setBookingToCancel(null);
      setCancellationReason('');
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">System Bookings</h2>
          <p className="text-muted-foreground mt-1">
            Monitor and manage all customer bookings and status overrides
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchBookings}
          disabled={isLoading}
          className="gap-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Bookings"
          value={totalCount}
          icon={<FileCheck className="h-4 w-4 text-primary" />}
          accent="bg-primary/10"
        />
        <StatCard
          label="Pending Approvals"
          value={pendingCount}
          icon={<AlertCircle className="h-4 w-4 text-yellow-600" />}
          accent="bg-yellow-50 dark:bg-yellow-950/20"
        />
        <StatCard
          label="Ongoing Rentals"
          value={ongoingCount}
          icon={<PlayCircle className="h-4 w-4 text-indigo-600" />}
          accent="bg-indigo-50 dark:bg-indigo-950/20"
        />
        <StatCard
          label="Rental Volume"
          value={formatLKR(totalVolume)}
          icon={<Calendar className="h-4 w-4 text-emerald-600" />}
          accent="bg-emerald-50 dark:bg-emerald-950/20"
        />
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search & Filters */}
      <Card className="border border-border shadow-none">
        <CardContent className="p-4 flex flex-col md:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by Booking ID, renter, owner, vehicle..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 h-10 w-full"
            />
          </div>

          <div className="w-full md:w-auto shrink-0">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-10 px-3 rounded-lg border border-input bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring w-full"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="ONGOING">Ongoing</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border border-border shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Booking ID</th>
                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vehicle</th>
                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Renter</th>
                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rental Period</th>
                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Amount</th>
                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    <p className="text-sm text-muted-foreground mt-2">Loading bookings...</p>
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((booking) => (
                  <tr key={booking.bookingId} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-mono font-medium text-sm text-foreground">
                      #{booking.bookingId}
                    </td>
                    <td className="p-4 text-sm text-foreground">
                      <div className="font-medium">{booking.vehicleMake} {booking.vehicleModel}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Owner: {booking.ownerName}</div>
                    </td>
                    <td className="p-4 text-sm">
                      <div className="font-medium text-foreground">{booking.renterName}</div>
                      <div className="text-xs text-muted-foreground">{booking.renterEmail}</div>
                    </td>
                    <td className="p-4 text-sm text-foreground">
                      <div>
                        {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {booking.numberOfDays} {booking.numberOfDays === 1 ? 'day' : 'days'}
                      </div>
                    </td>
                    <td className="p-4 text-sm font-semibold text-foreground">
                      {formatLKR(booking.totalAmount)}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedBooking(booking)}
                          title="View Details"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {booking.status === 'PENDING' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateStatus(booking, 'APPROVED')}
                            disabled={isActionPending}
                            title="Approve booking"
                            className="text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-8 px-2"
                          >
                            Approve
                          </Button>
                        )}
                        
                        {booking.status === 'ONGOING' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateStatus(booking, 'COMPLETED')}
                            disabled={isActionPending}
                            title="Mark as Completed"
                            className="text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 h-8 px-2"
                          >
                            Complete
                          </Button>
                        )}

                        {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setBookingToCancel(booking)}
                            disabled={isActionPending}
                            title="Cancel Booking"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground text-sm">
                    {query ? `No bookings found matching "${query}"` : 'No bookings in the system.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
          {selectedBooking && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center justify-between">
                  <span>Booking #{selectedBooking.bookingId}</span>
                  {getStatusBadge(selectedBooking.status)}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-2 text-sm">
                <div className="grid grid-cols-2 gap-3 bg-muted/20 p-3 rounded-lg border border-border">
                  <div>
                    <span className="text-xs text-muted-foreground block">Rental Period</span>
                    <span className="font-medium text-sm">
                      {formatDate(selectedBooking.startDate)} - {formatDate(selectedBooking.endDate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Duration</span>
                    <span className="font-medium text-sm">{selectedBooking.numberOfDays} Days</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Daily Price</span>
                    <span className="font-medium text-sm">{formatLKR(selectedBooking.dailyPrice)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Total Amount</span>
                    <span className="font-semibold text-sm text-foreground">{formatLKR(selectedBooking.totalAmount)}</span>
                  </div>
                </div>

                {selectedBooking.notes && (
                  <div>
                    <span className="text-xs text-muted-foreground block mb-0.5">Booking Notes</span>
                    <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 p-2.5 rounded-lg border">
                      {selectedBooking.notes}
                    </p>
                  </div>
                )}

                {selectedBooking.status === 'CANCELLED' && selectedBooking.cancellationReason && (
                  <div>
                    <span className="text-xs text-red-600 block mb-0.5 font-medium">Cancellation Reason</span>
                    <p className="text-xs text-red-700 bg-red-50/50 p-2.5 rounded-lg border border-red-100 leading-relaxed">
                      {selectedBooking.cancellationReason}
                    </p>
                  </div>
                )}

                <Separator />

                {/* Vehicle Section */}
                <div>
                  <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-2">Vehicle Details</h4>
                  <div className="flex items-center gap-3 bg-muted/10 p-3 rounded-lg border">
                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
                      <Car className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground text-sm">
                        {selectedBooking.vehicleMake} {selectedBooking.vehicleModel}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Type: {selectedBooking.vehicleType} · {selectedBooking.vehiclePickupLocation}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Renter & Owner info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-2">Renter</h4>
                    <div className="space-y-1.5 p-3 bg-muted/20 rounded-lg border border-border">
                      <div className="font-medium text-sm text-foreground flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        {selectedBooking.renterName}
                      </div>
                      <div className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
                        <Mail className="h-3 w-3" />
                        {selectedBooking.renterEmail}
                      </div>
                      {selectedBooking.renterContactNumber && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Phone className="h-3 w-3" />
                          {selectedBooking.renterContactNumber}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-2">Vehicle Owner</h4>
                    <div className="space-y-1.5 p-3 bg-muted/20 rounded-lg border border-border">
                      <div className="font-medium text-sm text-foreground flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        {selectedBooking.ownerName}
                      </div>
                      <div className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
                        <Mail className="h-3 w-3" />
                        {selectedBooking.ownerEmail}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedBooking.status !== 'CANCELLED' && selectedBooking.status !== 'COMPLETED' && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-2">Management Actions</h4>
                      <div className="flex gap-2">
                        {selectedBooking.status === 'PENDING' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateStatus(selectedBooking, 'APPROVED')}
                            disabled={isActionPending}
                            className="flex-1"
                          >
                            Approve Booking
                          </Button>
                        )}
                        {selectedBooking.status === 'ONGOING' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateStatus(selectedBooking, 'COMPLETED')}
                            disabled={isActionPending}
                            className="flex-1"
                          >
                            Mark Completed
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setBookingToCancel(selectedBooking)}
                          disabled={isActionPending}
                          className="flex-1"
                        >
                          Cancel Booking
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <DialogFooter className="mt-4">
                <Button variant="outline" size="sm" onClick={() => setSelectedBooking(null)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={!!bookingToCancel} onOpenChange={(open) => !open && setBookingToCancel(null)}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle className="text-red-600 font-bold flex items-center gap-2">
              <Ban className="h-5 w-5" />
              <span>Cancel Booking</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Are you sure you want to cancel Booking <strong className="text-foreground">#{bookingToCancel?.bookingId}</strong>? 
              This will notify both the renter and owner. Please provide a cancellation reason.
            </p>
            <div className="space-y-1.5">
              <label htmlFor="reason" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Cancellation Reason
              </label>
              <Textarea
                id="reason"
                placeholder="Reason for cancellation (e.g. Vehicle safety issue, policy violation)..."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="h-20 text-sm"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setBookingToCancel(null);
                setCancellationReason('');
              }}
              disabled={isActionPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleCancelBooking}
              disabled={isActionPending}
              className="gap-1.5"
            >
              {isActionPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
