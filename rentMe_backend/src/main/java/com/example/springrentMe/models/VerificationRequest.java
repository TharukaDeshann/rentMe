package com.example.springrentMe.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Records every KYC submission made by a VehicleOwner.
 *
 * Why a separate table?
 *   - An owner can be REJECTED and re-submit; each submission is a separate row.
 *   - Full audit history is preserved; nothing is overwritten.
 *   - Documents uploaded for a request are linked via Document.vehicleOwner,
 *     but we also keep a direct list for easy retrieval.
 *
 * Lifecycle:
 *   Owner uploads docs → status = PENDING
 *   Admin reviews      → status = APPROVED | REJECTED (with rejectionReason)
 *   If REJECTED        → owner uploads again → new VerificationRequest row
 */
@Entity
@Table(
    name = "verification_requests",
    indexes = {
        @Index(name = "idx_vr_owner",  columnList = "vehicle_owner_id"),
        @Index(name = "idx_vr_status", columnList = "status")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerificationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    private Long requestId;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_owner_id", nullable = false)
    private VehicleOwner vehicleOwner;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private VerificationStatus status = VerificationStatus.PENDING;

    /**
     * Optional notes from the admin when REJECTING the request.
     * Null when status is PENDING or APPROVED.
     */
    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    /**
     * Reviewed by which admin (stored as user_id for simplicity).
     */
    @Column(name = "reviewed_by_user_id")
    private Long reviewedByUserId;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @CreationTimestamp
    @Column(name = "submitted_at", nullable = false, updatable = false)
    private LocalDateTime submittedAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Documents submitted with this specific request.
     * Stored in the Document table and linked via verification_request_id FK.
     */
    @OneToMany(mappedBy = "verificationRequest", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Document> documents = new ArrayList<>();
}