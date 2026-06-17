/**
 * Document & Verification TypeScript types
 * Mirrors backend DTOs: DocumentResponseDTO, VerificationRequestResponseDTO
 */

// ─── Document ─────────────────────────────────────────────────────────────────

export type DocumentType =
  // Vehicle documents
  | "VEHICLE_REGISTRATION"
  | "VEHICLE_INSURANCE"
  | "VEHICLE_PICTURE"
  // Owner KYC documents
  | "OWNER_NIC"
  | "OWNER_DRIVING_LICENSE"
  | "OWNER_ADDRESS_PROOF"
  | "OWNER_OTHER"
  // Booking documents
  | "BOOKING_CONDITION_IMAGE";

export interface Document {
  documentId: number;
  documentType: DocumentType;
  documentName: string;
  /** Serve URL (local) or provider URL (cloud) */
  fileUrl: string;
  originalFilename: string;
  contentType: string;
  fileSize: number;
  storageProvider: string;
  uploadedAt: string;
  // Only one will be non-null
  vehicleId: number | null;
  verificationRequestId: number | null;
  bookingId: number | null;
}

// ─── Verification ─────────────────────────────────────────────────────────────

export type VerificationStatus =
  | "NOT_SUBMITTED"
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export interface VerificationRequest {
  requestId: number;
  status: VerificationStatus;
  rejectionReason: string | null;
  // Owner summary
  vehicleOwnerId: number;
  ownerFullName: string;
  ownerEmail: string;
  ownerContactNumber: string;
  // Review info
  reviewedByUserId: number | null;
  reviewedAt: string | null;
  submittedAt: string;
  updatedAt: string;
  documents: Document[];
}

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface AdminReviewActionDTO {
  approve: boolean;
  rejectionReason?: string;
}

// ─── Document label helpers ───────────────────────────────────────────────────

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  VEHICLE_REGISTRATION:  "Vehicle Registration",
  VEHICLE_INSURANCE:     "Vehicle Insurance",
  VEHICLE_PICTURE:       "Vehicle Photo",
  OWNER_NIC:             "National ID Card (NIC)",
  OWNER_DRIVING_LICENSE: "Driving Licence",
  OWNER_ADDRESS_PROOF:   "Address Proof",
  OWNER_OTHER:           "Other Document",
  BOOKING_CONDITION_IMAGE: "Vehicle Condition Image",
};

export const VEHICLE_DOCUMENT_TYPES: DocumentType[] = [
  "VEHICLE_REGISTRATION",
  "VEHICLE_INSURANCE",
  "VEHICLE_PICTURE",
];

export const OWNER_KYC_DOCUMENT_TYPES: DocumentType[] = [
  "OWNER_NIC",
  "OWNER_DRIVING_LICENSE",
  "OWNER_ADDRESS_PROOF",
  "OWNER_OTHER",
];
