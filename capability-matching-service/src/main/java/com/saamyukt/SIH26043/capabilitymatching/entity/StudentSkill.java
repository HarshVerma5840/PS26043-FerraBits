package com.saamyukt.SIH26043.capabilitymatching.entity;

import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;
import java.util.UUID;

@Entity
@Table(name = "student_skill")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class StudentSkill {

    @EmbeddedId
    private StudentSkillId id = new StudentSkillId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("studentId")
    @JoinColumn(name = "student_id")
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("skillId")
    @JoinColumn(name = "skill_id")
    private Skill skill;

    @Column(name = "proficiency_level")
    private String proficiencyLevel;

    @Embeddable
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode
    public static class StudentSkillId implements Serializable {
        private UUID studentId;
        private UUID skillId;
    }
}
