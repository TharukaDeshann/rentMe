package com.example.springrentMe.controllers;

import com.example.springrentMe.DTOs.AdminVerificationActionDTO;
import com.example.springrentMe.DTOs.VerificationRequestResponseDTO;
import com.example.springrentMe.models.DocumentType;
import com.example.springrentMe.services.VerificationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * KYC / Verification endpoints.
 *
 * Owner flow:
 *   POST   /api/v1/owner/verification/request               submit new request + upload docs
 *   GET    /api/v1/owner/verification/history               full history for current owner
 *   GET    /api/v1/owner/verification/latest                latest request
 *   POST   /api/v1/owner/verification/{requestId}/documents add docs to an existing PENDING request
 *
 * Admin flow:
 *   GET    /api/v1/admin/verification/pending               view PENDING queue
 *   GET    /api/v1/admin/verification/all                   view all requests
 *   GET    /api/v1/admin/verification/{id}                  view one request (with documents)
 *   POST   /api/v1/admin/verification/{id}/review           approve or reject
 */
@RestController
public class VerificationController {

    private final VerificationService verificationService;

    public VerificationController(VerificationService verificationService) {
        this.verificationService = verificationService;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Owner: submit a new KYC verification request with documents
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * POST /api/v1/owner/verification/request
     *
     * Multipart form fields:
     *   files[]         (required) — one or more document files
     *   documentTypes[] (optional, parallel array) — OWNER_NIC | OWNER_DRIVING_LICENSE | ...
     *   documentNames[] (optional, parallel array) — human labels, e.g. "NIC Front"
     *
     * Rules:
     *   - Owner must NOT already have a PENDING request.
     *   - Creates a new VerificationRequest in PENDING status.
     *   - If previously REJECTED, owner can re-submit; old request is kept for audit.
     *
     * Requires: VEHICLE_OWNER role
     */
    @PreAuthorize("hasAnyRole('VEHICLE_OWNER', 'RENTER')")
    @PostMapping(
        value  = "/api/v1/owner/verification/request",
        consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?> submitVerificationRequest(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "documentTypes", required = false) String[] documentTypeStrs,
            @RequestParam(value = "documentNames",  required = false) String[] documentNames) {

        try {
            DocumentType[] documentTypes = parseDocumentTypes(documentTypeStrs, files.length);
            VerificationRequestResponseDTO response =
                    verificationService.submitVerificationRequest(documentTypes, documentNames, files);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(buildError(e.getMessage()));
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Owner: view own request history
    // ─────────────────────────────────────────────────────────────────────────

    /** GET /api/v1/owner/verification/history */
    @PreAuthorize("hasAnyRole('VEHICLE_OWNER', 'RENTER')")
    @GetMapping("/api/v1/owner/verification/history")
    public ResponseEntity<List<VerificationRequestResponseDTO>> getMyHistory() {
        return ResponseEntity.ok(verificationService.getMyVerificationHistory());
    }

    /** GET /api/v1/owner/verification/latest */
    @PreAuthorize("hasAnyRole('VEHICLE_OWNER', 'RENTER')")
    @GetMapping("/api/v1/owner/verification/latest")
    public ResponseEntity<?> getMyLatestRequest() {
        try {
            return ResponseEntity.ok(verificationService.getMyLatestRequest());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(buildError(e.getMessage()));
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Owner: add more documents to an existing PENDING request
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * POST /api/v1/owner/verification/{requestId}/documents
     *
     * Multipart form fields:
     *   files[]         (required)
     *   documentType    (optional, single type applied to all files)
     *   documentName    (optional, single label applied to all files)
     *
     * Only PENDING requests accept new documents.
     */
    @PreAuthorize("hasAnyRole('VEHICLE_OWNER', 'RENTER')")
    @PostMapping(
        value  = "/api/v1/owner/verification/{requestId}/documents",
        consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?> addDocumentsToRequest(
            @PathVariable Long requestId,
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "documentType", defaultValue = "OWNER_OTHER") String documentTypeStr,
            @RequestParam(value = "documentName", defaultValue = "Verification Document") String documentName) {

        try {
            DocumentType documentType = parseDocumentType(documentTypeStr);
            var saved = verificationService
                    // Delegate to DocumentService via the service layer
                    .uploadDocumentsForRequest(requestId, documentType, documentName, files);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(buildError(e.getMessage()));
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Admin: view the review queue
    // ─────────────────────────────────────────────────────────────────────────

    /** GET /api/v1/admin/verification/pending */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/api/v1/admin/verification/pending")
    public ResponseEntity<List<VerificationRequestResponseDTO>> getPendingRequests() {
        return ResponseEntity.ok(verificationService.getAllPendingRequests());
    }

    /** GET /api/v1/admin/verification/all */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/api/v1/admin/verification/all")
    public ResponseEntity<List<VerificationRequestResponseDTO>> getAllRequests() {
        return ResponseEntity.ok(verificationService.getAllRequests());
    }

    /** GET /api/v1/admin/verification/{id} */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/api/v1/admin/verification/{id}")
    public ResponseEntity<?> getRequestById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(verificationService.getRequestById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(buildError(e.getMessage()));
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Admin: approve or reject
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * POST /api/v1/admin/verification/{id}/review
     *
     * Body (JSON):
     * {
     *   "approve": true | false,
     *   "rejectionReason": "Provide reason when approve=false"
     * }
     *
     * Rules:
     *  - Only PENDING requests can be reviewed.
     *  - rejectionReason is mandatory when approve=false.
     *  - Approving sets VehicleOwner.verificationStatus = APPROVED.
     *  - Rejecting sets VehicleOwner.verificationStatus = REJECTED.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/api/v1/admin/verification/{id}/review")
    public ResponseEntity<?> reviewRequest(
            @PathVariable Long id,
            @Valid @RequestBody AdminVerificationActionDTO action) {
        try {
            VerificationRequestResponseDTO result = verificationService.reviewRequest(id, action);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(buildError(e.getMessage()));
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private DocumentType parseDocumentType(String value) {
        try {
            return DocumentType.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Unknown documentType: " + value +
                    ". Valid values: " + java.util.Arrays.toString(DocumentType.values()));
        }
    }

    /**
     * Parse a parallel string array of documentType names into enum values.
     * If the array is shorter than fileCount, the remaining entries default to OWNER_OTHER.
     */
    private DocumentType[] parseDocumentTypes(String[] strs, int fileCount) {
        DocumentType[] types = new DocumentType[fileCount];
        for (int i = 0; i < fileCount; i++) {
            if (strs != null && i < strs.length && strs[i] != null && !strs[i].isBlank()) {
                types[i] = parseDocumentType(strs[i]);
            } else {
                types[i] = DocumentType.OWNER_OTHER;
            }
        }
        return types;
    }

    private Map<String, Object> buildError(String message) {
        Map<String, Object> err = new HashMap<>();
        err.put("success", false);
        err.put("message", message);
        return err;
    }
}
