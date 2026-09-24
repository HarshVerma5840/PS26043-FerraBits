package com.saamyukt.SIH26043.repository;

import com.saamyukt.SIH26043.entity.ProblemLanguageArtifact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProblemLanguageArtifactRepository extends JpaRepository<ProblemLanguageArtifact, UUID> {
    Optional<ProblemLanguageArtifact> findByRunId(UUID runId);
}
