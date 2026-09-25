package com.saamyukt.SIH26043.capabilitymatching.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;
import java.util.List;

@Data
@Entity
@Table(name = "project_mentorship")
public class ProjectMentorship {
    @Id
    private UUID mentorshipId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private ActiveProject project;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "org_id")
    private IndustryOrganization organization;
    
    private UUID mentorUserId;
    private String scope;
    private String status;
    private OffsetDateTime createdAt;
    
    @OneToMany(mappedBy = "mentorship", cascade = CascadeType.ALL)
    private List<MentorshipSession> sessions;
}
