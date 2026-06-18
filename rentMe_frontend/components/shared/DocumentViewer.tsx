"use client";

import { useState } from "react";
import { ExternalLink, FileText, X, ZoomIn } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Document, DOCUMENT_TYPE_LABELS } from "@/types/document";
import { cn } from "@/lib/utils";

// ─── Thumbnail card ───────────────────────────────────────────────────────────

interface DocumentThumbnailProps {
  doc: Document;
  onView: (doc: Document) => void;
  onDelete?: (doc: Document) => void;
  isDeleting?: boolean;
}

function DocumentThumbnail({
  doc,
  onView,
  onDelete,
  isDeleting,
}: DocumentThumbnailProps) {
  const isPdf =
    doc.contentType === "application/pdf" ||
    doc.originalFilename?.endsWith(".pdf");

  return (
    <div className="group relative flex flex-col gap-2 rounded-xl border border-border bg-card p-3 transition-shadow hover:shadow-md">
      {/* Preview area */}
      <div
        className="relative h-32 w-full cursor-pointer overflow-hidden rounded-lg bg-muted"
        onClick={() => onView(doc)}
      >
        {isPdf ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <FileText className="h-10 w-10" />
            <span className="text-xs">PDF Document</span>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={doc.fileUrl}
            alt={doc.documentName}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.classList.remove("hidden");
            }}
          />
        )}

        {/* Hover overlay */}
        {!isPdf && (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <ZoomIn className="h-6 w-6 text-white" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">
          {doc.documentName}
        </p>
        <Badge variant="outline" className="mt-1 text-xs">
          {DOCUMENT_TYPE_LABELS[doc.documentType]}
        </Badge>
        <p className="mt-1 text-xs text-muted-foreground">
          {new Date(doc.uploadedAt).toLocaleDateString()}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-1.5">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 h-7 text-xs gap-1"
          onClick={() => onView(doc)}
        >
          <ZoomIn className="h-3 w-3" />
          View
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs gap-1"
          asChild
        >
          <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3 w-3" />
          </a>
        </Button>
        {onDelete && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/8"
            onClick={() => onDelete(doc)}
            disabled={isDeleting}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Lightbox modal ───────────────────────────────────────────────────────────

interface DocumentLightboxProps {
  doc: Document | null;
  onClose: () => void;
}

function DocumentLightbox({ doc, onClose }: DocumentLightboxProps) {
  if (!doc) return null;
  const isPdf =
    doc.contentType === "application/pdf" ||
    doc.originalFilename?.endsWith(".pdf");

  return (
    <Dialog open={!!doc} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {doc.documentName}
            <Badge variant="outline" className="text-xs font-normal">
              {DOCUMENT_TYPE_LABELS[doc.documentType]}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="mt-2 overflow-hidden rounded-lg border border-border bg-muted">
          {isPdf ? (
            <iframe
              src={doc.fileUrl}
              title={doc.documentName}
              className="h-[70vh] w-full"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={doc.fileUrl}
              alt={doc.documentName}
              className="max-h-[70vh] w-full object-contain"
            />
          )}
        </div>
        <div className="flex justify-between items-center pt-2">
          <p className="text-xs text-muted-foreground">
            Uploaded {new Date(doc.uploadedAt).toLocaleString()}
          </p>
          <Button variant="outline" size="sm" asChild>
            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              Open original
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main DocumentViewer ──────────────────────────────────────────────────────

interface DocumentViewerProps {
  documents: Document[];
  onDelete?: (doc: Document) => void;
  deletingId?: number | null;
  className?: string;
}

/**
 * Grid of document thumbnails with click-to-lightbox preview.
 * Reused in admin verification detail and owner verification page.
 */
export function DocumentViewer({
  documents,
  onDelete,
  deletingId,
  className,
}: DocumentViewerProps) {
  const [viewing, setViewing] = useState<Document | null>(null);

  if (documents.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">
        No documents uploaded.
      </p>
    );
  }

  return (
    <>
      <div
        className={cn(
          "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3",
          className
        )}
      >
        {documents.map((doc) => (
          <DocumentThumbnail
            key={doc.documentId}
            doc={doc}
            onView={setViewing}
            onDelete={onDelete}
            isDeleting={deletingId === doc.documentId}
          />
        ))}
      </div>
      <DocumentLightbox doc={viewing} onClose={() => setViewing(null)} />
    </>
  );
}
