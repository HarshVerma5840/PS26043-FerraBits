package com.saamyukt.SIH26043.capabilitymatching.service;

import com.saamyukt.SIH26043.capabilitymatching.dto.IndustryParticipationDTOs.*;
import com.saamyukt.SIH26043.capabilitymatching.entity.*;
import com.saamyukt.SIH26043.capabilitymatching.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class IndustryParticipationService {

    private final IndustryOrganizationRepository orgRepository;
    private final ProjectIndustryParticipantRepository participantRepository;
    private final ProjectFundingRepository fundingRepository;
    private final ProjectMentorshipRepository mentorshipRepository;
    private final MentorshipSessionRepository sessionRepository;
    private final ActiveProjectRepository projectRepository;

    public IndustryParticipationService(IndustryOrganizationRepository orgRepository,
                                        ProjectIndustryParticipantRepository participantRepository,
                                        ProjectFundingRepository fundingRepository,
                                        ProjectMentorshipRepository mentorshipRepository,
                                        MentorshipSessionRepository sessionRepository,
                                        ActiveProjectRepository projectRepository) {
        this.orgRepository = orgRepository;
        this.participantRepository = participantRepository;
        this.fundingRepository = fundingRepository;
        this.mentorshipRepository = mentorshipRepository;
        this.sessionRepository = sessionRepository;
        this.projectRepository = projectRepository;
    }

    @Transactional
    public IndustryOrganizationDto createOrganization(IndustryOrganizationDto dto) {
        IndustryOrganization org = new IndustryOrganization();
        org.setOrgId(UUID.randomUUID());
        org.setName(dto.getName());
        org.setDescription(dto.getDescription());
        org.setContactEmail(dto.getContactEmail());
        org.setContactPhone(dto.getContactPhone());
        org.setWebsite(dto.getWebsite());
        org.setAddress(dto.getAddress());
        org.setCreatedAt(OffsetDateTime.now());
        org.setUpdatedAt(OffsetDateTime.now());
        orgRepository.save(org);
        return mapOrg(org);
    }

    @Transactional(readOnly = true)
    public List<IndustryOrganizationDto> getOrganizations() {
        return orgRepository.findAll().stream().map(this::mapOrg).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public IndustryOrganizationDto getOrganization(UUID id) {
        return orgRepository.findById(id).map(this::mapOrg)
                .orElseThrow(() -> new IllegalArgumentException("Org not found"));
    }

    @Transactional
    public IndustryOrganizationDto updateOrganization(UUID id, IndustryOrganizationDto dto) {
        IndustryOrganization org = orgRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Org not found"));
        if (dto.getName() != null) org.setName(dto.getName());
        if (dto.getDescription() != null) org.setDescription(dto.getDescription());
        if (dto.getContactEmail() != null) org.setContactEmail(dto.getContactEmail());
        if (dto.getContactPhone() != null) org.setContactPhone(dto.getContactPhone());
        if (dto.getWebsite() != null) org.setWebsite(dto.getWebsite());
        if (dto.getAddress() != null) org.setAddress(dto.getAddress());
        org.setUpdatedAt(OffsetDateTime.now());
        orgRepository.save(org);
        return mapOrg(org);
    }

    @Transactional
    public ProjectIndustryParticipantDto addParticipant(UUID projectId, ProjectIndustryParticipantDto dto) {
        ActiveProject project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        IndustryOrganization org = orgRepository.findById(dto.getOrgId())
                .orElseThrow(() -> new IllegalArgumentException("Org not found"));
                
        ProjectIndustryParticipant participant = new ProjectIndustryParticipant();
        participant.setParticipantId(UUID.randomUUID());
        participant.setProject(project);
        participant.setOrganization(org);
        participant.setContributionType(dto.getContributionType());
        participant.setDeliverables(dto.getDeliverables());
        participant.setStartDate(dto.getStartDate());
        participant.setEndDate(dto.getEndDate());
        participant.setStatus(dto.getStatus() != null ? dto.getStatus() : "ACTIVE");
        participant.setCreatedAt(OffsetDateTime.now());
        
        participantRepository.save(participant);
        return mapParticipant(participant);
    }

    @Transactional(readOnly = true)
    public List<ProjectIndustryParticipantDto> getParticipants(UUID projectId) {
        return participantRepository.findByProject_ProjectId(projectId).stream()
                .map(this::mapParticipant).collect(Collectors.toList());
    }

    @Transactional
    public void removeParticipant(UUID participantId) {
        participantRepository.deleteById(participantId);
    }

    @Transactional
    public ProjectFundingDto addFunding(UUID projectId, ProjectFundingDto dto) {
        ActiveProject project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        IndustryOrganization org = orgRepository.findById(dto.getOrgId())
                .orElseThrow(() -> new IllegalArgumentException("Org not found"));
                
        ProjectFunding funding = new ProjectFunding();
        funding.setFundingId(UUID.randomUUID());
        funding.setProject(project);
        funding.setOrganization(org);
        funding.setAmount(dto.getAmount());
        funding.setCurrency(dto.getCurrency() != null ? dto.getCurrency() : "INR");
        funding.setDescription(dto.getDescription());
        funding.setApprovalState("PENDING");
        funding.setCreatedAt(OffsetDateTime.now());
        funding.setUpdatedAt(OffsetDateTime.now());
        
        fundingRepository.save(funding);
        return mapFunding(funding, true);
    }

    @Transactional(readOnly = true)
    public List<ProjectFundingDto> getFunding(UUID projectId, boolean includeFinancials) {
        return fundingRepository.findByProject_ProjectId(projectId).stream()
                .map(f -> mapFunding(f, includeFinancials))
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjectFundingDto updateFunding(UUID fundingId, ProjectFundingDto dto) {
        ProjectFunding funding = fundingRepository.findById(fundingId)
                .orElseThrow(() -> new IllegalArgumentException("Funding not found"));
        if (dto.getAmount() != null) funding.setAmount(dto.getAmount());
        if (dto.getDescription() != null) funding.setDescription(dto.getDescription());
        funding.setUpdatedAt(OffsetDateTime.now());
        fundingRepository.save(funding);
        return mapFunding(funding, true);
    }

    @Transactional
    public ProjectFundingDto approveFunding(UUID fundingId) {
        ProjectFunding funding = fundingRepository.findById(fundingId)
                .orElseThrow(() -> new IllegalArgumentException("Funding not found"));
        funding.setApprovalState("APPROVED");
        funding.setUpdatedAt(OffsetDateTime.now());
        fundingRepository.save(funding);
        return mapFunding(funding, true);
    }

    @Transactional
    public ProjectMentorshipDto assignMentor(UUID projectId, ProjectMentorshipDto dto) {
        ActiveProject project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        IndustryOrganization org = orgRepository.findById(dto.getOrgId())
                .orElseThrow(() -> new IllegalArgumentException("Org not found"));
                
        ProjectMentorship mentorship = new ProjectMentorship();
        mentorship.setMentorshipId(UUID.randomUUID());
        mentorship.setProject(project);
        mentorship.setOrganization(org);
        mentorship.setMentorUserId(dto.getMentorUserId());
        mentorship.setScope(dto.getScope());
        mentorship.setStatus(dto.getStatus() != null ? dto.getStatus() : "ACTIVE");
        mentorship.setCreatedAt(OffsetDateTime.now());
        
        mentorshipRepository.save(mentorship);
        return mapMentorship(mentorship);
    }
    
    @Transactional
    public MentorshipSessionDto addSession(UUID mentorshipId, MentorshipSessionDto dto) {
        ProjectMentorship mentorship = mentorshipRepository.findById(mentorshipId)
                .orElseThrow(() -> new IllegalArgumentException("Mentorship not found"));
                
        MentorshipSession session = new MentorshipSession();
        session.setSessionId(UUID.randomUUID());
        session.setMentorship(mentorship);
        session.setSessionDate(dto.getSessionDate());
        session.setNotes(dto.getNotes());
        session.setCommitments(dto.getCommitments());
        session.setCompletionStatus(dto.getCompletionStatus() != null ? dto.getCompletionStatus() : "SCHEDULED");
        session.setCreatedAt(OffsetDateTime.now());
        
        sessionRepository.save(session);
        return mapSession(session);
    }

    private IndustryOrganizationDto mapOrg(IndustryOrganization org) {
        IndustryOrganizationDto dto = new IndustryOrganizationDto();
        dto.setOrgId(org.getOrgId());
        dto.setName(org.getName());
        dto.setDescription(org.getDescription());
        dto.setContactEmail(org.getContactEmail());
        dto.setContactPhone(org.getContactPhone());
        dto.setWebsite(org.getWebsite());
        dto.setAddress(org.getAddress());
        dto.setCreatedAt(org.getCreatedAt());
        return dto;
    }

    private ProjectIndustryParticipantDto mapParticipant(ProjectIndustryParticipant p) {
        ProjectIndustryParticipantDto dto = new ProjectIndustryParticipantDto();
        dto.setParticipantId(p.getParticipantId());
        dto.setProjectId(p.getProject().getProjectId());
        dto.setOrgId(p.getOrganization().getOrgId());
        dto.setContributionType(p.getContributionType());
        dto.setDeliverables(p.getDeliverables());
        dto.setStartDate(p.getStartDate());
        dto.setEndDate(p.getEndDate());
        dto.setStatus(p.getStatus());
        dto.setCreatedAt(p.getCreatedAt());
        return dto;
    }

    private ProjectFundingDto mapFunding(ProjectFunding f, boolean includeFinancials) {
        ProjectFundingDto dto = new ProjectFundingDto();
        dto.setFundingId(f.getFundingId());
        dto.setProjectId(f.getProject().getProjectId());
        dto.setOrgId(f.getOrganization().getOrgId());
        if (includeFinancials) {
            dto.setAmount(f.getAmount());
            dto.setCurrency(f.getCurrency());
        }
        dto.setDescription(f.getDescription());
        dto.setApprovalState(f.getApprovalState());
        dto.setCreatedAt(f.getCreatedAt());
        return dto;
    }

    private ProjectMentorshipDto mapMentorship(ProjectMentorship m) {
        ProjectMentorshipDto dto = new ProjectMentorshipDto();
        dto.setMentorshipId(m.getMentorshipId());
        dto.setProjectId(m.getProject().getProjectId());
        dto.setOrgId(m.getOrganization().getOrgId());
        dto.setMentorUserId(m.getMentorUserId());
        dto.setScope(m.getScope());
        dto.setStatus(m.getStatus());
        dto.setCreatedAt(m.getCreatedAt());
        return dto;
    }

    private MentorshipSessionDto mapSession(MentorshipSession s) {
        MentorshipSessionDto dto = new MentorshipSessionDto();
        dto.setSessionId(s.getSessionId());
        dto.setMentorshipId(s.getMentorship().getMentorshipId());
        dto.setSessionDate(s.getSessionDate());
        dto.setNotes(s.getNotes());
        dto.setCommitments(s.getCommitments());
        dto.setCompletionStatus(s.getCompletionStatus());
        dto.setCreatedAt(s.getCreatedAt());
        return dto;
    }
}
