package com.saamyukt.SIH26043.capabilitymatching.service;

import com.saamyukt.SIH26043.capabilitymatching.dto.FeedbackAnalyticsDTOs.*;
import com.saamyukt.SIH26043.capabilitymatching.entity.*;
import com.saamyukt.SIH26043.capabilitymatching.repository.*;
import com.saamyukt.SIH26043.capabilitymatching.util.GeohashUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FeedbackAnalyticsService {

    private final CitizenFeedbackRepository feedbackRepository;
    private final ActiveProjectRepository projectRepository;
    private final DeploymentRepository deploymentRepository;

    public FeedbackAnalyticsService(CitizenFeedbackRepository feedbackRepository,
                                    ActiveProjectRepository projectRepository,
                                    DeploymentRepository deploymentRepository) {
        this.feedbackRepository = feedbackRepository;
        this.projectRepository = projectRepository;
        this.deploymentRepository = deploymentRepository;
    }

    @Transactional
    public CitizenFeedbackDto submitFeedback(UUID projectId, CreateFeedbackDto dto, UUID currentUserId) {
        ActiveProject project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        
        CitizenFeedback fb = new CitizenFeedback();
        fb.setFeedbackId(UUID.randomUUID());
        fb.setProject(project);
        
        if (Boolean.TRUE.equals(dto.getIsAnonymous())) {
            fb.setUserId(null);
            fb.setIsAnonymous(true);
        } else {
            fb.setUserId(currentUserId);
            fb.setIsAnonymous(false);
        }
        
        fb.setRating(dto.getRating());
        fb.setCategory(dto.getCategory());
        fb.setComment(dto.getComment());
        fb.setCompletionUsefulness(dto.getCompletionUsefulness());
        fb.setModerationStatus("PENDING");
        
        // PRIVACY RULE: Save exact coordinates but also compute geohash for public consumption.
        fb.setLatitude(dto.getLatitude());
        fb.setLongitude(dto.getLongitude());
        if (dto.getLatitude() != null && dto.getLongitude() != null) {
            // Precision 5 roughly corresponds to a 5km x 5km bounding box.
            fb.setGeohash(GeohashUtils.encode(dto.getLatitude().doubleValue(), dto.getLongitude().doubleValue(), 5));
        }
        
        fb.setCreatedAt(OffsetDateTime.now());
        
        feedbackRepository.save(fb);
        return mapFeedback(fb, false);
    }

    @Transactional(readOnly = true)
    public List<CitizenFeedbackDto> getProjectFeedback(UUID projectId, boolean isAdmin) {
        // Suppress cells below minimum threshold (k-anonymity for locations)
        List<CitizenFeedback> raw = feedbackRepository.findByProject_ProjectId(projectId);
        
        // Count frequencies of geohashes
        Map<String, Long> geohashCounts = raw.stream()
                .filter(f -> f.getGeohash() != null)
                .collect(Collectors.groupingBy(CitizenFeedback::getGeohash, Collectors.counting()));
        
        return raw.stream()
                // Only show APPROVED unless admin
                .filter(f -> isAdmin || "APPROVED".equals(f.getModerationStatus()))
                .map(f -> {
                    CitizenFeedbackDto dto = mapFeedback(f, isAdmin);
                    // Privacy threshold: suppress location if < 3 records exist for this bucket
                    if (!isAdmin && f.getGeohash() != null && geohashCounts.getOrDefault(f.getGeohash(), 0L) < 3) {
                        dto.setLocationGeohash(null); // Suppressed
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public CitizenFeedbackDto moderateFeedback(UUID feedbackId, String status) {
        CitizenFeedback fb = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new IllegalArgumentException("Feedback not found"));
        fb.setModerationStatus(status);
        feedbackRepository.save(fb);
        return mapFeedback(fb, true);
    }

    @Transactional(readOnly = true)
    public FeedbackSummaryDto getFeedbackSummary() {
        long total = feedbackRepository.countByModerationStatus("APPROVED");
        // Simplified average rating for the demo
        double avg = 4.5;
        
        FeedbackSummaryDto dto = new FeedbackSummaryDto();
        dto.setTotalFeedback(total);
        dto.setAverageRating(avg);
        return dto;
    }

    @Transactional(readOnly = true)
    public ImpactMetricsDto getImpactMetrics() {
        ImpactMetricsDto dto = new ImpactMetricsDto();
        
        // Simplified metrics aggregation query equivalents
        dto.setProjectsCompleted(projectRepository.count());
        dto.setProjectsDeployed(deploymentRepository.count());
        dto.setCitizenFeedbackCount(feedbackRepository.count());
        dto.setAverageSatisfaction(4.2);
        dto.setDistrictsServed(15);
        dto.setInstitutionsInvolved(30);
        dto.setStudentsInvolved(150);
        dto.setFacultyInvolved(20);
        dto.setIndustryContributions(5);
        dto.setAverageCompletionTimeDays(45.5);
        dto.setDeploymentSuccessRate(95.0);
        
        return dto;
    }

    @Transactional(readOnly = true)
    public List<DistrictAnalyticsDto> getDistrictsAnalytics() {
        return projectRepository.findAll().stream()
                .map(p -> {
                    DistrictAnalyticsDto d = new DistrictAnalyticsDto();
                    d.setDistrict("District " + p.getProjectId().toString().substring(0, 4).toUpperCase());
                    d.setState("State-1");
                    d.setProjectCount(1);
                    d.setDeployedCount("DEPLOYED".equalsIgnoreCase(p.getStatus()) ? 1 : 0);
                    d.setActiveStudents(12);
                    d.setGeohash("ttnfp");
                    return d;
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InstitutionAnalyticsDto> getInstitutionsAnalytics() {
        return projectRepository.findAll().stream()
                .map(p -> {
                    InstitutionAnalyticsDto inst = new InstitutionAnalyticsDto();
                    inst.setInstitutionId(p.getInstitutionId() != null ? p.getInstitutionId().toString() : UUID.randomUUID().toString());
                    inst.setInstitutionName("Institution " + (p.getInstitutionId() != null ? p.getInstitutionId().toString().substring(0, 6) : "Lead"));
                    inst.setProjectCount(1);
                    inst.setSuccessRate(95.0);
                    inst.setTotalStudents(25);
                    return inst;
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProjectAnalyticsDto> getProjectsAnalytics() {
        return projectRepository.findAll().stream()
                .map(p -> {
                    ProjectAnalyticsDto dto = new ProjectAnalyticsDto();
                    dto.setProjectId(p.getProjectId().toString());
                    dto.setProjectName(p.getName());
                    dto.setStatus(p.getStatus());
                    dto.setDeploymentStatus("DEPLOYED".equalsIgnoreCase(p.getStatus()) ? "DEPLOYED" : "PENDING");
                    dto.setDistrict("District " + p.getProjectId().toString().substring(0, 4).toUpperCase());
                    dto.setInstitutionName("Institution " + (p.getInstitutionId() != null ? p.getInstitutionId().toString().substring(0, 6) : "Lead"));
                    dto.setSatisfactionScore(4.5);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private CitizenFeedbackDto mapFeedback(CitizenFeedback f, boolean isAdmin) {
        CitizenFeedbackDto dto = new CitizenFeedbackDto();
        dto.setFeedbackId(f.getFeedbackId());
        dto.setProjectId(f.getProject().getProjectId());
        
        // Never expose userId if anonymous
        if (!Boolean.TRUE.equals(f.getIsAnonymous())) {
            dto.setUserId(f.getUserId());
        }
        
        dto.setRating(f.getRating());
        dto.setCategory(f.getCategory());
        dto.setComment(f.getComment());
        dto.setCompletionUsefulness(f.getCompletionUsefulness());
        dto.setIsAnonymous(f.getIsAnonymous());
        dto.setModerationStatus(f.getModerationStatus());
        dto.setCreatedAt(f.getCreatedAt());
        
        // PRIVACY RULE: Never expose exact lat/lon in DTO. Expose only Geohash.
        dto.setLocationGeohash(f.getGeohash());
        return dto;
    }
}
