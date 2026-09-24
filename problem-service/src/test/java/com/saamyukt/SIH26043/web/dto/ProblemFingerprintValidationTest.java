package com.saamyukt.SIH26043.web.dto;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.exc.UnrecognizedPropertyException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ProblemFingerprintValidationTest {

    private Validator validator;
    private ObjectMapper mapper;

    @BeforeEach
    void setUp() {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
        mapper = new ObjectMapper();
    }

    private ProblemFingerprintPayload createValidPayload() {
        return new ProblemFingerprintPayload(
                UUID.randomUUID(),
                1,
                "Infrastructure",
                "Roads",
                "Pothole",
                8,
                "HIGH",
                List.of("Repair"),
                List.of("Weather"),
                List.of(new ProblemFingerprintPayload.RequiredCapability("Masonry", 5)),
                List.of("Tractor"),
                "Villagers",
                "Fixed road",
                new ProblemFingerprintPayload.GeographicContext("RURAL", "Near temple"),
                new ProblemFingerprintPayload.EvidenceSummary(1, 0, 0, 0, "Photo of pothole"),
                0.95,
                List.of("Assumed safe"),
                List.of(),
                List.of(),
                Map.of("model", "gpt-4")
        );
    }

    @Test
    void testValidFingerprint() {
        ProblemFingerprintPayload payload = createValidPayload();
        Set<ConstraintViolation<ProblemFingerprintPayload>> violations = validator.validate(payload);
        assertThat(violations).isEmpty();
    }

    @Test
    void testMissingRequiredField() {
        ProblemFingerprintPayload payload = new ProblemFingerprintPayload(
                null, // Missing problemId
                1,
                "Infrastructure",
                null, null, 8, null, null, null, null, null, null, null, null, null, null, null, null, null, null
        );
        Set<ConstraintViolation<ProblemFingerprintPayload>> violations = validator.validate(payload);
        assertThat(violations).isNotEmpty();
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("problemId"));
    }

    @Test
    void testInvalidUrgencyScore() {
        ProblemFingerprintPayload payload = new ProblemFingerprintPayload(
                UUID.randomUUID(), 1, "Infrastructure", null, null, 11, null, null, null, null, null, null, null, null, null, null, null, null, null, null
        );
        Set<ConstraintViolation<ProblemFingerprintPayload>> violations = validator.validate(payload);
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("urgencyScore"));
    }

    @Test
    void testEmptyCapability() {
        ProblemFingerprintPayload payload = new ProblemFingerprintPayload(
                UUID.randomUUID(), 1, "Infrastructure", null, null, 5, null, null, null,
                List.of(new ProblemFingerprintPayload.RequiredCapability("", 5)), // Empty skill
                null, null, null, null, null, null, null, null, null, null
        );
        Set<ConstraintViolation<ProblemFingerprintPayload>> violations = validator.validate(payload);
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().contains("skill"));
    }

    @Test
    void testOversizedArray() {
        List<String> largeList = java.util.stream.IntStream.range(0, 15).mapToObj(String::valueOf).toList();
        ProblemFingerprintPayload payload = new ProblemFingerprintPayload(
                UUID.randomUUID(), 1, "Infrastructure", null, null, 5, null, largeList, null, null, null, null, null, null, null, null, null, null, null, null
        );
        Set<ConstraintViolation<ProblemFingerprintPayload>> violations = validator.validate(payload);
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("interventionTypes"));
    }

    @Test
    void testUnknownSchemaFieldRejection() throws Exception {
        String json = """
            {
                "problemId": "123e4567-e89b-12d3-a456-426614174000",
                "fingerprintVersion": 1,
                "domain": "Infrastructure",
                "urgencyScore": 5,
                "fakeUnknownField": "Should be rejected"
            }
        """;
        
        assertThrows(UnrecognizedPropertyException.class, () -> mapper.readValue(json, ProblemFingerprintPayload.class));
    }
}
