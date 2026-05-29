"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Car,
  CheckCircle2,
  FileText,
  Loader2,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import vehicleService from "@/services/vehicle.service";
import { VehicleDocumentUpload } from "@/components/owner/vehicle-document-upload";
import { MapLocationSelectorModal } from "@/components/modals/MapLocationSelectorModal";
import { Vehicle, VehicleType, VEHICLE_TYPES } from "@/types/booking";
import { cn } from "@/lib/utils";


// ─── Step indicator ─────────────────────────────────────────────────────────

function StepBadge({
  step,
  label,
  active,
  done,
}: {
  step: number;
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors",
          done
            ? "bg-secondary text-secondary-foreground"
            : active
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        {done ? <CheckCircle2 className="h-4 w-4" /> : step}
      </div>
      <span
        className={cn(
          "text-sm font-medium",
          active ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Step 1: Vehicle Details Form ─────────────────────────────────────────

interface VehicleFormState {
  make: string;
  model: string;
  type: VehicleType;
  capacity: string;
  dailyPrice: string;
  description: string;
  pickupLocation: string;
  latitude: string;
  longitude: string;
}

function VehicleDetailsStep({
  form,
  setForm,
  onNext,
  isSubmitting,
  error,
}: {
  form: VehicleFormState;
  setForm: React.Dispatch<React.SetStateAction<VehicleFormState>>;
  onNext: () => void;
  isSubmitting: boolean;
  error: string | null;
}) {
  const [showMapModal, setShowMapModal] = useState(false);

  const handleLocationSelect = (data: { address: string; latitude: number; longitude: number }) => {
    setForm((prev) => ({
      ...prev,
      pickupLocation: data.address,
      latitude: data.latitude.toString(),
      longitude: data.longitude.toString(),
    }));
  };

  const set = (field: keyof VehicleFormState, val: string) =>
    setForm((p) => ({ ...p, [field]: val }));

  return (
    <Card className="border border-border shadow-none">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Car className="h-5 w-5 text-primary" />
          Vehicle Details
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Enter the basic information about your vehicle.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Make + Model */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="make">Make *</Label>
            <Input
              id="make"
              value={form.make}
              onChange={(e) => set("make", e.target.value)}
              placeholder="Toyota"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="model">Model *</Label>
            <Input
              id="model"
              value={form.model}
              onChange={(e) => set("model", e.target.value)}
              placeholder="Camry"
            />
          </div>
        </div>

        {/* Type + Capacity */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="type">Vehicle Type *</Label>
            <Select
              value={form.type}
              onValueChange={(v) => set("type", v as VehicleType)}
            >
              <SelectTrigger id="type">
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
          <div className="space-y-1.5">
            <Label htmlFor="capacity">Seats *</Label>
            <Input
              id="capacity"
              type="number"
              min={1}
              max={50}
              value={form.capacity}
              onChange={(e) => set("capacity", e.target.value)}
              placeholder="5"
            />
          </div>
        </div>

        {/* Daily price */}
        <div className="space-y-1.5">
          <Label htmlFor="dailyPrice">Daily Rate (LKR) *</Label>
          <Input
            id="dailyPrice"
            type="number"
            step="0.01"
            min="0.01"
            value={form.dailyPrice}
            onChange={(e) => set("dailyPrice", e.target.value)}
            placeholder="4999"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="A well-maintained vehicle in excellent condition..."
            rows={3}
            className="resize-none"
          />
        </div>

        <Separator />

        {/* Pickup location */}
        <div className="space-y-1.5">
          <Label htmlFor="pickupLocation">Pickup Location *</Label>
          <div className="flex gap-2">
            <Input
              id="pickupLocation"
              value={form.pickupLocation}
              readOnly
              placeholder="Select location on map..."
              className="flex-1 bg-muted/50 cursor-not-allowed"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowMapModal(true)}
              className="shrink-0 gap-1"
            >
              <MapPin className="h-4 w-4 text-primary" />
              Map
            </Button>
          </div>
        </div>

        {/* Coordinates reference */}
        {form.pickupLocation && (
          <p className="text-xs text-muted-foreground font-mono">
            Coordinates: {parseFloat(form.latitude).toFixed(4)}, {parseFloat(form.longitude).toFixed(4)}
          </p>
        )}

        {error && (
          <p className="text-sm text-destructive font-medium">{error}</p>
        )}

        <Button
          onClick={onNext}
          disabled={isSubmitting}
          className="w-full gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating vehicle…
            </>
          ) : (
            <>
              Continue to Document Upload
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </CardContent>

      <MapLocationSelectorModal
        open={showMapModal}
        onOpenChange={setShowMapModal}
        initialLat={parseFloat(form.latitude) || 6.9271}
        initialLng={parseFloat(form.longitude) || 79.8612}
        onSelect={handleLocationSelect}
      />
    </Card>
  );
}

// ─── Step 2: Document Upload ────────────────────────────────────────────────

function DocumentUploadStep({
  vehicle,
  onDone,
}: {
  vehicle: Vehicle;
  onDone: () => void;
}) {
  return (
    <div className="space-y-4">
      <Card className="border border-secondary/30 bg-secondary/5 shadow-none">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/15">
              <CheckCircle2 className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                {vehicle.make} {vehicle.model} created!
              </p>
              <p className="text-sm text-muted-foreground">
                Vehicle ID #{vehicle.vehicleId} — now upload the required legal
                documents.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 p-4 text-sm text-amber-800 dark:text-amber-300">
        <p className="font-semibold mb-1">Documents required</p>
        <ul className="list-disc list-inside space-y-0.5 text-amber-700 dark:text-amber-400">
          <li>Vehicle Registration Certificate</li>
          <li>Insurance Policy</li>
          <li>Vehicle Photograph (at least one)</li>
        </ul>
      </div>

      <VehicleDocumentUpload
        vehicleId={vehicle.vehicleId}
        showExisting={false}
        onUploaded={() => {}}
      />

      <Button variant="outline" onClick={onDone} className="w-full gap-2">
        <CheckCircle2 className="h-4 w-4 text-secondary" />
        Done — Go to My Vehicles
      </Button>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

/**
 * /owner/vehicles/create
 * Two-step flow:
 *  1. Fill vehicle details → POST /owner/vehicles
 *  2. Upload required legal documents → POST /owner/vehicles/:id/documents
 */
export default function CreateVehiclePage() {
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState<1 | 2>(1);
  const [createdVehicle, setCreatedVehicle] = useState<Vehicle | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<VehicleFormState>({
    make: "",
    model: "",
    type: "SEDAN",
    capacity: "5",
    dailyPrice: "",
    description: "",
    pickupLocation: "",
    latitude: "6.9271",
    longitude: "79.8612",
  });

  const handleCreateVehicle = async () => {
    setError(null);

    // Client-side validation
    if (!form.make.trim() || !form.model.trim() || !form.pickupLocation.trim()) {
      setError("Make, Model, and Pickup Location are required.");
      return;
    }
    const capacity = parseInt(form.capacity);
    const dailyPrice = parseFloat(form.dailyPrice);
    if (!capacity || capacity < 1) {
      setError("Capacity must be at least 1.");
      return;
    }
    if (!dailyPrice || dailyPrice <= 0) {
      setError("Daily price must be greater than 0.");
      return;
    }

    setIsSubmitting(true);
    try {
      const vehicle = await vehicleService.createVehicle({
        make: form.make.trim(),
        model: form.model.trim(),
        type: form.type,
        capacity,
        dailyPrice,
        description: form.description.trim() || undefined,
        pickupLocation: form.pickupLocation.trim(),
        latitude: parseFloat(form.latitude) || 6.9271,
        longitude: parseFloat(form.longitude) || 79.8612,
        pictures: "",
      });

      setCreatedVehicle(vehicle);
      setStep(2);
      toast({
        title: "Vehicle created!",
        description: "Now upload the required legal documents.",
      });
    } catch (err: any) {
      setError(err.message || "Failed to create vehicle.");
      toast({
        title: "Creation failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/owner/vehicles")}
          className="text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Add New Vehicle
          </h1>
          <p className="text-sm text-muted-foreground">
            Complete both steps to list your vehicle.
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
        <StepBadge
          step={1}
          label="Vehicle Details"
          active={step === 1}
          done={step === 2}
        />
        <div className="flex-1 h-px bg-border" />
        <StepBadge
          step={2}
          label="Upload Documents"
          active={step === 2}
          done={false}
        />
      </div>

      {/* Step content */}
      {step === 1 && (
        <VehicleDetailsStep
          form={form}
          setForm={setForm}
          onNext={handleCreateVehicle}
          isSubmitting={isSubmitting}
          error={error}
        />
      )}

      {step === 2 && createdVehicle && (
        <DocumentUploadStep
          vehicle={createdVehicle}
          onDone={() => router.push("/owner/vehicles")}
        />
      )}
    </div>
  );
}
