package com.saamyukt.SIH26043.web.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@JsonIgnoreProperties(ignoreUnknown = false)
public record ProblemFingerprintPayload(
        @NotNull UUID problemId,
        @NotNull @Min(1) Integer fingerprintVersion,
        @NotBlank @Size(max = 100) String domain,
        @Size(max = 100) String subDomain,
        @Size(max = 100) String problemType,
        @NotNull @Min(1) @Max(10) Integer urgencyScore,
        @Size(max = 50) String severity,
        @Size(max = 10) List<@NotBlank @Size(max = 100) String> interventionTypes,
        @Size(max = 10) List<@NotBlank @Size(max = 200) String> inferredRootCauses,
        @Size(max = 10) @Valid List<RequiredCapability> requiredCapabilities,
        @Size(max = 10) List<@NotBlank @Size(max = 100) String> requiredEquipment,
        @Size(max = 200) String affectedPopulation,
        @Size(max = 500) String expectedOutcome,
        @Valid GeographicContext geographicContext,
        @Valid EvidenceSummary evidenceSummary,
        @Min(0) @Max(1) Double confidence,
        @Size(max = 5) List<@NotBlank @Size(max = 200) String> assumptions,
        @Size(max = 5) List<@NotBlank @Size(max = 100) String> ambiguityFlags,
        @Size(max = 5) List<@NotBlank @Size(max = 100) String> safetyFlags,
        Map<String, Object> extractionModelMetadata
) {
    public record RequiredCapability(
            @NotBlank @Size(max = 100) String skill,
            @NotNull @Min(1) @Max(5) Integer importance
    ) {}

    public record GeographicContext(
            @Size(max = 100) String regionType,
            @Size(max = 200) String localizedFeatures
    ) {}

    public record EvidenceSummary(
            int photoCount,
            int videoCount,
            int documentCount,
            int audioCount,
            @Size(max = 500) String descriptiveSummary
    ) {}
}
