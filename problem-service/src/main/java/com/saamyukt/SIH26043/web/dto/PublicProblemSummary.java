package com.saamyukt.SIH26043.web.dto;

import com.saamyukt.SIH26043.entity.Location;
import com.saamyukt.SIH26043.entity.Problem;
import com.saamyukt.SIH26043.enums.ProblemStatus;

import java.time.Instant;
import java.util.UUID;

public record PublicProblemSummary(
        UUID problemId,
        String title,
        String description,
        ProblemStatus status,
        String approximateLocation,
        Instant submittedAt
) {
    public static PublicProblemSummary from(Problem p, Location loc) {
        String approx = "Unknown Location";
        if (loc != null) {
            if (loc.getDistrict() != null && !loc.getDistrict().isBlank()) {
                approx = loc.getDistrict();
                if (loc.getBlockTehsil() != null && !loc.getBlockTehsil().isBlank()) {
                    approx = loc.getBlockTehsil() + ", " + approx;
                }
            } else if (loc.getState() != null && !loc.getState().isBlank()) {
                approx = loc.getState();
            }
        }

        return new PublicProblemSummary(
                p.getProblemId(),
                p.getTitle(),
                // Keep description reasonably short for summaries? Let's just return full for now.
                p.getDescription(),
                p.getStatus(),
                approx,
                p.getSubmittedAt()
        );
    }
}
