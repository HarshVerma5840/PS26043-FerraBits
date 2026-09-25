package com.saamyukt.SIH26043.capabilitymatching.entity;

import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;
import java.util.UUID;

@Entity
@Table(name = "faculty_skill")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class FacultySkill {

    @EmbeddedId
    private FacultySkillId id = new FacultySkillId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("facultyId")
    @JoinColumn(name = "faculty_id")
    private Faculty faculty;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("skillId")
    @JoinColumn(name = "skill_id")
    private Skill skill;

    @Column(name = "proficiency_level")
    private String proficiencyLevel;

    @Embeddable
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode
    public static class FacultySkillId implements Serializable {
        private UUID facultyId;
        private UUID skillId;
    }
}
