package com.example.springrentMe.models;

import jakarta.persistence.*;
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

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // Store as JSON: {"idCardUrl": "...", "addressProofUrl": "...", "submittedAt": "..."}
    @Column(name = "verification_documents", columnDefinition = "TEXT")
    private String verificationDocuments;

    // Optional: Track verification status
    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status")
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    @Column(name = "verification_notes")
    private String verificationNotes; // Admin can add rejection reasons
}
