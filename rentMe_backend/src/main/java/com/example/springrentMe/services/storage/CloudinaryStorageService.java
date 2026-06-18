package com.example.springrentMe.services.storage;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

/**
 * Stores files on Cloudinary.
 *
 * Activated when: app.storage.provider=cloudinary
 *
 * Required environment variables:
 *   CLOUDINARY_CLOUD_NAME  – your cloud name
 *   CLOUDINARY_API_KEY     – your API key
 *   CLOUDINARY_API_SECRET  – your API secret
 *
 * The returned reference is the Cloudinary secure_url (a full HTTPS URL),
 * so DocumentService.buildServeUrl() will pass it through as-is.
 */
@Service
@ConditionalOnProperty(name = "app.storage.provider", havingValue = "cloudinary")
public class CloudinaryStorageService implements FileStorageService {

    private final Cloudinary cloudinary;

    public CloudinaryStorageService(
            @Value("${cloudinary.cloud-name}") String cloudName,
            @Value("${cloudinary.api-key}")    String apiKey,
            @Value("${cloudinary.api-secret}") String apiSecret) {

        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key",    apiKey,
                "api_secret", apiSecret,
                "secure",     true
        ));
    }

    @Override
    public String store(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Cannot store an empty file.");
        }

        try {
            // Use a UUID-prefixed public_id to avoid name collisions
            String publicId = folder + "/" + UUID.randomUUID();

            @SuppressWarnings("unchecked")
            Map<String, Object> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "public_id",    publicId,
                            "resource_type","auto",   // handles images, PDFs, etc.
                            "overwrite",    false
                    )
            );

            // Return the permanent HTTPS URL; this is stored in Document.fileUrl
            return (String) result.get("secure_url");

        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file to Cloudinary: " + e.getMessage(), e);
        }
    }

    @Override
    public void delete(String fileReference) {
        // fileReference is the full secure_url – extract the public_id from it
        // e.g. https://res.cloudinary.com/<cloud>/image/upload/v123/vehicles/3/docs/<uuid>
        try {
            // public_id is everything after "/upload/vXXXX/" and before the extension
            String publicId = extractPublicId(fileReference);
            if (publicId != null) {
                cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type", "auto"));
            }
        } catch (IOException e) {
            System.err.println("[CloudinaryStorage] Could not delete: " + fileReference + " — " + e.getMessage());
        }
    }

    @Override
    public String getProviderName() {
        return "cloudinary";
    }

    /**
     * Extract the Cloudinary public_id from a secure_url.
     * URL format: https://res.cloudinary.com/{cloud}/{resource_type}/upload/v{version}/{public_id}.{ext}
     */
    private String extractPublicId(String secureUrl) {
        if (secureUrl == null || !secureUrl.contains("/upload/")) {
            return null;
        }
        // Remove everything up to and including "/upload/vXXXXXX/"
        String afterUpload = secureUrl.substring(secureUrl.indexOf("/upload/") + "/upload/".length());
        // Strip the version segment (vXXXXXX/)
        if (afterUpload.startsWith("v") && afterUpload.contains("/")) {
            afterUpload = afterUpload.substring(afterUpload.indexOf("/") + 1);
        }
        // Strip the file extension
        int dotIndex = afterUpload.lastIndexOf('.');
        if (dotIndex > 0) {
            afterUpload = afterUpload.substring(0, dotIndex);
        }
        return afterUpload;
    }
}
