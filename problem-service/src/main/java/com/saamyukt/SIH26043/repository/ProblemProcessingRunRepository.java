package com.saamyukt.SIH26043.repository;

import com.saamyukt.SIH26043.entity.ProblemProcessingRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProblemProcessingRunRepository extends JpaRepository<ProblemProcessingRun, UUID> {
    List<ProblemProcessingRun> findByProblemIdOrderByCreatedAtDesc(UUID problemId);
}
