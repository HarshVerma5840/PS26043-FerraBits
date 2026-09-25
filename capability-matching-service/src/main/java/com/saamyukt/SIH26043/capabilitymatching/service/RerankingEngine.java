package com.saamyukt.SIH26043.capabilitymatching.service;

import com.saamyukt.SIH26043.capabilitymatching.dto.MatchResult;
import com.saamyukt.SIH26043.capabilitymatching.dto.ProblemFingerprint;
import com.saamyukt.SIH26043.capabilitymatching.dto.retrieval.RetrievalDTOs.RrfResult;
import com.saamyukt.SIH26043.capabilitymatching.entity.*;
import com.saamyukt.SIH26043.capabilitymatching.repository.InstitutionRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class RerankingEngine {

    private final InstitutionRepository institutionRepository;
    private final GeoDistanceCalculator geoDistanceCalculator;

    public RerankingEngine(InstitutionRepository institutionRepository, GeoDistanceCalculator geoDistanceCalculator) {
        this.institutionRepository = institutionRepository;
        this.geoDistanceCalculator = geoDistanceCalculator;
    }

    public List<MatchResult.MatchedInstitution> rerank(
            List<RrfResult> candidates, 
            ProblemFingerprint fingerprint, 
            AlgorithmConfig config) {

        List<MatchResult.MatchedInstitution> finalResults = new ArrayList<>();

        for (RrfResult candidate : candidates) {
            Optional<Institution> instOpt = institutionRepository.findById(candidate.getInstitutionId());
            if (instOpt.isEmpty()) continue;
            Institution inst = instOpt.get();

            // 1. Hard Constraints
            if (!Boolean.TRUE.equals(inst.getActiveStatus())) continue;
            if ("MANDATORY".equalsIgnoreCase(fingerprint.getDomain()) && !"VERIFIED".equals(inst.getVerificationStatus())) {
                continue; // Example logic: domain marks verification as mandatory
            }
            if (candidate.isExactEquipmentMiss()) {
                continue; // 9. Never recommend a candidate that fails a mandatory equipment constraint
            }

            // Calculate aggregate workload and capacity
            double totalWorkloadPct = 0;
            int facultyCount = 0;
            double avgPastPerformance = 0;
            Set<String> allSkills = new HashSet<>();
            Set<String> allEq = new HashSet<>();

            if (inst.getDepartments() != null) {
                for (Department dept : inst.getDepartments()) {
                    if (dept.getFaculty() != null) {
                        for (Faculty fac : dept.getFaculty()) {
                            totalWorkloadPct += fac.getCurrentWorkloadPct();
                            avgPastPerformance += fac.getPastPerformanceScore();
                            facultyCount++;
                            if (fac.getSkills() != null) {
                                for (FacultySkill fs : fac.getSkills()) {
                                    allSkills.add(fs.getSkill().getName().toLowerCase());
                                }
                            }
                        }
                    }
                }
            }
            
            if (inst.getLabs() != null) {
                for (Lab lab : inst.getLabs()) {
                    if (lab.getEquipmentList() != null) {
                        for (Equipment eq : lab.getEquipmentList()) {
                            if (Boolean.TRUE.equals(eq.getIsOperational())) {
                                allEq.add(eq.getName().toLowerCase());
                            }
                        }
                    }
                }
            }

            double avgWorkload = facultyCount > 0 ? totalWorkloadPct / facultyCount : 0;
            if (avgWorkload >= config.getCapacityThreshold()) {
                continue; // Team over capacity
            }

            avgPastPerformance = facultyCount > 0 ? avgPastPerformance / facultyCount : 0.5;

            double distance = geoDistanceCalculator.calculateDistanceKm(
                    fingerprint.getLatitude(), fingerprint.getLongitude(),
                    inst.getLatitude(), inst.getLongitude()
            );

            // Invalid location check
            if (fingerprint.getMaxDistanceKm() != null && distance == -1.0) {
                continue; // Missing location when distance constraint is provided
            }

            if (fingerprint.getMaxDistanceKm() != null && distance > fingerprint.getMaxDistanceKm()) {
                continue; // Too far
            }

            // 2. Normalized Scores
            
            double semanticScore = candidate.getDenseScore() != null ? candidate.getDenseScore() : 
                                  (candidate.getRrfScore() > 0 ? Math.min(candidate.getRrfScore() * 10, 1.0) : 0.0);
            
            // Skill Alignment
            double skillAlignmentScore = 1.0;
            int reqSkillCount = 0;
            int matchedSkillCount = 0;
            List<String> matchedSkills = new ArrayList<>();
            List<String> skillGaps = new ArrayList<>();
            
            if (fingerprint.getRequiredCapabilities() != null) {
                for (ProblemFingerprint.RequiredCapability rc : fingerprint.getRequiredCapabilities()) {
                    reqSkillCount++;
                    if (allSkills.contains(rc.getSkill().toLowerCase())) {
                        matchedSkillCount++;
                        matchedSkills.add(rc.getSkill());
                    } else {
                        skillGaps.add(rc.getSkill());
                    }
                }
            }
            if (reqSkillCount > 0) {
                skillAlignmentScore = (double) matchedSkillCount / reqSkillCount;
            }

            // Equipment Availability
            double eqScore = 1.0; // Already verified by sparse exact equipment miss flag, assume 1.0
            
            // Capacity Score (1.0 - (workload / 100))
            double capacityScore = Math.max(0, 1.0 - (avgWorkload / 100.0));

            // Geography Score
            double geoScore = 1.0;
            if (fingerprint.getLatitude() != null && fingerprint.getLongitude() != null && distance >= 0) {
                double maxD = fingerprint.getMaxDistanceKm() != null ? fingerprint.getMaxDistanceKm() : config.getMaxDistanceKm();
                geoScore = Math.max(0, 1.0 - (distance / maxD));
            } else if (fingerprint.getLatitude() == null) {
                geoScore = 0.5; // No-location input baseline
            }

            // Past Performance
            double pastPerfScore = Math.min(1.0, avgPastPerformance);

            // 3. Multi-Factor Fusion
            double overallScore = 
                (semanticScore * config.getSemanticWeight()) +
                (skillAlignmentScore * config.getSkillWeight()) +
                (eqScore * config.getInfrastructureWeight()) +
                (pastPerfScore * config.getPastPerformanceWeight()) +
                (capacityScore * config.getCapacityWeight()) +
                (geoScore * config.getGeographyWeight());

            MatchResult.ScoreBreakdown breakdown = new MatchResult.ScoreBreakdown();
            breakdown.setSemanticFit(semanticScore);
            breakdown.setSkillAlignment(skillAlignmentScore);
            breakdown.setEquipmentAvailability(eqScore);
            breakdown.setPastPerformance(pastPerfScore);
            breakdown.setCapacity(capacityScore);
            breakdown.setGeographicProximity(geoScore);

            MatchResult.MatchedInstitution mi = new MatchResult.MatchedInstitution();
            mi.setInstitutionId(inst.getInstitutionId());
            mi.setInstitutionName(inst.getName());
            mi.setOverallScore(overallScore);
            mi.setScoreBreakdown(breakdown);
            mi.setMatchedSkills(matchedSkills);
            mi.setSkillGaps(skillGaps);
            
            Map<String, Boolean> constraints = new HashMap<>();
            constraints.put("equipment_met", !candidate.isExactEquipmentMiss());
            constraints.put("capacity_met", avgWorkload < config.getCapacityThreshold());
            mi.setConstraints(constraints);

            finalResults.add(mi);
        }

        // 4. Deterministic Ordering
        finalResults.sort((a, b) -> {
            int cmp = Double.compare(b.getOverallScore(), a.getOverallScore());
            if (cmp != 0) return cmp;
            return a.getInstitutionId().compareTo(b.getInstitutionId());
        });

        // Set ranks
        for (int i = 0; i < finalResults.size(); i++) {
            finalResults.get(i).setRank(i + 1);
        }

        return finalResults;
    }
}
