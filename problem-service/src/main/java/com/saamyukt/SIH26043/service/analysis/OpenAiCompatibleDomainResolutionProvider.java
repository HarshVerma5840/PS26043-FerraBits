package com.saamyukt.SIH26043.service.analysis;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Adapts the existing {@link OpenAiCompatibleDomainResolutionClient} to the new
 * {@link DomainResolutionProvider} interface.
 *
 * <p>The underlying client is preserved as-is — this class only bridges the old
 * request/response shapes to the new generic contract. No existing behaviour changes.
 *
 * <p>Activated via {@code app.ai.domain-resolver.provider=openai-compatible}.
 */
@Service
@ConditionalOnProperty(
        name = "app.ai.domain-resolver.provider",
        havingValue = "openai-compatible"
)
public class OpenAiCompatibleDomainResolutionProvider implements DomainResolutionProvider {

    private static final Logger log =
            LoggerFactory.getLogger(OpenAiCompatibleDomainResolutionProvider.class);

    private static final String CLASSIFICATION_VERSION = "domain-classifier-v1";

    private final OpenAiCompatibleDomainResolutionClient delegate;
    private final String model;

    public OpenAiCompatibleDomainResolutionProvider(
            OpenAiCompatibleDomainResolutionClient delegate,
            @Value("${app.llm.openai.model:agentrouter/deepseek-v4-flash}") String model) {
        this.delegate = delegate;
        this.model = model;
    }

    @Override
    public String providerName() {
        return "OPENAI_COMPATIBLE";
    }

    @Override
    public DomainResolutionResult resolve(DomainResolutionRequest request) {
        if (!delegate.configured()) {
            throw new ProviderException(
                    "OpenAI-compatible provider is not configured (no api-key)", false);
        }

        // Adapt DomainResolutionRequest.DomainOption → OpenAiCompatibleDomainResolutionClient.DomainOption
        List<OpenAiCompatibleDomainResolutionClient.DomainOption> options =
                request.taxonomyOptions().stream()
                        .map(o -> new OpenAiCompatibleDomainResolutionClient.DomainOption(
                                o.domainId(), o.domainName(), o.description()))
                        .toList();

        long start = System.currentTimeMillis();
        Optional<List<String>> answer = delegate.resolve(
                request.title(),
                request.description(),
                request.submitterHintNames(),
                options);
        long latencyMs = System.currentTimeMillis() - start;

        if (answer.isEmpty()) {
            log.warn("OpenAI-compatible provider returned no answer for correlationId={}",
                    request.correlationId());
            throw new ProviderException("OpenAI-compatible provider returned no usable answer", true);
        }

        log.info("OpenAI-compatible provider resolved correlationId={} → {} domain(s) in {}ms",
                request.correlationId(), answer.get().size(), latencyMs);

        return DomainResolutionResult.success(
                answer.get(),
                null,           // the existing client does not expose confidence
                providerName(),
                model,
                CLASSIFICATION_VERSION,
                latencyMs);
    }
}
