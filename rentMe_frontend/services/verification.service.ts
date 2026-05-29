/**
 * Verification Service
 * Handles the full KYC lifecycle for vehicle owners and admin review.
 * Mirrors VerificationController endpoints.
 */

import apiClient, { getErrorMessage } from "@/lib/api/axios";
import {
  VerificationRequest,
  Document,
  DocumentType,
  AdminReviewActionDTO,
} from "@/types/document";

// ─── Owner flow ───────────────────────────────────────────────────────────────

/**
 * POST /owner/verification/request
 * Submit a new KYC verification request with initial documents.
 *
 * @param files          - files to upload (parallel to types/names arrays)
 * @param documentTypes  - parallel array of DocumentType strings
 * @param documentNames  - parallel array of human-readable labels
 */
export const submitVerificationRequest = async (
  files: File[],
  documentTypes?: DocumentType[],
  documentNames?: string[]
): Promise<VerificationRequest> => {
  try {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    if (documentTypes) {
      documentTypes.forEach((t) => form.append("documentTypes", t));
    }
    if (documentNames) {
      documentNames.forEach((n) => form.append("documentNames", n));
    }

    const response = await apiClient.post<VerificationRequest>(
      "/owner/verification/request",
      form
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * GET /owner/verification/history
 * All past verification requests for the current owner (newest first).
 */
export const getMyVerificationHistory = async (): Promise<
  VerificationRequest[]
> => {
  try {
    const response = await apiClient.get<VerificationRequest[]>(
      "/owner/verification/history"
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * GET /owner/verification/latest
 * Latest verification request for the current owner.
 */
export const getMyLatestVerificationRequest =
  async (): Promise<VerificationRequest | null> => {
    try {
      const response = await apiClient.get<VerificationRequest>(
        "/owner/verification/latest"
      );
      return response.data;
    } catch (error: any) {
      // 400 means "no request found" — not a real error
      if (error?.response?.status === 400 || error?.response?.status === 404) {
        return null;
      }
      throw new Error(getErrorMessage(error));
    }
  };

/**
 * POST /owner/verification/:requestId/documents
 * Add more documents to an existing PENDING request.
 */
export const addDocumentsToRequest = async (
  requestId: number | string,
  files: File[],
  documentType: DocumentType = "OWNER_OTHER",
  documentName = "Verification Document"
): Promise<Document[]> => {
  try {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    form.append("documentType", documentType);
    form.append("documentName", documentName);

    const response = await apiClient.post<Document[]>(
      `/owner/verification/${requestId}/documents`,
      form
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// ─── Admin flow ───────────────────────────────────────────────────────────────

/**
 * GET /admin/verification/pending
 * All PENDING requests (oldest first — FIFO queue).
 */
export const getPendingVerificationRequests = async (): Promise<
  VerificationRequest[]
> => {
  try {
    const response = await apiClient.get<VerificationRequest[]>(
      "/admin/verification/pending"
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * GET /admin/verification/all
 * All verification requests regardless of status.
 */
export const getAllVerificationRequests = async (): Promise<
  VerificationRequest[]
> => {
  try {
    const response = await apiClient.get<VerificationRequest[]>(
      "/admin/verification/all"
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * GET /admin/verification/:id
 * Single request with full document list.
 */
export const getVerificationRequestById = async (
  requestId: number | string
): Promise<VerificationRequest> => {
  try {
    const response = await apiClient.get<VerificationRequest>(
      `/admin/verification/${requestId}`
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * POST /admin/verification/:id/review
 * Approve or reject a PENDING request.
 *
 * @param requestId       - the verification request to review
 * @param action          - { approve: true } or { approve: false, rejectionReason: "..." }
 */
export const reviewVerificationRequest = async (
  requestId: number | string,
  action: AdminReviewActionDTO
): Promise<VerificationRequest> => {
  try {
    const response = await apiClient.post<VerificationRequest>(
      `/admin/verification/${requestId}/review`,
      action
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

const verificationService = {
  submitVerificationRequest,
  getMyVerificationHistory,
  getMyLatestVerificationRequest,
  addDocumentsToRequest,
  getPendingVerificationRequests,
  getAllVerificationRequests,
  getVerificationRequestById,
  reviewVerificationRequest,
};

export default verificationService;
