package com.saamyukt.SIH26043.capabilitymatching.repository;

import com.saamyukt.SIH26043.capabilitymatching.entity.MatchingRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;
import java.util.List;

@Repository
public interface MatchingRunRepository extends JpaRepository<MatchingRun, UUID> {
    
    Optional<MatchingRun> findTopByProblemIdAndFingerprintVersionAndRegistryVersionIdAndAlgorithmVersionOrderByCreatedAtDesc(
            UUID problemId, Integer fingerprintVersion, Integer registryVersionId, String algorithmVersion);
            
    Optional<MatchingRun> findTopByProblemIdOrderByCreatedAtDesc(UUID problemId);
}
