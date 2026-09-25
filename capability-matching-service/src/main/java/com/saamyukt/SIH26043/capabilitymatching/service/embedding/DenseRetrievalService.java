package com.saamyukt.SIH26043.capabilitymatching.service.embedding;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.saamyukt.SIH26043.capabilitymatching.dto.ProblemFingerprint;
import com.saamyukt.SIH26043.capabilitymatching.entity.EmbeddingRecord;
import com.saamyukt.SIH26043.capabilitymatching.entity.Institution;
import com.saamyukt.SIH26043.capabilitymatching.repository.EmbeddingRecordRepository;
import com.saamyukt.SIH26043.capabilitymatching.repository.InstitutionRepository;
import com.saamyukt.SIH26043.capabilitymatching.service.EmbeddingProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class DenseRetrievalService {

    private final EmbeddingRecordRepository embeddingRecordRepository;
    private final InstitutionRepository institutionRepository;
    private final EmbeddingProvider embeddingProvider;
    private final ObjectMapper objectMapper;

    public DenseRetrievalService(EmbeddingRecordRepository embeddingRecordRepository,
                                 InstitutionRepository institutionRepository,
                                 EmbeddingProvider embeddingProvider,
                                 ObjectMapper objectMapper) {
        this.embeddingRecordRepository = embeddingRecordRepository;
        this.institutionRepository = institutionRepository;
        this.embeddingProvider = embeddingProvider;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public List<DenseRetrievalResult> retrieveTopK(ProblemFingerprint fingerprint, int topK, Integer registryVersionId) {
        
        // Retrieve target vector using provider
        String problemText = fingerprint.getDomain() + " " + fingerprint.getSubDomain();
        var req = com.saamyukt.SIH26043.capabilitymatching.dto.embedding.EmbeddingDTOs.EmbeddingRequest.builder()
                .inputText(problemText)
                .build();
        var targetResult = embeddingProvider.embed(req);
        if (!targetResult.isSuccess()) {
            return Collections.emptyList();
        }

        List<Double> targetVector = targetResult.getVector();

        // 1. Version filtering
        List<EmbeddingRecord> records;
        if (registryVersionId != null) {
            records = embeddingRecordRepository.findByEntityTypeAndRegistryVersionIdAndStatus("INSTITUTION", registryVersionId, "SUCCESS");
        } else {
            records = embeddingRecordRepository.findByStatus("SUCCESS").stream()
                        .filter(r -> "INSTITUTION".equals(r.getEntityType()))
                        .collect(Collectors.toList());
        }

        List<DenseRetrievalResult> candidates = new ArrayList<>();

        for (EmbeddingRecord record : records) {
            // 2. Load entity and verify active/verified filtering
            Optional<Institution> instOpt = institutionRepository.findById(record.getEntityId());
            if (instOpt.isEmpty()) continue;
            
            Institution inst = instOpt.get();
            if (!Boolean.TRUE.equals(inst.getActiveStatus())) continue;
            if (!"VERIFIED".equals(inst.getVerificationStatus())) continue;
            
            // 3. Check dimension mismatch if configured, but here we just attempt cosine similarity
            try {
                List<Double> vector = objectMapper.readValue(record.getEmbeddingVector(), new TypeReference<List<Double>>() {});
                if (vector.size() != targetVector.size()) {
                    continue; // skip dimension mismatch
                }

                double similarity = embeddingProvider.cosineSimilarity(targetVector, vector);
                
                candidates.add(new DenseRetrievalResult(inst.getInstitutionId(), inst.getName(), similarity));
            } catch (JsonProcessingException e) {
                // Ignore parsing errors for individual records
            }
        }

        // 4. Deterministic ordering: by similarity descending, then by institution UUID to break ties deterministically
        candidates.sort((a, b) -> {
            int cmp = Double.compare(b.getSimilarity(), a.getSimilarity());
            if (cmp == 0) {
                return a.getInstitutionId().compareTo(b.getInstitutionId());
            }
            return cmp;
        });

        // 5. Configurable Top-K
        if (candidates.size() > topK) {
            candidates = candidates.subList(0, topK);
        }

        return candidates;
    }

    public static class DenseRetrievalResult {
        private final UUID institutionId;
        private final String name;
        private final double similarity;

        public DenseRetrievalResult(UUID institutionId, String name, double similarity) {
            this.institutionId = institutionId;
            this.name = name;
            this.similarity = similarity;
        }

        public UUID getInstitutionId() { return institutionId; }
        public String getName() { return name; }
        public double getSimilarity() { return similarity; }
    }
}
