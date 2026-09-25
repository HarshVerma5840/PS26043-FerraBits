package com.saamyukt.SIH26043.capabilitymatching.service;

import com.saamyukt.SIH26043.capabilitymatching.dto.embedding.EmbeddingDTOs.EmbeddingRequest;
import com.saamyukt.SIH26043.capabilitymatching.dto.embedding.EmbeddingDTOs.EmbeddingResult;
import com.saamyukt.SIH26043.capabilitymatching.dto.embedding.EmbeddingDTOs.EmbeddingResult;

import java.util.Arrays;
import java.util.List;

public class MockEmbeddingProvider implements EmbeddingProvider {

    @Override
    public EmbeddingResult embed(EmbeddingRequest request) {
        // Deterministic mock generation based on hash or length of input text
        double val1 = request.getInputText() != null ? request.getInputText().length() * 0.01 : 0.1;
        double val2 = request.getEntityId() != null ? (Math.abs(request.getEntityId().hashCode()) % 100) / 100.0 : 0.2;
        
        List<Double> vector = Arrays.asList(val1, val2, 0.3);
        
        return EmbeddingResult.builder()
                .correlationId(request.getCorrelationId())
                .vector(vector)
                .success(true)
                .build();
    }

    @Override
    public double cosineSimilarity(List<Double> vecA, List<Double> vecB) {
        if (vecA == null || vecB == null || vecA.size() != vecB.size()) {
            return 0.0;
        }
        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;
        for (int i = 0; i < vecA.size(); i++) {
            dotProduct += vecA.get(i) * vecB.get(i);
            normA += Math.pow(vecA.get(i), 2);
            normB += Math.pow(vecB.get(i), 2);
        }
        if (normA == 0.0 || normB == 0.0) return 0.0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}
