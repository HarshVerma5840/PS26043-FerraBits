package com.saamyukt.SIH26043.service.analysis;

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
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
@ConditionalOnProperty(name = "app.analysis.translate.provider", havingValue = "bhashini")
public class BhashiniTranslationProvider implements TranslationProvider {

    private static final Logger log = LoggerFactory.getLogger(BhashiniTranslationProvider.class);

    private final String endpoint;
    private final String apiKey;
    private final String serviceId;
    private final int timeoutSeconds;

    private volatile RestClient restClient;

    public BhashiniTranslationProvider(
            @Value("${app.analysis.translate.bhashini.endpoint:}") String endpoint,
            @Value("${app.analysis.translate.bhashini.api-key:}") String apiKey,
            @Value("${app.analysis.translate.bhashini.service-id:}") String serviceId,
            @Value("${app.analysis.translate.bhashini.timeout-seconds:30}") int timeoutSeconds) {
        this.endpoint = endpoint;
        this.apiKey = apiKey;
        this.serviceId = serviceId;
        this.timeoutSeconds = timeoutSeconds;
    }

    @Override
    public String providerName() {
        return "BHASHINI_TRANSLATE";
    }

    @Override
    public TranslationResult translate(TranslationRequest request) {
        if (endpoint == null || endpoint.isBlank() || apiKey == null || apiKey.isBlank()) {
            throw new ProviderException("BHASHINI translate provider is not fully configured", false);
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("text", request.originalText());
        body.put("sourceLanguage", request.sourceLanguage() != null ? request.sourceLanguage() : "hi");
        body.put("targetLanguage", request.targetLanguage() != null ? request.targetLanguage() : "en");
        body.put("serviceId", serviceId);

        Map responseBody;
        try {
            responseBody = restClient().post()
                    .uri(endpoint)
                    .contentType(MediaType.APPLICATION_JSON)
                    .header(HttpHeaders.AUTHORIZATION, apiKey)
                    .body(body)
                    .retrieve()
                    .body(Map.class);
        } catch (ProviderException e) {
            throw e;
        } catch (Exception e) {
            log.error("BHASHINI translation unexpected failure for correlationId={}", request.correlationId(), e);
            throw new ProviderException("Unexpected provider error: " + e.getMessage(), e, true);
        }

        if (responseBody == null) {
            throw new ProviderException("Empty response from BHASHINI translation", true);
        }

        String transcript = (String) responseBody.getOrDefault("translatedText", "");
        String detectedLang = (String) responseBody.getOrDefault("sourceLanguage", request.sourceLanguage());
        Double confidence = responseBody.containsKey("confidence") ? ((Number) responseBody.get("confidence")).doubleValue() : null;
        String requestId = (String) responseBody.get("requestId");

        // Strip raw tokens/secrets if any happen to echo back
        responseBody.remove("apiKey");

        return new TranslationResult(
                transcript,
                detectedLang,
                request.targetLanguage(),
                confidence,
                providerName(),
                requestId,
                Instant.now(),
                responseBody
        );
    }

    private RestClient restClient() {
        if (restClient == null) {
            synchronized (this) {
                if (restClient == null) {
                    SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
                    factory.setConnectTimeout(Duration.ofSeconds(5));
                    factory.setReadTimeout(Duration.ofSeconds(timeoutSeconds));

                    restClient = RestClient.builder()
                            .requestFactory(factory)
                            .defaultStatusHandler(status -> status.isError(), (request, response) -> {
                                HttpStatusCode status = response.getStatusCode();
                                boolean transientErr = status.is5xxServerError() || status == HttpStatus.REQUEST_TIMEOUT || status == HttpStatus.TOO_MANY_REQUESTS;
                                throw new ProviderException("BHASHINI Translate API returned " + status, transientErr);
                            })
                            .build();
                }
            }
        }
        return restClient;
    }
}
