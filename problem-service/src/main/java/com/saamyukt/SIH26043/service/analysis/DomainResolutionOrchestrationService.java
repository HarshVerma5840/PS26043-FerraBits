package com.saamyukt.SIH26043.service.analysis;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Orchestrates domain resolution with a fallback chain:
 * <ol>
 *   <li>Primary provider (Gemini, OpenAI-compatible, or deterministic as configured)</li>
 *   <li>Deterministic fallback if the primary fails with a transient error</li>
 *   <li>Deterministic fallback if the primary throws an unexpected error</li>
 * </ol>
 *
 * <p>The contract with the caller ({@code AutoUniversitySelectionService}) is preserved:
 * this service never throws for transient provider errors — it degrades gracefully.
 * Terminal errors (e.g. "no domain options") are still propagated as
 * {@link ProviderException} because they indicate a deployment misconfiguration.
 *
 * <p>Observability: every resolution attempt is logged with problem id, provider,
 * latency, and whether fallback was used. API keys are never logged.
 */
@Service
public class DomainResolutionOrchestrationService {

    private static final Logger log =
            LoggerFactory.getLogger(DomainResolutionOrchestrationService.class);

    private final DomainResolutionProvider primaryProvider;
    private final DeterministicFallbackDomainResolutionProvider deterministicFallback;

    public DomainResolutionOrchestrationService(
            DomainResolutionProvider primaryProvider,
            DeterministicFallbackDomainResolutionProvider deterministicFallback) {
        this.primaryProvider = primaryProvider;
        this.deterministicFallback = deterministicFallback;
    }

    /**
     * Resolves the taxonomy domains for a problem.
     *
     * @param request the classification input (title, description, taxonomy options)
     * @return a result with resolved domain ids, provider name, confidence, and fallback indicator
     */
    public DomainResolutionResult resolve(DomainResolutionRequest request) {
        String correlationId = request.correlationId() != null
                ? request.correlationId()
                : UUID.randomUUID().toString();

        log.debug("Domain resolution starting: correlationId={}, provider={}",
                correlationId, primaryProvider.providerName());

        // If the primary is already the deterministic provider, skip the fallback logic
        boolean primaryIsDeterministic =
                "DETERMINISTIC".equals(primaryProvider.providerName());

        if (primaryIsDeterministic) {
            return primaryProvider.resolve(request);
        }

        // Try primary (AI) provider
        try {
            DomainResolutionResult result = primaryProvider.resolve(request);
            log.info("Domain resolution success: correlationId={}, provider={}, "
                    + "domains={}, confidence={}, latencyMs={}",
                    correlationId, result.provider(),
                    result.resolvedDomainIds().size(), result.confidence(), result.latencyMs());
            return result;

        } catch (ProviderException pe) {
            if (!pe.isTransient()) {
                // Terminal errors from the primary (e.g. unconfigured, auth failure)
                // fall through to deterministic so the submission flow is never broken.
                log.warn("Primary provider terminal error — falling back to deterministic: "
                        + "correlationId={}, error={}", correlationId, pe.getMessage());
            } else {
                log.warn("Primary provider transient error — falling back to deterministic: "
                        + "correlationId={}, error={}", correlationId, pe.getMessage());
            }
        } catch (Exception e) {
            log.error("Primary provider unexpected error — falling back to deterministic: "
                    + "correlationId={}", correlationId, e);
        }

        // Deterministic fallback
        DomainResolutionResult fallbackResult = deterministicFallback.resolve(request);
        log.info("Domain resolution via deterministic fallback: correlationId={}, domains={}",
                correlationId, fallbackResult.resolvedDomainIds().size());
        return fallbackResult;
    }
}
