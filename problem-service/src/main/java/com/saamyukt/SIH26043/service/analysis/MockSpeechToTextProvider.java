package com.saamyukt.SIH26043.service.analysis;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Service
@ConditionalOnProperty(name = "app.analysis.speech.provider", havingValue = "mock", matchIfMissing = true)
public class MockSpeechToTextProvider implements SpeechToTextProvider {

    @Override
    public String providerName() {
        return "MOCK";
    }

    @Override
    public TranscriptionResult transcribe(TranscriptionRequest request) {
        if ("audio/invalid".equals(request.mimeType())) {
            throw new ProviderException("Unsupported MIME type", false);
        }
        
        // Simulate a timeout if correlation id signals it
        if ("SIMULATE_TIMEOUT".equals(request.correlationId())) {
            throw new ProviderException("Provider timed out", true);
        }

        if ("SIMULATE_4XX".equals(request.correlationId())) {
            throw new ProviderException("Bad Request", false);
        }

        if ("SIMULATE_5XX".equals(request.correlationId())) {
            throw new ProviderException("Internal Server Error", true);
        }

        return new TranscriptionResult(
                "This is a mock transcription for audio evidence " + request.evidenceId(),
                "hi", // Mocking Hindi
                0.99,
                providerName(),
                UUID.randomUUID().toString(),
                Map.of("mockData", true),
                Instant.now()
        );
    }
}
