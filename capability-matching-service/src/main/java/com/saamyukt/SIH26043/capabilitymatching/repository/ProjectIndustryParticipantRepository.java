package com.saamyukt.SIH26043.capabilitymatching.repository;

import com.saamyukt.SIH26043.capabilitymatching.entity.ProjectIndustryParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.List;

@Repository
public interface ProjectIndustryParticipantRepository extends JpaRepository<ProjectIndustryParticipant, UUID> {
    List<ProjectIndustryParticipant> findByProject_ProjectId(UUID projectId);
}
