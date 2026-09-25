package com.saamyukt.SIH26043.capabilitymatching.service.embedding;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.saamyukt.SIH26043.capabilitymatching.dto.embedding.EmbeddingDTOs.EmbeddingRequest;
import com.saamyukt.SIH26043.capabilitymatching.dto.embedding.EmbeddingDTOs.EmbeddingResult;
import com.saamyukt.SIH26043.capabilitymatching.entity.EmbeddingRecord;
import com.saamyukt.SIH26043.capabilitymatching.entity.Institution;
import com.saamyukt.SIH26043.capabilitymatching.repository.EmbeddingRecordRepository;
import com.saamyukt.SIH26043.capabilitymatching.service.EmbeddingProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;
import java.util.Base64;

@Service
public class EmbeddingGenerationService {

    private final EmbeddingProvider embeddingProvider;
    private final EmbeddingRecordRepository embeddingRecordRepository;
    private final ObjectMapper objectMapper;

    public EmbeddingGenerationService(EmbeddingProvider embeddingProvider, 
                                      EmbeddingRecordRepository embeddingRecordRepository,
                                      ObjectMapper objectMapper) {
        this.embeddingProvider = embeddingProvider;
        this.embeddingRecordRepository = embeddingRecordRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public void generateForInstitution(Institution institution) {
        // Construct canonical text representation (input normalization)
        String inputText = normalizeText(
                institution.getName() + " " +
                institution.getType() + " " +
                institution.getState() + " " +
                institution.getDistrict()
        );

        String contentHash = computeHash(inputText);

        Optional<EmbeddingRecord> existingOpt = embeddingRecordRepository
                .findByEntityTypeAndEntityIdAndRegistryVersionId("INSTITUTION", institution.getInstitutionId(), institution.getRegistryVersionId());

        if (existingOpt.isPresent()) {
            EmbeddingRecord existing = existingOpt.get();
            // Hash-based skip when content has not changed
            if (contentHash.equals(existing.getContentHash()) && "SUCCESS".equals(existing.getStatus())) {
                return;
            }
        }

        EmbeddingRecord record = existingOpt.orElse(new EmbeddingRecord());
        record.setEntityType("INSTITUTION");
        record.setEntityId(institution.getInstitutionId());
        record.setRegistryVersionId(institution.getRegistryVersionId());
        record.setContentHash(contentHash);
        record.setStatus("PENDING");
        record.setRetryCount(record.getRetryCount() == null ? 0 : record.getRetryCount());
        record.setCreatedAt(record.getCreatedAt() == null ? OffsetDateTime.now() : record.getCreatedAt());
        record.setUpdatedAt(OffsetDateTime.now());

        embeddingRecordRepository.save(record);

        EmbeddingRequest req = EmbeddingRequest.builder()
                .modelName("local-mock-model")
                .modelVersion("v1")
                .dimension(3)
                .inputText(inputText)
                .entityType("INSTITUTION")
                .entityId(institution.getInstitutionId())
                .correlationId(UUID.randomUUID().toString())
                .build();

        EmbeddingResult result = embeddingProvider.embed(req);

        if (result.isSuccess()) {
            record.setStatus("SUCCESS");
            try {
                record.setEmbeddingVector(objectMapper.writeValueAsString(result.getVector()));
            } catch (JsonProcessingException e) {
                record.setStatus("FAILED");
                record.setErrorMessage("Failed to serialize vector");
            }
            record.setModelName(req.getModelName());
            record.setModelVersion(req.getModelVersion());
            record.setDimension(req.getDimension());
            record.setErrorMessage(null);
        } else {
            record.setStatus("FAILED");
            record.setErrorMessage(result.getErrorMessage());
            record.setRetryCount(record.getRetryCount() + 1);
        }

        record.setUpdatedAt(OffsetDateTime.now());
        embeddingRecordRepository.save(record);
    }

    private String normalizeText(String input) {
        if (input == null) return "";
        return input.trim().replaceAll("\\s+", " ").toLowerCase();
    }

    private String computeHash(String text) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(text.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not found", e);
        }
    }
}
