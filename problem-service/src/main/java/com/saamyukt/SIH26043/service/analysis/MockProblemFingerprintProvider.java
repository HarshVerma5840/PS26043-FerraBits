package com.saamyukt.SIH26043.service.analysis;

import com.saamyukt.SIH26043.web.dto.ProblemFingerprintPayload;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@ConditionalOnProperty(name = "app.analysis.fingerprint.provider", havingValue = "mock", matchIfMissing = true)
public class MockProblemFingerprintProvider implements ProblemFingerprintProvider {

    @Override
    public String providerName() {
        return "MOCK_FINGERPRINT";
    }

    @Override
    public FingerprintExtractionResult extract(FingerprintExtractionRequest request) {
        if ("SIMULATE_TIMEOUT".equals(request.correlationId())) {
            throw new ProviderException("Mock provider timed out", true);
        }
        if ("SIMULATE_FAILURE".equals(request.correlationId())) {
            throw new ProviderException("Mock provider terminal failure", false);
        }

        ProblemFingerprintPayload payload = new ProblemFingerprintPayload(
                request.problemId(),
                request.schemaVersion() != null ? request.schemaVersion() : 1,
                "Infrastructure",
                "Roads",
                "Pothole",
                8,
                "HIGH",
                List.of("Repair"),
                List.of("Weather"),
                List.of(new ProblemFingerprintPayload.RequiredCapability("Masonry", 5)),
                List.of("Tractor"),
                "Villagers",
                "Fixed road",
                new ProblemFingerprintPayload.GeographicContext("RURAL", request.locationSummary()),
                new ProblemFingerprintPayload.EvidenceSummary(1, 0, 0, 0, request.evidenceSummary()),
                0.95,
                List.of("Assumed safe"),
                List.of(),
                List.of(),
                Map.of("mockData", true)
        );

        return new FingerprintExtractionResult(
                payload,
                providerName(),
                UUID.randomUUID().toString(),
                "v1.0",
                "mock-model-1",
                Map.of("safe_mock", "value"),
                Instant.now()
        );
    }
}
