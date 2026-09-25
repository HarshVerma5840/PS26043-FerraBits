package com.saamyukt.SIH26043.capabilitymatching.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;
import java.util.List;

@Entity
@Table(name = "institution")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Institution {
    @Id
    @Column(name = "institution_id")
    private UUID institutionId;

    private String name;
    private String type;
    
    @Column(name = "aishe_identifier")
    private String aisheIdentifier;
    
    private String state;
    private String district;
    private Double latitude;
    private Double longitude;

    @Column(name = "verification_status")
    private String verificationStatus;

    @Column(name = "active_status")
    private Boolean activeStatus;

    private String source;

    @Column(name = "imported_at")
    private OffsetDateTime importedAt;

    @Column(name = "verified_at")
    private OffsetDateTime verifiedAt;

    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    @Column(name = "raw_import_data")
    private String rawImportData;

    @Column(name = "registry_version_id")
    private Integer registryVersionId;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @OneToMany(mappedBy = "institution")
    private List<Department> departments;

    @OneToMany(mappedBy = "institution")
    private List<Student> students;

    @OneToMany(mappedBy = "institution")
    private List<Lab> labs;

    @OneToMany(mappedBy = "institution")
    private List<Team> teams;

    @OneToMany(mappedBy = "institution")
    private List<PastProject> pastProjects;
}
