package com.saamyukt.SIH26043.service.analysis;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
import com.google.genai.types.Schema;
import com.google.genai.types.Type;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * {@link DomainResolutionProvider} that uses the official Google GenAI Java SDK
 * ({@code com.google.genai:google-genai}) to classify problems into the 44-node taxonomy.
 *
 * <h3>Structured Output</h3>
 * The Gemini API is instructed to return JSON that matches a strict schema
 * ({@code responseMimeType = "application/json"} + {@code responseSchema}) so:
 * <ul>
 *   <li>No regex extraction of JSON from free-form text.</li>
 *   <li>No markdown fence stripping.</li>
 *   <li>The model cannot emit text outside the schema.</li>
 * </ul>
 *
 * <h3>Security</h3>
 * <ul>
 *   <li>The API key is loaded only from the {@code GEMINI_API_KEY} environment variable
 *       (via {@code @Value}); it is never logged.</li>
 *   <li>Only title, description, and taxonomy names are sent to Gemini — no PII,
 *       no phone numbers, no exact addresses.</li>
 * </ul>
 *
 * <h3>Resilience</h3>
 * <ul>
 *   <li>Bounded retry with a configurable max.</li>
 *   <li>Authentication errors ({@code 401}/{@code 403}) are terminal — no retry.</li>
 *   <li>Rate-limit ({@code 429}) and server errors ({@code 5xx}) are transient — retry.</li>
 *   <li>Throws {@link ProviderException} so the orchestrating service can fall back.</li>
 * </ul>
 *
 * <p>Activated via {@code app.ai.domain-resolver.provider=gemini}.
 */
@Service
@ConditionalOnProperty(
        name = "app.ai.domain-resolver.provider",
        havingValue = "gemini"
)
public class GeminiDomainResolutionProvider implements DomainResolutionProvider {

    private static final Logger log =
            LoggerFactory.getLogger(GeminiDomainResolutionProvider.class);

    /**
     * Prompt version string embedded in every log and audit entry so that a benchmark
     * run can always be traced back to the exact prompt it used.
     */
    public static final String CLASSIFICATION_VERSION = "domain-classifier-v1";

    // -----------------------------------------------------------------------
    // System instruction — injected into every request, never logged in full
    // -----------------------------------------------------------------------
    private static final String SYSTEM_INSTRUCTION = """
            You are a deterministic domain taxonomy classifier for the SAAMYUKT societal \
            challenge platform operated by the Government of Jharkhand.

            Your task: given a societal problem's title and description, classify it into \
            the SINGLE most relevant domain from the provided taxonomy list.

            Rules you MUST follow:
            - Use ONLY the domain IDs from the provided taxonomy list. Never invent an ID.
            - Choose the single most specific, best-supported domain. Select additional \
              domains (max 2 more) ONLY when the problem genuinely spans multiple domains.
            - Prefer the root domain closest to the problem's core subject.
            - If the problem is too vague to classify confidently, choose the best match \
              and set confidence below 0.65.
            - Do NOT recommend universities, institutions, or individuals.
            - Do NOT solve the problem. Do NOT rank anything.
            - Base your classification only on the supplied text; do not infer unstated facts.
            - Return JSON matching the schema exactly. No extra fields. No prose.""";

    private final String apiKey;
    private final String model;
    private final int maxRetries;
    private final double temperature;
    private final ObjectMapper objectMapper;

    // Lazily initialised - validated in @PostConstruct
    private volatile Client geminiClient;

    public GeminiDomainResolutionProvider(
            @Value("${app.llm.gemini.api-key:}") String apiKey,
            @Value("${app.llm.gemini.model:gemini-3.1-flash-lite}") String model,
            @Value("${app.llm.gemini.max-retries:2}") int maxRetries,
            @Value("${app.llm.gemini.temperature:0.1}") double temperature,
            ObjectMapper objectMapper) {
        this.apiKey = apiKey == null ? "" : apiKey.trim();
        this.model = model;
        this.maxRetries = maxRetries;
        this.temperature = temperature;
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    void validateConfiguration() {
        if (apiKey.isEmpty()) {
            log.warn("GeminiDomainResolutionProvider is active but GEMINI_API_KEY is not set. "
                    + "All classification attempts will fail until the key is provided.");
        } else {
            log.info("GeminiDomainResolutionProvider configured: model={}, maxRetries={}",
                    model, maxRetries);
        }
    }

    @Override
    public String providerName() {
        return "GEMINI";
    }

    @Override
    public DomainResolutionResult resolve(DomainResolutionRequest request) {
        if (apiKey.isEmpty()) {
            throw new ProviderException(
                    "Gemini provider is not configured (GEMINI_API_KEY is empty)", false);
        }
        if (request.taxonomyOptions() == null || request.taxonomyOptions().isEmpty()) {
            throw new ProviderException("No taxonomy options provided to Gemini resolver", false);
        }

        String prompt = buildUserPrompt(request);

        int attempts = Math.max(1, maxRetries + 1);
        ProviderException lastError = null;

        for (int attempt = 1; attempt <= attempts; attempt++) {
            try {
                long start = System.currentTimeMillis();
                GeminiClassificationResponse response = callGemini(prompt);
                long latencyMs = System.currentTimeMillis() - start;

                // Validate returned IDs against the taxonomy
                List<String> validatedIds = validateDomainIds(
                        response.domainIds(), request.taxonomyOptions(), request.correlationId());

                double confidence = clampConfidence(response.confidence());

                log.info("Gemini resolved correlationId={} → {} domain(s), confidence={}, latency={}ms",
                        request.correlationId(), validatedIds.size(), confidence, latencyMs);

                return DomainResolutionResult.success(
                        validatedIds, confidence, providerName(), model,
                        CLASSIFICATION_VERSION, latencyMs);

            } catch (ProviderException pe) {
                lastError = pe;
                if (!pe.isTransient()) {
                    log.error("Gemini: terminal error on correlationId={}: {}",
                            request.correlationId(), pe.getMessage());
                    throw pe;   // Don't retry terminal errors (auth failures, etc.)
                }
                log.warn("Gemini: transient error attempt {}/{} for correlationId={}: {}",
                        attempt, attempts, request.correlationId(), pe.getMessage());
            }
        }

        // All retries exhausted
        log.error("Gemini: all {} attempts failed for correlationId={}",
                attempts, request.correlationId());
        throw lastError != null ? lastError
                : new ProviderException("Gemini: all retries exhausted", true);
    }

    // -----------------------------------------------------------------------
    // Internal implementation
    // -----------------------------------------------------------------------

    /**
     * Builds the user-turn prompt. Taxonomy is injected dynamically from the
     * authoritative DB-backed list — never hardcoded in the prompt.
     *
     * <p>Privacy: only title, description, and domain names/descriptions are sent.
     * No citizen identity, no phone numbers, no precise addresses.
     */
    private String buildUserPrompt(DomainResolutionRequest request) {
        StringBuilder sb = new StringBuilder();
        sb.append("Available taxonomy domains (id | name | description):\n");
        for (DomainResolutionRequest.DomainOption opt : request.taxonomyOptions()) {
            sb.append("- ").append(opt.domainId())
              .append(" | ").append(opt.domainName())
              .append(" | ").append(opt.description() == null ? "" : opt.description())
              .append('\n');
        }
        sb.append("\nProblem title: ").append(request.title() == null ? "" : request.title());
        sb.append("\nProblem description: ")
          .append(request.description() == null ? "" : request.description());

        if (request.submitterHintNames() != null && !request.submitterHintNames().isEmpty()) {
            sb.append("\nSubmitter suggested domains (non-binding, for context only): ")
              .append(String.join(", ", request.submitterHintNames()));
        }
        return sb.toString();
    }

    /**
     * Calls the Gemini API with structured output enforced via a JSON schema.
     * Never logs the prompt in full (it may contain citizen text).
     */
    private GeminiClassificationResponse callGemini(String userPrompt) {
        try {
            Client client = geminiClient();

            // Build the strict JSON response schema:
            // { "domainIds": ["<uuid>", ...], "confidence": 0.0-1.0 }
            Schema responseSchema = Schema.builder()
                    .type(Type.Known.OBJECT)
                    .properties(java.util.Map.of(
                            "domainIds", Schema.builder()
                                    .type(Type.Known.ARRAY)
                                    .items(Schema.builder().type(Type.Known.STRING).build())
                                    .description("List of 1-3 taxonomy domain UUIDs, most relevant first.")
                                    .build(),
                            "confidence", Schema.builder()
                                    .type(Type.Known.NUMBER)
                                    .description("Confidence of the primary classification in [0.0, 1.0].")
                                    .build()
                    ))
                    .required(java.util.Arrays.asList("domainIds", "confidence"))
                    .build();

            GenerateContentConfig config = GenerateContentConfig.builder()
                    .systemInstruction(Content.fromParts(Part.fromText(SYSTEM_INSTRUCTION)))
                    .responseMimeType("application/json")
                    .responseSchema(responseSchema)
                    .temperature((float) temperature)
                    .build();

            GenerateContentResponse response = client.models.generateContent(
                    model, userPrompt, config);

            String rawJson = response.text();
            if (rawJson == null || rawJson.isBlank()) {
                throw new ProviderException("Gemini returned empty text content", true);
            }

            return parseResponse(rawJson);

        } catch (ProviderException pe) {
            throw pe;
        } catch (Exception e) {
            // Classify error type from exception message for transient/terminal determination
            String msg = e.getMessage() == null ? "" : e.getMessage();
            boolean transient_ = isTransientError(msg, e);
            throw new ProviderException(
                    "Gemini API call failed: " + sanitizeErrorMessage(msg), e, transient_);
        }
    }

    /**
     * Parses the Gemini-returned JSON into a typed record.
     * The schema constraint means this should always succeed, but we validate defensively.
     */
    private GeminiClassificationResponse parseResponse(String rawJson) {
        try {
            JsonNode root = objectMapper.readTree(rawJson);

            JsonNode idsNode = root.path("domainIds");
            if (!idsNode.isArray()) {
                throw new ProviderException(
                        "Gemini response missing required 'domainIds' array", true);
            }

            List<String> domainIds = new ArrayList<>();
            for (JsonNode n : idsNode) {
                if (n.isTextual() && !n.asText().isBlank()) {
                    domainIds.add(n.asText().trim());
                }
            }

            JsonNode confNode = root.path("confidence");
            double confidence = confNode.isNumber() ? confNode.asDouble() : 0.5;

            return new GeminiClassificationResponse(domainIds, confidence);
        } catch (ProviderException pe) {
            throw pe;
        } catch (Exception e) {
            throw new ProviderException(
                    "Failed to parse Gemini JSON response: " + e.getMessage(), e, true);
        }
    }

    /**
     * Validates that every domain ID returned by the model actually exists in the
     * authoritative taxonomy options. Hallucinated IDs are silently dropped (not
     * failed), matching the existing behaviour in {@code AutoUniversitySelectionService}.
     */
    private List<String> validateDomainIds(List<String> rawIds,
                                            List<DomainResolutionRequest.DomainOption> options,
                                            String correlationId) {
        List<String> knownUuids = options.stream()
                .map(o -> o.domainId().toString())
                .toList();

        List<String> validated = new ArrayList<>();
        for (String raw : rawIds) {
            if (raw == null || raw.isBlank()) continue;
            // Check it's a valid UUID format first
            try {
                UUID.fromString(raw.trim());
            } catch (IllegalArgumentException e) {
                log.warn("Gemini: dropping non-UUID domain id='{}' for correlationId={}",
                        raw, correlationId);
                continue;
            }
            if (!knownUuids.contains(raw.trim())) {
                log.warn("Gemini: dropping hallucinated domain id='{}' not in taxonomy for correlationId={}",
                        raw, correlationId);
                continue;
            }
            validated.add(raw.trim());
        }
        return validated;
    }

    private double clampConfidence(double raw) {
        return Math.max(0.0, Math.min(1.0, raw));
    }

    /**
     * Determines whether an exception represents a transient (retryable) error.
     * Auth errors are terminal; network/rate-limit/5xx are transient.
     */
    private boolean isTransientError(String message, Exception e) {
        String lower = message.toLowerCase();
        // HTTP 401/403 = authentication/permission failure → terminal, do not retry
        if (lower.contains("401") || lower.contains("403")
                || lower.contains("unauthorized") || lower.contains("forbidden")
                || lower.contains("invalid api key") || lower.contains("api_key")) {
            return false;
        }
        // Rate limits and server errors → transient
        if (lower.contains("429") || lower.contains("rate limit")
                || lower.contains("quota") || lower.contains("503")
                || lower.contains("500") || lower.contains("502")
                || lower.contains("504") || lower.contains("timeout")
                || lower.contains("connection")) {
            return true;
        }
        // Default: treat unknown exceptions as transient (allow retry)
        return true;
    }

    /**
     * Removes any substring that looks like an API key from an error message before logging.
     * Conservative regex: removes anything that looks like "sk-..." or long alphanumeric tokens.
     */
    private String sanitizeErrorMessage(String msg) {
        if (msg == null) return null;
        // Remove anything that looks like a Bearer token or API key
        return msg.replaceAll("(?i)(bearer\\s+|api[_-]?key[=:\\s]+)[A-Za-z0-9_\\-]{10,}", "[REDACTED]")
                  .replaceAll("[A-Za-z0-9_\\-]{40,}", "[REDACTED_TOKEN]");
    }

    private Client geminiClient() {
        Client current = geminiClient;
        if (current == null) {
            synchronized (this) {
                if (geminiClient == null) {
                    geminiClient = Client.builder()
                            .apiKey(apiKey)
                            .build();
                }
                current = geminiClient;
            }
        }
        return current;
    }

    /** Internal typed response from Gemini (after JSON parsing). */
    private record GeminiClassificationResponse(List<String> domainIds, double confidence) {}
}
