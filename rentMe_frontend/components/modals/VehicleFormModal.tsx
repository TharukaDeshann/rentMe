"use client";

import { useState, useEffect } from "react";
import { Loader2, MapPin, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import vehicleService from "@/services/vehicle.service";
import documentService from "@/services/document.service";
import { MapLocationSelectorModal } from "./MapLocationSelectorModal";
import { VEHICLE_TYPES } from "@/types/booking";

interface VehicleFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle?: any; // If present, we are in EDIT mode. Otherwise ADD mode.
  onSuccess: () => void;
}

export function VehicleFormModal({
  open,
  onOpenChange,
  vehicle,
  onSuccess,
}: VehicleFormModalProps) {
  const isEdit = !!vehicle;
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showMapModal, setShowMapModal] = useState(false);

  // Form & File State
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingDocs, setExistingDocs] = useState<any[]>([]);
  const [deletedDocIds, setDeletedDocIds] = useState<number[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    type: "SEDAN",
    capacity: "5",
    dailyPrice: "",
    pickupLocation: "",
    latitude: "6.9271",
    longitude: "79.8612",
  });

  // Populate data when dialog opens
  useEffect(() => {
    if (open) {
      setFormError(null);
      setSelectedFiles([]);
      setDeletedDocIds([]);
      if (vehicle) {
        setFormData({
          make: vehicle.make || "",
          model: vehicle.model || "",
          type: vehicle.type || "SEDAN",
          capacity: vehicle.capacity?.toString() || "5",
          dailyPrice: vehicle.dailyPrice?.toString() || "",
          pickupLocation: vehicle.pickupLocation || "",
          latitude: vehicle.latitude?.toString() || "6.9271",
          longitude: vehicle.longitude?.toString() || "79.8612",
        });

        // Load existing pictures
        const fetchDocs = async () => {
          try {
            setLoadingDocs(true);
            const docs = await documentService.getVehicleDocuments(vehicle.vehicleId);
            setExistingDocs(docs.filter((d) => d.documentType === "VEHICLE_PICTURE"));
          } catch (err) {
            console.error("Failed to load vehicle pictures", err);
          } finally {
            setLoadingDocs(false);
          }
        };
        fetchDocs();
      } else {
        setFormData({
          make: "",
          model: "",
          type: "SEDAN",
          capacity: "5",
          dailyPrice: "",
          pickupLocation: "",
          latitude: "6.9271",
          longitude: "79.8612",
        });
        setExistingDocs([]);
      }
    }
  }, [open, vehicle]);

  const handleRemoveExistingDoc = (docId: number) => {
    setExistingDocs((prev) => prev.filter((d) => d.documentId !== docId));
    setDeletedDocIds((prev) => [...prev, docId]);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const validFiles = filesArray.filter((file) => {
        const isValidSize = file.size <= 10 * 1024 * 1024;
        const isValidType = ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type);
        return isValidSize && isValidType;
      });

      if (validFiles.length < filesArray.length) {
        toast({
          title: "Some files skipped",
          description: "Files must be smaller than 10MB and be JPEG, PNG, or WEBP.",
          variant: "destructive",
        });
      }

      setSelectedFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLocationSelect = (data: { address: string; latitude: number; longitude: number }) => {
    setFormData((prev) => ({
      ...prev,
      pickupLocation: data.address,
      latitude: data.latitude.toString(),
      longitude: data.longitude.toString(),
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setFormError(null);

    // Validations
    if (!formData.make.trim() || !formData.model.trim() || !formData.pickupLocation.trim()) {
      setFormError("Please fill in Make, Model, and Pickup Location.");
      setIsSubmitting(false);
      return;
    }
    const capacityNum = parseInt(formData.capacity) || 0;
    const priceNum = parseFloat(formData.dailyPrice) || 0;
    if (capacityNum < 1) {
      setFormError("Capacity must be at least 1.");
      setIsSubmitting(false);
      return;
    }
    if (priceNum <= 0) {
      setFormError("Daily price must be greater than 0.");
      setIsSubmitting(false);
      return;
    }

    // Role check for creation
    if (!isEdit) {
      const role = typeof window !== "undefined" ? localStorage.getItem("user_role") : null;
      if (role !== "VEHICLE_OWNER") {
        setFormError("You must be a verified vehicle owner to add vehicles. Please complete owner verification.");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const payload = {
        ...formData,
        capacity: capacityNum,
        dailyPrice: priceNum,
        latitude: parseFloat(formData.latitude) || 0.0,
        longitude: parseFloat(formData.longitude) || 0.0,
      };

      if (isEdit) {
        await vehicleService.updateVehicle(vehicle.vehicleId, payload);

        // Delete documents marked for removal
        for (const docId of deletedDocIds) {
          try {
            await documentService.deleteDocument(docId);
          } catch (err) {
            console.error("Failed to delete document", docId, err);
          }
        }

        // If new files are chosen, replace all remaining existing pictures
        if (selectedFiles.length > 0) {
          for (const doc of existingDocs) {
            try {
              await documentService.deleteDocument(doc.documentId);
            } catch (err) {
              console.error("Failed to delete document", doc.documentId, err);
            }
          }

          // Upload new replacement pictures
          await documentService.uploadVehicleDocuments(
            vehicle.vehicleId,
            selectedFiles,
            "VEHICLE_PICTURE",
            "Vehicle Picture"
          );
        }

        toast({ title: "Vehicle updated", description: "Changes and images saved successfully." });
      } else {
        const created = await vehicleService.createVehicle(payload);
        if (selectedFiles.length > 0) {
          try {
            await documentService.uploadVehicleDocuments(
              created.vehicleId,
              selectedFiles,
              "VEHICLE_PICTURE",
              "Vehicle Picture"
            );
            toast({ title: "Vehicle added", description: `Vehicle listed successfully with ${selectedFiles.length} pictures.` });
          } catch (err: any) {
            toast({
              title: "Pictures upload failed",
              description: "Vehicle was created, but pictures could not be uploaded. You can manage them in Docs.",
              variant: "destructive",
            });
          }
        } else {
          toast({ title: "Vehicle added", description: "Your vehicle was listed successfully." });
        }
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error(error);
      const msg = error?.response?.data?.message || error?.message || "Operation failed";
      setFormError(msg);
      toast({
        title: isEdit ? "Update failed" : "Add vehicle failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Vehicle" : "Add New Vehicle"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Make */}
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="text-right text-sm text-muted-foreground">Make *</Label>
              <Input
                value={formData.make}
                onChange={(e) => handleInputChange("make", e.target.value)}
                placeholder="Toyota"
                className="col-span-2 h-9"
              />
            </div>

            {/* Model */}
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="text-right text-sm text-muted-foreground">Model *</Label>
              <Input
                value={formData.model}
                onChange={(e) => handleInputChange("model", e.target.value)}
                placeholder="Camry"
                className="col-span-2 h-9"
              />
            </div>

            {/* Type */}
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="text-right text-sm text-muted-foreground">Type *</Label>
              <div className="col-span-2">
                <Select value={formData.type} onValueChange={(val) => handleInputChange("type", val)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Capacity */}
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="text-right text-sm text-muted-foreground">Capacity (Seats) *</Label>
              <Input
                type="number"
                value={formData.capacity}
                onChange={(e) => handleInputChange("capacity", e.target.value)}
                placeholder="5"
                className="col-span-2 h-9"
              />
            </div>

            {/* Daily Price */}
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="text-right text-sm text-muted-foreground">Daily Price (LKR) *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.dailyPrice}
                onChange={(e) => handleInputChange("dailyPrice", e.target.value)}
                placeholder="4999"
                className="col-span-2 h-9"
              />
            </div>

            {/* Automated Location Select */}
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="text-right text-sm text-muted-foreground">Pickup Location *</Label>
              <div className="col-span-2 flex gap-2">
                <Input
                  value={formData.pickupLocation}
                  readOnly
                  placeholder="Select location on map..."
                  className="flex-1 h-9 bg-muted/50 cursor-not-allowed"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowMapModal(true)}
                  className="shrink-0 h-9 px-3 gap-1"
                >
                  <MapPin className="h-4 w-4 text-primary" />
                  Map
                </Button>
              </div>
            </div>

            {/* Coordinates display (Readonly, for reference) */}
            {formData.pickupLocation && (
              <div className="grid grid-cols-3 items-center gap-4">
                <span />
                <p className="col-span-2 text-xs text-muted-foreground font-mono">
                  Coordinates: {parseFloat(formData.latitude).toFixed(4)}, {parseFloat(formData.longitude).toFixed(4)}
                </p>
              </div>
            )}

            {/* Pictures section (Both Create and Edit) */}
            <div className="grid grid-cols-3 gap-4 items-start">
              <Label className="text-right text-sm text-muted-foreground pt-2">Pictures</Label>
              <div className="col-span-2 space-y-3">
                {/* Existing Images (Edit mode only) */}
                {isEdit && existingDocs.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground font-medium">Existing Images:</span>
                    {loadingDocs ? (
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground py-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Loading pictures...
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {existingDocs.map((doc) => (
                          <div key={doc.documentId} className="relative h-11 w-16 rounded overflow-hidden border">
                            <img
                              src={doc.fileUrl}
                              alt={doc.documentName}
                              className="h-full w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveExistingDoc(doc.documentId)}
                              className="absolute top-0.5 right-0.5 bg-destructive/80 hover:bg-destructive rounded-full p-0.5 text-white transition-colors"
                              title="Remove image"
                            >
                              <X className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Upload Zone */}
                <div className="border border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center gap-1 hover:bg-muted/30 transition-colors relative cursor-pointer min-h-[90px]">
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">
                    {isEdit ? "Upload new replacement photos" : "Click to upload photos"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">JPEG, PNG, WEBP (Max 10MB)</span>
                </div>

                {/* Selected Files Preview */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-1">
                    {isEdit && (
                      <span className="text-[10px] text-amber-600 font-medium block leading-normal">
                        * Note: Uploading new photos will replace all remaining existing photos.
                      </span>
                    )}
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {selectedFiles.map((file, idx) => (
                        <div key={idx} className="relative h-11 w-16 rounded overflow-hidden border">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${idx + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeSelectedFile(idx)}
                            className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5 text-white hover:bg-black"
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {formError && <p className="text-sm text-destructive text-center font-medium mt-2">{formError}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  Saving...
                </>
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Add Vehicle"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Map location selector */}
      <MapLocationSelectorModal
        open={showMapModal}
        onOpenChange={setShowMapModal}
        initialLat={parseFloat(formData.latitude) || 6.9271}
        initialLng={parseFloat(formData.longitude) || 79.8612}
        onSelect={handleLocationSelect}
      />
    </>
  );
}
