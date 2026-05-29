package com.example.springrentMe.services.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * Stores files on the local filesystem.
 *
 * Activated when: app.storage.provider=local  (default)
 *
 * Files are placed at:
 *   {app.storage.local.base-dir}/{folder}/{uuid}_{originalFilename}
 *
 * The returned reference is the path RELATIVE to base-dir so that
 * the app can be moved without stale absolute paths in the DB.
 * The controller converts this relative path to a serve URL via:
 *   GET /api/v1/files/{**path}
 */
@Service
@ConditionalOnProperty(name = "app.storage.provider", havingValue = "local", matchIfMissing = true)
public class LocalFileStorageService implements FileStorageService {

    private final Path baseDir;

    public LocalFileStorageService(
            @Value("${app.storage.local.base-dir:uploads}") String baseDirStr) {
        this.baseDir = Paths.get(baseDirStr).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.baseDir);
        } catch (IOException e) {
            throw new RuntimeException("Could not create local storage directory: " + baseDirStr, e);
        }
    }

    @Override
    public String store(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Cannot store an empty file.");
        }

        String originalName = StringUtils.cleanPath(
                file.getOriginalFilename() != null ? file.getOriginalFilename() : "file"
        );

        // Prevent path traversal
        if (originalName.contains("..")) {
            throw new RuntimeException("Filename contains invalid path sequence: " + originalName);
        }

        String uniqueFilename = UUID.randomUUID() + "_" + originalName;

        try {
            Path targetDir = baseDir.resolve(folder).normalize();
            Files.createDirectories(targetDir);               // create sub-dirs lazily

            Path targetFile = targetDir.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), targetFile, StandardCopyOption.REPLACE_EXISTING);

            // Return RELATIVE path from base-dir (OS-independent, use forward slash)
            return baseDir.relativize(targetFile).toString().replace("\\", "/");
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file " + uniqueFilename, e);
        }
    }

    @Override
    public void delete(String fileReference) {
        try {
            Path target = baseDir.resolve(fileReference).normalize();
            Files.deleteIfExists(target);
        } catch (IOException e) {
            // Log but don't fail the business operation
            System.err.println("[LocalStorage] Could not delete file: " + fileReference + " — " + e.getMessage());
        }
    }

    @Override
    public String getProviderName() {
        return "local";
    }
}