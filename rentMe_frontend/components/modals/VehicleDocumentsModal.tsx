"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VehicleDocumentUpload } from "../owner/vehicle-document-upload";

interface VehicleDocumentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: any;
  onSuccess?: () => void;
}

export function VehicleDocumentsModal({
  open,
  onOpenChange,
  vehicle,
  onSuccess,
}: VehicleDocumentsModalProps) {
  if (!vehicle) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Manage Documents — {vehicle.make} {vehicle.model}
          </DialogTitle>
        </DialogHeader>
        <VehicleDocumentUpload
          vehicleId={vehicle.vehicleId}
          showExisting={true}
          onUploaded={() => {
            // Call success handler to trigger parent state refresh
            onSuccess?.();
            // Automatically close modal
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
