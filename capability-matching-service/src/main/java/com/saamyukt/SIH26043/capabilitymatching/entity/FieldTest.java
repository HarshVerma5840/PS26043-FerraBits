package com.saamyukt.SIH26043.capabilitymatching.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "field_test")
public class FieldTest {
    @Id
    private UUID testId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private ActiveProject project;
    
    private String testPlan;
    private String location;
    private OffsetDateTime startDate;
    private OffsetDateTime endDate;
    private String observations;
    private String evidence;
    private String result;
    private String approvalStatus;
    private OffsetDateTime createdAt;
}
