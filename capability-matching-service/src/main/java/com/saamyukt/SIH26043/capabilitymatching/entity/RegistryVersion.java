package com.saamyukt.SIH26043.capabilitymatching.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "registry_version")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class RegistryVersion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "version_id")
    private Integer versionId;

    @Column(name = "version_name")
    private String versionName;

    @Column(name = "published_at")
    private OffsetDateTime publishedAt;

    @Column(name = "is_active")
    private Boolean isActive;
}
