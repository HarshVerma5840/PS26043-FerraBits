package com.saamyukt.SIH26043.capabilitymatching.service;

import com.saamyukt.SIH26043.capabilitymatching.dto.ProblemFingerprint;
import com.saamyukt.SIH26043.capabilitymatching.dto.TeamSynthesisResult;
import com.saamyukt.SIH26043.capabilitymatching.entity.*;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class TeamSynthesisService {

    private final GeoDistanceCalculator geoDistanceCalculator;

    public TeamSynthesisService(GeoDistanceCalculator geoDistanceCalculator) {
        this.geoDistanceCalculator = geoDistanceCalculator;
    }

    public TeamSynthesisResult synthesizeTeam(Institution institution, ProblemFingerprint problem, AlgorithmConfig config) {
        UUID teamId = UUID.randomUUID();
        List<TeamSynthesisResult.TeamMemberInfo> finalMembers = new ArrayList<>();
        List<String> coveredSkills = new ArrayList<>();
        List<String> skillGaps = new ArrayList<>();
        List<TeamSynthesisResult.EquipmentEvidence> equipmentEvidenceList = new ArrayList<>();
        List<String> evidence = new ArrayList<>();

        // 1. Partition required capabilities
        List<ProblemFingerprint.RequiredCapability> requiredSkills = problem.getRequiredCapabilities() != null 
                ? problem.getRequiredCapabilities() 
                : new ArrayList<>();

        // Collect all available candidates with capacity
        List<CandidateMember> availableCandidates = new ArrayList<>();
        if (institution.getDepartments() != null) {
            for (Department dept : institution.getDepartments()) {
                if (dept.getFaculty() != null) {
                    for (Faculty fac : dept.getFaculty()) {
                        if (fac.getCurrentWorkloadPct() < config.getCapacityThreshold()) {
                            availableCandidates.add(new CandidateMember(
                                    "FACULTY",
                                    fac.getFacultyId().toString(),
                                    dept.getName(),
                                    fac.getPastPerformanceScore(),
                                    fac.getSkills() != null ? fac.getSkills().stream().map(s -> s.getSkill().getName().toLowerCase()).collect(Collectors.toSet()) : new HashSet<>()
                            ));
                        }
                    }
                }
            }
        }
        if (institution.getStudents() != null) {
            for (Student st : institution.getStudents()) {
                // Students generally have 0 workload tracked in this schema context, assuming available
                availableCandidates.add(new CandidateMember(
                        "STUDENT",
                        st.getStudentId().toString(),
                        "Institution level", // Alternatively map if student has dept
                        0.5, // Default performance
                        st.getSkills() != null ? st.getSkills().stream().map(s -> s.getSkill().getName().toLowerCase()).collect(Collectors.toSet()) : new HashSet<>()
                ));
            }
        }

        // 2 & 3 & 4. Identify members and ensure skills are covered
        Map<String, CandidateMember> selectedMembers = new HashMap<>(); // memberReference -> CandidateMember
        
        for (ProblemFingerprint.RequiredCapability reqSkill : requiredSkills) {
            String skillTarget = reqSkill.getSkill().toLowerCase();
            
            // Find candidates having this skill
            List<CandidateMember> matchingCandidates = availableCandidates.stream()
                    .filter(c -> c.skills.contains(skillTarget))
                    .collect(Collectors.toList());

            if (matchingCandidates.isEmpty()) {
                skillGaps.add(reqSkill.getSkill());
                if ("HIGH".equalsIgnoreCase(reqSkill.getImportance())) {
                    evidence.add("Required high-importance skill '" + reqSkill.getSkill() + "' is MISSING.");
                } else {
                    evidence.add("Required skill '" + reqSkill.getSkill() + "' is MISSING.");
                }
                continue;
            }

            // 10. Deterministic Team Selection
            // Sort by: already in team? (prefer local team cohesion), number of total skills, past performance, id
            matchingCandidates.sort((a, b) -> {
                boolean aSelected = selectedMembers.containsKey(a.id);
                boolean bSelected = selectedMembers.containsKey(b.id);
                if (aSelected && !bSelected) return -1;
                if (!aSelected && bSelected) return 1;

                int aSkillCount = a.skills.size();
                int bSkillCount = b.skills.size();
                if (aSkillCount != bSkillCount) return Integer.compare(bSkillCount, aSkillCount); // More skills first

                int perfCmp = Double.compare(b.performance, a.performance);
                if (perfCmp != 0) return perfCmp;

                return a.id.compareTo(b.id);
            });

            CandidateMember chosen = matchingCandidates.get(0);
            chosen.matchedSkills.add(reqSkill.getSkill());
            selectedMembers.put(chosen.id, chosen);
            coveredSkills.add(reqSkill.getSkill());
            
            evidence.add("Required skill '" + reqSkill.getSkill() + "' is covered by " + chosen.role + " in " + chosen.department);
        }

        // Build final member list (Privacy Safe - No Names)
        for (CandidateMember cm : selectedMembers.values()) {
            finalMembers.add(TeamSynthesisResult.TeamMemberInfo.builder()
                    .role(cm.role)
                    .memberReference(cm.id)
                    .department(cm.department)
                    .matchedSkills(new ArrayList<>(cm.matchedSkills))
                    .build());
        }

        // 5 & 8. Equipment Requirements
        List<String> requiredEq = problem.getRequiredEquipment() != null ? problem.getRequiredEquipment() : new ArrayList<>();
        for (String eqReq : requiredEq) {
            boolean found = false;
            if (institution.getLabs() != null) {
                for (Lab lab : institution.getLabs()) {
                    if (lab.getEquipmentList() != null) {
                        for (Equipment eq : lab.getEquipmentList()) {
                            if (eq.getName().equalsIgnoreCase(eqReq)) {
                                found = true;
                                if (Boolean.TRUE.equals(eq.getIsOperational())) {
                                    equipmentEvidenceList.add(new TeamSynthesisResult.EquipmentEvidence(eqReq, "VERIFIED_AVAILABLE", lab.getName()));
                                    evidence.add("Required equipment '" + eqReq + "' is verified available in '" + lab.getName() + "'.");
                                } else {
                                    equipmentEvidenceList.add(new TeamSynthesisResult.EquipmentEvidence(eqReq, "UNAVAILABLE", lab.getName()));
                                    evidence.add("Required equipment '" + eqReq + "' is unavailable/unverified in '" + lab.getName() + "'.");
                                }
                                break;
                            }
                        }
                    }
                    if (found) break;
                }
            }
            if (!found) {
                equipmentEvidenceList.add(new TeamSynthesisResult.EquipmentEvidence(eqReq, "NOT_FOUND", "N/A"));
                evidence.add("Required equipment '" + eqReq + "' is MISSING.");
            }
        }

        // 6. Capacity Explanation
        if (!finalMembers.isEmpty()) {
            evidence.add("Team members have sufficient capacity (all under " + config.getCapacityThreshold() + "% workload).");
        } else {
            evidence.add("No members with sufficient capacity or matching skills were found.");
        }

        // Geographic Explanation
        double distance = geoDistanceCalculator.calculateDistanceKm(
                problem.getLatitude(), problem.getLongitude(),
                institution.getLatitude(), institution.getLongitude()
        );
        if (distance >= 0) {
            evidence.add(String.format("Geographic proximity: %.2f km from problem location.", distance));
        } else {
            evidence.add("Geographic proximity: Location data unavailable.");
        }

        // Add Registry and Algorithm Version
        evidence.add("Algorithm Version: " + config.getVersion());
        if (institution.getRegistryVersionId() != null) {
            evidence.add("Registry Version: " + institution.getRegistryVersionId());
        }

        return TeamSynthesisResult.builder()
                .teamId(teamId)
                .members(finalMembers)
                .coveredSkills(coveredSkills)
                .skillGaps(skillGaps)
                .equipmentEvidence(equipmentEvidenceList)
                .evidence(evidence)
                .build();
    }

    private static class CandidateMember {
        String role;
        String id;
        String department;
        double performance;
        Set<String> skills;
        Set<String> matchedSkills = new LinkedHashSet<>();

        CandidateMember(String role, String id, String department, double performance, Set<String> skills) {
            this.role = role;
            this.id = id;
            this.department = department;
            this.performance = performance;
            this.skills = skills;
        }
    }
}
