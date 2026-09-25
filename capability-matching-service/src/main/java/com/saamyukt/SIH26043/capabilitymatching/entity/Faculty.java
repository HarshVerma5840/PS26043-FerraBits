package com.saamyukt.SIH26043.capabilitymatching.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "faculty")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Faculty {
    @Id
    @Column(name = "faculty_id")
    private UUID facultyId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    private String name;
    
    @Column(name = "workload_capacity_pct")
    private Integer workloadCapacityPct;
    
    @Column(name = "current_workload_pct")
    private Integer currentWorkloadPct;
    
    @Column(name = "past_performance_score")
    private Double pastPerformanceScore;

    @OneToMany(mappedBy = "faculty", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<FacultySkill> skills;
}
