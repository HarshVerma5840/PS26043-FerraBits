package com.saamyukt.SIH26043.repository;

import com.saamyukt.SIH26043.entity.Evidence;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EvidenceRepository extends JpaRepository<Evidence, UUID> {

    List<Evidence> findByProblemId(UUID problemId);

    boolean existsByFileHash(String fileHash);
    
    java.util.Optional<Evidence> findByProblemIdAndClientUploadId(UUID problemId, String clientUploadId);

    long countByProblemId(UUID problemId);
}
