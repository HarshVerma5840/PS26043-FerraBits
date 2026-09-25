package com.saamyukt.SIH26043.capabilitymatching.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;
import java.util.List;

@Entity
@Table(name = "lab")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Lab {
    @Id
    @Column(name = "lab_id")
    private UUID labId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id")
    private Institution institution;

    private String name;

    @OneToMany(mappedBy = "lab")
    private List<Equipment> equipmentList;
}
