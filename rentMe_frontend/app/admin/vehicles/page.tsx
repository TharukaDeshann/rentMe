'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  RefreshCw,
  Car,
  Trash2,
  Loader2,
  AlertCircle,
  MapPin,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  Eye,
  SlidersHorizontal,
  DollarSign
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  getAllVehiclesAdmin,
  adminUpdateVehicleAvailability,
  adminDeleteVehicle
} from '@/services/vehicle.service';
import { Vehicle, VehicleType, VEHICLE_TYPES } from '@/types/booking';
import { formatLKR } from '@/utils/currency';

// Helper for stats cards
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

export default function AdminVehiclesPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'AVAILABLE' | 'UNAVAILABLE' | 'LISTED' | 'UNLISTED'>('ALL');

  // Detail Modal & Action loading states
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const [isActionPending, setIsActionPending] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Fetch
  const fetchVehicles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAllVehiclesAdmin(currentPage, 10);
      const data = response.data;
      // Sort by newest
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setVehicles(data);
      setTotalPages(response.meta.totalPages);
      setTotalElements(response.meta.totalElements);
    } catch (err: any) {
      setError(err.message || 'Failed to load vehicles');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // Reset page when filtering changes
  useEffect(() => {
    setCurrentPage(0);
  }, [query, selectedType, selectedStatus]);

  // Derived lists / Filters
  const totalVehiclesCount = totalElements;
  const listedCount = vehicles.filter((v) => v.isListed).length;
  const availableCount = vehicles.filter((v) => v.isAvailable && v.isListed).length;
  const averagePrice = vehicles.length > 0 
    ? Math.round(vehicles.reduce((acc, v) => acc + Number(v.dailyPrice), 0) / vehicles.length)
    : 0;

  const filtered = vehicles.filter((v) => {
    const q = query.toLowerCase();
    const matchesQuery = 
      !q ||
      v.make?.toLowerCase().includes(q) ||
      v.model?.toLowerCase().includes(q) ||
      v.ownerName?.toLowerCase().includes(q) ||
      v.ownerEmail?.toLowerCase().includes(q) ||
      v.pickupLocation?.toLowerCase().includes(q);

    const matchesType = selectedType === 'ALL' || v.type === selectedType;

    const matchesStatus = (() => {
      switch (selectedStatus) {
        case 'AVAILABLE':
          return v.isAvailable && v.isListed;
        case 'UNAVAILABLE':
          return !v.isAvailable && v.isListed;
        case 'LISTED':
          return v.isListed;
        case 'UNLISTED':
          return !v.isListed;
        default:
          return true;
      }
    })();

    return matchesQuery && matchesType && matchesStatus;
  });

  // Toggle Availability Action
  const handleToggleAvailability = async (vehicle: Vehicle) => {
    setIsActionPending(true);
    try {
      const updated = await adminUpdateVehicleAvailability(vehicle.vehicleId, {
        isAvailable: !vehicle.isAvailable
      });
      setVehicles((prev) => prev.map((v) => (v.vehicleId === vehicle.vehicleId ? updated : v)));
      if (selectedVehicle?.vehicleId === vehicle.vehicleId) {
        setSelectedVehicle(updated);
      }
      toast({
        title: 'Status Updated',
        description: `Vehicle "${vehicle.make} ${vehicle.model}" availability set to ${!vehicle.isAvailable ? 'Available' : 'Unavailable'}.`
      });
    } catch (err: any) {
      toast({
        title: 'Action Failed',
        description: err.message || 'Could not update availability.',
        variant: 'destructive'
      });
    } finally {
      setIsActionPending(false);
    }
  };

  // Toggle Listing Status Action
  const handleToggleListing = async (vehicle: Vehicle) => {
    setIsActionPending(true);
    try {
      const updated = await adminUpdateVehicleAvailability(vehicle.vehicleId, {
        isListed: !vehicle.isListed
      });
      setVehicles((prev) => prev.map((v) => (v.vehicleId === vehicle.vehicleId ? updated : v)));
      if (selectedVehicle?.vehicleId === vehicle.vehicleId) {
        setSelectedVehicle(updated);
      }
      toast({
        title: 'Listing Status Updated',
        description: `Vehicle "${vehicle.make} ${vehicle.model}" is now ${!vehicle.isListed ? 'Listed' : 'Unlisted'}.`
      });
    } catch (err: any) {
      toast({
        title: 'Action Failed',
        description: err.message || 'Could not update listing status.',
        variant: 'destructive'
      });
    } finally {
      setIsActionPending(false);
    }
  };

  // Delete Action
  const handleDeleteVehicle = async () => {
    if (!vehicleToDelete) return;
    setIsActionPending(true);
    try {
      await adminDeleteVehicle(vehicleToDelete.vehicleId);
      setVehicles((prev) => prev.filter((v) => v.vehicleId !== vehicleToDelete.vehicleId));
      setSelectedVehicle(null);
      toast({
        title: 'Vehicle Deleted',
        description: `Successfully deleted "${vehicleToDelete.make} ${vehicleToDelete.model}" listing from the system.`
      });
    } catch (err: any) {
      toast({
        title: 'Deletion Failed',
        description: err.message || 'Could not delete vehicle. Make sure it has no ongoing or pending bookings.',
        variant: 'destructive'
      });
    } finally {
      setIsActionPending(false);
      setVehicleToDelete(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">System Vehicles</h2>
          <p className="text-muted-foreground mt-1">
            Monitor and manage all vehicle listings in the system
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchVehicles}
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
          label="Total Registered"
          value={totalVehiclesCount}
          icon={<Car className="h-4 w-4 text-primary" />}
          accent="bg-primary/10"
        />
        <StatCard
          label="Listed on Market"
          value={listedCount}
          icon={<Car className="h-4 w-4 text-emerald-600" />}
          accent="bg-emerald-50 dark:bg-emerald-950/20"
        />
        <StatCard
          label="Currently Available"
          value={availableCount}
          icon={<CheckCircle2 className="h-4 w-4 text-teal-600" />}
          accent="bg-teal-50 dark:bg-teal-950/20"
        />
        <StatCard
          label="Avg Daily Rate"
          value={formatLKR(averagePrice)}
          icon={<DollarSign className="h-4 w-4 text-amber-600" />}
          accent="bg-amber-50 dark:bg-amber-950/20"
        />
      </div>

      {/* Error display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search & Filters Row */}
      <Card className="border border-border shadow-none">
        <CardContent className="p-4 flex flex-col md:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by make, model, owner, location..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 h-10 w-full"
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto shrink-0">
            {/* Type selector */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="h-10 px-3 rounded-lg border border-input bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="ALL">All Types</option>
              {VEHICLE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            {/* Status selector */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="h-10 px-3 rounded-lg border border-input bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="UNAVAILABLE">Unavailable</option>
              <option value="LISTED">Listed</option>
              <option value="UNLISTED">Unlisted</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Vehicles Table / Listing */}
      <Card className="border border-border shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vehicle</th>
                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Owner</th>
                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Daily Price</th>
                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Listing</th>
                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Availability</th>
                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    <p className="text-sm text-muted-foreground mt-2">Loading vehicles...</p>
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((vehicle) => (
                  <tr key={vehicle.vehicleId} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-foreground text-sm">
                        {vehicle.make} {vehicle.model}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {vehicle.pickupLocation}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-foreground">
                      <Badge variant="secondary" className="text-xs uppercase">
                        {vehicle.type}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm">
                      <div className="font-medium text-foreground">{vehicle.ownerName}</div>
                      <div className="text-xs text-muted-foreground">{vehicle.ownerEmail}</div>
                    </td>
                    <td className="p-4 text-sm font-semibold text-foreground">
                      {formatLKR(vehicle.dailyPrice)}
                    </td>
                    <td className="p-4 text-sm">
                      <Badge
                        variant="outline"
                        className={vehicle.isListed 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400' 
                          : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400'
                        }
                      >
                        {vehicle.isListed ? 'Listed' : 'Unlisted'}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm">
                      <Badge
                        variant="outline"
                        className={vehicle.isAvailable && vehicle.isListed
                          ? 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/20 dark:text-teal-400' 
                          : 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400'
                        }
                      >
                        {vehicle.isAvailable && vehicle.isListed ? 'Available' : 'Unavailable'}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedVehicle(vehicle)}
                          title="View Details"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleListing(vehicle)}
                          disabled={isActionPending}
                          title={vehicle.isListed ? 'Unlist vehicle' : 'List vehicle'}
                          className="text-xs h-8 px-2"
                        >
                          {vehicle.isListed ? 'Unlist' : 'List'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleAvailability(vehicle)}
                          disabled={isActionPending || !vehicle.isListed}
                          title={vehicle.isAvailable ? 'Set Unavailable' : 'Set Available'}
                          className="text-xs h-8 px-2"
                        >
                          {vehicle.isAvailable ? 'Block' : 'Unblock'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setVehicleToDelete(vehicle)}
                          disabled={isActionPending}
                          title="Delete Vehicle"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground text-sm">
                    {query ? `No vehicles found matching "${query}"` : 'No vehicles in the system.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/10">
          <div className="text-xs text-muted-foreground">
            Showing {totalElements === 0 ? 0 : currentPage * 10 + 1} to {Math.min((currentPage + 1) * 10, totalElements)} of {totalElements} vehicles
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
              disabled={currentPage === 0 || isLoading}
            >
              Previous
            </Button>
            <div className="text-xs font-medium px-2">
              Page {currentPage + 1} of {totalPages || 1}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
              disabled={currentPage >= totalPages - 1 || isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* Vehicle Detail Dialog */}
      <Dialog open={!!selectedVehicle} onOpenChange={(open) => !open && setSelectedVehicle(null)}>
        <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
          {selectedVehicle && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center justify-between">
                  <span>{selectedVehicle.make} {selectedVehicle.model}</span>
                  <Badge className="text-xs uppercase">{selectedVehicle.type}</Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-2 text-sm">
                {/* Image carousel or single image */}
                {selectedVehicle.pictures && selectedVehicle.pictures.length > 0 ? (
                  <div className="relative h-48 w-full rounded-lg overflow-hidden border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedVehicle.pictures[0]}
                      alt={`${selectedVehicle.make} ${selectedVehicle.model}`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="h-48 w-full rounded-lg bg-muted flex items-center justify-center border text-muted-foreground">
                    No Images Uploaded
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <span className="text-xs text-muted-foreground block">Vehicle ID</span>
                    <span className="font-mono text-sm font-medium">#{selectedVehicle.vehicleId}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Daily Rate</span>
                    <span className="text-sm font-semibold text-foreground">{formatLKR(selectedVehicle.dailyPrice)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Capacity</span>
                    <span className="text-sm font-medium">{selectedVehicle.capacity} Persons</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Location</span>
                    <span className="text-sm font-medium flex items-center gap-1">
                      <MapPin className="h-3 w-3 shrink-0 text-muted-foreground" />
                      {selectedVehicle.pickupLocation}
                    </span>
                  </div>
                </div>

                {selectedVehicle.description && (
                  <div>
                    <span className="text-xs text-muted-foreground block mb-0.5">Description</span>
                    <p className="text-xs leading-relaxed text-muted-foreground bg-muted/40 p-2.5 rounded-lg border">
                      {selectedVehicle.description}
                    </p>
                  </div>
                )}

                <Separator />

                {/* Owner Information */}
                <div>
                  <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-2">Owner Information</h4>
                  <div className="space-y-2 bg-muted/30 p-3 rounded-lg border border-border">
                    <div className="font-medium text-foreground text-sm">{selectedVehicle.ownerName}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      {selectedVehicle.ownerEmail}
                    </div>
                    {selectedVehicle.ownerContactNumber && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        {selectedVehicle.ownerContactNumber}
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Status Toggles in Dialog */}
                <div>
                  <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-2">Management Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleListing(selectedVehicle)}
                      disabled={isActionPending}
                    >
                      {selectedVehicle.isListed ? 'Unlist from Market' : 'List on Market'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleAvailability(selectedVehicle)}
                      disabled={isActionPending || !selectedVehicle.isListed}
                    >
                      {selectedVehicle.isAvailable ? 'Block Booking' : 'Make Available'}
                    </Button>
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-4">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setVehicleToDelete(selectedVehicle);
                  }}
                  className="mr-auto"
                >
                  Delete Listing
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedVehicle(null)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!vehicleToDelete} onOpenChange={(open) => !open && setVehicleToDelete(null)}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle className="text-red-600 font-bold flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span>Confirm Delete Listing</span>
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground py-2 leading-relaxed">
            Are you sure you want to permanently delete the listing for{' '}
            <strong className="text-foreground">
              {vehicleToDelete?.make} {vehicleToDelete?.model}
            </strong>
            ? This action is irreversible, and will delete all associated photos and booking records.
          </p>

          <DialogFooter className="gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVehicleToDelete(null)}
              disabled={isActionPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteVehicle}
              disabled={isActionPending}
              className="gap-1.5"
            >
              {isActionPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
