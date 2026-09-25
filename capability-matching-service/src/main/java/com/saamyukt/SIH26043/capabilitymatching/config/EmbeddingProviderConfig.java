package com.saamyukt.SIH26043.capabilitymatching.config;

import com.saamyukt.SIH26043.capabilitymatching.service.EmbeddingProvider;
import com.saamyukt.SIH26043.capabilitymatching.service.HttpEmbeddingProvider;
import com.saamyukt.SIH26043.capabilitymatching.service.MockEmbeddingProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class EmbeddingProviderConfig {

    @Value("${embedding.provider:}")
    private String provider;

    @Value("${embedding.api.url:}")
    private String apiUrl;

    @Value("${embedding.api.key:}")
    private String apiKey;

    @Bean
    public EmbeddingProvider embeddingProvider() {
        if ("mock".equalsIgnoreCase(provider)) {
            return new MockEmbeddingProvider();
        } else if ("http".equalsIgnoreCase(provider)) {
            if (apiUrl == null || apiUrl.isBlank()) {
                throw new IllegalStateException("embedding.api.url must be configured when provider=http");
            }
            return new HttpEmbeddingProvider(apiUrl, apiKey);
        } else {
            throw new IllegalStateException("Invalid or missing embedding.provider configuration. Use 'mock' or 'http'.");
        }
    }
}
