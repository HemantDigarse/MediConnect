package com.mediconnect.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import jakarta.annotation.PostConstruct;
import java.time.Duration;

@Slf4j
@Component
public class S3Util {

    @Value("${aws.access-key}")
    private String accessKey;

    @Value("${aws.secret-key}")
    private String secretKey;

    @Value("${aws.s3.bucket}")
    private String bucketName;

    @Value("${aws.s3.region:ap-south-1}")
    private String region;

    private S3Client s3Client;
    private boolean s3Available = false;

    @PostConstruct
    public void init() {
        try {
            s3Client = S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(accessKey, secretKey)))
                .build();
            s3Available = true;
            log.info("AWS S3 client initialized for bucket: {}", bucketName);
        } catch (Exception e) {
            log.warn("AWS S3 initialization failed - file uploads will be mocked: {}", e.getMessage());
            s3Available = false;
        }
    }

    public String uploadFile(String key, byte[] fileBytes, String contentType) {
        if (!s3Available) {
            log.info("[S3 MOCK] Would upload file: {}", key);
            return "https://mock-s3.mediconnect.local/" + key;
        }
        try {
            PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(contentType)
                .build();
            s3Client.putObject(request, RequestBody.fromBytes(fileBytes));
            return "https://" + bucketName + ".s3." + region + ".amazonaws.com/" + key;
        } catch (Exception e) {
            log.error("S3 upload failed for key {}: {}", key, e.getMessage());
            throw new RuntimeException("File upload failed: " + e.getMessage());
        }
    }

    public String getPresignedUrl(String key) {
        if (!s3Available) return "https://mock-s3.mediconnect.local/" + key;
        try {
            S3Presigner presigner = S3Presigner.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(accessKey, secretKey)))
                .build();
            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(60))
                .getObjectRequest(GetObjectRequest.builder().bucket(bucketName).key(key).build())
                .build();
            return presigner.presignGetObject(presignRequest).url().toString();
        } catch (Exception e) {
            log.error("Presigned URL generation failed: {}", e.getMessage());
            return "";
        }
    }

    public void deleteFile(String key) {
        if (!s3Available) { log.info("[S3 MOCK] Would delete: {}", key); return; }
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder().bucket(bucketName).key(key).build());
        } catch (Exception e) {
            log.error("S3 delete failed: {}", e.getMessage());
        }
    }
}
