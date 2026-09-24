package com.saamyukt.SIH26043.service.analysis;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class OpenAiCompatibleFingerprintClient {

    private static final Logger log = LoggerFactory.getLogger(OpenAiCompatibleFingerprintClient.class);

    private static final String SYSTEM_PROMPT = """
            You are a multilingual AI assistant processing citizen-reported problems.
            Your task is to normalize vernacular text, optionally translate it to English, and extract a structured fingerprint.
            Return ONLY a valid JSON object matching the exact schema below (no prose, no markdown fences):
            {
              "problemId": "uuid",
              "fingerprintVersion": 1,
              "language": {
                "sourceLanguage": "ISO-639-1 code (e.g., hi, en, ta)",
                "sourceLanguageName": "Language name",
                "translationConfidence": 0.0 to 1.0
              },
              "domain": "String",
              "subDomain": "String",
              "interventionTypes": ["String"],
              "urgencyScore": 0.0 to 1.0,
              "severity": "CRITICAL|HIGH|MEDIUM|LOW",
              "inferredRootCauses": ["String"],
              "requiredCapabilities": [
                { "skill": "String", "importance": "HIGH|MEDIUM|LOW" }
              ],
              "requiredEquipment": ["String"],
              "geographicContext": {
                "district": "String",
                "block": "String"
              },
              "evidenceSummary": {
                "photoCount": 0,
                "videoCount": 0,
                "audioCount": 0,
                "documentCount": 0
              }
            }
            Extract as much detail as possible from the provided context. If a field cannot be inferred, provide a sensible default or empty array.
            """;

    private final String apiKey;
    private final String baseUrl;
    private final String model;
    private final long maxTokens;
    private final int timeoutSeconds;
    private final int maxRetries;
    private final double temperature;
    private final ObjectMapper objectMapper;

    private volatile RestClient restClient;

    public OpenAiCompatibleFingerprintClient(
            @Value("${app.llm.openai.api-key:}") String apiKey,
            @Value("${app.llm.openai.base-url:http://localhost:20128/v1}") String baseUrl,
            @Value("${app.llm.openai.model:agentrouter/deepseek-v4-flash}") String model,
            @Value("${app.llm.openai.max-tokens:8192}") long maxTokens,
            @Value("${app.llm.openai.timeout-seconds:120}") int timeoutSeconds,
            @Value("${app.llm.openai.max-retries:2}") int maxRetries,
            @Value("${app.llm.openai.temperature:0.1}") double temperature,
            ObjectMapper objectMapper) {
        this.apiKey = apiKey == null ? "" : apiKey.trim();
        this.baseUrl = baseUrl == null ? "" : baseUrl.trim();
        this.model = model;
        this.maxTokens = maxTokens;
        this.timeoutSeconds = timeoutSeconds;
        this.maxRetries = maxRetries;
        this.temperature = temperature;
        this.objectMapper = objectMapper;
    }

    public Optional<Map<String, Object>> generateFingerprint(String contextPayload) {
        if (!configured()) {
            log.info("No app.llm.openai.api-key configured; cannot generate fingerprint");
            return Optional.empty();
        }

        int attempts = Math.max(1, maxRetries + 1);
        RuntimeException lastError = null;
        for (int attempt = 1; attempt <= attempts; attempt++) {
            try {
                Optional<Map<String, Object>> result = callOnce(contextPayload);
                if (result.isPresent()) {
                    return result;
                }
                lastError = new IllegalStateException("LLM response could not be parsed as valid fingerprint");
            } catch (RuntimeException e) {
                lastError = e;
                log.warn("Fingerprint generation attempt {}/{} failed: {}", attempt, attempts, e.getMessage());
            }
        }
        log.error("Fingerprint generation failed after {} attempts", attempts, lastError);
        return Optional.empty();
    }

    public boolean configured() {
        return !apiKey.isEmpty();
    }

    private Optional<Map<String, Object>> callOnce(String userContent) {
        Map<String, Object> requestBody = new LinkedHashMap<>();
        requestBody.put("model", model);
        requestBody.put("messages", List.of(
                Map.of("role", "system", "content", SYSTEM_PROMPT),
                Map.of("role", "user", "content", userContent)));
        requestBody.put("temperature", temperature);
        requestBody.put("max_tokens", maxTokens);
        requestBody.put("stream", false);
        requestBody.put("response_format", Map.of("type", "json_object"));

        String raw;
        try {
            raw = restClient().post()
                    .uri("/chat/completions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(objectMapper.writeValueAsString(requestBody))
                    .retrieve()
                    .body(String.class);
        } catch (Exception e) {
            throw new IllegalStateException("OpenAI-compatible request failed: " + e.getMessage(), e);
        }
        if (raw == null || raw.isBlank()) return Optional.empty();

        String text = extractContent(raw);
        if (text == null || text.isBlank()) return Optional.empty();

        return parseFingerprint(text);
    }

    private String extractContent(String raw) {
        try {
            JsonNode root = objectMapper.readTree(raw);
            JsonNode choices = root.path("choices");
            if (!choices.isArray() || choices.isEmpty()) return null;
            JsonNode message = choices.get(0).path("message");
            if (!message.isObject()) return null;
            JsonNode content = message.path("content");
            return content.isTextual() ? content.asText() : null;
        } catch (Exception e) {
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    private Optional<Map<String, Object>> parseFingerprint(String text) {
        String json = text;
        if (json.startsWith("```")) {
            json = json.replaceFirst("^```(?:json)?\\s*", "");
            json = json.replaceFirst("\\s*```$", "");
        }
        try {
            Map<String, Object> map = objectMapper.readValue(json, Map.class);
            return Optional.of(map);
        } catch (Exception e) {
            throw new IllegalStateException("Unparseable LLM JSON response: " + e.getMessage(), e);
        }
    }

    private RestClient restClient() {
        RestClient current = restClient;
        if (current == null) {
            synchronized (this) {
                if (restClient == null) {
                    SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
                    requestFactory.setConnectTimeout(Duration.ofSeconds(5));
                    requestFactory.setReadTimeout(Duration.ofSeconds(timeoutSeconds));
                    restClient = RestClient.builder()
                            .baseUrl(baseUrl)
                            .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                            .requestFactory(requestFactory)
                            .build();
                }
                current = restClient;
            }
        }
        return current;
    }
}
