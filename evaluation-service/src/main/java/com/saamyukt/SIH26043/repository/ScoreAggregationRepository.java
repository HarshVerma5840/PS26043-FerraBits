package com.saamyukt.SIH26043.repository;

import com.saamyukt.SIH26043.entity.ScoreAggregation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ScoreAggregationRepository extends JpaRepository<ScoreAggregation, UUID> {

    Optional<ScoreAggregation> findByCycleId(UUID cycleId);
}
