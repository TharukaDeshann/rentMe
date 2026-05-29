package com.example.springrentMe.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Normalised document table.
 *
 * A document belongs to exactly ONE of:
 *   - A Vehicle (vehicle docs: registration, insurance, photos)
 *   - A VerificationRequest (KYC docs: NIC, driving licence, address proof)
 *
 * The nullable FK pair enforces this at the DB level.
 */
@Entity
@Table(
    name = "documents",
    indexes = {
        @Index(name = "idx_doc_vehicle", columnList = "vehicle_id"),
        @Index(name = "idx_doc_vr",      columnList = "verification_request_id"),
        @Index(name = "idx_doc_type",    columnList = "document_type")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "document_id")
    private Long documentId;

    // ── Parent FK (mutually exclusive) ───────────────────────────────────────

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verification_request_id")
    private VerificationRequest verificationRequest;

    // ── Metadata ─────────────────────────────────────────────────────────────

    @NotNull(message = "Document type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false)
    private DocumentType documentType;

    /**
     * Human-readable label: "Registration Book", "NIC Front Side", etc.
     */
    @NotBlank(message = "Document name is required")
    @Size(max = 255)
    @Column(name = "document_name", nullable = false, length = 255)
    private String documentName;

    /**
     * Storage reference — NEVER raw bytes.
     * Local  : relative path  e.g. "uploads/vehicles/3/reg.pdf"
     * Cloud  : full URL returned by the provider
     */
    @NotBlank(message = "File URL is required")
    @Column(name = "file_url", nullable = false, columnDefinition = "TEXT")
    private String fileUrl;

    @Size(max = 255)
    @Column(name = "original_filename", length = 255)
    private String originalFilename;

    @Size(max = 100)
    @Column(name = "content_type", length = 100)
    private String contentType;

    @Column(name = "file_size")
    private Long fileSize;

    /**
     * Tag for the deletion adapter: "local" | "s3" | "cloudinary".
     */
    @Size(max = 50)
    @Column(name = "storage_provider", length = 50)
    private String storageProvider;

    @CreationTimestamp
    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private LocalDateTime uploadedAt;
}