package com.saamyukt.SIH26043.repository;

import com.saamyukt.SIH26043.entity.UploadSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface UploadSessionRepository extends JpaRepository<UploadSession, UUID> {

    List<UploadSession> findByUserIdAndStatus(UUID userId, String status);

    List<UploadSession> findByProblemId(UUID problemId);

    List<UploadSession> findByStatusAndExpiresAtBefore(String status, Instant cutoff);
}
