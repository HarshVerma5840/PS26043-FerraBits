package com.saamyukt.SIH26043.web.dto;

import com.saamyukt.SIH26043.entity.Evidence;
import com.saamyukt.SIH26043.enums.EvidenceType;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record EvidenceResponse(
        UUID evidenceId,
        UUID problemId,
        EvidenceType evidenceType,
        String fileHash,
        String clientUploadId,
        Map<String, Object> metadata,
        Instant capturedAt
) {
    public static EvidenceResponse from(Evidence e) {
        return new EvidenceResponse(
                e.getEvidenceId(),
                e.getProblemId(),
                e.getEvidenceType(),
                e.getFileHash(),
                e.getClientUploadId(),
                e.getMetadata(),
                e.getCapturedAt()
        );
    }
}
