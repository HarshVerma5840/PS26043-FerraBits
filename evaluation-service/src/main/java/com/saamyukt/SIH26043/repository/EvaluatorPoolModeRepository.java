package com.saamyukt.SIH26043.repository;

import com.saamyukt.SIH26043.entity.EvaluatorPoolMode;
import com.saamyukt.SIH26043.enums.EvaluatorType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EvaluatorPoolModeRepository extends JpaRepository<EvaluatorPoolMode, EvaluatorType> {

    Optional<EvaluatorPoolMode> findByEvaluatorType(EvaluatorType evaluatorType);
}
