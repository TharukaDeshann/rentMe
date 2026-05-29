"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import vehicleService from "@/services/vehicle.service";
import { useToast } from '@/hooks/use-toast';

export function MyVehicles() {
  const [ownerVehicles, setOwnerVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    type: "SEDAN",
    capacity: "5",
    dailyPrice: "",
    pickupLocation: "",
    latitude: "6.9271",
    longitude: "79.8612"
  });
  const { toast } = useToast();
  const [formError, setFormError] = useState<string | null>(null);

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
    setFormData({
      make: vehicle.make || "",
      model: vehicle.model || "",
      type: vehicle.type || "SEDAN",
      capacity: vehicle.capacity?.toString() || "5",
      dailyPrice: vehicle.dailyPrice?.toString() || "",
      pickupLocation: vehicle.pickupLocation || "",
      latitude: vehicle.latitude?.toString() || "6.9271",
      longitude: vehicle.longitude?.toString() || "79.8612"
    });
    setShowEditDialog(true);
  };

  const handleAddOpen = () => {
    setFormData({
      make: "",
      model: "",
      type: "SEDAN",
      capacity: "5",
      dailyPrice: "",
      pickupLocation: "",
      latitude: "6.9271",
      longitude: "79.8612"
    });
    setShowAddDialog(true);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddSubmit = async () => {
    setIsSubmitting(true);
    setFormError(null);
    // Basic client-side validation
    if (!formData.make || !formData.model || !formData.pickupLocation) {
      setFormError('Please fill in Make, Model and Pickup Location.');
      setIsSubmitting(false);
      return;
    }
    const capacityNum = parseInt(formData.capacity as string) || 0;
    const priceNum = parseFloat(formData.dailyPrice as string) || 0;
    if (capacityNum < 1) {
      setFormError('Capacity must be at least 1.');
      setIsSubmitting(false);
      return;
    }
    if (priceNum <= 0) {
      setFormError('Daily price must be greater than 0.');
      setIsSubmitting(false);
      return;
    }
    // Role check: require VEHICLE_OWNER
    const role = typeof window !== 'undefined' ? localStorage.getItem('user_role') : null;
    if (role !== 'VEHICLE_OWNER') {
      setFormError('You must be a verified vehicle owner to add vehicles. Please complete owner verification.');
      setIsSubmitting(false);
      return;
    }
    try {
      await vehicleService.createVehicle({
        ...formData,
        capacity: parseInt(formData.capacity) || 5,
        dailyPrice: parseFloat(formData.dailyPrice) || 0.0,
        latitude: parseFloat(formData.latitude) || 0.0,
        longitude: parseFloat(formData.longitude) || 0.0,
        pictures: "https://via.placeholder.com/400x250",
        legalDocuments: "{}"
      });
      setShowAddDialog(false);
      fetchMyVehicles();
      toast({ title: 'Vehicle added', description: 'Your vehicle was listed successfully.' });
    } catch (error) {
      console.error(error);
      // Surface backend error message
      const msg = error?.response?.data?.message || error?.message || 'Failed to add vehicle';
      setFormError(msg);
      toast({ title: 'Add vehicle failed', description: msg, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async () => {
    setIsSubmitting(true);
    try {
      await vehicleService.updateVehicle(selectedVehicle.vehicleId, {
        ...formData,
        capacity: parseInt(formData.capacity) || 5,
        dailyPrice: parseFloat(formData.dailyPrice) || 0.0,
        latitude: parseFloat(formData.latitude) || 0.0,
        longitude: parseFloat(formData.longitude) || 0.0,
      });
      setShowEditDialog(false);
      fetchMyVehicles();
      toast({ title: 'Vehicle updated', description: 'Changes saved.' });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await vehicleService.deleteVehicle(id);
      fetchMyVehicles();
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleListing = async (vehicle: any) => {
    try {
      await vehicleService.updateVehicleAvailability(vehicle.vehicleId, {
        isListed: !vehicle.isListed
      });
      fetchMyVehicles();
    } catch (error) {
      console.error(error);
    }
  };

  const VehicleFormContent = () => (
    <div className="grid gap-4 py-2">
      <div className="grid grid-cols-3 items-center gap-4">
        <Label className="text-right text-sm text-muted-foreground">Make</Label>
        <Input 
          value={formData.make} 
          onChange={(e) => handleInputChange("make", e.target.value)}
          placeholder="Toyota" className="col-span-2 h-9" 
        />
      </div>
      <div className="grid grid-cols-3 items-center gap-4">
        <Label className="text-right text-sm text-muted-foreground">Model</Label>
        <Input 
          value={formData.model} 
          onChange={(e) => handleInputChange("model", e.target.value)}
          placeholder="Camry" className="col-span-2 h-9" 
        />
      </div>
      <div className="grid grid-cols-3 items-center gap-4">
        <Label className="text-right text-sm text-muted-foreground">Type</Label>
        <div className="col-span-2">
          <Select value={formData.type} onValueChange={(val) => handleInputChange("type", val)}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["SEDAN", "SUV", "TRUCK", "VAN", "HATCHBACK"].map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-3 items-center gap-4">
        <Label className="text-right text-sm text-muted-foreground">Capacity (Seats)</Label>
        <Input 
          type="number"
          value={formData.capacity} 
          onChange={(e) => handleInputChange("capacity", e.target.value)}
          placeholder="5" className="col-span-2 h-9" 
        />
      </div>
      <div className="grid grid-cols-3 items-center gap-4">
        <Label className="text-right text-sm text-muted-foreground">Daily Price ($)</Label>
        <Input 
          type="number" step="0.01"
          value={formData.dailyPrice} 
          onChange={(e) => handleInputChange("dailyPrice", e.target.value)}
          placeholder="49.99" className="col-span-2 h-9" 
        />
      </div>
      <div className="grid grid-cols-3 items-center gap-4">
        <Label className="text-right text-sm text-muted-foreground">Pickup Location</Label>
        <Input 
          value={formData.pickupLocation} 
          onChange={(e) => handleInputChange("pickupLocation", e.target.value)}
          placeholder="Colombo 03" className="col-span-2 h-9" 
        />
      </div>
    </div>
  );

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
                      src={vehicle.pictures?.split(',')[0]?.trim() || "/placeholder.jpg"}
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
                      <p className="font-semibold text-foreground">${vehicle.dailyPrice}</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-xs text-muted-foreground mb-0.5">Status</p>
                      <Badge className={vehicle.isAvailable ? "status-approved" : "status-ongoing"}>
                        {vehicle.isAvailable ? "Available" : "Rented"}
                      </Badge>
                    </div>

                    <div className="flex gap-1.5 ml-auto">
                      <Button size="sm" variant="outline" className="gap-1.5 h-8" onClick={() => handleEdit(vehicle)}>
                        <Edit2 className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1.5 h-8 text-muted-foreground hover:text-foreground" onClick={() => handleToggleListing(vehicle)}>
                         {vehicle.isListed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-destructive hover:text-destructive hover:bg-destructive/8" onClick={() => handleDelete(vehicle.vehicleId)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>
          </DialogHeader>
          <VehicleFormContent />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleEditSubmit} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Vehicle</DialogTitle>
          </DialogHeader>
          <VehicleFormContent />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleAddSubmit} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Vehicle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
