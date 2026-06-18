package com.example.springrentMe.services.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Set;

/**
 * Centralised file validation.
 * Rules are driven by application properties so they can be changed without
 * code changes.
 */
@Service
public class FileValidationService {

    /** Maximum allowed file size in bytes. Default: 10 MB. */
    @Value("${app.storage.max-file-size-bytes:10485760}")
    private long maxFileSizeBytes;

    /** Allowed MIME types for document uploads. */
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "application/pdf",
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
    );

    /**
     * Validate a single uploaded file.
     *
     * @throws RuntimeException with a descriptive message if validation fails.
     */
    public void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Uploaded file is empty or missing.");
        }

        // Size check
        if (file.getSize() > maxFileSizeBytes) {
            long maxMb = maxFileSizeBytes / (1024 * 1024);
            throw new RuntimeException(
                "File '" + file.getOriginalFilename() + "' exceeds the maximum allowed size of " + maxMb + " MB.");
        }

        // Content-type check
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new RuntimeException(
                "File type '" + contentType + "' is not allowed. " +
                "Accepted types: PDF, JPEG, PNG, WEBP.");
        }
    }

    /**
     * Validate all files in an array.
     */
    public void validateAll(MultipartFile[] files) {
        if (files == null || files.length == 0) {
            throw new RuntimeException("At least one document file must be uploaded.");
        }
        for (MultipartFile file : files) {
            validate(file);
        }
    }
}