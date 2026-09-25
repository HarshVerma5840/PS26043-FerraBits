package com.saamyukt.SIH26043.capabilitymatching.repository;

import com.saamyukt.SIH26043.capabilitymatching.entity.EmbeddingRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmbeddingRecordRepository extends JpaRepository<EmbeddingRecord, UUID> {
    Optional<EmbeddingRecord> findByEntityTypeAndEntityIdAndRegistryVersionId(String entityType, UUID entityId, Integer registryVersionId);
    List<EmbeddingRecord> findByEntityTypeAndRegistryVersionIdAndStatus(String entityType, Integer registryVersionId, String status);
    List<EmbeddingRecord> findByStatus(String status);
}
