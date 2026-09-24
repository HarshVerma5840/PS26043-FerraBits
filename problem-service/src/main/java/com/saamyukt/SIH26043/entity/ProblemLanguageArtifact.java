package com.saamyukt.SIH26043.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "problem_language_artifact")
@Getter
@Setter
public class ProblemLanguageArtifact {

    @Id
    @Column(name = "artifact_id")
    private UUID artifactId;

    @Column(name = "run_id", nullable = false)
    private UUID runId;

    @Column(name = "problem_id", nullable = false)
    private UUID problemId;

    @Column(name = "source_language", length = 50)
    private String sourceLanguage;

    @Column(name = "original_content", columnDefinition = "text")
    private String originalContent;

    @Column(name = "transcribed_text", columnDefinition = "text")
    private String transcribedText;

    @Column(name = "translated_text", columnDefinition = "text")
    private String translatedText;

    @Column(name = "translation_confidence", precision = 4, scale = 3)
    private BigDecimal translationConfidence;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (artifactId == null) artifactId = UUID.randomUUID();
        if (createdAt == null) createdAt = Instant.now();
    }
}
