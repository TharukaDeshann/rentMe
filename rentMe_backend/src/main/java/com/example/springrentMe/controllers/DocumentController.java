package com.example.springrentMe.controllers;

import com.example.springrentMe.DTOs.DocumentResponseDTO;
import com.example.springrentMe.models.DocumentType;
import com.example.springrentMe.services.DocumentService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Vehicle document endpoints + local-file serving.
 *
 * Vehicle documents:
 *   POST   /api/v1/owner/vehicles/{vehicleId}/documents          upload
 *   GET    /api/v1/owner/vehicles/{vehicleId}/documents          list (owner)
 *   GET    /api/v1/public/vehicles/{vehicleId}/documents         list (public)
 *   DELETE /api/v1/owner/documents/{documentId}                  delete
 *
 * File serving (local storage only):
 *   GET    /api/v1/files/**                                       serve file
 */
@RestController
public class DocumentController {

    private final DocumentService documentService;

    @Value("${app.storage.local.base-dir:uploads}")
    private String localBaseDir;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Upload vehicle documents
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * POST /api/v1/owner/vehicles/{vehicleId}/documents
     *
     * Multipart form fields:
     *   files        (required) — one or more files
     *   documentType (optional) — VEHICLE_REGISTRATION | VEHICLE_INSURANCE | VEHICLE_PICTURE | …
     *   documentName (optional) — human label, e.g. "Registration Book"
     *
     * Requires: VEHICLE_OWNER role
     */
    @PreAuthorize("hasRole('VEHICLE_OWNER')")
    @PostMapping(
        value = "/api/v1/owner/vehicles/{vehicleId}/documents",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?> uploadVehicleDocuments(
            @PathVariable Long vehicleId,
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "documentType", defaultValue = "VEHICLE_REGISTRATION") String documentTypeStr,
            @RequestParam(value = "documentName", defaultValue = "Vehicle Document") String documentName) {
        try {
            DocumentType documentType = parseDocumentType(documentTypeStr);
            List<DocumentResponseDTO> saved = documentService.uploadVehicleDocuments(
                    vehicleId, documentType, documentName, files);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(buildError(e.getMessage()));
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // List vehicle documents
    // ─────────────────────────────────────────────────────────────────────────

    /** GET /api/v1/owner/vehicles/{vehicleId}/documents  (authenticated owner) */
    @PreAuthorize("hasRole('VEHICLE_OWNER')")
    @GetMapping("/api/v1/owner/vehicles/{vehicleId}/documents")
    public ResponseEntity<List<DocumentResponseDTO>> listVehicleDocumentsOwner(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(documentService.getDocumentsForVehicle(vehicleId));
    }

    /** GET /api/v1/public/vehicles/{vehicleId}/documents  (public) */
    @GetMapping("/api/v1/public/vehicles/{vehicleId}/documents")
    public ResponseEntity<List<DocumentResponseDTO>> listVehicleDocumentsPublic(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(documentService.getDocumentsForVehicle(vehicleId));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Delete a document
    // ─────────────────────────────────────────────────────────────────────────

    /** DELETE /api/v1/owner/documents/{documentId}  (owner or admin) */
    @PreAuthorize("hasRole('VEHICLE_OWNER') or hasRole('ADMIN')")
    @DeleteMapping("/api/v1/owner/documents/{documentId}")
    public ResponseEntity<?> deleteDocument(@PathVariable Long documentId) {
        try {
            documentService.deleteDocument(documentId);
            Map<String, Object> body = new HashMap<>();
            body.put("success", true);
            body.put("message", "Document deleted successfully");
            return ResponseEntity.ok(body);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(buildError(e.getMessage()));
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Local file serving  (used only when app.storage.provider=local)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/v1/files/{**path}
     *
     * Serves files stored on the local filesystem.
     * Protected: only authenticated users can fetch files.
     * Admins can reach any file; owners/renters can reach files they have access to
     * (enforcement is currently trust-based — the URL itself is not guessable
     * because it includes a UUID prefix).
     */
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/api/v1/files/**")
    public ResponseEntity<Resource> serveFile(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader,
            jakarta.servlet.http.HttpServletRequest request) {
        try {
            // Extract the path after /api/v1/files/
            String requestURI = request.getRequestURI();
            String filePath   = requestURI.substring(requestURI.indexOf("/api/v1/files/") + "/api/v1/files/".length());

            Path baseDir  = Paths.get(localBaseDir).toAbsolutePath().normalize();
            Path resolved = baseDir.resolve(filePath).normalize();

            // Security: prevent path traversal — resolved path must start with baseDir
            if (!resolved.startsWith(baseDir)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            Resource resource = new UrlResource(resolved.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            // Determine Content-Type
            String contentType = request.getServletContext().getMimeType(resolved.toString());
            if (contentType == null) contentType = "application/octet-stream";

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);

        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
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

    private Map<String, Object> buildError(String message) {
        Map<String, Object> err = new HashMap<>();
        err.put("success", false);
        err.put("message", message);
        return err;
    }
}