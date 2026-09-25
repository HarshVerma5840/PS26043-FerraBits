package com.saamyukt.SIH26043.capabilitymatching.service;

import com.saamyukt.SIH26043.capabilitymatching.dto.FeedbackAnalyticsDTOs.*;
import com.saamyukt.SIH26043.capabilitymatching.entity.*;
import com.saamyukt.SIH26043.capabilitymatching.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class FeedbackAnalyticsServiceTest {

    @Mock
    private CitizenFeedbackRepository feedbackRepository;
    @Mock
    private ActiveProjectRepository projectRepository;
    @Mock
    private DeploymentRepository deploymentRepository;

    @InjectMocks
    private FeedbackAnalyticsService service;

    private UUID projectId;
    private ActiveProject project;

    @BeforeEach
    void setUp() {
        projectId = UUID.randomUUID();
        project = new ActiveProject();
        project.setProjectId(projectId);
    }

    @Test
    void testSubmitFeedbackCreatesGeohash() {
        CreateFeedbackDto dto = new CreateFeedbackDto();
        dto.setRating(5);
        dto.setLatitude(new BigDecimal("12.9716"));
        dto.setLongitude(new BigDecimal("77.5946"));
        
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        when(feedbackRepository.save(any(CitizenFeedback.class))).thenAnswer(i -> {
            CitizenFeedback fb = i.getArgument(0);
            fb.setFeedbackId(UUID.randomUUID());
            return fb;
        });

        CitizenFeedbackDto result = service.submitFeedback(projectId, dto, UUID.randomUUID());
        
        assertNotNull(result);
        assertEquals(5, result.getRating());
        // Geohash should be calculated
        assertNotNull(result.getLocationGeohash());
        // Exact lat/long must NEVER be in DTO
    }

    @Test
    void testGetProjectFeedbackFiltersPendingAndAnonymizes() {
        CitizenFeedback f1 = new CitizenFeedback();
        f1.setFeedbackId(UUID.randomUUID());
        f1.setProject(project);
        f1.setModerationStatus("PENDING"); // Should be filtered out for non-admins
        f1.setGeohash("tdr1");

        CitizenFeedback f2 = new CitizenFeedback();
        f2.setFeedbackId(UUID.randomUUID());
        f2.setProject(project);
        f2.setModerationStatus("APPROVED"); // Kept
        f2.setGeohash("tdr1");

        CitizenFeedback f3 = new CitizenFeedback();
        f3.setFeedbackId(UUID.randomUUID());
        f3.setProject(project);
        f3.setModerationStatus("APPROVED"); // Kept
        f3.setGeohash("tdr1");
        
        // Count for "tdr1" is 3. The threshold is < 3. So it should NOT be suppressed since count is 3.

        when(feedbackRepository.findByProject_ProjectId(projectId)).thenReturn(List.of(f1, f2, f3));

        List<CitizenFeedbackDto> dtos = service.getProjectFeedback(projectId, false);
        
        assertEquals(2, dtos.size(), "Non-admin sees only APPROVED feedback");
        assertEquals("tdr1", dtos.get(0).getLocationGeohash(), "Geohash kept because count >= 3");
    }

    @Test
    void testGetProjectFeedbackSuppressesGeohashIfUnderThreshold() {
        CitizenFeedback f1 = new CitizenFeedback();
        f1.setFeedbackId(UUID.randomUUID());
        f1.setProject(project);
        f1.setModerationStatus("APPROVED");
        f1.setGeohash("unique1"); // Count = 1, < 3 -> should be suppressed
        
        when(feedbackRepository.findByProject_ProjectId(projectId)).thenReturn(List.of(f1));

        List<CitizenFeedbackDto> dtos = service.getProjectFeedback(projectId, false);
        
        assertEquals(1, dtos.size());
        assertNull(dtos.get(0).getLocationGeohash(), "Geohash suppressed due to privacy threshold < 3");
    }
}
