package com.example.springrentMe.services;

import com.example.springrentMe.DTOs.DocumentResponseDTO;
import com.example.springrentMe.models.*;
import com.example.springrentMe.repositories.DocumentRepository;
import com.example.springrentMe.repositories.VehicleOwnerRepository;
import com.example.springrentMe.repositories.VehicleRepository;
import com.example.springrentMe.repositories.VerificationRequestRepository;
import com.example.springrentMe.security.UserDetailsImpl;
import com.example.springrentMe.services.storage.FileStorageService;
import com.example.springrentMe.services.storage.FileValidationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Handles all document persistence operations.
 * File I/O is fully delegated to the injected {@link FileStorageService}.
 */
@Service
public class DocumentService {

    @Autowired private DocumentRepository       documentRepository;
    @Autowired private VehicleRepository        vehicleRepository;
    @Autowired private VehicleOwnerRepository   vehicleOwnerRepository;
    @Autowired private VerificationRequestRepository vrRepository;
    @Autowired private FileStorageService       fileStorageService;
    @Autowired private FileValidationService    fileValidationService;

    /** Base URL used to build serve-URLs for local-storage files. */
    @Value("${app.server.base-url:http://localhost:8080}")
    private String serverBaseUrl;

    // ─────────────────────────────────────────────────────────────────────────
    // Vehicle document upload
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Upload one or more legal documents for a vehicle.
     * The vehicle must belong to the currently authenticated owner.
     *
     * @param vehicleId    target vehicle
     * @param documentType e.g. VEHICLE_REGISTRATION, VEHICLE_INSURANCE
     * @param documentName human-readable label
     * @param files        the uploaded files
     */
    @Transactional
    public List<DocumentResponseDTO> uploadVehicleDocuments(
            Long vehicleId,
            DocumentType documentType,
            String documentName,
            MultipartFile[] files) {

        fileValidationService.validateAll(files);

        // Ownership check
        Long userId = getCurrentUserId();
        VehicleOwner owner = vehicleOwnerRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new RuntimeException("Vehicle owner profile not found."));

        Vehicle vehicle = vehicleRepository
                .findByVehicleIdAndVehicleOwner_VehicleOwnerId(vehicleId, owner.getVehicleOwnerId())
                .orElseThrow(() -> new RuntimeException(
                        "Vehicle not found or you do not have permission to upload documents for it."));

        String folder = "vehicles/" + vehicleId + "/docs";

        return Arrays.stream(files)
                .map(file -> {
                    String ref = fileStorageService.store(file, folder);
                    Document doc = Document.builder()
                            .vehicle(vehicle)
                            .documentType(documentType)
                            .documentName(documentName)
                            .fileUrl(ref)
                            .originalFilename(file.getOriginalFilename())
                            .contentType(file.getContentType())
                            .fileSize(file.getSize())
                            .storageProvider(fileStorageService.getProviderName())
                            .build();
                    return convertToDTO(documentRepository.save(doc));
                })
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Verification (KYC) document upload
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Upload KYC documents for a specific verification request.
     * Only the owner who owns the request may upload.
     */
    @Transactional
    public List<DocumentResponseDTO> uploadVerificationDocuments(
            Long requestId,
            DocumentType documentType,
            String documentName,
            MultipartFile[] files) {

        fileValidationService.validateAll(files);

        Long userId = getCurrentUserId();
        VehicleOwner owner = vehicleOwnerRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new RuntimeException("Vehicle owner profile not found."));

        VerificationRequest vr = vrRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Verification request not found: " + requestId));

        if (!vr.getVehicleOwner().getVehicleOwnerId().equals(owner.getVehicleOwnerId())) {
            throw new RuntimeException("You do not have permission to upload documents for this request.");
        }
        if (vr.getStatus() != VerificationStatus.PENDING) {
            throw new RuntimeException(
                "Cannot add documents to a request with status: " + vr.getStatus() +
                ". Only PENDING requests accept new documents.");
        }

        String folder = "owners/" + owner.getVehicleOwnerId() + "/kyc/" + requestId;

        return Arrays.stream(files)
                .map(file -> {
                    String ref = fileStorageService.store(file, folder);
                    Document doc = Document.builder()
                            .verificationRequest(vr)
                            .documentType(documentType)
                            .documentName(documentName)
                            .fileUrl(ref)
                            .originalFilename(file.getOriginalFilename())
                            .contentType(file.getContentType())
                            .fileSize(file.getSize())
                            .storageProvider(fileStorageService.getProviderName())
                            .build();
                    return convertToDTO(documentRepository.save(doc));
                })
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Read
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<DocumentResponseDTO> getDocumentsForVehicle(Long vehicleId) {
        return documentRepository.findByVehicle_VehicleId(vehicleId)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DocumentResponseDTO> getDocumentsForVerificationRequest(Long requestId) {
        return documentRepository.findByVerificationRequest_RequestId(requestId)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Delete
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Delete a single document.
     * Owner: can only delete documents on their own vehicles / their own pending requests.
     * Admin: can delete any document.
     */
    @Transactional
    public void deleteDocument(Long documentId) {
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found: " + documentId));

        Long userId = getCurrentUserId();
        boolean isAdmin = isCurrentUserAdmin();

        if (!isAdmin) {
            // Ownership check for vehicle documents
            if (doc.getVehicle() != null) {
                Long ownerId = doc.getVehicle().getVehicleOwner().getVehicleOwnerId();
                VehicleOwner me = vehicleOwnerRepository.findByUser_UserId(userId)
                        .orElseThrow(() -> new RuntimeException("Owner profile not found."));
                if (!ownerId.equals(me.getVehicleOwnerId())) {
                    throw new RuntimeException("You do not have permission to delete this document.");
                }
            }
            // Ownership check for KYC documents
            if (doc.getVerificationRequest() != null) {
                Long ownerId = doc.getVerificationRequest().getVehicleOwner().getVehicleOwnerId();
                VehicleOwner me = vehicleOwnerRepository.findByUser_UserId(userId)
                        .orElseThrow(() -> new RuntimeException("Owner profile not found."));
                if (!ownerId.equals(me.getVehicleOwnerId())) {
                    throw new RuntimeException("You do not have permission to delete this document.");
                }
                if (doc.getVerificationRequest().getStatus() != VerificationStatus.PENDING) {
                    throw new RuntimeException("Cannot delete documents from a non-PENDING verification request.");
                }
            }
        }

        fileStorageService.delete(doc.getFileUrl());
        documentRepository.delete(doc);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ((UserDetailsImpl) auth.getPrincipal()).getId();
    }

    private boolean isCurrentUserAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    /**
     * Build the serve URL for local-storage files.
     * Cloud files already carry a full URL from the provider.
     */
    private String buildServeUrl(Document doc) {
        if ("local".equals(doc.getStorageProvider())) {
            return serverBaseUrl + "/api/v1/files/" + doc.getFileUrl();
        }
        // Cloud: the stored value is already a full URL
        return doc.getFileUrl();
    }

    public DocumentResponseDTO convertToDTO(Document doc) {
        return DocumentResponseDTO.builder()
                .documentId(doc.getDocumentId())
                .documentType(doc.getDocumentType())
                .documentName(doc.getDocumentName())
                .fileUrl(buildServeUrl(doc))
                .originalFilename(doc.getOriginalFilename())
                .contentType(doc.getContentType())
                .fileSize(doc.getFileSize())
                .storageProvider(doc.getStorageProvider())
                .uploadedAt(doc.getUploadedAt())
                .vehicleId(doc.getVehicle() != null ? doc.getVehicle().getVehicleId() : null)
                .verificationRequestId(doc.getVerificationRequest() != null
                        ? doc.getVerificationRequest().getRequestId() : null)
                .build();
    }
}