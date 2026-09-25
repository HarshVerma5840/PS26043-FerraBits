package com.saamyukt.SIH26043.capabilitymatching.repository;
import com.saamyukt.SIH26043.capabilitymatching.entity.ProjectMilestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.List;
@Repository
public interface ProjectMilestoneRepository extends JpaRepository<ProjectMilestone, UUID> {
    List<ProjectMilestone> findByProject_ProjectId(UUID projectId);
}
