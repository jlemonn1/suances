package com.suances.media.dto;

public record PresignedUrlResponse(
        String uploadUrl,
        String publicUrl,
        long expiresInSeconds) {
}
