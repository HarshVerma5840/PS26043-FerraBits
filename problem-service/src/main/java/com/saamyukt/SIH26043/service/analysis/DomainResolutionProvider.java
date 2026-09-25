package com.saamyukt.SIH26043.service.analysis;

/**
 * Provider abstraction for AI-assisted domain taxonomy resolution.
 *
 * <p>Mirrors the existing {@link ProblemFingerprintProvider} pattern.
 * Implementations are selected via {@code app.ai.domain-resolver.provider}:
 * <ul>
 *   <li>{@code gemini} → {@link GeminiDomainResolutionProvider}</li>
 *   <li>{@code openai-compatible} → {@link OpenAiCompatibleDomainResolutionProvider}</li>
 *   <li>{@code deterministic} (default) → {@link DeterministicFallbackDomainResolutionProvider}</li>
 * </ul>
 *
 * <p>A provider MUST NOT throw to its caller for transient errors; it must
 * either return a valid {@link DomainResolutionResult} or throw a
 * {@link ProviderException} with the correct {@code isTransient} flag so
 * the orchestrating service can decide whether to retry or fall back.
 */
public interface DomainResolutionProvider {

    /**
     * A stable, loggable name for this provider.
     * Examples: "GEMINI", "OPENAI_COMPATIBLE", "DETERMINISTIC".
     */
    String providerName();

    /**
     * Resolves the taxonomy domains for the given request.
     *
     * @param request the classification input (title, description, taxonomy options)
     * @return a resolution result containing resolved domain ids, confidence,
     *         provider metadata, and resolver status
     * @throws ProviderException for transient (retryable) or terminal (non-retryable) errors
     */
    DomainResolutionResult resolve(DomainResolutionRequest request);
}
