package com.saamyukt.SIH26043.capabilitymatching.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "skill")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Skill {
    @Id
    @Column(name = "skill_id")
    private UUID skillId;

    private String name;
}
