package com.saamyukt.SIH26043.capabilitymatching.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamSynthesisResult {
    private UUID teamId;
    private List<TeamMemberInfo> members;
    private List<String> coveredSkills;
    private List<String> skillGaps;
    private List<EquipmentEvidence> equipmentEvidence;
    private List<String> evidence;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeamMemberInfo {
        private String role;
        private String memberReference; // Privacy safe identifier
        private String department;
        private List<String> matchedSkills;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EquipmentEvidence {
        private String equipment;
        private String status;
        private String lab;
    }
}
