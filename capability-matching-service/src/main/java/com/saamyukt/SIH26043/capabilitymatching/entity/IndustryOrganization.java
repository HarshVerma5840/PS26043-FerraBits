package com.saamyukt.SIH26043.capabilitymatching.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;
import java.util.List;

@Data
@Entity
@Table(name = "industry_organization")
public class IndustryOrganization {
    @Id
    private UUID orgId;
    
    private String name;
    private String description;
    private String contactEmail;
    private String contactPhone;
    private String website;
    private String address;
    
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    
    @OneToMany(mappedBy = "organization", cascade = CascadeType.ALL)
    private List<ProjectIndustryParticipant> participations;
}
