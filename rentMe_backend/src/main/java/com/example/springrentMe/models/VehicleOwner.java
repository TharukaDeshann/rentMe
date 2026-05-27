package com.example.springrentMe.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "vehicle_owners")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VehicleOwner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "vehicle_owner_id")
    private Long vehicleOwnerId;

    @NotNull(message = "User is required")
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // Store as JSON: {"idCardUrl": "...", "addressProofUrl": "...", "submittedAt":
    // "..."}
    // This field is MANDATORY for vehicle owners - they cannot be approved without
    // documents
    @NotBlank(message = "Verification documents are required for vehicle owners")
    @Column(name = "verification_documents", columnDefinition = "TEXT")
    private String verificationDocuments;

    // Track verification status - defaults to NOT_SUBMITTED, changes to PENDING
    // when docs uploaded
    @NotNull(message = "Verification status is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false)
    private VerificationStatus verificationStatus = VerificationStatus.NOT_SUBMITTED;

    @Column(name = "verification_notes")
    private String verificationNotes; // Admin can add rejection reasons
}
