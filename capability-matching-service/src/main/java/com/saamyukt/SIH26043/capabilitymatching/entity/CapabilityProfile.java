package com.saamyukt.SIH26043.capabilitymatching.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "capability_profile")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CapabilityProfile {
    @Id
    @Column(name = "profile_id")
    private UUID profileId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id")
    private Institution institution;

    @Column(name = "profile_text")
    private String profileText;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "embedding_vector")
    private String embeddingVector; // Stored as JSON string "[0.1, 0.2, ...]"

    private Integer version;
}
