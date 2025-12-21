package com.example.springrentMe.DTOs;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

/**
 * DTO for verification documents
 * Used for both request and response
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VerificationDocumentsDTO {

    @NotBlank(message = "ID card URL is required")
    private String idCardUrl; // Required

    @NotBlank(message = "Address proof URL is required")
    private String addressProofUrl; // Required

    private LocalDateTime submittedAt;
    private String adminNotes; // For rejection reasons
}