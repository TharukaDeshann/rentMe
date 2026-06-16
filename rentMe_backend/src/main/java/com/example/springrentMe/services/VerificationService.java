package com.example.springrentMe.services;

import com.example.springrentMe.DTOs.AdminVerificationActionDTO;
import com.example.springrentMe.DTOs.DocumentResponseDTO;
import com.example.springrentMe.DTOs.VerificationRequestResponseDTO;
import com.example.springrentMe.models.*;
import com.example.springrentMe.repositories.UserRepository;
import com.example.springrentMe.repositories.VehicleOwnerRepository;
import com.example.springrentMe.repositories.VerificationRequestRepository;
import com.example.springrentMe.security.UserDetailsImpl;
import com.example.springrentMe.services.storage.FileStorageService;
import com.example.springrentMe.services.storage.FileValidationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Manages the full KYC lifecycle for Vehicle Owners.
 *
 * Owner flow  : submitVerificationRequest() → upload docs → admin reviews
 * Admin flow  : getPendingRequests()        → reviewRequest()
 * Re-upload   : if REJECTED, owner calls submitVerificationRequest() again
 *               (previous requests are preserved for audit)
 */
@Service
public class VerificationService {

    @Autowired private VerificationRequestRepository vrRepository;
    @Autowired private VehicleOwnerRepository        vehicleOwnerRepository;
    @Autowired private UserRepository                userRepository;
    @Autowired private DocumentService               documentService;
    @Autowired private FileStorageService            fileStorageService;
    @Autowired private FileValidationService         fileValidationService;

    // ─────────────────────────────────────────────────────────────────────────
    // Owner: submit a new KYC request (with initial document upload)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Creates a new PENDING verification request and stores the uploaded files.
     *
     * Rules:
     *  - Owner must not already have a PENDING request (re-submit only after REJECTED).
     *  - Previous REJECTED/APPROVED requests are kept for history.
     *
     * @param documentTypes  parallel array — documentTypes[i] maps to files[i]
     * @param documentNames  parallel array — documentNames[i] maps to files[i]
     * @param files          the actual file bytes
     */
    @Transactional
    public VerificationRequestResponseDTO submitVerificationRequest(
            DocumentType[] documentTypes,
            String[]       documentNames,
            MultipartFile[] files) {

        fileValidationService.validateAll(files);

        VehicleOwner owner = getOrCreateOwnerForCurrentUser();

        // Guard: no duplicate PENDING
        if (vrRepository.existsByVehicleOwner_VehicleOwnerIdAndStatus(
                owner.getVehicleOwnerId(), VerificationStatus.PENDING)) {
            throw new RuntimeException(
                "You already have a pending verification request. " +
                "Please wait for the admin to review it before submitting again.");
        }

        // Create the request
        VerificationRequest vr = VerificationRequest.builder()
                .vehicleOwner(owner)
                .status(VerificationStatus.PENDING)
                .build();
        VerificationRequest savedVr = vrRepository.save(vr);

        // Update owner-level status so the rest of the system can check it cheaply
        owner.setVerificationStatus(VerificationStatus.PENDING);
        vehicleOwnerRepository.save(owner);

        // Upload documents and link them to the request
        String folder = "owners/" + owner.getVehicleOwnerId() + "/kyc/" + savedVr.getRequestId();

        for (int i = 0; i < files.length; i++) {
            MultipartFile file = files[i];
            DocumentType type  = (documentTypes != null && i < documentTypes.length)
                    ? documentTypes[i] : DocumentType.OWNER_OTHER;
            String name        = (documentNames != null && i < documentNames.length)
                    ? documentNames[i] : file.getOriginalFilename();

            String ref = fileStorageService.store(file, folder);

            Document doc = Document.builder()
                    .verificationRequest(savedVr)
                    .documentType(type)
                    .documentName(name)
                    .fileUrl(ref)
                    .originalFilename(file.getOriginalFilename())
                    .contentType(file.getContentType())
                    .fileSize(file.getSize())
                    .storageProvider(fileStorageService.getProviderName())
                    .build();

            savedVr.getDocuments().add(doc);
        }

        vrRepository.save(savedVr);
        return convertToDTO(savedVr);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Owner: view own request history
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<VerificationRequestResponseDTO> getMyVerificationHistory() {
        Long userId = getCurrentUserId();
        java.util.Optional<VehicleOwner> ownerOpt = vehicleOwnerRepository.findByUser_UserId(userId);
        if (ownerOpt.isEmpty()) {
            return List.of();
        }
        VehicleOwner owner = ownerOpt.get();
        return vrRepository
                .findByVehicleOwner_VehicleOwnerIdOrderBySubmittedAtDesc(owner.getVehicleOwnerId())
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public VerificationRequestResponseDTO getMyLatestRequest() {
        Long userId = getCurrentUserId();
        java.util.Optional<VehicleOwner> ownerOpt = vehicleOwnerRepository.findByUser_UserId(userId);
        if (ownerOpt.isEmpty()) {
            throw new RuntimeException("No verification request found.");
        }
        VehicleOwner owner = ownerOpt.get();
        return vrRepository
                .findTopByVehicleOwner_VehicleOwnerIdOrderBySubmittedAtDesc(owner.getVehicleOwnerId())
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("No verification request found."));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Owner: add extra documents to an existing PENDING request
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Delegates to DocumentService.uploadVerificationDocuments so the owner can
     * attach extra files to a PENDING request after it was initially created.
     */
    @Transactional
    public List<DocumentResponseDTO> uploadDocumentsForRequest(
            Long requestId,
            DocumentType documentType,
            String documentName,
            MultipartFile[] files) {
        return documentService.uploadVerificationDocuments(requestId, documentType, documentName, files);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Admin: view queue and act
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<VerificationRequestResponseDTO> getAllPendingRequests() {
        return vrRepository.findByStatusOrderBySubmittedAtAsc(VerificationStatus.PENDING)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VerificationRequestResponseDTO> getAllRequests() {
        return vrRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public VerificationRequestResponseDTO getRequestById(Long requestId) {
        return convertToDTO(findRequestOrThrow(requestId));
    }

    /**
     * Admin approves or rejects a PENDING request.
     *
     * Approve  → owner.verificationStatus = APPROVED (can now list vehicles)
     * Reject   → owner.verificationStatus = REJECTED  (must re-submit)
     *             rejectionReason must be provided
     */
    @Transactional
    public VerificationRequestResponseDTO reviewRequest(
            Long requestId,
            AdminVerificationActionDTO action) {

        VerificationRequest vr = findRequestOrThrow(requestId);

        if (vr.getStatus() != VerificationStatus.PENDING) {
            throw new RuntimeException(
                "Only PENDING requests can be reviewed. Current status: " + vr.getStatus());
        }

        Long adminUserId = getCurrentUserId();

        if (Boolean.TRUE.equals(action.getApprove())) {
            // ── APPROVE ──────────────────────────────────────────────────────
            vr.setStatus(VerificationStatus.APPROVED);
            vr.setRejectionReason(null);
            vr.setReviewedByUserId(adminUserId);
            vr.setReviewedAt(LocalDateTime.now());

            VehicleOwner owner = vr.getVehicleOwner();
            owner.setVerificationStatus(VerificationStatus.APPROVED);
            vehicleOwnerRepository.save(owner);

            User user = owner.getUser();
            user.setRole(UserRole.VEHICLE_OWNER);
            userRepository.save(user);

        } else {
            // ── REJECT ───────────────────────────────────────────────────────
            String reason = action.getRejectionReason();
            if (reason == null || reason.isBlank()) {
                throw new RuntimeException("A rejection reason is required when rejecting a request.");
            }
            vr.setStatus(VerificationStatus.REJECTED);
            vr.setRejectionReason(reason.trim());
            vr.setReviewedByUserId(adminUserId);
            vr.setReviewedAt(LocalDateTime.now());

            VehicleOwner owner = vr.getVehicleOwner();
            owner.setVerificationStatus(VerificationStatus.REJECTED);
            vehicleOwnerRepository.save(owner);
        }

        return convertToDTO(vrRepository.save(vr));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private VehicleOwner getOwnerForCurrentUser() {
        Long userId = getCurrentUserId();
        return vehicleOwnerRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new RuntimeException("Vehicle owner profile not found."));
    }

    private VehicleOwner getOrCreateOwnerForCurrentUser() {
        Long userId = getCurrentUserId();
        return vehicleOwnerRepository.findByUser_UserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User not found: " + userId));
                    VehicleOwner owner = new VehicleOwner();
                    owner.setUser(user);
                    owner.setVerificationStatus(VerificationStatus.NOT_SUBMITTED);
                    return vehicleOwnerRepository.save(owner);
                });
    }

    private VerificationRequest findRequestOrThrow(Long id) {
        return vrRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Verification request not found: " + id));
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ((UserDetailsImpl) auth.getPrincipal()).getId();
    }

    public VerificationRequestResponseDTO convertToDTO(VerificationRequest vr) {
        List<DocumentResponseDTO> docs = vr.getDocuments() == null
                ? List.of()
                : vr.getDocuments().stream()
                        .map(documentService::convertToDTO)
                        .collect(Collectors.toList());

        VehicleOwner owner = vr.getVehicleOwner();
        return VerificationRequestResponseDTO.builder()
                .requestId(vr.getRequestId())
                .status(vr.getStatus())
                .rejectionReason(vr.getRejectionReason())
                .vehicleOwnerId(owner.getVehicleOwnerId())
                .ownerFullName(owner.getUser().getFullName())
                .ownerEmail(owner.getUser().getEmail())
                .ownerContactNumber(owner.getUser().getContactNumber())
                .reviewedByUserId(vr.getReviewedByUserId())
                .reviewedAt(vr.getReviewedAt())
                .submittedAt(vr.getSubmittedAt())
                .updatedAt(vr.getUpdatedAt())
                .documents(docs)
                .build();
    }
}