package com.saamyukt.SIH26043.repository;

import com.saamyukt.SIH26043.entity.ProblemAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ProblemAnalysisRepository extends JpaRepository<ProblemAnalysis, UUID> {

    Optional<ProblemAnalysis> findByCycleId(UUID cycleId);
}
