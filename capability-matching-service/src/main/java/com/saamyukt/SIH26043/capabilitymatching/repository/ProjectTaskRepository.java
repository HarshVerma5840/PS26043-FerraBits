package com.saamyukt.SIH26043.capabilitymatching.repository;
import com.saamyukt.SIH26043.capabilitymatching.entity.ProjectTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.List;
@Repository
public interface ProjectTaskRepository extends JpaRepository<ProjectTask, UUID> {
    List<ProjectTask> findByProject_ProjectIdOrderByPositionIndexAsc(UUID projectId);
}
