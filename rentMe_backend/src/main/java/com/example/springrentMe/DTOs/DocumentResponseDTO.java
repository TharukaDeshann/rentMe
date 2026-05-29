package com.example.springrentMe.DTOs;

import com.example.springrentMe.models.DocumentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Returned whenever a document record is exposed via the API.
 * Never exposes raw file bytes — only the metadata and the URL/path.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentResponseDTO {

    private Long documentId;
    private DocumentType documentType;
    private String documentName;

    /**
     * For local storage: the serve URL built by the controller
     *   e.g. /api/v1/files/vehicles/3/docs/uuid_reg.pdf
     * For cloud storage: the URL returned by the provider.
     */
    private String fileUrl;

    private String originalFilename;
    private String contentType;
    private Long fileSize;
    private String storageProvider;
    private LocalDateTime uploadedAt;

    // Parent context (only one will be non-null)
    private Long vehicleId;
    private Long verificationRequestId;
}