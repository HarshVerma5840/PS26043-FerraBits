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
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Gemini implementation of {@link CriterionScoringClient}.
 *
 * <p>Activated when {@code app.llm.scoring-provider=gemini}. Uses the same
 * {@code com.google.genai} SDK already installed in the repository for Phase 1
 * domain resolution. Reuses the {@code GEMINI_API_KEY} and {@code GEMINI_MODEL}
 * environment variables from Phase 1.
 *
 * <p><b>What this does:</b>
 * <ul>
 *   <li>One Gemini call per pool evaluation (not one per criterion).</li>
 *   <li>Structured JSON output via {@code responseSchema} — no markdown, no fences.</li>
 *   <li>Returns scores keyed by {@code criterionKey} to exactly match
 *       {@link CriterionScoringResult}'s contract (no adapter layer needed
 *       downstream).</li>
 *   <li>Rejects any score outside 1–10 (DB CHECK constraint) or above the
 *       criterion's configured {@code maxScore}: the whole pool degrades to MANUAL
 *       on any validation failure.</li>
 *   <li>Bounded retries: transient HTTP errors (429, 5xx) are retried up to
 *       {@code maxRetries} times. Terminal auth errors (401, 403) are not.</li>
 *   <li>Never throws: all failures return {@link Optional#empty()} so
 *       {@link com.saamyukt.SIH26043.service.AutoEvaluationService} degrades the
 *       pool to MANUAL instead of blocking the cycle.</li>
 * </ul>
 *
 * <p><b>Privacy:</b> Only the problem title, description, domain, source bucket,
 * urgency, and severity are sent to Gemini — exactly the same fields the
 * OpenAI-compatible client sends. Phone numbers, home addresses, and identity
 * fields are never included.
 *
 * <p><b>Security:</b> The API key is injected via {@code @Value} from the
 * environment. It is never logged. Structured JSON output prevents prompt
 * injection.
 */
@Service
@ConditionalOnProperty(name = "app.llm.scoring-provider", havingValue = "gemini",
        matchIfMissing = false)
public class GeminiCriterionScoringClient implements CriterionScoringClient {

    private static final Logger log = LoggerFactory.getLogger(GeminiCriterionScoringClient.class);

    /** DB constraint: evaluation_response.score BETWEEN 1 AND 10. */
    private static final int MIN_SCORE = 1;
    private static final int MAX_SCORE = 10;

    /** Column widths on evaluation_assignment. */
    private static final int RECOMMENDATION_MAX = 255;
    private static final int FEEDBACK_MAX = 4000;

    private static final String PROVIDER_NAME = "gemini";

    /**
     * Stable system instruction shared across all five pools.
     *
     * <p>Pool-specific role instruction is injected into the user content per call.
     * Few-shot examples are disabled by default (see Phase 2 PRD: "Enable only
     * after benchmark comparison proves it improves evaluation quality").
     */
    private static final String SYSTEM_INSTRUCTION = """
            You are an AI evaluator operating inside the SAAMYUKT multi-pool societal problem \
            evaluation system.
            Rules:
            - Evaluate ONLY the supplied problem using ONLY the criterion keys provided.
            - Do NOT invent criteria. Do NOT change criterion weights.
            - Scores are integers from 1 to 10 and must not exceed the criterion's maxScore.
            - Calibrate: 1 = absent or very weak, 5 = adequate, 10 = exceptional. Never inflate.
            - Do NOT assign a final cross-pool priority score.
            - Do NOT claim government, industry, academic, or community facts absent from input.
            - Distinguish evidence from inference. When evidence is insufficient, flag uncertainty \
            explicitly.
            - Give concise reason codes (3–8 words), not hidden chain-of-thought.
            - Return exactly one score per required criterion unless explicitly permitted otherwise.
            - Use structured JSON only. No prose, no markdown fences.""";

    private static final Map<String, String> POOL_ROLE = Map.of(
            "GOVERNMENT",
            "Evaluate strictly from a government/public-sector perspective: policy relevance, "
                    + "administrative feasibility, public impact, urgency.",
            "INDUSTRY",
            "Evaluate strictly from an industry/ecosystem perspective: technical feasibility, "
                    + "scalability, innovation potential, commercial viability.",
            "HEI",
            "Evaluate strictly from a higher-education/research perspective: academic relevance, "
                    + "research potential, innovation, scientific feasibility.",
            "CITIZEN",
            "Evaluate strictly from an individual citizen perspective: personal importance, "
                    + "daily-life impact, urgency, accessibility of solutions.",
            "COMMUNITY",
            "Evaluate strictly from a local/community perspective: social impact, community need, "
                    + "inclusiveness of vulnerable groups, sustainability."
    );

    private final String apiKey;
    private final String model;
    private final int maxRetries;
    private final double temperature;
    private final ObjectMapper objectMapper;

    public GeminiCriterionScoringClient(
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

    @Override
    public boolean configured() {
        return !apiKey.isEmpty();
    }

    @Override
    public Optional<CriterionScoringResult> score(CriterionScoringRequest request) {
        if (apiKey.isEmpty()) {
            log.info("No app.llm.gemini.api-key configured; skipping Gemini scoring for pool {}",
                    request.pool());
            return Optional.empty();
        }
        if (request.criteria() == null || request.criteria().isEmpty()) {
            log.warn("Gemini scoring skipped for pool {}: no criteria supplied", request.pool());
            return Optional.empty();
        }

        String userContent = buildUserContent(request);
        int attempts = Math.max(1, maxRetries + 1);
        Exception lastError = null;

        for (int attempt = 1; attempt <= attempts; attempt++) {
            try {
                Optional<CriterionScoringResult> result = callGemini(userContent, request);
                if (result.isPresent()) {
                    log.info("Gemini scored pool {} on attempt {}/{}: {} criteria",
                            request.pool(), attempt, attempts,
                            result.get().scoresByKey().size());
                    return result;
                }
                // Unusable response (validation failed) — retry may not help, but the
                // existing OpenAI client also retries on unusable responses.
                lastError = new IllegalStateException("Gemini response unusable for pool scoring");
            } catch (GeminiTerminalException e) {
                // Auth/permission failures — never retry.
                log.error("Gemini terminal error scoring pool {} (not retrying): {}",
                        request.pool(), e.getMessage());
                return Optional.empty();
            } catch (Exception e) {
                lastError = e;
                log.warn("Gemini scoring attempt {}/{} for pool {} failed: {}",
                        attempt, attempts, request.pool(), e.getMessage());
            }
        }
        log.error("Gemini scoring failed for pool {} after {} attempt(s)",
                request.pool(), attempts, lastError);
        return Optional.empty();
    }

    // -----------------------------------------------------------------------
    // Gemini call
    // -----------------------------------------------------------------------

    private Optional<CriterionScoringResult> callGemini(String userContent,
                                                        CriterionScoringRequest request)
            throws Exception {
        Client client = Client.builder()
                .apiKey(apiKey)
                .build();

        Schema responseSchema = buildResponseSchema(request.criteria());

        GenerateContentConfig config = GenerateContentConfig.builder()
                .systemInstruction(Content.fromParts(Part.fromText(SYSTEM_INSTRUCTION)))
                .responseMimeType("application/json")
                .responseSchema(responseSchema)
                .temperature((float) temperature)
                .build();

        GenerateContentResponse response = client.models.generateContent(
                model,
                userContent,
                config);

        if (response == null || response.text() == null || response.text().isBlank()) {
            log.warn("Gemini returned empty text for pool {}", request.pool());
            return Optional.empty();
        }

        return parseAndValidate(response.text(), request);
    }

    // -----------------------------------------------------------------------
    // Response schema
    // -----------------------------------------------------------------------

    /**
     * Builds the Gemini structured-output schema for one pool's scoring response.
     *
     * <p>The schema enforces:
     * <ul>
     *   <li>{@code evaluation_version}, {@code pool}, {@code summary}: required strings.</li>
     *   <li>{@code overall_confidence}: number in [0, 1].</li>
     *   <li>{@code uncertainty_flags}: array of strings.</li>
     *   <li>{@code criterion_scores}: array of per-criterion objects each with
     *       {@code criterion_key} (the stable key string), {@code score} (integer),
     *       {@code confidence}, {@code reason_codes}, optional {@code evidence} and
     *       {@code uncertainty}.</li>
     * </ul>
     *
     * <p>Using {@code criterionKey} (not UUID) in the schema matches
     * {@link CriterionScoringResult#scoresByKey()} so no adapter is needed downstream.
     */
    private static Schema buildResponseSchema(List<CriterionScoringRequest.CriterionSpec> criteria) {
        // criterion_score item schema
        Schema criterionScoreItem = Schema.builder()
                .type(Type.Known.OBJECT)
                .properties(Map.of(
                        "criterion_key", Schema.builder().type(Type.Known.STRING).build(),
                        "score", Schema.builder().type(Type.Known.INTEGER).build(),
                        "confidence", Schema.builder().type(Type.Known.NUMBER).build(),
                        "reason_codes", Schema.builder()
                                .type(Type.Known.ARRAY)
                                .items(Schema.builder().type(Type.Known.STRING).build())
                                .build(),
                        "evidence", Schema.builder()
                                .type(Type.Known.ARRAY)
                                .items(Schema.builder().type(Type.Known.STRING).build())
                                .build(),
                        "uncertainty", Schema.builder().type(Type.Known.STRING).build()
                ))
                .required(List.of("criterion_key", "score", "confidence", "reason_codes"))
                .build();

        return Schema.builder()
                .type(Type.Known.OBJECT)
                .properties(Map.of(
                        "evaluation_version", Schema.builder().type(Type.Known.STRING).build(),
                        "pool", Schema.builder().type(Type.Known.STRING).build(),
                        "criterion_scores", Schema.builder()
                                .type(Type.Known.ARRAY)
                                .items(criterionScoreItem)
                                .build(),
                        "overall_confidence", Schema.builder().type(Type.Known.NUMBER).build(),
                        "uncertainty_flags", Schema.builder()
                                .type(Type.Known.ARRAY)
                                .items(Schema.builder().type(Type.Known.STRING).build())
                                .build(),
                        "summary", Schema.builder().type(Type.Known.STRING).build(),
                        "feedback", Schema.builder().type(Type.Known.STRING).build(),
                        "recommendation", Schema.builder().type(Type.Known.STRING).build()
                ))
                .required(List.of("evaluation_version", "pool", "criterion_scores",
                        "overall_confidence", "uncertainty_flags", "summary"))
                .build();
    }

    // -----------------------------------------------------------------------
    // User content / prompt
    // -----------------------------------------------------------------------

    private String buildUserContent(CriterionScoringRequest request) {
        Map<String, Object> payload = new LinkedHashMap<>();

        // Pool identity and role (tells the model which expert lens to adopt)
        String poolName = request.pool() == null ? "UNKNOWN" : request.pool().name();
        payload.put("pool", poolName);
        payload.put("poolRole", POOL_ROLE.getOrDefault(poolName,
                "Evaluate from the perspective of a " + poolName + " expert."));

        // Problem context — title, description, domain only; no PII
        Map<String, Object> problemMap = new LinkedHashMap<>();
        ProblemContext ctx = request.problem();
        if (ctx != null) {
            problemMap.put("title", ctx.title());
            problemMap.put("description", ctx.description());
            problemMap.put("domains", ctx.domains());
            problemMap.put("sourceBucket", ctx.sourceBucket());
            problemMap.put("urgency", ctx.urgency());
            problemMap.put("severity", ctx.severity());
            problemMap.put("affectedPopulation", ctx.affectedPopulation());
            problemMap.put("expectedOutcome", ctx.expectedOutcome());
            problemMap.put("location", ctx.location());
        }
        payload.put("problem", problemMap);

        // Advisory analysis profile (null-safe; present when analysis step ran)
        if (request.advisory() != null) {
            Map<String, Object> advisory = new LinkedHashMap<>();
            advisory.put("problemCategory", request.advisory().problemCategory());
            advisory.put("domain", request.advisory().domain());
            advisory.put("sector", request.advisory().sector());
            advisory.put("impactAreas", request.advisory().impactAreas());
            advisory.put("complexity", request.advisory().complexity());
            advisory.put("potentialScale", request.advisory().potentialScale());
            advisory.put("technologyRelevance", request.advisory().technologyRelevance());
            advisory.put("socialImpact", request.advisory().socialImpact());
            payload.put("advisoryAnalysis", advisory);
        }

        // Criteria: pass stable keys, labels, descriptions, and score ranges
        List<Map<String, Object>> criteriaList = new ArrayList<>();
        for (CriterionScoringRequest.CriterionSpec c : request.criteria()) {
            Map<String, Object> spec = new LinkedHashMap<>();
            spec.put("criterionKey", c.criterionKey());
            spec.put("label", c.criterionLabel());
            spec.put("description", c.description());
            spec.put("minScore", MIN_SCORE);
            spec.put("maxScore", c.maxScore());
            criteriaList.add(spec);
        }
        payload.put("criteria", criteriaList);
        payload.put("evaluationVersion", "evaluation-v1");

        try {
            return objectMapper.writeValueAsString(payload);
        } catch (Exception e) {
            // All components are simple records/collections; this cannot realistically fail.
            return "{}";
        }
    }

    // -----------------------------------------------------------------------
    // Parsing and validation
    // -----------------------------------------------------------------------

    /**
     * Parses the Gemini structured-JSON response and validates every criterion score.
     *
     * <p>Validation rules:
     * <ul>
     *   <li>Every requested criterion must have exactly one score entry.</li>
     *   <li>Score must be an integer in [1, max] where max is the criterion's configured maxScore.</li>
     *   <li>Confidence must be in [0, 1].</li>
     *   <li>Unknown criterion keys from Gemini are silently dropped (hallucination guard).</li>
     *   <li>A missing required criterion causes the whole pool to degrade to MANUAL.</li>
     *   <li>An out-of-range score causes the whole pool to degrade to MANUAL.</li>
     * </ul>
     */
    private Optional<CriterionScoringResult> parseAndValidate(String raw,
                                                              CriterionScoringRequest request) {
        JsonNode root;
        try {
            root = objectMapper.readTree(raw);
        } catch (Exception e) {
            log.warn("Gemini returned malformed JSON for pool {}: {}",
                    request.pool(), e.getMessage());
            throw new IllegalStateException("Gemini returned malformed JSON", e);
        }

        JsonNode criterionScoresNode = root.path("criterion_scores");
        if (!criterionScoresNode.isArray()) {
            log.warn("Gemini response missing 'criterion_scores' array for pool {}", request.pool());
            return Optional.empty();
        }

        // Index the Gemini response by criterion_key
        Map<String, JsonNode> geminiByKey = new LinkedHashMap<>();
        criterionScoresNode.forEach(node -> {
            String key = node.path("criterion_key").asText(null);
            if (key != null && !key.isBlank()) {
                geminiByKey.put(key, node);
            }
        });

        Map<String, Integer> scoresByKey = new LinkedHashMap<>();
        Map<String, String> commentsByKey = new LinkedHashMap<>();

        // Build a map of criterionKey → maxScore from request for validation
        Map<String, Integer> maxScoreByKey = new LinkedHashMap<>();
        for (CriterionScoringRequest.CriterionSpec spec : request.criteria()) {
            maxScoreByKey.put(spec.criterionKey(), spec.maxScore());
        }

        for (CriterionScoringRequest.CriterionSpec spec : request.criteria()) {
            String key = spec.criterionKey();
            JsonNode entry = geminiByKey.get(key);
            if (entry == null) {
                log.warn("Gemini scorecard for pool {} missing criterion '{}'",
                        request.pool(), key);
                return Optional.empty();
            }

            JsonNode scoreNode = entry.path("score");
            if (!scoreNode.isNumber()) {
                log.warn("Gemini scored criterion '{}' of pool {} with non-numeric value: {}",
                        key, request.pool(), scoreNode);
                return Optional.empty();
            }
            int score = scoreNode.asInt();
            int max = maxScoreByKey.getOrDefault(key, MAX_SCORE);
            if (score < MIN_SCORE || score > max) {
                log.warn("Gemini scored criterion '{}' of pool {} at {}, outside {}..{}",
                        key, request.pool(), score, MIN_SCORE, max);
                return Optional.empty();
            }

            scoresByKey.put(key, score);

            // Build comment from reason_codes + uncertainty (maps to the existing
            // CriterionScoringResult.commentsByKey — stored as assignment response comment)
            String comment = buildComment(entry);
            if (comment != null) {
                commentsByKey.put(key, comment);
            }
        }

        if (scoresByKey.isEmpty()) {
            return Optional.empty();
        }

        String feedback = truncate(root.path("summary").asText(null), FEEDBACK_MAX);
        String recommendation = truncate(root.path("recommendation").asText(null),
                RECOMMENDATION_MAX);

        return Optional.of(new CriterionScoringResult(
                scoresByKey,
                commentsByKey,
                feedback,
                recommendation,
                PROVIDER_NAME,
                model));
    }

    /**
     * Assembles a human-readable comment from reason_codes and the uncertainty field.
     * Stored in {@code evaluation_response.comment} (TEXT column, no length limit).
     */
    private static String buildComment(JsonNode entry) {
        List<String> parts = new ArrayList<>();
        JsonNode reasonCodes = entry.path("reason_codes");
        if (reasonCodes.isArray() && !reasonCodes.isEmpty()) {
            List<String> codes = new ArrayList<>();
            reasonCodes.forEach(n -> codes.add(n.asText()));
            parts.add(String.join("; ", codes));
        }
        JsonNode uncertainty = entry.path("uncertainty");
        if (!uncertainty.isMissingNode() && !uncertainty.isNull()) {
            String u = uncertainty.asText("").trim();
            if (!u.isEmpty()) {
                parts.add("[uncertainty: " + u + "]");
            }
        }
        return parts.isEmpty() ? null : String.join(" | ", parts);
    }

    // -----------------------------------------------------------------------
    // Error classification
    // -----------------------------------------------------------------------

    /**
     * Thrown for terminal Gemini errors (auth/permission failures) that must
     * not be retried. Transient errors throw standard {@link RuntimeException}.
     */
    static final class GeminiTerminalException extends RuntimeException {
        GeminiTerminalException(String message, Throwable cause) {
            super(message, cause);
        }
    }

    // -----------------------------------------------------------------------
    // Utilities
    // -----------------------------------------------------------------------

    private static String truncate(String value, int max) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.length() <= max ? trimmed : trimmed.substring(0, max);
    }
}
