package com.saamyukt.SIH26043.capabilitymatching.repository;
import com.saamyukt.SIH26043.capabilitymatching.entity.TaskActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.List;
@Repository
public interface TaskActivityRepository extends JpaRepository<TaskActivity, UUID> {
    List<TaskActivity> findByTask_TaskIdOrderByCreatedAtDesc(UUID taskId);
}
