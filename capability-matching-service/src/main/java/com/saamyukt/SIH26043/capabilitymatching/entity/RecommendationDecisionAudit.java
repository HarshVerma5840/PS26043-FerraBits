package com.saamyukt.SIH26043.capabilitymatching.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "recommendation_decision_audit")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecommendationDecisionAudit {

    @Id
    @Column(name = "id")
    private UUID id;

    @Column(name = "matching_run_id", nullable = false)
    private UUID matchingRunId;

    @Column(name = "problem_id", nullable = false)
    private UUID problemId;

    @Column(name = "decision", nullable = false)
    private String decision; // APPROVE, REJECT, OVERRIDE

    @Column(name = "original_institution_id")
    private UUID originalInstitutionId;

    @Column(name = "selected_institution_id")
    private UUID selectedInstitutionId;

    @Column(name = "actor_id", nullable = false)
    private UUID actorId;

    @Column(name = "actor_role", nullable = false)
    private String actorRole;

    @Column(name = "reason")
    private String reason;

    @Column(name = "request_metadata")
    private String requestMetadata;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "previous_hash", nullable = false, updatable = false)
    private String previousHash;

    @Column(name = "current_hash", nullable = false, updatable = false)
    private String currentHash;
}
