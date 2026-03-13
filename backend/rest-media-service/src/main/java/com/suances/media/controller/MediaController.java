package com.suances.media.controller;

import com.suances.media.dto.PresignedUrlResponse;
import com.suances.media.service.CloudflareS3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {

    private final CloudflareS3Service cloudflareS3Service;

    @GetMapping("/upload-url")
    public ResponseEntity<PresignedUrlResponse> getUploadUrl(
            @RequestParam String extension,
            @RequestParam String contentType) {

        log.info("Solicitud de URL pre-firmada - extension: {}, contentType: {}", extension, contentType);

        PresignedUrlResponse response = cloudflareS3Service.generatePresignedUploadUrl(extension, contentType);
        return ResponseEntity.ok(response);
    }
}
