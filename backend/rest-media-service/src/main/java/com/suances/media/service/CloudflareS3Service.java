package com.suances.media.service;

import com.suances.media.dto.PresignedUrlResponse;
import com.suances.media.exception.InvalidFileTypeException;
import com.suances.media.exception.PresignedUrlGenerationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CloudflareS3Service {

    private static final long EXPIRATION_SECONDS = 300;

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "jpg", "jpeg", "png", "webp", "gif", "svg", "pdf");

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "application/pdf");

    private final S3Presigner s3Presigner;

    @Value("${app.s3.bucket}")
    private String bucket;

    @Value("${app.s3.cdn-domain}")
    private String cdnDomain;

    public PresignedUrlResponse generatePresignedUploadUrl(String extension, String contentType) {
        validateFileType(extension, contentType);

        String fileName = UUID.randomUUID() + "." + extension.toLowerCase();
        log.info("Generating presigned URL for file: {}, contentType: {}", fileName, contentType);

        try {
            PutObjectRequest objectRequest = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(fileName)
                    .contentType(contentType)
                    .build();

            PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofSeconds(EXPIRATION_SECONDS))
                    .putObjectRequest(objectRequest)
                    .build();

            PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(presignRequest);

            String uploadUrl = presignedRequest.url().toString();
            String publicUrl = "https://" + cdnDomain + "/" + fileName;

            log.info("Presigned URL generated successfully for file: {}", fileName);

            return new PresignedUrlResponse(uploadUrl, publicUrl, EXPIRATION_SECONDS);

        } catch (Exception e) {
            log.error("Error generating presigned URL for file: {}", fileName, e);
            throw new PresignedUrlGenerationException(
                    "Error al generar la URL pre-firmada para el archivo: " + fileName, e);
        }
    }

    private void validateFileType(String extension, String contentType) {
        if (extension == null || extension.isBlank()) {
            throw new InvalidFileTypeException("La extensión del archivo es obligatoria");
        }
        if (contentType == null || contentType.isBlank()) {
            throw new InvalidFileTypeException("El tipo de contenido (contentType) es obligatorio");
        }

        String normalizedExt = extension.toLowerCase().trim();
        String normalizedContentType = contentType.toLowerCase().trim();

        if (!ALLOWED_EXTENSIONS.contains(normalizedExt)) {
            throw new InvalidFileTypeException(
                    "Extensión no permitida: '" + extension + "'. Extensiones válidas: " + ALLOWED_EXTENSIONS);
        }
        if (!ALLOWED_CONTENT_TYPES.contains(normalizedContentType)) {
            throw new InvalidFileTypeException(
                    "Tipo de contenido no permitido: '" + contentType + "'. Tipos válidos: " + ALLOWED_CONTENT_TYPES);
        }
    }
}
