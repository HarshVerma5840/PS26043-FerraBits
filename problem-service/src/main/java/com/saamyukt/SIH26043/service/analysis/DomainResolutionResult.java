package com.saamyukt.SIH26043.service.analysis;

import java.util.List;

/**
 * Result of a domain resolution attempt.
 *
 * <p>Two cases must be distinguished by the caller:
 * <ul>
 *   <li>{@code resolverStatus == SUCCESS} — the provider returned at least one valid domain id.</li>
 *   <li>{@code resolverStatus == FALLBACK} — the primary provider failed; the deterministic
 *       fallback ran and produced a best-effort answer.</li>
 *   <li>{@code resolverStatus == FAILED} — no answer could be produced at all (should never
 *       reach the caller in normal flow; the orchestrating service converts this to a 400).</li>
 * </ul>
 *
 * <p>Important: {@code resolvedDomainIds} is present-but-empty if the model explicitly replied
 * with no matching domain. That is <em>different</em> from an empty {@code resolvedDomainIds}
 * because the model failed — the caller must distinguish the two to give the right 400 message.
 */
public record DomainResolutionResult(
        /**
         * The UUIDs of the taxonomy nodes that were chosen, in model-relevance order.
         * Never null; may be empty if the model replied with no match.
         */
        List<String> resolvedDomainIds,

        /**
         * Confidence in [0.0, 1.0] as reported by or inferred from the provider.
         * May be null when the provider does not produce a confidence score (e.g. deterministic).
         */
        Double confidence,

        /** The provider that produced this answer (e.g. "GEMINI", "OPENAI_COMPATIBLE", "DETERMINISTIC"). */
        String provider,

        /** The model identifier used (e.g. "gemini-3.1-flash-lite"). Null for deterministic. */
        String model,

        /**
         * The prompt/classification schema version used. Allows reproducibility and auditing.
         * Format: "domain-classifier-v1".
         */
        String classificationVersion,

        /** Whether the primary provider failed and the deterministic fallback was used. */
        boolean fallbackUsed,

        /** Terminal outcome of the resolution attempt. */
        ResolverStatus resolverStatus,

        /**
         * Error category code for observability. Null on success.
         * Never contains API keys or sensitive response content.
         */
        String errorCode,

        /** Wall-clock latency of the LLM call (not including validation). Null for deterministic. */
        Long latencyMs
) {
    public enum ResolverStatus {
        SUCCESS,
        FALLBACK,
        FAILED
    }

    /** Convenience factory: a successful primary resolution. */
    public static DomainResolutionResult success(List<String> ids, Double confidence,
                                                   String provider, String model,
                                                   String classificationVersion, Long latencyMs) {
        return new DomainResolutionResult(
                ids, confidence, provider, model, classificationVersion,
                false, ResolverStatus.SUCCESS, null, latencyMs);
    }

    /** Convenience factory: deterministic fallback was used. */
    public static DomainResolutionResult fallback(List<String> ids, String errorCode) {
        return new DomainResolutionResult(
                ids, null, "DETERMINISTIC", null, "domain-classifier-v1",
                true, ResolverStatus.FALLBACK, errorCode, null);
    }

    /** Convenience factory: complete failure (no answer available). */
    public static DomainResolutionResult failed(String errorCode) {
        return new DomainResolutionResult(
                List.of(), null, "NONE", null, "domain-classifier-v1",
                false, ResolverStatus.FAILED, errorCode, null);
    }
}
