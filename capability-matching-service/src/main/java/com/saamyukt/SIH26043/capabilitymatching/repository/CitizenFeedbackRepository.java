package com.saamyukt.SIH26043.capabilitymatching.repository;

import com.saamyukt.SIH26043.capabilitymatching.entity.CitizenFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.List;

@Repository
public interface CitizenFeedbackRepository extends JpaRepository<CitizenFeedback, UUID>, JpaSpecificationExecutor<CitizenFeedback> {
    List<CitizenFeedback> findByProject_ProjectIdAndModerationStatus(UUID projectId, String moderationStatus);
    List<CitizenFeedback> findByProject_ProjectId(UUID projectId);
    long countByModerationStatus(String moderationStatus);
}
