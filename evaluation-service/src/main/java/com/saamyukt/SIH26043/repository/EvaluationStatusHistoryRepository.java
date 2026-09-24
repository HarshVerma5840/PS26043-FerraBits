package com.saamyukt.SIH26043.repository;

import com.saamyukt.SIH26043.entity.EvaluationStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EvaluationStatusHistoryRepository extends JpaRepository<EvaluationStatusHistory, UUID> {

    List<EvaluationStatusHistory> findByCycleIdOrderByChangedAtAsc(UUID cycleId);
}
