package com.saamyukt.SIH26043.capabilitymatching.service;

import com.saamyukt.SIH26043.capabilitymatching.dto.embedding.EmbeddingDTOs.EmbeddingRequest;
import com.saamyukt.SIH26043.capabilitymatching.dto.embedding.EmbeddingDTOs.EmbeddingResult;

public interface EmbeddingProvider {
    EmbeddingResult embed(EmbeddingRequest request);
    double cosineSimilarity(java.util.List<Double> vecA, java.util.List<Double> vecB);
}
