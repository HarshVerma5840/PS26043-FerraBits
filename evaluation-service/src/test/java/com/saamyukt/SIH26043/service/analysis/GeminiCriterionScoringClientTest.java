package com.saamyukt.SIH26043.service.analysis;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.saamyukt.SIH26043.enums.EvaluatorType;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

import java.lang.reflect.Method;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Unit tests for {@link GeminiCriterionScoringClient}.
 *
 * <p>Tests the client's parsing, validation, and error-handling logic using
 * synthesised JSON payloads. Does NOT hit the live Gemini API — the objective
 * is to verify the contract with {@link com.saamyukt.SIH26043.service.AutoEvaluationService}:
 * every failure must return {@link Optional#empty()} so the pool degrades to MANUAL.</p>
 *
 * <p>Test cases cover:
 * <ul>
 *   <li>configured() / unconfigured guard</li>
 *   <li>Valid structured JSON — all five pools</li>
 *   <li>score = 0 (below DB CHECK minimum of 1) → rejected</li>
 *   <li>score = 11 (above maxScore of 10) → rejected</li>
 *   <li>Missing required criterion → rejected (whole pool degrades)</li>
 *   <li>Hallucinated/extra criterion key → dropped, then fails if real key missing</li>
 *   <li>Malformed JSON → IllegalStateException (caught by retry loop)</li>
 *   <li>Missing criterion_scores node → empty</li>
 *   <li>reason_codes + uncertainty assembled into comment</li>
 *   <li>summary/feedback truncated to 4000 chars</li>
 * </ul>
 */
class GeminiCriterionScoringClientTest {

    private final ObjectMapper mapper = new ObjectMapper();

    // ─── configured() ────────────────────────────────────────────────────────

    @Test
    void configuredReturnsFalseWhenApiKeyIsEmpty() {
        assertThat(client("").configured()).isFalse();
    }

    @Test
    void configuredReturnsTrueWhenApiKeyIsPresent() {
        assertThat(client("my-key").configured()).isTrue();
    }

    // ─── unconfigured / empty criteria guards ────────────────────────────────

    @Test
    void scoreReturnsEmptyWhenKeyIsAbsent() {
        assertThat(client("").score(govtRequest())).isEmpty();
    }

    @Test
    void scoreReturnsEmptyWhenCriteriaListIsEmpty() {
        CriterionScoringRequest req = new CriterionScoringRequest(
                EvaluatorType.GOVERNMENT, ctx(), List.of(), null);
        assertThat(client("key").score(req)).isEmpty();
    }

    // ─── parseAndValidate — happy path ───────────────────────────────────────

    @Test
    void parsesValidGovtResponseSuccessfully() throws Exception {
        String json = govtJson(8, 7, 6, 9, 5);
        Optional<CriterionScoringResult> r = parse(client("key"), json, govtRequest());

        assertThat(r).isPresent();
        assertThat(r.get().scoresByKey())
                .containsEntry("policy_relevance", 8)
                .containsEntry("admin_feasibility", 7)
                .containsEntry("impl_feasibility", 6)
                .containsEntry("public_impact", 9)
                .containsEntry("urgency", 5)
                .hasSize(5);
        assertThat(r.get().provider()).isEqualTo("gemini");
        assertThat(r.get().model()).isEqualTo("gemini-3.1-flash-lite");
        assertThat(r.get().feedback()).isEqualTo("Overall evaluation summary");
    }

    @ParameterizedTest
    @EnumSource(EvaluatorType.class)
    void parsesValidResponseForEachPool(EvaluatorType pool) throws Exception {
        String criterionKey = firstKeyFor(pool);
        String json = singleCriterionJson(pool.name(), criterionKey, 7);
        Optional<CriterionScoringResult> r = parse(client("key"), json,
                singleRequest(pool, criterionKey));

        assertThat(r).as("Pool %s should parse", pool).isPresent();
        assertThat(r.get().scoresByKey()).containsKey(criterionKey);
    }

    // ─── comment assembly ────────────────────────────────────────────────────

    @Test
    void reasonCodesAreJoinedIntoComment() throws Exception {
        String json = singleCriterionJsonWithReason("policy_relevance", 8,
                List.of("aligned with national policy", "supports PM programme"), null);
        Optional<CriterionScoringResult> r = parse(client("key"), json,
                singleRequest(EvaluatorType.GOVERNMENT, "policy_relevance"));

        assertThat(r).isPresent();
        String comment = r.get().commentsByKey().get("policy_relevance");
        assertThat(comment)
                .contains("aligned with national policy")
                .contains("supports PM programme");
    }

    @Test
    void uncertaintyIsAppendedToComment() throws Exception {
        String json = singleCriterionJsonWithReason("policy_relevance", 5,
                List.of("limited info"),
                "description lacks policy alignment evidence");
        Optional<CriterionScoringResult> r = parse(client("key"), json,
                singleRequest(EvaluatorType.GOVERNMENT, "policy_relevance"));

        assertThat(r).isPresent();
        String comment = r.get().commentsByKey().get("policy_relevance");
        assertThat(comment).contains("[uncertainty:");
        assertThat(comment).contains("description lacks policy alignment evidence");
    }

    // ─── score validation failures ───────────────────────────────────────────

    @Test
    void rejectsScoreOfZeroBelowDbCheckMin() throws Exception {
        String json = singleCriterionJson("GOVERNMENT", "policy_relevance", 0);
        Optional<CriterionScoringResult> r = parse(client("key"), json,
                singleRequest(EvaluatorType.GOVERNMENT, "policy_relevance"));
        assertThat(r).isEmpty();
    }

    @Test
    void rejectsScoreAboveMaxScore() throws Exception {
        // maxScore is 10 (DB default); Gemini returns 11
        String json = singleCriterionJson("GOVERNMENT", "policy_relevance", 11);
        Optional<CriterionScoringResult> r = parse(client("key"), json,
                singleRequest(EvaluatorType.GOVERNMENT, "policy_relevance"));
        assertThat(r).isEmpty();
    }

    @Test
    void rejectsScoreAtExactMinusOne() throws Exception {
        String json = singleCriterionJson("GOVERNMENT", "policy_relevance", 0);
        assertThat(parse(client("key"), json,
                singleRequest(EvaluatorType.GOVERNMENT, "policy_relevance"))).isEmpty();
    }

    // ─── incomplete scorecard ────────────────────────────────────────────────

    @Test
    void returnsEmptyWhenRequiredCriterionIsMissing() throws Exception {
        // 4 of 5 GOVERNMENT criteria — urgency omitted
        String json = partialGovtJson(8, 7, 6, 9 /* urgency missing */);
        Optional<CriterionScoringResult> r = parse(client("key"), json, govtRequest());
        assertThat(r).isEmpty();
    }

    @Test
    void dropsHallucinatedKeyButStillFailsWhenRealKeyMissing() throws Exception {
        // 4 real + 1 hallucinated key; urgency still missing
        String json = partialGovtJsonWithExtra(8, 7, 6, 9, "FAKE_CRITERION");
        Optional<CriterionScoringResult> r = parse(client("key"), json, govtRequest());
        assertThat(r).isEmpty();
    }

    // ─── structural / JSON failures ──────────────────────────────────────────

    @Test
    void throwsIllegalStateExceptionForMalformedJson() {
        assertThatThrownBy(() ->
                parse(client("key"), "NOT_JSON{{{{",
                        singleRequest(EvaluatorType.GOVERNMENT, "policy_relevance")))
                .hasCauseInstanceOf(IllegalStateException.class)
                .hasStackTraceContaining("malformed JSON");
    }

    @Test
    void returnsEmptyWhenCriterionScoresNodeMissing() throws Exception {
        String json = """
                {"evaluation_version":"evaluation-v1","pool":"GOVERNMENT",
                 "overall_confidence":0.8,"uncertainty_flags":[],"summary":"ok"}""";
        assertThat(parse(client("key"), json,
                singleRequest(EvaluatorType.GOVERNMENT, "policy_relevance"))).isEmpty();
    }

    // ─── feedback truncation ─────────────────────────────────────────────────

    @Test
    void summaryTruncatedToFeedbackMax() throws Exception {
        String longSummary = "x".repeat(6000);
        String json = jsonWithSummary("policy_relevance", 7, longSummary);
        Optional<CriterionScoringResult> r = parse(client("key"), json,
                singleRequest(EvaluatorType.GOVERNMENT, "policy_relevance"));

        assertThat(r).isPresent();
        assertThat(r.get().feedback()).hasSizeLessThanOrEqualTo(4000);
    }

    @Test
    void recommendationTruncatedTo255() throws Exception {
        String longRec = "r".repeat(500);
        String json = jsonWithRecommendation("policy_relevance", 7, longRec);
        Optional<CriterionScoringResult> r = parse(client("key"), json,
                singleRequest(EvaluatorType.GOVERNMENT, "policy_relevance"));

        assertThat(r).isPresent();
        assertThat(r.get().recommendation()).hasSizeLessThanOrEqualTo(255);
    }

    // ─── helpers ─────────────────────────────────────────────────────────────

    private GeminiCriterionScoringClient client(String apiKey) {
        return new GeminiCriterionScoringClient(apiKey, "gemini-3.1-flash-lite", 0, 0.1, mapper);
    }

    /** Reflectively invokes the package-private parseAndValidate for white-box testing. */
    @SuppressWarnings("unchecked")
    private Optional<CriterionScoringResult> parse(GeminiCriterionScoringClient client,
                                                    String json,
                                                    CriterionScoringRequest request)
            throws Exception {
        Method m = GeminiCriterionScoringClient.class.getDeclaredMethod(
                "parseAndValidate", String.class, CriterionScoringRequest.class);
        m.setAccessible(true);
        return (Optional<CriterionScoringResult>) m.invoke(client, json, request);
    }

    private CriterionScoringRequest govtRequest() {
        return new CriterionScoringRequest(
                EvaluatorType.GOVERNMENT, ctx(),
                List.of(
                        spec("policy_relevance", 10),
                        spec("admin_feasibility", 10),
                        spec("impl_feasibility", 10),
                        spec("public_impact", 10),
                        spec("urgency", 10)),
                null);
    }

    private CriterionScoringRequest singleRequest(EvaluatorType pool, String key) {
        return new CriterionScoringRequest(pool, ctx(), List.of(spec(key, 10)), null);
    }

    private static CriterionScoringRequest.CriterionSpec spec(String key, int max) {
        return new CriterionScoringRequest.CriterionSpec(key, "Label " + key, "Desc", max);
    }

    private static ProblemContext ctx() {
        return new ProblemContext(
                UUID.randomUUID(),
                "Hand pump not working",
                "Village hand pump broken for 3 months. No safe drinking water.",
                "CITIZEN", null, "HIGH", "HIGH", 500,
                "Restore safe water access", null, "Bihar", List.of("Water"), 2);
    }

    private static String firstKeyFor(EvaluatorType pool) {
        return switch (pool) {
            case GOVERNMENT -> "policy_relevance";
            case INDUSTRY -> "tech_feasibility";
            case HEI -> "tech_validity";
            case CITIZEN -> "problem_importance";
            case COMMUNITY -> "social_impact";
        };
    }

    // ─── JSON builders ───────────────────────────────────────────────────────

    /** All five GOVERNMENT criteria at given scores. */
    private static String govtJson(int pr, int af, int imf, int pi, int ur) {
        return """
                {"evaluation_version":"evaluation-v1","pool":"GOVERNMENT",
                 "criterion_scores":[
                   {"criterion_key":"policy_relevance","score":%d,"confidence":0.8,"reason_codes":["a"]},
                   {"criterion_key":"admin_feasibility","score":%d,"confidence":0.7,"reason_codes":["b"]},
                   {"criterion_key":"impl_feasibility","score":%d,"confidence":0.7,"reason_codes":["c"]},
                   {"criterion_key":"public_impact","score":%d,"confidence":0.9,"reason_codes":["d"]},
                   {"criterion_key":"urgency","score":%d,"confidence":0.8,"reason_codes":["e"]}
                 ],
                 "overall_confidence":0.8,"uncertainty_flags":[],
                 "summary":"Overall evaluation summary","feedback":"feedback","recommendation":"Prioritize"}"""
                .formatted(pr, af, imf, pi, ur);
    }

    /** Four GOVERNMENT criteria (urgency omitted). */
    private static String partialGovtJson(int pr, int af, int imf, int pi) {
        return """
                {"evaluation_version":"evaluation-v1","pool":"GOVERNMENT",
                 "criterion_scores":[
                   {"criterion_key":"policy_relevance","score":%d,"confidence":0.8,"reason_codes":["a"]},
                   {"criterion_key":"admin_feasibility","score":%d,"confidence":0.7,"reason_codes":["b"]},
                   {"criterion_key":"impl_feasibility","score":%d,"confidence":0.7,"reason_codes":["c"]},
                   {"criterion_key":"public_impact","score":%d,"confidence":0.9,"reason_codes":["d"]}
                 ],
                 "overall_confidence":0.8,"uncertainty_flags":[],"summary":"test"}"""
                .formatted(pr, af, imf, pi);
    }

    /** Four real + one hallucinated GOVERNMENT criteria (urgency still absent). */
    private static String partialGovtJsonWithExtra(int pr, int af, int imf, int pi, String extra) {
        return """
                {"evaluation_version":"evaluation-v1","pool":"GOVERNMENT",
                 "criterion_scores":[
                   {"criterion_key":"policy_relevance","score":%d,"confidence":0.8,"reason_codes":["a"]},
                   {"criterion_key":"admin_feasibility","score":%d,"confidence":0.7,"reason_codes":["b"]},
                   {"criterion_key":"impl_feasibility","score":%d,"confidence":0.7,"reason_codes":["c"]},
                   {"criterion_key":"public_impact","score":%d,"confidence":0.9,"reason_codes":["d"]},
                   {"criterion_key":"%s","score":6,"confidence":0.5,"reason_codes":["hallucinated"]}
                 ],
                 "overall_confidence":0.8,"uncertainty_flags":[],"summary":"test"}"""
                .formatted(pr, af, imf, pi, extra);
    }

    private static String singleCriterionJson(String pool, String key, int score) {
        return """
                {"evaluation_version":"evaluation-v1","pool":"%s",
                 "criterion_scores":[{"criterion_key":"%s","score":%d,"confidence":0.8,
                   "reason_codes":["test reason"]}],
                 "overall_confidence":0.8,"uncertainty_flags":[],
                 "summary":"test","feedback":"fb","recommendation":"rec"}"""
                .formatted(pool, key, score);
    }

    private String singleCriterionJsonWithReason(String key, int score,
                                                  List<String> reasons,
                                                  String uncertainty) throws Exception {
        String reasonsJson = mapper.writeValueAsString(reasons);
        String uncertaintyJson = uncertainty == null ? "null" : "\"" + uncertainty + "\"";
        return """
                {"evaluation_version":"evaluation-v1","pool":"GOVERNMENT",
                 "criterion_scores":[{"criterion_key":"%s","score":%d,"confidence":0.7,
                   "reason_codes":%s,"uncertainty":%s}],
                 "overall_confidence":0.7,"uncertainty_flags":[],
                 "summary":"test","feedback":"fb","recommendation":"rec"}"""
                .formatted(key, score, reasonsJson, uncertaintyJson);
    }

    private static String jsonWithSummary(String key, int score, String summary) {
        return """
                {"evaluation_version":"evaluation-v1","pool":"GOVERNMENT",
                 "criterion_scores":[{"criterion_key":"%s","score":%d,"confidence":0.8,
                   "reason_codes":["t"]}],
                 "overall_confidence":0.8,"uncertainty_flags":[],
                 "summary":"%s","feedback":"fb","recommendation":"rec"}"""
                .formatted(key, score, summary);
    }

    private static String jsonWithRecommendation(String key, int score, String recommendation) {
        return """
                {"evaluation_version":"evaluation-v1","pool":"GOVERNMENT",
                 "criterion_scores":[{"criterion_key":"%s","score":%d,"confidence":0.8,
                   "reason_codes":["t"]}],
                 "overall_confidence":0.8,"uncertainty_flags":[],
                 "summary":"ok","feedback":"fb","recommendation":"%s"}"""
                .formatted(key, score, recommendation);
    }
}
