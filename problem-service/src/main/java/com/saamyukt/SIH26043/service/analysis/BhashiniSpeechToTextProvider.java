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
import org.springframework.core.io.InputStreamResource;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Service
@ConditionalOnProperty(name = "app.analysis.speech.provider", havingValue = "bhashini")
public class BhashiniSpeechToTextProvider implements SpeechToTextProvider {

    private static final Logger log = LoggerFactory.getLogger(BhashiniSpeechToTextProvider.class);

    private final String endpoint;
    private final String apiKey;
    private final String serviceId;
    private final int timeoutSeconds;

    private volatile RestClient restClient;

    public BhashiniSpeechToTextProvider(
            @Value("${app.analysis.speech.bhashini.endpoint:}") String endpoint,
            @Value("${app.analysis.speech.bhashini.api-key:}") String apiKey,
            @Value("${app.analysis.speech.bhashini.service-id:}") String serviceId,
            @Value("${app.analysis.speech.bhashini.timeout-seconds:30}") int timeoutSeconds) {
        this.endpoint = endpoint;
        this.apiKey = apiKey;
        this.serviceId = serviceId;
        this.timeoutSeconds = timeoutSeconds;
    }

    @Override
    public String providerName() {
        return "BHASHINI";
    }

    @Override
    public TranscriptionResult transcribe(TranscriptionRequest request) {
        if (endpoint == null || endpoint.isBlank() || apiKey == null || apiKey.isBlank()) {
            throw new ProviderException("BHASHINI provider is not fully configured", false);
        }

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new InputStreamResource(request.audioStream()) {
            @Override
            public String getFilename() {
                return request.evidenceId().toString();
            }
        });
        body.add("serviceId", serviceId);
        if (request.declaredLanguage() != null && !request.declaredLanguage().isBlank()) {
            body.add("sourceLanguage", request.declaredLanguage());
        }

        Map responseBody;
        try {
            responseBody = restClient().post()
                    .uri(endpoint)
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .header(HttpHeaders.AUTHORIZATION, apiKey)
                    .body(body)
                    .retrieve()
                    .body(Map.class);
        } catch (ProviderException e) {
            throw e;
        } catch (Exception e) {
            log.error("BHASHINI unexpected failure for correlationId={}", request.correlationId(), e);
            throw new ProviderException("Unexpected provider error: " + e.getMessage(), e, true);
        }

        if (responseBody == null) {
            throw new ProviderException("Empty response from BHASHINI", true);
        }

        String transcript = (String) responseBody.getOrDefault("transcript", "");
        String detectedLang = (String) responseBody.getOrDefault("language", "unknown");
        Double confidence = responseBody.containsKey("confidence") ? ((Number) responseBody.get("confidence")).doubleValue() : null;
        String requestId = (String) responseBody.get("requestId");

        return new TranscriptionResult(
                transcript,
                detectedLang,
                confidence,
                providerName(),
                requestId,
                responseBody,
                Instant.now()
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
                                throw new ProviderException("BHASHINI API returned " + status, transientErr);
                            })
                            .build();
                }
            }
        }
        return restClient;
    }
}
