package com.example.springrentMe.services.storage;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * AWS S3 (or any S3-compatible store: MinIO, Wasabi, Backblaze B2) storage.
 *
 * Activated when: app.storage.provider=s3
 *
 * To enable:
 *  1. Add to pom.xml:
 *       <dependency>
 *         <groupId>software.amazon.awssdk</groupId>
 *         <artifactId>s3</artifactId>
 *       </dependency>
 *  2. Set in application.properties / environment:
 *       app.storage.provider=s3
 *       app.storage.s3.bucket=your-bucket-name
 *       app.storage.s3.region=ap-southeast-1
 *       app.storage.s3.access-key=AKIA...
 *       app.storage.s3.secret-key=...
 *       app.storage.s3.endpoint=          # optional: for MinIO/custom endpoint
 *  3. Uncomment and complete the implementation below.
 */
@Service
@ConditionalOnProperty(name = "app.storage.provider", havingValue = "s3")
public class S3FileStorageService implements FileStorageService {

    // @Value("${app.storage.s3.bucket}")   private String bucket;
    // @Value("${app.storage.s3.region}")   private String region;
    // @Value("${app.storage.s3.access-key}") private String accessKey;
    // @Value("${app.storage.s3.secret-key}") private String secretKey;
    // @Value("${app.storage.s3.endpoint:}") private String endpoint;
    // private S3Client s3Client;

    // @PostConstruct
    // public void init() {
    //     AwsBasicCredentials creds = AwsBasicCredentials.create(accessKey, secretKey);
    //     S3ClientBuilder builder = S3Client.builder()
    //             .region(Region.of(region))
    //             .credentialsProvider(StaticCredentialsProvider.create(creds));
    //     if (!endpoint.isBlank()) {
    //         builder.endpointOverride(URI.create(endpoint));
    //     }
    //     this.s3Client = builder.build();
    // }

    @Override
    public String store(MultipartFile file, String folder) {
        throw new UnsupportedOperationException(
            "S3FileStorageService is not yet implemented. " +
            "Uncomment the implementation in S3FileStorageService.java after adding the SDK dependency.");
    }

    @Override
    public void delete(String fileReference) {
        throw new UnsupportedOperationException("S3FileStorageService is not yet implemented.");
    }

    @Override
    public String getProviderName() {
        return "s3";
    }
}