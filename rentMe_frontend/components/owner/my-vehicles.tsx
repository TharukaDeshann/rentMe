"use client";

import { useState, useEffect } from "react";
import { formatLKR } from "@/utils/currency";
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import vehicleService from "@/services/vehicle.service";
import bookingService from "@/services/booking.service";
import documentService from "@/services/document.service";
import { useToast } from "@/hooks/use-toast";
import { VehicleFormModal } from "@/components/modals/VehicleFormModal";
import { VehicleDocumentsModal } from "@/components/modals/VehicleDocumentsModal";
import { ConfirmDeleteModal } from "@/components/modals/ConfirmDeleteModal";

export function MyVehicles() {
  const [ownerVehicles, setOwnerVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Modals Visibility
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

  const [showDocsModal, setShowDocsModal] = useState(false);
  const [selectedVehicleForDocs, setSelectedVehicleForDocs] = useState<any>(null);

  // Delete Confirmation Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingVehicleId, setDeletingVehicleId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [checkingDelete, setCheckingDelete] = useState(false);
  const [deleteWarningData, setDeleteWarningData] = useState<{
    docCount: number;
    bookingCount: number;
  } | null>(null);

  const fetchMyVehicles = async () => {
    try {
      setLoading(true);
      const data = await vehicleService.getMyVehiclesAsOwner();
      setOwnerVehicles(data);
    } catch (error) {
      console.error("Failed to fetch vehicles", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyVehicles();
  }, []);

  const handleEdit = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setShowFormModal(true);
  };

  const handleAddOpen = () => {
    setSelectedVehicle(null);
    setShowFormModal(true);
  };

  const handleDeleteClick = async (vehicleId: number) => {
    try {
      setCheckingDelete(true);
      setDeletingVehicleId(vehicleId);
      const docs = await documentService.getVehicleDocuments(vehicleId);
      const allBookings = await bookingService.getMyBookingsAsOwner();
      const vehicleBookings = allBookings.filter((b) => b.vehicleId === vehicleId);

      const activeBookings = vehicleBookings.filter((b) =>
        ["PENDING", "APPROVED", "ONGOING"].includes(b.status)
      );

      if (activeBookings.length > 0) {
        toast({
          title: "Deletion prevented",
          description: "This vehicle has pending, approved, or ongoing bookings and cannot be deleted. Please resolve them first.",
          variant: "destructive",
        });
        setDeletingVehicleId(null);
        return;
      }

      setDeleteWarningData({
        docCount: docs.length,
        bookingCount: vehicleBookings.length,
      });
      setShowDeleteModal(true);
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Check failed",
        description: "Failed to verify vehicle booking status.",
        variant: "destructive",
      });
      setDeletingVehicleId(null);
    } finally {
      setCheckingDelete(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingVehicleId) return;
    try {
      setDeleteLoading(true);
      await vehicleService.deleteVehicle(deletingVehicleId);
      setShowDeleteModal(false);
      setDeletingVehicleId(null);
      setDeleteWarningData(null);
      fetchMyVehicles();
      toast({ title: "Vehicle deleted", description: "Vehicle removed successfully." });
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete vehicle.",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleListing = async (vehicle: any) => {
    try {
      await vehicleService.updateVehicleAvailability(vehicle.vehicleId, {
        isListed: !vehicle.isListed,
      });
      fetchMyVehicles();
      toast({
        title: vehicle.isListed ? "Vehicle unlisted" : "Vehicle listed",
        description: `Vehicle is now ${vehicle.isListed ? "hidden" : "visible"} to renters.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleManageDocs = (vehicle: any) => {
    setSelectedVehicleForDocs(vehicle);
    setShowDocsModal(true);
  };

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">My Vehicles</h1>
          {!loading && (
            <p className="text-sm text-muted-foreground mt-1">
              {ownerVehicles.length} vehicle{ownerVehicles.length !== 1 ? "s" : ""} listed
            </p>
          )}
        </div>
        <Button className="gap-2 h-9" onClick={handleAddOpen}>
          <Plus className="h-4 w-4" />
          Add Vehicle
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : ownerVehicles.length === 0 ? (
        <div className="text-center py-10 bg-muted/30 rounded-xl border border-dashed text-muted-foreground">
          You don't have any vehicles listed yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {ownerVehicles.map((vehicle) => (
            <Card key={vehicle.vehicleId} className="border border-border shadow-none overflow-hidden">
              <CardContent className="p-0">
                <div className="grid sm:grid-cols-[160px_1fr] gap-0">
                  <div className="relative h-36 sm:h-auto bg-muted overflow-hidden">
                    <img
                      src={
                        (Array.isArray(vehicle.pictures)
                          ? vehicle.pictures[0]
                          : vehicle.pictures?.split(",")[0]?.trim()) || "/placeholder.jpg"
                      }
                      alt={`${vehicle.make} ${vehicle.model}`}
                      onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3 p-5">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-foreground">
                        {vehicle.make} {vehicle.model}
                      </h3>
                      <p className="text-sm text-muted-foreground">{vehicle.type}</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-xs text-muted-foreground mb-0.5">Pickup Location</p>
                      <p className="font-mono font-medium text-foreground">{vehicle.pickupLocation}</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-xs text-muted-foreground mb-0.5">Daily Rate</p>
                      <p className="font-semibold text-foreground">{formatLKR(vehicle.dailyPrice)}</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-xs text-muted-foreground mb-0.5">Status</p>
                      <Badge className={vehicle.isAvailable ? "status-approved" : "status-ongoing"}>
                        {vehicle.isAvailable ? "Available" : "Rented"}
                      </Badge>
                    </div>

                    <div className="flex gap-1.5 ml-auto">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 h-8 text-primary hover:text-primary hover:bg-primary/5"
                        onClick={() => handleManageDocs(vehicle)}
                      >
                        <FileText className="h-3.5 w-3.5" />
                        Docs
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1.5 h-8" onClick={() => handleEdit(vehicle)}>
                        <Edit2 className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 h-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleToggleListing(vehicle)}
                      >
                        {vehicle.isListed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-destructive hover:text-destructive hover:bg-destructive/8"
                        onClick={() => handleDeleteClick(vehicle.vehicleId)}
                        disabled={checkingDelete && deletingVehicleId === vehicle.vehicleId}
                      >
                        {checkingDelete && deletingVehicleId === vehicle.vehicleId ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Unified Add / Edit Vehicle Modal */}
      <VehicleFormModal
        open={showFormModal}
        onOpenChange={setShowFormModal}
        vehicle={selectedVehicle}
        onSuccess={fetchMyVehicles}
      />

      {/* Document management Modal */}
      <VehicleDocumentsModal
        open={showDocsModal}
        onOpenChange={setShowDocsModal}
        vehicle={selectedVehicleForDocs}
        onSuccess={fetchMyVehicles}
      />

      {/* Reusable Delete Confirmation Modal */}
      <ConfirmDeleteModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={confirmDelete}
        title="Delete Vehicle"
        isLoading={deleteLoading}
        description={
          <div className="space-y-3">
            <p className="font-medium text-destructive">
              Warning: This is a permanent action that cannot be undone.
            </p>
            <div className="text-xs text-muted-foreground space-y-1 bg-destructive/5 p-3 rounded-md border border-destructive/10">
              <p>Deleting this vehicle will also permanently delete:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Associated vehicle documents ({deleteWarningData?.docCount || 0} files)</li>
                <li>All past completed or cancelled bookings ({deleteWarningData?.bookingCount || 0} bookings)</li>
                <li>All uploaded vehicle pictures</li>
              </ul>
            </div>
            <p className="text-xs">
              Are you sure you want to delete this vehicle listing from the system?
            </p>
          </div>
        }
      />
    </div>
  );
}
