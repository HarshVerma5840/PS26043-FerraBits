package com.saamyukt.SIH26043.capabilitymatching.repository;

import com.saamyukt.SIH26043.capabilitymatching.entity.RecommendationDecisionAudit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RecommendationDecisionAuditRepository extends JpaRepository<RecommendationDecisionAudit, UUID> {

    Optional<RecommendationDecisionAudit> findTopByOrderByCreatedAtDesc();

    List<RecommendationDecisionAudit> findByProblemIdOrderByCreatedAtDesc(UUID problemId);

    List<RecommendationDecisionAudit> findByMatchingRunIdOrderByCreatedAtDesc(UUID matchingRunId);

    Page<RecommendationDecisionAudit> findByMatchingRunId(UUID matchingRunId, Pageable pageable);

    @Query("SELECT a FROM RecommendationDecisionAudit a WHERE a.matchingRunId = :runId ORDER BY a.createdAt DESC LIMIT 1")
    Optional<RecommendationDecisionAudit> findLatestByMatchingRunId(UUID runId);
}
