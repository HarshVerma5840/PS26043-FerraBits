package com.saamyukt.SIH26043.capabilitymatching.repository;

import com.saamyukt.SIH26043.capabilitymatching.entity.ProjectFunding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.List;

@Repository
public interface ProjectFundingRepository extends JpaRepository<ProjectFunding, UUID> {
    List<ProjectFunding> findByProject_ProjectId(UUID projectId);
}
