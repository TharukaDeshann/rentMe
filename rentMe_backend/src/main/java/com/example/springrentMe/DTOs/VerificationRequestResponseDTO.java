package com.example.springrentMe.DTOs;

import com.example.springrentMe.models.VerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Returned for all verification-request read operations (owner and admin views).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerificationRequestResponseDTO {

    private Long requestId;
    private VerificationStatus status;
    private String rejectionReason;

    // Owner summary
    private Long vehicleOwnerId;
    private String ownerFullName;
    private String ownerEmail;
    private String ownerContactNumber;

    // Reviewer info (populated after admin action)
    private Long reviewedByUserId;
    private LocalDateTime reviewedAt;

    private LocalDateTime submittedAt;
    private LocalDateTime updatedAt;

    private List<DocumentResponseDTO> documents;
}