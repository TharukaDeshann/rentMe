"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Car,
  MapPin,
  Users,
  CalendarDays,
  DollarSign,
  FileText,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Loader2,
  BarChart3,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Info,
  Edit2,
} from "lucide-react";
import { formatLKR } from "@/utils/currency";
import documentService from "@/services/document.service";
import bookingService from "@/services/booking.service";
import { Document, DOCUMENT_TYPE_LABELS } from "@/types/document";
import { Booking } from "@/types/booking";
import { cn } from "@/lib/utils";

interface VehicleProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: any;
  onEdit?: (vehicle: any) => void;
  onManageDocs?: (vehicle: any) => void;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: any;
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex items-start gap-3">
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          accent ?? "bg-primary/10"
        )}
      >
        <Icon className={cn("h-4 w-4", accent ? "text-white" : "text-primary")} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-lg font-bold text-foreground leading-tight">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Photo Gallery ────────────────────────────────────────────────────────────

function PhotoGallery({ photos }: { photos: string[] }) {
  const [current, setCurrent] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="flex h-52 w-full items-center justify-center rounded-xl border border-dashed bg-muted/40 text-muted-foreground gap-2 text-sm">
        <ImageIcon className="h-5 w-5" />
        No photos uploaded
      </div>
    );
  }

  return (
    <div className="relative h-52 w-full overflow-hidden rounded-xl bg-muted">
      <img
        src={photos[current]}
        alt={`Photo ${current + 1}`}
        className="h-full w-full object-cover transition-opacity duration-300"
        onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

      {/* Navigation arrows */}
      {photos.length > 1 && (
        <>
          <button
            onClick={() => setCurrent((p) => (p - 1 + photos.length) % photos.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrent((p) => (p + 1) % photos.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === current ? "w-5 bg-white" : "w-1.5 bg-white/50"
                )}
              />
            ))}
          </div>
        </>
      )}

      {/* Photo count badge */}
      <div className="absolute top-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
        {current + 1} / {photos.length}
      </div>
    </div>
  );
}

// ─── Document Row ─────────────────────────────────────────────────────────────

function DocRow({ doc }: { doc: Document }) {
  const isImage = doc.contentType?.startsWith("image/");
  const label = DOCUMENT_TYPE_LABELS[doc.documentType] ?? doc.documentType;
  const sizeMB = (doc.fileSize / 1024 / 1024).toFixed(2);

  return (
    <a
      href={doc.fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5 hover:bg-muted/60 transition-colors group"
    >
      {isImage ? (
        <div className="h-9 w-12 shrink-0 overflow-hidden rounded border bg-muted">
          <img
            src={doc.fileUrl}
            alt={doc.documentName}
            className="h-full w-full object-cover"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        </div>
      ) : (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded border bg-muted">
          <FileText className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate">{label}</p>
        <p className="text-xs text-muted-foreground truncate">{doc.originalFilename}</p>
      </div>
      <p className="text-xs text-muted-foreground shrink-0">{sizeMB} MB</p>
    </a>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export function VehicleProfileModal({
  open,
  onOpenChange,
  vehicle,
  onEdit,
  onManageDocs,
}: VehicleProfileModalProps) {
  const [docs, setDocs] = useState<Document[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Load documents and bookings when modal opens for a vehicle
  useEffect(() => {
    if (!open || !vehicle) return;
    setDocs([]);
    setBookings([]);

    const fetchDocs = async () => {
      setLoadingDocs(true);
      try {
        const d = await documentService.getVehicleDocuments(vehicle.vehicleId);
        setDocs(d);
      } catch {
        /* silently ignore */
      } finally {
        setLoadingDocs(false);
      }
    };

    const fetchBookings = async () => {
      setLoadingBookings(true);
      try {
        const all = await bookingService.getMyBookingsAsOwner();
        setBookings(all.filter((b) => b.vehicleId === vehicle.vehicleId));
      } catch {
        /* silently ignore */
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchDocs();
    fetchBookings();
  }, [open, vehicle]);

  if (!vehicle) return null;

  // ── Derived data ─────────────────────────────────────────────────────────────
  const pictures = docs.filter((d) => d.documentType === "VEHICLE_PICTURE");
  const otherDocs = docs.filter((d) => d.documentType !== "VEHICLE_PICTURE");
  const photoUrls = pictures.map((p) => p.fileUrl);

  const totalBookings = bookings.length;
  const completedBookings = bookings.filter((b) => b.status === "COMPLETED").length;
  const activeBookings = bookings.filter((b) =>
    ["PENDING", "APPROVED", "ONGOING"].includes(b.status)
  ).length;
  const cancelledBookings = bookings.filter((b) => b.status === "CANCELLED").length;
  const totalRevenue = bookings
    .filter((b) => b.status === "COMPLETED")
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const createdDate = vehicle.createdAt
    ? new Date(vehicle.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-0">
        {/* ── Header ── */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-start justify-between gap-3">
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight">
                {vehicle.make} {vehicle.model}
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <Badge variant="outline" className="text-xs font-medium">
                  {vehicle.type}
                </Badge>
                <Badge
                  className={cn(
                    "text-xs",
                    vehicle.isListed
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {vehicle.isListed ? "Listed" : "Unlisted"}
                </Badge>
                <Badge
                  className={cn(
                    "text-xs",
                    vehicle.isAvailable
                      ? "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400"
                      : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                  )}
                >
                  {vehicle.isAvailable ? "Available" : "Rented Out"}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              {onManageDocs && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 h-8"
                  onClick={() => { onOpenChange(false); onManageDocs(vehicle); }}
                >
                  <FileText className="h-3.5 w-3.5" />
                  Docs
                </Button>
              )}
              {onEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 h-8"
                  onClick={() => { onOpenChange(false); onEdit(vehicle); }}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-6">
          {/* ── Photo Gallery ── */}
          <PhotoGallery photos={photoUrls} />

          {/* ── Core Info ── */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              Vehicle Information
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-muted/40 border border-border p-3">
                <p className="text-xs text-muted-foreground mb-0.5">Make</p>
                <p className="font-semibold text-foreground">{vehicle.make}</p>
              </div>
              <div className="rounded-lg bg-muted/40 border border-border p-3">
                <p className="text-xs text-muted-foreground mb-0.5">Model</p>
                <p className="font-semibold text-foreground">{vehicle.model}</p>
              </div>
              <div className="rounded-lg bg-muted/40 border border-border p-3">
                <p className="text-xs text-muted-foreground mb-0.5">Type</p>
                <p className="font-semibold text-foreground">{vehicle.type}</p>
              </div>
              <div className="rounded-lg bg-muted/40 border border-border p-3">
                <p className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1">
                  <Users className="h-3 w-3" /> Seats
                </p>
                <p className="font-semibold text-foreground">{vehicle.capacity} passengers</p>
              </div>
              <div className="rounded-lg bg-muted/40 border border-border p-3">
                <p className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1">
                  <DollarSign className="h-3 w-3" /> Daily Rate
                </p>
                <p className="font-semibold text-foreground">{formatLKR(vehicle.dailyPrice)}</p>
              </div>
              <div className="rounded-lg bg-muted/40 border border-border p-3">
                <p className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" /> Listed Since
                </p>
                <p className="font-semibold text-foreground">{createdDate}</p>
              </div>
            </div>

            {/* Pickup Location */}
            <div className="mt-3 rounded-lg bg-muted/40 border border-border p-3 flex items-start gap-2">
              <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Pickup Location</p>
                <p className="text-sm font-medium text-foreground">{vehicle.pickupLocation}</p>
                {vehicle.latitude && vehicle.longitude && (
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    {parseFloat(vehicle.latitude).toFixed(4)}, {parseFloat(vehicle.longitude).toFixed(4)}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            {vehicle.description && (
              <div className="mt-3 rounded-lg bg-muted/40 border border-border p-3">
                <p className="text-xs text-muted-foreground mb-1">Description</p>
                <p className="text-sm text-foreground leading-relaxed">{vehicle.description}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* ── Booking Stats ── */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Booking Statistics
            </h3>
            {loadingBookings ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading stats…
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard
                  icon={Car}
                  label="Total Bookings"
                  value={totalBookings}
                />
                <StatCard
                  icon={CheckCircle2}
                  label="Completed"
                  value={completedBookings}
                  accent="bg-emerald-500"
                />
                <StatCard
                  icon={Clock}
                  label="Active"
                  value={activeBookings}
                  accent="bg-sky-500"
                />
                <StatCard
                  icon={XCircle}
                  label="Cancelled"
                  value={cancelledBookings}
                  accent="bg-rose-500"
                />
              </div>
            )}

            {/* Revenue */}
            {!loadingBookings && totalRevenue > 0 && (
              <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-900 p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                    Total Revenue Earned
                  </p>
                  <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                    {formatLKR(totalRevenue)}
                  </p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* ── Documents ── */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Documents & Photos
              {!loadingDocs && (
                <span className="ml-auto text-xs font-normal text-muted-foreground">
                  {docs.length} file{docs.length !== 1 ? "s" : ""}
                </span>
              )}
            </h3>

            {loadingDocs ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading documents…
              </div>
            ) : docs.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-muted/20 py-6 text-center text-sm text-muted-foreground">
                No documents uploaded yet.
              </div>
            ) : (
              <div className="space-y-2">
                {/* Pictures first */}
                {pictures.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Photos ({pictures.length})
                    </p>
                    {pictures.map((doc) => (
                      <DocRow key={doc.documentId} doc={doc} />
                    ))}
                  </div>
                )}
                {/* Other documents */}
                {otherDocs.length > 0 && (
                  <div className="space-y-2 mt-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Legal Documents ({otherDocs.length})
                    </p>
                    {otherDocs.map((doc) => (
                      <DocRow key={doc.documentId} doc={doc} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
