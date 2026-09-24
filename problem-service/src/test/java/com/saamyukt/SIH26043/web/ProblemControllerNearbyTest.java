package com.saamyukt.SIH26043.web;

import com.saamyukt.SIH26043.entity.Location;
import com.saamyukt.SIH26043.entity.Problem;
import com.saamyukt.SIH26043.enums.ProblemStatus;
import com.saamyukt.SIH26043.exception.ApiException;
import com.saamyukt.SIH26043.repository.EvidenceRepository;
import com.saamyukt.SIH26043.repository.LocationRepository;
import com.saamyukt.SIH26043.repository.ProblemRepository;
import com.saamyukt.SIH26043.service.EvidenceUploadService;
import com.saamyukt.SIH26043.service.ProblemStatusService;
import com.saamyukt.SIH26043.service.ProblemSubmissionService;
import com.saamyukt.SIH26043.web.dto.PublicProblemSummary;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ProblemControllerNearbyTest {

    private final ProblemSubmissionService submissionService = mock(ProblemSubmissionService.class);
    private final ProblemStatusService statusService = mock(ProblemStatusService.class);
    private final ProblemRepository problemRepository = mock(ProblemRepository.class);
    private final LocationRepository locationRepository = mock(LocationRepository.class);
    private final EvidenceUploadService evidenceUploadService = mock(EvidenceUploadService.class);
    private final EvidenceRepository evidenceRepository = mock(EvidenceRepository.class);

    private ProblemController controller;

    @BeforeEach
    void setUp() {
        controller = new ProblemController(submissionService, statusService, problemRepository, locationRepository, evidenceUploadService, evidenceRepository, org.mockito.Mockito.mock(com.saamyukt.SIH26043.service.AuditService.class), org.mockito.Mockito.mock(com.saamyukt.SIH26043.repository.ProblemFingerprintVersionRepository.class), org.mockito.Mockito.mock(com.saamyukt.SIH26043.service.analysis.Batch2OrchestrationWorkflowService.class));
        ReflectionTestUtils.setField(controller, "maxRadiusKm", 50.0);
        ReflectionTestUtils.setField(controller, "defaultRadiusKm", 5.0);
    }

    @Test
    void shouldRejectInvalidCoordinates() {
        assertThatThrownBy(() -> controller.getNearbyProblems(-100, 0, null, null, Pageable.unpaged()))
                .isInstanceOf(ApiException.class)
                .extracting(ex -> ((ApiException) ex).getStatus())
                .isEqualTo(HttpStatus.BAD_REQUEST);

        assertThatThrownBy(() -> controller.getNearbyProblems(0, 200, null, null, Pageable.unpaged()))
                .isInstanceOf(ApiException.class)
                .extracting(ex -> ((ApiException) ex).getStatus())
                .isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void shouldRejectInvalidRadius() {
        assertThatThrownBy(() -> controller.getNearbyProblems(10, 10, -5.0, null, Pageable.unpaged()))
                .isInstanceOf(ApiException.class)
                .extracting(ex -> ((ApiException) ex).getStatus())
                .isEqualTo(HttpStatus.BAD_REQUEST);

        assertThatThrownBy(() -> controller.getNearbyProblems(10, 10, 100.0, null, Pageable.unpaged()))
                .isInstanceOf(ApiException.class)
                .extracting(ex -> ((ApiException) ex).getStatus())
                .isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void shouldReturnSanitizedSummaries() {
        Problem p = new Problem();
        p.setProblemId(UUID.randomUUID());
        p.setTitle("Test Problem");
        p.setDescription("Desc");
        p.setStatus(ProblemStatus.SUBMITTED);
        p.setLocationId(UUID.randomUUID());
        p.setSubmittedAt(Instant.now());

        Location l = new Location();
        l.setDistrict("Pune");
        l.setBlockTehsil("Haveli");

        when(problemRepository.findNearbyProblems(eq(18.5204), eq(73.8567), eq(5.0), eq(null), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(p)));
        
        when(locationRepository.findById(p.getLocationId())).thenReturn(Optional.of(l));

        Page<PublicProblemSummary> page = controller.getNearbyProblems(18.5204, 73.8567, null, null, Pageable.unpaged());

        assertThat(page.getContent()).hasSize(1);
        PublicProblemSummary summary = page.getContent().get(0);
        assertThat(summary.title()).isEqualTo("Test Problem");
        assertThat(summary.approximateLocation()).isEqualTo("Haveli, Pune");
        // Ensure nothing private is exposed, such as accurate location or owner info.
        // We do this by ensuring the response type is PublicProblemSummary.
    }

    @Test
    void shouldReturnUnknownLocationWhenNoLocationData() {
        Problem p = new Problem();
        p.setProblemId(UUID.randomUUID());
        p.setTitle("Test Problem 2");
        p.setStatus(ProblemStatus.SUBMITTED);
        // no location attached

        when(problemRepository.findNearbyProblems(eq(18.5204), eq(73.8567), eq(5.0), eq(null), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(p)));
        
        Page<PublicProblemSummary> page = controller.getNearbyProblems(18.5204, 73.8567, null, null, Pageable.unpaged());

        assertThat(page.getContent()).hasSize(1);
        PublicProblemSummary summary = page.getContent().get(0);
        assertThat(summary.approximateLocation()).isEqualTo("Unknown Location");
    }
}
