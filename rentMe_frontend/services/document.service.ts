/**
 * Document Service
 * Handles vehicle document and verification document uploads/reads.
 * All endpoints require cookie-based JWT auth (withCredentials: true).
 */

import apiClient, { getErrorMessage } from "@/lib/api/axios";
import { Document, DocumentType } from "@/types/document";

// ─── Vehicle documents ────────────────────────────────────────────────────────

/**
 * POST /owner/vehicles/:vehicleId/documents
 * Upload one or more documents for a vehicle (multipart/form-data).
 *
 * @param vehicleId     - target vehicle
 * @param files         - FileList or File[] from the file input
 * @param documentType  - e.g. VEHICLE_REGISTRATION
 * @param documentName  - human label, e.g. "Registration Book"
 */
export const uploadVehicleDocuments = async (
  vehicleId: number | string,
  files: File[],
  documentType: DocumentType = "VEHICLE_REGISTRATION",
  documentName = "Vehicle Document"
): Promise<Document[]> => {
  try {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    form.append("documentType", documentType);
    form.append("documentName", documentName);

    const response = await apiClient.post<Document[]>(
      `/owner/vehicles/${vehicleId}/documents`,
      form,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * GET /owner/vehicles/:vehicleId/documents
 * List all documents for a vehicle (authenticated owner view).
 */
export const getVehicleDocuments = async (
  vehicleId: number | string
): Promise<Document[]> => {
  try {
    const response = await apiClient.get<Document[]>(
      `/owner/vehicles/${vehicleId}/documents`
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * GET /public/vehicles/:vehicleId/documents
 * List all documents for a vehicle (public).
 */
export const getVehicleDocumentsPublic = async (
  vehicleId: number | string
): Promise<Document[]> => {
  try {
    const response = await apiClient.get<Document[]>(
      `/public/vehicles/${vehicleId}/documents`
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * DELETE /owner/documents/:documentId
 * Delete a single document (owner or admin).
 */
export const deleteDocument = async (
  documentId: number | string
): Promise<void> => {
  try {
    await apiClient.delete(`/owner/documents/${documentId}`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

const documentService = {
  uploadVehicleDocuments,
  getVehicleDocuments,
  getVehicleDocumentsPublic,
  deleteDocument,
};

export default documentService;
