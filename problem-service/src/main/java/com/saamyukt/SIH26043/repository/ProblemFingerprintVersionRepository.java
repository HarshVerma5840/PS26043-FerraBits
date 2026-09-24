package com.saamyukt.SIH26043.repository;

import com.saamyukt.SIH26043.entity.ProblemFingerprintVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProblemFingerprintVersionRepository extends JpaRepository<ProblemFingerprintVersion, UUID> {
    Optional<ProblemFingerprintVersion> findByProblemIdAndIsLatestTrue(UUID problemId);
}
