package com.example.springrentMe.services.storage;

import org.springframework.web.multipart.MultipartFile;

/**
 * Storage abstraction.
 *
 * Swap implementations via the {@code app.storage.provider} property:
 *   app.storage.provider=local      → LocalFileStorageService
 *   app.storage.provider=s3         → S3FileStorageService  (future)
 *   app.storage.provider=cloudinary → CloudinaryStorageService (future)
 *
 * The active implementation is selected by @ConditionalOnProperty in each
 * concrete class, so only ONE bean is registered at runtime.
 */
public interface FileStorageService {

    /**
     * Store a file and return its permanent reference (URL or relative path).
     *
     * @param file      the uploaded multipart file
     * @param folder    logical folder/prefix, e.g. "vehicles/3/docs" or "owners/7/kyc"
     * @return          the storage reference to be persisted in {@link com.example.springrentMe.models.Document#fileUrl}
     */
    String store(MultipartFile file, String folder);

    /**
     * Delete a previously stored file.
     *
     * @param fileReference the value that was returned by {@link #store}
     */
    void delete(String fileReference);

    /**
     * Return the short identifier for this backend.
     * Stored in {@link com.example.springrentMe.models.Document#storageProvider}.
     */
    String getProviderName();
}