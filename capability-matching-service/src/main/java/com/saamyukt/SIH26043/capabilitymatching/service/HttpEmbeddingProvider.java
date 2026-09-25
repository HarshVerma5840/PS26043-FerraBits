package com.saamyukt.SIH26043.capabilitymatching.service;

import com.saamyukt.SIH26043.capabilitymatching.dto.embedding.EmbeddingDTOs.EmbeddingRequest;
import com.saamyukt.SIH26043.capabilitymatching.dto.embedding.EmbeddingDTOs.EmbeddingResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;
import java.util.Collections;

@Service
public class HttpEmbeddingProvider implements EmbeddingProvider {

    private final RestTemplate restTemplate = new RestTemplate();
    
    @Value("${embedding.api.url:}")
    private String apiUrl;
    
    @Value("${embedding.api.key:}")
    private String apiKey;

    @Override
    public EmbeddingResult embed(EmbeddingRequest request) {
        if (apiUrl == null || apiUrl.isBlank()) {
            return EmbeddingResult.builder()
                    .correlationId(request.getCorrelationId())
                    .success(false)
                    .errorMessage("API URL not configured")
                    .build();
        }

        try {
            // Pseudo-implementation of generic HTTP provider
            // In a real scenario, map to specific provider JSON request structure (e.g. OpenAI / vLLM)
            Map<String, Object> payload = Map.of(
                    "model", request.getModelName(),
                    "input", request.getInputText()
            );

            ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, payload, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                // Assuming standard "data" -> [0] -> "embedding" structure
                List<Map<String, Object>> data = (List<Map<String, Object>>) response.getBody().get("data");
                List<Double> vector = (List<Double>) data.get(0).get("embedding");

                return EmbeddingResult.builder()
                        .correlationId(request.getCorrelationId())
                        .vector(vector)
                        .success(true)
                        .build();
            } else {
                return EmbeddingResult.builder()
                        .correlationId(request.getCorrelationId())
                        .success(false)
                        .errorMessage("HTTP Error: " + response.getStatusCode())
                        .build();
            }
        } catch (Exception e) {
            return EmbeddingResult.builder()
                    .correlationId(request.getCorrelationId())
                    .success(false)
                    .errorMessage(e.getMessage())
                    .build();
        }
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
