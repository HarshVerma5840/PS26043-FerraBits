package com.saamyukt.SIH26043.capabilitymatching.dto;

import lombok.Data;
import java.util.List;
import java.util.UUID;
import java.util.Map;

@Data
public class MatchResult {
    private UUID problemId;
    private UUID matchingRunId;
    private String algorithmVersion;
    private List<MatchedInstitution> matches;

    @Data
    public static class MatchedInstitution {
        private Integer rank;
        private UUID institutionId;
        private String institutionName;
        private UUID teamId;
        private Double overallScore;
        private ScoreBreakdown scoreBreakdown;
        private List<String> matchedSkills;
        private List<String> matchedEquipment;
        private List<String> skillGaps;
        private List<String> evidence;
        private Map<String, Boolean> constraints;
        private TeamSynthesisResult teamSynthesis;
    }

    @Data
    public static class ScoreBreakdown {
        private Double semanticFit;
        private Double skillAlignment;
        private Double equipmentAvailability;
        private Double pastPerformance;
        private Double capacity;
        private Double geographicProximity;
    }
}
