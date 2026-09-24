package com.saamyukt.SIH26043.entity;

import com.saamyukt.SIH26043.enums.AiProcessingStatus;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class ProblemProcessingDomainTest {

    @Test
    void runEntityPopulatesDefaults() {
        ProblemProcessingRun run = new ProblemProcessingRun();
        run.setProblemId(UUID.randomUUID());
        
        run.onCreate();
        
        assertThat(run.getRunId()).isNotNull();
        assertThat(run.getStatus()).isEqualTo(AiProcessingStatus.PENDING);
        assertThat(run.getCreatedAt()).isNotNull();
        assertThat(run.getUpdatedAt()).isNotNull();
        assertThat(run.getRetryCount()).isEqualTo(0);
        
        Instant created = run.getCreatedAt();
        run.onUpdate();
        assertThat(run.getUpdatedAt()).isAfterOrEqualTo(created);
    }

    @Test
    void languageArtifactPopulatesDefaults() {
        ProblemLanguageArtifact artifact = new ProblemLanguageArtifact();
        artifact.setRunId(UUID.randomUUID());
        artifact.setProblemId(UUID.randomUUID());
        
        artifact.onCreate();
        
        assertThat(artifact.getArtifactId()).isNotNull();
        assertThat(artifact.getCreatedAt()).isNotNull();
    }

    @Test
    void fingerprintVersionPopulatesDefaults() {
        ProblemFingerprintVersion version = new ProblemFingerprintVersion();
        version.setRunId(UUID.randomUUID());
        version.setProblemId(UUID.randomUUID());
        version.setVersionNumber(1);
        
        version.onCreate();
        
        assertThat(version.getVersionId()).isNotNull();
        assertThat(version.getIsLatest()).isFalse();
        assertThat(version.getCreatedAt()).isNotNull();
    }
}
