package com.saamyukt.SIH26043.capabilitymatching.service;

import com.saamyukt.SIH26043.capabilitymatching.dto.IndustryParticipationDTOs.*;
import com.saamyukt.SIH26043.capabilitymatching.entity.*;
import com.saamyukt.SIH26043.capabilitymatching.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class IndustryParticipationServiceTest {

    @Mock
    private IndustryOrganizationRepository orgRepository;
    @Mock
    private ProjectIndustryParticipantRepository participantRepository;
    @Mock
    private ProjectFundingRepository fundingRepository;
    @Mock
    private ProjectMentorshipRepository mentorshipRepository;
    @Mock
    private MentorshipSessionRepository sessionRepository;
    @Mock
    private ActiveProjectRepository projectRepository;

    @InjectMocks
    private IndustryParticipationService service;

    private UUID projectId;
    private UUID orgId;
    private ActiveProject project;
    private IndustryOrganization org;

    @BeforeEach
    void setUp() {
        projectId = UUID.randomUUID();
        orgId = UUID.randomUUID();
        
        project = new ActiveProject();
        project.setProjectId(projectId);
        
        org = new IndustryOrganization();
        org.setOrgId(orgId);
    }

    @Test
    void testAddFunding() {
        ProjectFundingDto dto = new ProjectFundingDto();
        dto.setOrgId(orgId);
        dto.setAmount(new BigDecimal("10000.00"));
        dto.setCurrency("INR");
        
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        when(orgRepository.findById(orgId)).thenReturn(Optional.of(org));
        
        when(fundingRepository.save(any(ProjectFunding.class))).thenAnswer(invocation -> {
            ProjectFunding funding = invocation.getArgument(0);
            funding.setFundingId(UUID.randomUUID());
            return funding;
        });

        ProjectFundingDto created = service.addFunding(projectId, dto);
        
        assertNotNull(created);
        assertNotNull(created.getFundingId());
        assertEquals(new BigDecimal("10000.00"), created.getAmount());
        assertEquals("INR", created.getCurrency());
        assertEquals("PENDING", created.getApprovalState());
        verify(fundingRepository, times(1)).save(any(ProjectFunding.class));
    }

    @Test
    void testGetFundingHidesFinancialsWhenRequested() {
        ProjectFunding funding = new ProjectFunding();
        funding.setFundingId(UUID.randomUUID());
        funding.setProject(project);
        funding.setOrganization(org);
        funding.setAmount(new BigDecimal("50000.00"));
        funding.setCurrency("USD");
        funding.setApprovalState("APPROVED");

        when(fundingRepository.findByProject_ProjectId(projectId)).thenReturn(List.of(funding));

        // Unauthorized call (includeFinancials = false)
        List<ProjectFundingDto> unauthResult = service.getFunding(projectId, false);
        assertEquals(1, unauthResult.size());
        assertNull(unauthResult.get(0).getAmount());
        assertNull(unauthResult.get(0).getCurrency());
        assertEquals("APPROVED", unauthResult.get(0).getApprovalState());

        // Authorized call (includeFinancials = true)
        List<ProjectFundingDto> authResult = service.getFunding(projectId, true);
        assertEquals(1, authResult.size());
        assertEquals(new BigDecimal("50000.00"), authResult.get(0).getAmount());
        assertEquals("USD", authResult.get(0).getCurrency());
    }

    @Test
    void testAssignMentor() {
        ProjectMentorshipDto dto = new ProjectMentorshipDto();
        dto.setOrgId(orgId);
        dto.setMentorUserId(UUID.randomUUID());
        dto.setScope("Technical mentorship");
        
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        when(orgRepository.findById(orgId)).thenReturn(Optional.of(org));
        
        when(mentorshipRepository.save(any(ProjectMentorship.class))).thenAnswer(invocation -> {
            ProjectMentorship m = invocation.getArgument(0);
            m.setMentorshipId(UUID.randomUUID());
            return m;
        });

        ProjectMentorshipDto created = service.assignMentor(projectId, dto);
        
        assertNotNull(created);
        assertEquals("Technical mentorship", created.getScope());
        assertEquals("ACTIVE", created.getStatus());
        verify(mentorshipRepository, times(1)).save(any(ProjectMentorship.class));
    }
}
