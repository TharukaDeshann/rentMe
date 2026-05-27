package com.example.springrentMe.DTOs;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for uploading verification documents to become a vehicle owner
 * Users must be registered renters first, then upload documents to upgrade to
 * VEHICLE_OWNER
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UploadVerificationDocumentsRequest {

    @NotBlank(message = "ID card URL is required")
    private String idCardUrl;

    @NotBlank(message = "Address proof URL is required")
    private String addressProofUrl;

    // Optional additional documents
    private String drivingLicenseUrl;

    private String additionalNotes;
}
