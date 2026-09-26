package com.saamyukt.SIH26043.service.analysis;

import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for {@link DeterministicFallbackDomainResolutionProvider}.
 *
 * <p>This provider must ALWAYS return a result — never throw, never make
 * network calls, never return null.
 */
class DeterministicFallbackDomainResolutionProviderTest {

    private static final UUID HEALTHCARE_ID =
            UUID.fromString("00000000-0000-4000-8000-000000000001");
    private static final UUID WATER_ID =
            UUID.fromString("00000000-0000-4000-8000-000000000003");
    private static final UUID TRANSPORT_ID =
            UUID.fromString("00000000-0000-4000-8000-000000000005");

    private final DeterministicFallbackDomainResolutionProvider provider =
            new DeterministicFallbackDomainResolutionProvider();

    @Test
    void matchesHealthcareKeywords() {
        DomainResolutionResult result = provider.resolve(request(
                "Hospital not accessible",
                "There is no medical doctor in our village. Patients have to travel 50km to the hospital."));

        assertThat(result.resolvedDomainIds()).isNotEmpty();
        assertThat(result.resolvedDomainIds().get(0)).isEqualTo(HEALTHCARE_ID.toString());
        assertThat(result.fallbackUsed()).isTrue();
        assertThat(result.resolverStatus())
                .isEqualTo(DomainResolutionResult.ResolverStatus.FALLBACK);
    }

    @Test
    void matchesWaterKeywordsInHindi() {
        DomainResolutionResult result = provider.resolve(request(
                "Pani ki samasya",
                "Hamare gaon mein hand pump kharab hai aur peene ka pani nahi hai."));

        assertThat(result.resolvedDomainIds()).isNotEmpty();
        assertThat(result.resolvedDomainIds().get(0)).isEqualTo(WATER_ID.toString());
    }

    @Test
    void matchesRoadKeywords() {
        DomainResolutionResult result = provider.resolve(request(
                "Broken road with potholes",
                "The sadak near our village has many ghadde (potholes). Vehicles get damaged."));

        assertThat(result.resolvedDomainIds()).isNotEmpty();
        assertThat(result.resolvedDomainIds().get(0)).isEqualTo(TRANSPORT_ID.toString());
    }

    @Test
    void returnsFirstOptionWhenNoKeywordsMatch() {
        DomainResolutionResult result = provider.resolve(request(
                "Unspecified problem",
                "Something went wrong."));

        // Should still return a non-empty list — never leave caller with empty
        assertThat(result.resolvedDomainIds()).isNotEmpty();
        assertThat(result.fallbackUsed()).isTrue();
        assertThat(result.errorCode()).isEqualTo("NO_KEYWORD_MATCH");
    }

    @Test
    void returnsNoErrorWhenTaxonomyIsEmpty() {
        DomainResolutionResult result = provider.resolve(
                new DomainResolutionRequest("corr-1", "title", "desc", List.of(), List.of()));

        assertThat(result.resolvedDomainIds()).isEmpty();
        assertThat(result.fallbackUsed()).isTrue();
        assertThat(result.errorCode()).isEqualTo("NO_TAXONOMY_OPTIONS");
    }

    @Test
    void selectsMultipleDomainsWhenKeywordsMatchSeveral() {
        DomainResolutionResult result = provider.resolve(request(
                "School has no water or electricity",
                "The school building has no drinking water, the hand pump is broken, "
                        + "and there is a bijli (electricity) problem too. Students suffer."));

        // Should have matched at least Education, Water, and Energy
        assertThat(result.resolvedDomainIds()).hasSizeLessThanOrEqualTo(3);
        assertThat(result.resolvedDomainIds()).hasSizeGreaterThan(1);
    }

    @Test
    void neverExceedsThreeDomains() {
        // Long description touching many domains
        DomainResolutionResult result = provider.resolve(request(
                "Multi-issue village",
                "Hospital needed, crops failing, water contaminated, roads broken, "
                        + "school needs repair, electricity cuts daily, police absent, "
                        + "panchayat office non-functional, jobs unavailable."));

        assertThat(result.resolvedDomainIds()).hasSizeLessThanOrEqualTo(3);
    }

    @Test
    void providerNameIsCorrect() {
        assertThat(provider.providerName()).isEqualTo("DETERMINISTIC");
    }

    // -----------------------------------------------------------------------

    private DomainResolutionRequest request(String title, String description) {
        return new DomainResolutionRequest(
                "test-corr-" + System.nanoTime(),
                title,
                description,
                List.of(),
                List.of(
                        new DomainResolutionRequest.DomainOption(HEALTHCARE_ID, "Healthcare", "Medical services."),
                        new DomainResolutionRequest.DomainOption(
                                UUID.fromString("00000000-0000-4000-8000-000000000002"),
                                "Agriculture & Food", "Farming, food security."),
                        new DomainResolutionRequest.DomainOption(WATER_ID, "Water & Sanitation", "Drinking water."),
                        new DomainResolutionRequest.DomainOption(
                                UUID.fromString("00000000-0000-4000-8000-000000000004"),
                                "Education & Skills", "Schooling."),
                        new DomainResolutionRequest.DomainOption(TRANSPORT_ID, "Transportation & Mobility", "Roads."),
                        new DomainResolutionRequest.DomainOption(
                                UUID.fromString("00000000-0000-4000-8000-000000000006"),
                                "Public Safety & Justice", "Policing."),
                        new DomainResolutionRequest.DomainOption(
                                UUID.fromString("00000000-0000-4000-8000-000000000007"),
                                "Environment & Climate", "Pollution."),
                        new DomainResolutionRequest.DomainOption(
                                UUID.fromString("00000000-0000-4000-8000-000000000008"),
                                "Energy & Utilities", "Power."),
                        new DomainResolutionRequest.DomainOption(
                                UUID.fromString("00000000-0000-4000-8000-000000000009"),
                                "Digital & e-Governance", "Government services."),
                        new DomainResolutionRequest.DomainOption(
                                UUID.fromString("00000000-0000-4000-8000-00000000000A"),
                                "Rural & Urban Development", "Panchayats."),
                        new DomainResolutionRequest.DomainOption(
                                UUID.fromString("00000000-0000-4000-8000-00000000000B"),
                                "Employment & Livelihoods", "Jobs."),
                        new DomainResolutionRequest.DomainOption(
                                UUID.fromString("00000000-0000-4000-8000-00000000000C"),
                                "Tourism & Culture", "Heritage.")
                ));
    }
}
