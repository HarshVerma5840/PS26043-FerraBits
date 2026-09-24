package com.saamyukt.SIH26043.service.analysis;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Service
@ConditionalOnProperty(name = "app.analysis.translate.provider", havingValue = "mock", matchIfMissing = true)
public class MockTranslationProvider implements TranslationProvider {

    @Override
    public String providerName() {
        return "MOCK_TRANSLATE";
    }

    @Override
    public TranslationResult translate(TranslationRequest request) {
        if ("SIMULATE_TIMEOUT".equals(request.correlationId())) {
            throw new ProviderException("Mock provider timed out", true);
        }
        if ("SIMULATE_FAILURE".equals(request.correlationId())) {
            throw new ProviderException("Mock provider terminal failure", false);
        }
        if ("UNKNOWN_LANG".equals(request.sourceLanguage())) {
            throw new ProviderException("Unsupported language", false);
        }

        return new TranslationResult(
                "[MOCK TRANSLATED] " + request.originalText(),
                request.sourceLanguage() != null ? request.sourceLanguage() : "hi",
                request.targetLanguage() != null ? request.targetLanguage() : "en",
                0.95,
                providerName(),
                UUID.randomUUID().toString(),
                Instant.now(),
                Map.of("mock_metadata", "safe_value")
        );
    }
}
