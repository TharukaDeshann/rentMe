"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { FileUploadZone, FileWithMeta } from "@/components/shared/FileUploadZone";
import { DocumentViewer } from "@/components/shared/DocumentViewer";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import documentService from "@/services/document.service";
import { Document, DocumentType, VEHICLE_DOCUMENT_TYPES } from "@/types/document";

interface VehicleDocumentUploadProps {
  vehicleId: number | string;
  /** If true, shows existing documents and allows deletion */
  showExisting?: boolean;
  onUploaded?: (docs: Document[]) => void;
}

/**
 * Upload panel for vehicle legal documents (registration, insurance, photos).
 * Used both in the "create vehicle" flow (step 2) and in the vehicle detail page.
 */
export function VehicleDocumentUpload({
  vehicleId,
  showExisting = true,
  onUploaded,
}: VehicleDocumentUploadProps) {
  const { toast } = useToast();

  const [existingDocs, setExistingDocs] = useState<Document[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(showExisting);
  const [files, setFiles] = useState<FileWithMeta[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);

  // ── Load existing docs ─────────────────────────────────────────────────────

  const loadDocs = async () => {
    if (!showExisting) return;
    setIsLoadingDocs(true);
    try {
      const docs = await documentService.getVehicleDocuments(vehicleId);
      setExistingDocs(docs);
    } catch (err: any) {
      // Silently ignore — vehicle might not have docs yet
      console.warn("Could not load vehicle documents:", err.message);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  useEffect(() => {
    loadDocs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId]);

  // ── Upload ─────────────────────────────────────────────────────────────────

  const handleUpload = async () => {
    const validFiles = files.filter((f) => !f.error);
    if (validFiles.length === 0) {
      toast({
        title: "No valid files selected",
        description: "Please add at least one valid document.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Group by documentType and upload each group
      const byType = validFiles.reduce<Record<DocumentType, FileWithMeta[]>>(
        (acc, f) => {
          if (!acc[f.documentType]) acc[f.documentType] = [];
          acc[f.documentType].push(f);
          return acc;
        },
        {} as Record<DocumentType, FileWithMeta[]>
      );

      const uploaded: Document[] = [];
      for (const [type, group] of Object.entries(byType)) {
        const docs = await documentService.uploadVehicleDocuments(
          vehicleId,
          group.map((f) => f.file),
          type as DocumentType,
          group[0].documentName
        );
        uploaded.push(...docs);
      }

      toast({
        title: `${uploaded.length} document${uploaded.length !== 1 ? "s" : ""} uploaded`,
        description: "Your vehicle documents have been saved.",
      });
      setFiles([]);
      setExistingDocs((prev) => [...prev, ...uploaded]);
      onUploaded?.(uploaded);
    } catch (err: any) {
      toast({
        title: "Upload failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!docToDelete) return;
    setDeletingId(docToDelete.documentId);
    try {
      await documentService.deleteDocument(docToDelete.documentId);
      setExistingDocs((prev) =>
        prev.filter((d) => d.documentId !== docToDelete.documentId)
      );
      toast({
        title: "Document deleted",
        description: `"${docToDelete.documentName}" has been removed.`,
      });
    } catch (err: any) {
      toast({
        title: "Delete failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
      setDocToDelete(null);
    }
  };

  const validFileCount = files.filter((f) => !f.error).length;

  return (
    <div className="space-y-5">
      {/* Existing docs */}
      {showExisting && (
        <Card className="border border-border shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Uploaded Documents</span>
              {isLoadingDocs && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingDocs ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading documents…
              </div>
            ) : (
              <DocumentViewer
                documents={existingDocs}
                onDelete={setDocToDelete}
                deletingId={deletingId}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Upload panel */}
      <Card className="border border-border shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            Add Documents
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload registration certificate, insurance policy, or vehicle
            photos.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUploadZone
            allowedDocumentTypes={VEHICLE_DOCUMENT_TYPES}
            defaultDocumentType="VEHICLE_REGISTRATION"
            onChange={setFiles}
          />

          <Button
            onClick={handleUpload}
            disabled={isUploading || validFileCount === 0}
            className="w-full gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload {validFileCount > 0 ? `${validFileCount} File${validFileCount !== 1 ? "s" : ""}` : "Documents"}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Delete confirm */}
      <ConfirmActionDialog
        open={!!docToDelete}
        onOpenChange={(open) => !open && setDocToDelete(null)}
        title="Delete document?"
        description={`Are you sure you want to delete "${docToDelete?.documentName}"? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        isLoading={!!deletingId}
        onConfirm={handleDelete}
      />
    </div>
  );
}
