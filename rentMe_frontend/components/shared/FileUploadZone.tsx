"use client";

import { useCallback, useRef, useState } from "react";
import {
  FileText,
  Image as ImageIcon,
  Upload,
  X,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DocumentType, DOCUMENT_TYPE_LABELS } from "@/types/document";

// ─── Constants ────────────────────────────────────────────────────────────────

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const ALLOWED_EXTENSIONS = ".pdf, .jpg, .jpeg, .png, .webp";
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB — mirrors FileValidationService

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FileWithMeta {
  file: File;
  /** Client-side preview URL (createObjectURL) — null for PDFs */
  previewUrl: string | null;
  documentType: DocumentType;
  documentName: string;
  /** Validation error message if invalid */
  error?: string;
}

interface FileUploadZoneProps {
  /** Document types the user can choose from for each file */
  allowedDocumentTypes: DocumentType[];
  /** Default document type for new uploads */
  defaultDocumentType?: DocumentType;
  /** Max number of files. Undefined = unlimited */
  maxFiles?: number;
  onChange: (files: FileWithMeta[]) => void;
  className?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function validateFile(file: File): string | undefined {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `"${file.name}" — unsupported type. Allowed: PDF, JPG, PNG, WEBP.`;
  }
  if (file.size > MAX_SIZE_BYTES) {
    return `"${file.name}" exceeds the 10 MB limit.`;
  }
  return undefined;
}

function buildPreviewUrl(file: File): string | null {
  if (file.type.startsWith("image/")) {
    return URL.createObjectURL(file);
  }
  return null;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Drag-and-drop file upload zone with per-file preview, type selector,
 * name label, and remove button. Validates file type and size client-side
 * matching the backend's FileValidationService rules.
 */
export function FileUploadZone({
  allowedDocumentTypes,
  defaultDocumentType,
  maxFiles,
  onChange,
  className,
}: FileUploadZoneProps) {
  const [files, setFiles] = useState<FileWithMeta[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const defaultType = defaultDocumentType ?? allowedDocumentTypes[0];

  const addFiles = useCallback(
    (incoming: FileList | null) => {
      if (!incoming) return;
      const next = [...files];

      Array.from(incoming).forEach((file) => {
        if (maxFiles && next.length >= maxFiles) return;
        const error = validateFile(file);
        const previewUrl = error ? null : buildPreviewUrl(file);
        next.push({
          file,
          previewUrl,
          documentType: defaultType,
          documentName: file.name.replace(/\.[^.]+$/, ""), // strip extension
          error,
        });
      });

      setFiles(next);
      onChange(next);
    },
    [files, defaultType, maxFiles, onChange]
  );

  const remove = (idx: number) => {
    const next = files.filter((_, i) => i !== idx);
    // revoke object URL to avoid memory leak
    if (files[idx].previewUrl) URL.revokeObjectURL(files[idx].previewUrl!);
    setFiles(next);
    onChange(next);
  };

  const updateField = (
    idx: number,
    field: "documentType" | "documentName",
    value: string
  ) => {
    const next = files.map((f, i) =>
      i === idx ? { ...f, [field]: value } : f
    );
    setFiles(next);
    onChange(next);
  };

  // ── Drag handlers ──────────────────────────────────────────────────────────

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);

  const canAddMore = !maxFiles || files.length < maxFiles;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Drop zone */}
      {canAddMore && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 cursor-pointer",
            "transition-colors duration-200 select-none",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50"
          )}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Upload className="h-5 w-5 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              Drop files here or{" "}
              <span className="text-primary underline underline-offset-2">
                browse
              </span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {ALLOWED_EXTENSIONS} · Max 10 MB per file
              {maxFiles ? ` · Up to ${maxFiles} file${maxFiles > 1 ? "s" : ""}` : ""}
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED_EXTENSIONS}
            multiple={!maxFiles || maxFiles > 1}
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((item, idx) => (
            <div
              key={idx}
              className={cn(
                "flex gap-3 rounded-lg border p-3",
                item.error
                  ? "border-destructive/40 bg-destructive/5"
                  : "border-border bg-card"
              )}
            >
              {/* Thumbnail or icon */}
              <div className="h-14 w-14 shrink-0 rounded-md overflow-hidden border border-border bg-muted flex items-center justify-center">
                {item.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.previewUrl}
                    alt={item.file.name}
                    className="h-full w-full object-cover"
                  />
                ) : item.file.type === "application/pdf" ? (
                  <FileText className="h-6 w-6 text-muted-foreground" />
                ) : (
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                )}
              </div>

              {/* Meta */}
              <div className="flex flex-1 flex-col gap-1.5 min-w-0">
                {item.error ? (
                  <div className="flex items-start gap-1.5 text-destructive text-xs">
                    <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    {item.error}
                  </div>
                ) : (
                  <>
                    {/* Document name */}
                    <input
                      className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring"
                      value={item.documentName}
                      onChange={(e) =>
                        updateField(idx, "documentName", e.target.value)
                      }
                      placeholder="Document name"
                    />
                    {/* Type selector */}
                    {allowedDocumentTypes.length > 1 && (
                      <select
                        className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                        value={item.documentType}
                        onChange={(e) =>
                          updateField(
                            idx,
                            "documentType",
                            e.target.value as DocumentType
                          )
                        }
                      >
                        {allowedDocumentTypes.map((t) => (
                          <option key={t} value={t}>
                            {DOCUMENT_TYPE_LABELS[t]}
                          </option>
                        ))}
                      </select>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(item.file.size)}
                    </p>
                  </>
                )}
              </div>

              {/* Remove */}
              <button
                type="button"
                onClick={() => remove(idx)}
                className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {files.filter((f) => !f.error).length} valid file
          {files.filter((f) => !f.error).length !== 1 ? "s" : ""} ready to
          upload
          {files.some((f) => f.error) && (
            <span className="text-destructive ml-1">
              · {files.filter((f) => f.error).length} with errors (will be
              skipped)
            </span>
          )}
        </p>
      )}
    </div>
  );
}
