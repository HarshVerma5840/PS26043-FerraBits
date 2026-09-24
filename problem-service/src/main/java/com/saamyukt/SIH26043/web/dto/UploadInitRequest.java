package com.saamyukt.SIH26043.web.dto;

import com.saamyukt.SIH26043.enums.EvidenceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record UploadInitRequest(
        @NotBlank String filename,
        String contentType,
        @NotNull EvidenceType evidenceType,
        @Positive long totalBytes
) {
}
