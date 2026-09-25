package com.saamyukt.SIH26043.capabilitymatching.config;

import com.saamyukt.SIH26043.capabilitymatching.service.HttpEmbeddingProvider;
import com.saamyukt.SIH26043.capabilitymatching.service.MockEmbeddingProvider;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

import static org.assertj.core.api.Assertions.assertThat;

public class EmbeddingProviderConfigTest {

    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withUserConfiguration(EmbeddingProviderConfig.class);

    @Test
    void testMockProviderSelection() {
        contextRunner
                .withPropertyValues("embedding.provider=mock")
                .run(context -> {
                    assertThat(context).hasSingleBean(MockEmbeddingProvider.class);
                    assertThat(context).doesNotHaveBean(HttpEmbeddingProvider.class);
                });
    }

    @Test
    void testHttpProviderSelection() {
        contextRunner
                .withPropertyValues("embedding.provider=http", "embedding.api.url=http://localhost")
                .run(context -> {
                    assertThat(context).hasSingleBean(HttpEmbeddingProvider.class);
                    assertThat(context).doesNotHaveBean(MockEmbeddingProvider.class);
                });
    }

    @Test
    void testInvalidProviderConfiguration() {
        contextRunner
                .withPropertyValues("embedding.provider=invalid")
                .run(context -> {
                    assertThat(context).hasFailed();
                    assertThat(context.getStartupFailure()).hasMessageContaining("Invalid or missing embedding.provider configuration");
                });
    }

    @Test
    void testHttpProviderWithoutUrlFails() {
        contextRunner
                .withPropertyValues("embedding.provider=http", "embedding.api.url=")
                .run(context -> {
                    assertThat(context).hasFailed();
                    assertThat(context.getStartupFailure()).hasMessageContaining("embedding.api.url must be configured");
                });
    }
}
