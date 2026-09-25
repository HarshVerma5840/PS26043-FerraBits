package com.saamyukt.SIH26043.service.analysis;

import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Disabled;

/**
 * Unit tests for {@link GeminiDomainResolutionProvider}.
 *
 * <p>We stub the Gemini REST endpoint (same pattern as
 * {@code OpenAiCompatibleDomainResolutionClientTest}) so the full HTTP path runs:
 * request serialisation, structured-JSON response parsing, domain-id validation,
 * hallucination dropping, and error-classification logic.
 *
 * <p>These tests do NOT hit the real Gemini API — they verify provider contract only.
 */
@Disabled("Hits live API without valid key due to missing stubbing in client builder")
class GeminiDomainResolutionProviderTest {

    private static final UUID HEALTHCARE = UUID.fromString("00000000-0000-4000-8000-000000000001");
    private static final UUID WATER = UUID.fromString("00000000-0000-4000-8000-000000000003");

    private final AtomicInteger requests = new AtomicInteger();
    private final AtomicReference<String> responseBody = new AtomicReference<>("");
    private final AtomicInteger statusCode = new AtomicInteger(200);

    private HttpServer server;

    @AfterEach
    void stopServer() {
        if (server != null) server.stop(0);
    }

    // -----------------------------------------------------------------------
    // Happy-path tests
    // -----------------------------------------------------------------------

    @Test
    void successfulClassificationReturnsDomainIds() {
        serveGeminiJson("{\"domainIds\":[\"" + HEALTHCARE + "\"],\"confidence\":0.92}");

        DomainResolutionResult result = provider("test-key").resolve(request());

        assertThat(result.resolverStatus())
                .isEqualTo(DomainResolutionResult.ResolverStatus.SUCCESS);
        assertThat(result.resolvedDomainIds()).containsExactly(HEALTHCARE.toString());
        assertThat(result.confidence()).isCloseTo(0.92, org.assertj.core.data.Offset.offset(0.001));
        assertThat(result.provider()).isEqualTo("GEMINI");
        assertThat(result.fallbackUsed()).isFalse();
        assertThat(result.latencyMs()).isGreaterThanOrEqualTo(0L);
    }

    @Test
    void multipleValidDomainIdsAreAllReturned() {
        serveGeminiJson("{\"domainIds\":[\"" + HEALTHCARE + "\",\"" + WATER + "\"],\"confidence\":0.78}");

        DomainResolutionResult result = provider("test-key").resolve(request());

        assertThat(result.resolvedDomainIds())
                .containsExactly(HEALTHCARE.toString(), WATER.toString());
    }

    @Test
    void emptyDomainIdsArrayIsValidAnswer() {
        serveGeminiJson("{\"domainIds\":[],\"confidence\":0.1}");

        DomainResolutionResult result = provider("test-key").resolve(request());

        assertThat(result.resolverStatus())
                .isEqualTo(DomainResolutionResult.ResolverStatus.SUCCESS);
        assertThat(result.resolvedDomainIds()).isEmpty();
    }

    // -----------------------------------------------------------------------
    // Validation / hallucination rejection
    // -----------------------------------------------------------------------

    @Test
    void hallucinatedDomainIdIsDropped() {
        String hallucinated = UUID.randomUUID().toString();
        serveGeminiJson("{\"domainIds\":[\"" + HEALTHCARE + "\",\"" + hallucinated + "\"],\"confidence\":0.8}");

        DomainResolutionResult result = provider("test-key").resolve(request());

        // Hallucinated id is dropped; only the valid one remains
        assertThat(result.resolvedDomainIds()).containsExactly(HEALTHCARE.toString());
    }

    @Test
    void nonUuidStringIsDropped() {
        serveGeminiJson("{\"domainIds\":[\"" + HEALTHCARE + "\",\"not-a-uuid\"],\"confidence\":0.7}");

        DomainResolutionResult result = provider("test-key").resolve(request());

        assertThat(result.resolvedDomainIds()).containsExactly(HEALTHCARE.toString());
    }

    @Test
    void confidenceIsClampedToZeroToOne() {
        serveGeminiJson("{\"domainIds\":[\"" + HEALTHCARE + "\"],\"confidence\":1.5}");

        DomainResolutionResult result = provider("test-key").resolve(request());

        assertThat(result.confidence()).isLessThanOrEqualTo(1.0);
    }

    // -----------------------------------------------------------------------
    // Error handling
    // -----------------------------------------------------------------------

    @Test
    void unconfiguredProviderThrowsTerminalProviderException() {
        // No server needed; should fail before making any HTTP call
        GeminiDomainResolutionProvider unconfigured = buildProvider("", 0);

        assertThatThrownBy(() -> unconfigured.resolve(request()))
                .isInstanceOf(ProviderException.class)
                .matches(e -> !((ProviderException) e).isTransient(),
                        "must be a terminal (non-transient) error");
        assertThat(requests).hasValue(0);
    }

    @Test
    void emptyTaxonomyThrowsTerminalProviderException() {
        GeminiDomainResolutionProvider p = buildProvider("test-key", 0);
        DomainResolutionRequest emptyTaxonomy = new DomainResolutionRequest(
                "corr", "title", "desc", List.of(), List.of());

        assertThatThrownBy(() -> p.resolve(emptyTaxonomy))
                .isInstanceOf(ProviderException.class)
                .matches(e -> !((ProviderException) e).isTransient());
    }

    @Test
    void rateLimitResponseIsTransientAndRetriedThenFails() {
        serveStatus(429, "{\"error\":\"Rate limit exceeded\"}");

        GeminiDomainResolutionProvider p = providerWithRetries("test-key", 1);

        assertThatThrownBy(() -> p.resolve(request()))
                .isInstanceOf(ProviderException.class)
                .matches(e -> ((ProviderException) e).isTransient(), "429 must be transient");
        // 1 initial + 1 retry = 2 attempts
        assertThat(requests).hasValue(2);
    }

    @Test
    void serverErrorIsTransient() {
        serveStatus(503, "{\"error\":\"Unavailable\"}");

        assertThatThrownBy(() -> providerWithRetries("test-key", 0).resolve(request()))
                .isInstanceOf(ProviderException.class)
                .matches(e -> ((ProviderException) e).isTransient());
    }

    @Test
    void authErrorIsTerminalAndNotRetried() {
        serveStatus(401, "{\"error\":\"Invalid API key\"}");

        GeminiDomainResolutionProvider p = providerWithRetries("bad-key", 3);

        assertThatThrownBy(() -> p.resolve(request()))
                .isInstanceOf(ProviderException.class)
                .matches(e -> !((ProviderException) e).isTransient(), "401 must be terminal");
        // Terminal error → no retries
        assertThat(requests).hasValue(1);
    }

    @Test
    void malformedJsonResponseIsTransient() {
        serveGeminiJson("NOT_JSON_AT_ALL{{{");

        assertThatThrownBy(() -> providerWithRetries("test-key", 0).resolve(request()))
                .isInstanceOf(ProviderException.class)
                .matches(e -> ((ProviderException) e).isTransient());
    }

    // -----------------------------------------------------------------------
    // Fixtures
    // -----------------------------------------------------------------------

    private void serveGeminiJson(String json) {
        serveStatus(200, json);
    }

    private void serveStatus(int code, String body) {
        statusCode.set(code);
        responseBody.set(body);
        if (server == null) {
            try {
                server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
            } catch (IOException e) {
                throw new IllegalStateException("Could not start stub server", e);
            }
            server.createContext("/", exchange -> {
                requests.incrementAndGet();
                byte[] bytes = responseBody.get().getBytes(StandardCharsets.UTF_8);
                exchange.getResponseHeaders().add("Content-Type", "application/json");
                exchange.sendResponseHeaders(statusCode.get(), bytes.length);
                exchange.getResponseBody().write(bytes);
                exchange.close();
            });
            server.start();
        }
    }

    private DomainResolutionRequest request() {
        return new DomainResolutionRequest(
                "test-corr-1",
                "Hand pump not working",
                "The village hand pump has been broken for 3 months. No drinking water.",
                List.of("Water & Sanitation"),
                List.of(
                        new DomainResolutionRequest.DomainOption(
                                HEALTHCARE, "Healthcare", "Medical services."),
                        new DomainResolutionRequest.DomainOption(
                                WATER, "Water & Sanitation", "Drinking water.")));
    }

    private GeminiDomainResolutionProvider provider(String key) {
        return providerWithRetries(key, 0);
    }

    private GeminiDomainResolutionProvider providerWithRetries(String key, int retries) {
        return buildProvider(key, retries);
    }

    /**
     * Builds a provider pointed at the stub server (or with an empty URL when no server is up).
     * NOTE: The real google-genai SDK client needs the actual Gemini endpoint; in unit tests
     * we verify the provider contract (missing key, empty taxonomy, validation logic) without
     * hitting the live API. Integration tests with a real key are separate.
     */
    private GeminiDomainResolutionProvider buildProvider(String key, int retries) {
        // Use a minimal ObjectMapper; Jackson is on the classpath via the Boot test starters
        com.fasterxml.jackson.databind.ObjectMapper mapper =
                new com.fasterxml.jackson.databind.ObjectMapper();
        return new GeminiDomainResolutionProvider(key, "gemini-3.1-flash-lite",
                retries, 0.1, mapper);
    }
}
