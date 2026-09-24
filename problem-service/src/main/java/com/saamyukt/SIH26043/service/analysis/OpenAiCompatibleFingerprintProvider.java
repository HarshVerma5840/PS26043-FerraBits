package com.saamyukt.SIH26043.service.analysis;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.saamyukt.SIH26043.web.dto.ProblemFingerprintPayload;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResponseErrorHandler;
import org.springframework.web.client.RestClient;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@ConditionalOnProperty(name = "app.analysis.fingerprint.provider", havingValue = "openai")
public class OpenAiCompatibleFingerprintProvider implements ProblemFingerprintProvider {

    private static final Logger log = LoggerFactory.getLogger(OpenAiCompatibleFingerprintProvider.class);

    private final String endpoint;
    private final String apiKey;
    private final String model;
    private final int timeoutSeconds;
    private final Double temperature;
    private final Integer maxTokens;
    private final ObjectMapper objectMapper;
    private final Validator validator;

    private volatile RestClient restClient;

    public OpenAiCompatibleFingerprintProvider(
            @Value("${app.analysis.fingerprint.openai.endpoint:}") String endpoint,
            @Value("${app.analysis.fingerprint.openai.api-key:}") String apiKey,
            @Value("${app.analysis.fingerprint.openai.model:gpt-4}") String model,
            @Value("${app.analysis.fingerprint.openai.timeout-seconds:60}") int timeoutSeconds,
            @Value("${app.analysis.fingerprint.openai.temperature:0.2}") Double temperature,
            @Value("${app.analysis.fingerprint.openai.max-tokens:2000}") Integer maxTokens,
            ObjectMapper objectMapper,
            Validator validator) {
        this.endpoint = endpoint;
        this.apiKey = apiKey;
        this.model = model;
        this.timeoutSeconds = timeoutSeconds;
        this.temperature = temperature;
        this.maxTokens = maxTokens;
        this.objectMapper = objectMapper;
        this.validator = validator;
    }

    @Override
    public String providerName() {
        return "OPENAI_COMPATIBLE_FINGERPRINT";
    }

    @Override
    public FingerprintExtractionResult extract(FingerprintExtractionRequest request) {
        if (endpoint == null || endpoint.isBlank() || apiKey == null || apiKey.isBlank()) {
            throw new ProviderException("OpenAI provider is not fully configured", false);
        }

        String prompt = buildPrompt(request);

        Map<String, Object> body = Map.of(
                "model", model,
                "temperature", temperature,
                "max_tokens", maxTokens,
                "response_format", Map.of("type", "json_object"),
                "messages", List.of(
                        Map.of("role", "system", "content", "You are a strict, objective problem extraction AI. You MUST output ONLY valid JSON matching the ProblemFingerprintPayload schema. You MUST NEVER invent facts, recommend universities, assign teams, or rank institutions. Preserve geographic names. Differentiate facts from inferred causes."),
                        Map.of("role", "user", "content", prompt)
                )
        );

        Map responseBody;
        try {
            responseBody = restClient().post()
                    .uri(endpoint)
                    .contentType(MediaType.APPLICATION_JSON)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .body(body)
                    .retrieve()
                    .body(Map.class);
        } catch (ProviderException e) {
            throw e;
        } catch (Exception e) {
            log.error("OpenAI fingerprint unexpected failure for correlationId={}", request.correlationId(), e);
            throw new ProviderException("Unexpected provider error: " + e.getMessage(), e, true);
        }

        if (responseBody == null || !responseBody.containsKey("choices")) {
            throw new ProviderException("Invalid response structure from OpenAI provider", true);
        }

        List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
        if (choices.isEmpty()) {
            throw new ProviderException("No choices returned from OpenAI provider", true);
        }

        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
        String content = (String) message.get("content");

        ProblemFingerprintPayload payload;
        try {
            payload = objectMapper.readValue(content, ProblemFingerprintPayload.class);
        } catch (Exception e) {
            throw new ProviderException("LLM produced malformed JSON output: " + e.getMessage(), e, true); // Transient to allow bounded retry
        }

        // Schema validation
        Set<ConstraintViolation<ProblemFingerprintPayload>> violations = validator.validate(payload);
        if (!violations.isEmpty()) {
            throw new ProviderException("LLM output failed schema validation: " + violations.iterator().next().getMessage(), true);
        }

        String requestId = (String) responseBody.get("id");
        Map<String, Object> safeMetadata = Map.of(
                "usage", responseBody.get("usage")
        );

        return new FingerprintExtractionResult(
                payload,
                providerName(),
                requestId,
                "v1.0",
                model,
                safeMetadata,
                Instant.now()
        );
    }

    private String buildPrompt(FingerprintExtractionRequest req) {
        return String.format(
                "Extract fingerprint for ProblemId: %s.\nOriginal Text: %s\nTranscript: %s\nTranslated Text: %s\nLocation: %s\nEvidence: %s\nEnsure schema version is %d.",
                req.problemId(),
                req.originalText(),
                req.transcript(),
                req.translatedText(),
                req.locationSummary(),
                req.evidenceSummary(),
                req.schemaVersion() != null ? req.schemaVersion() : 1
        );
    }

    private RestClient restClient() {
        if (restClient == null) {
            synchronized (this) {
                if (restClient == null) {
                    SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
                    factory.setConnectTimeout(Duration.ofSeconds(10));
                    factory.setReadTimeout(Duration.ofSeconds(timeoutSeconds));

                    restClient = RestClient.builder()
                            .requestFactory(factory)
                            .defaultStatusHandler(status -> status.isError(), (request, response) -> {
                                HttpStatusCode status = response.getStatusCode();
                                boolean transientErr = status.is5xxServerError() || status == HttpStatus.REQUEST_TIMEOUT || status == HttpStatus.TOO_MANY_REQUESTS;
                                throw new ProviderException("OpenAI API returned " + status, transientErr);
                            })
                            .build();
                }
            }
        }
        return restClient;
    }
}
