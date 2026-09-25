package com.saamyukt.SIH26043.capabilitymatching.dto.governance;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;
import java.time.OffsetDateTime;
import java.util.List;

public class GovernanceDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GovernanceReviewDecisionRequest {
        private UUID selectedInstitutionId;
        private String reason;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EvidenceCard {
        private UUID institutionId;
        private String institutionName;
        private String departmentName;
        private String labName;
        private List<String> equipment;
        private List<String> faculty;
        private String teamCapability;
        private Double denseScore;
        private Double sparseScore;
        private Double rerankingScore;
        private Double finalScore;
        private String explanation;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GovernanceReviewResponse {
        private UUID reviewId; // maps to matching_run.run_id
        private UUID problemId;
        private String status; // PENDING, APPROVED, REJECTED, OVERRIDDEN
        private OffsetDateTime runCreatedAt;
        private UUID currentDecisionId; // If there is an audit record
        private List<EvidenceCard> topEvidenceCards;
        private List<GovernanceAuditRecord> auditHistory;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GovernanceAuditRecord {
        private UUID id;
        private String action; // APPROVE, REJECT, OVERRIDE
        private UUID actorId;
        private String actorRole;
        private String reason;
        private String requestMetadata;
        private UUID originalInstitutionId;
        private UUID selectedInstitutionId;
        private OffsetDateTime timestamp;
        private String previousHash;
        private String currentHash;
    }
}
