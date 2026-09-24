package com.saamyukt.SIH26043.web.dto;

import com.saamyukt.SIH26043.enums.EvaluationStatus;
import com.saamyukt.SIH26043.enums.ImpactLevel;
import com.saamyukt.SIH26043.enums.PriorityBand;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * The cycle's final rank after prioritisation.
 *
 * <p>{@code finalScore} and {@code priorityScore} are the same number by design
 * (see {@code PrioritizationService}); {@code priorityBand} is its bucket.</p>
 */
public record PrioritizationResponse(
        UUID cycleId,
        BigDecimal finalScore,
        ImpactLevel impactLevel,
        BigDecimal priorityScore,
        PriorityBand priorityBand,
        EvaluationStatus cycleStatus,
        boolean reviewRequired,
        String message
) {
}
