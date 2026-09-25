package com.saamyukt.SIH26043.capabilitymatching.repository;

import com.saamyukt.SIH26043.capabilitymatching.entity.ProjectMentorship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.List;

@Repository
public interface ProjectMentorshipRepository extends JpaRepository<ProjectMentorship, UUID> {
    List<ProjectMentorship> findByProject_ProjectId(UUID projectId);
}
