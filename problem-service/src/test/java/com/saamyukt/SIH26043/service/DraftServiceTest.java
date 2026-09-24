package com.saamyukt.SIH26043.service;

import com.saamyukt.SIH26043.client.SourceAccountGateway;
import com.saamyukt.SIH26043.entity.Problem;
import com.saamyukt.SIH26043.enums.KycStatus;
import com.saamyukt.SIH26043.enums.ProblemStatus;
import com.saamyukt.SIH26043.enums.Urgency;
import com.saamyukt.SIH26043.enums.UserRole;
import com.saamyukt.SIH26043.exception.ApiException;
import com.saamyukt.SIH26043.internal.SourceAccountResponse;
import com.saamyukt.SIH26043.repository.LocationRepository;
import com.saamyukt.SIH26043.repository.ProblemRepository;
import com.saamyukt.SIH26043.security.AuthUser;
import com.saamyukt.SIH26043.web.dto.ProblemSubmitRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class DraftServiceTest {

    private final ProblemRepository problemRepository = mock(ProblemRepository.class);
    private final LocationRepository locationRepository = mock(LocationRepository.class);
    private final SourceAccountGateway sourceAccountGateway = mock(SourceAccountGateway.class);
    private final AuditService auditService = mock(AuditService.class);

    private DraftService draftService;
    private AuthUser submitter;

    @BeforeEach
    void setUp() {
        draftService = new DraftService(problemRepository, locationRepository, sourceAccountGateway, auditService);
        submitter = new AuthUser(UUID.randomUUID(), "9876543210", UserRole.SUBMITTER, KycStatus.VERIFIED);
    }

    @Test
    void shouldCreateDraftSuccessfully() {
        UUID sourceAccountId = UUID.randomUUID();
        ProblemSubmitRequest req = new ProblemSubmitRequest(
                "Title", "Desc", Urgency.IMMEDIATE, null, null, null, null,
                sourceAccountId, null, null, null, null, null, "key123"
        );

        when(sourceAccountGateway.fetch(sourceAccountId))
                .thenReturn(new SourceAccountResponse(UUID.randomUUID(), submitter.getUserId(), UUID.randomUUID(), "ACTIVE", "VERIFIED", "GOVT", "DEPARTMENT", "Dept", true));
        when(problemRepository.existsBySubmittedByUserIdAndIdempotencyKey(submitter.getUserId(), "key123"))
                .thenReturn(false);

        Problem draft = draftService.saveDraft(req, submitter, "127.0.0.1");

        assertThat(draft.getStatus()).isEqualTo(ProblemStatus.DRAFT);
        assertThat(draft.getIdempotencyKey()).isEqualTo("key123");
        verify(problemRepository).save(any(Problem.class));
    }

    @Test
    void shouldRejectDuplicateIdempotencyKey() {
        UUID sourceAccountId = UUID.randomUUID();
        ProblemSubmitRequest req = new ProblemSubmitRequest(
                "Title", "Desc", Urgency.IMMEDIATE, null, null, null, null,
                sourceAccountId, null, null, null, null, null, "key123"
        );

        when(sourceAccountGateway.fetch(sourceAccountId))
                .thenReturn(new SourceAccountResponse(UUID.randomUUID(), submitter.getUserId(), UUID.randomUUID(), "ACTIVE", "VERIFIED", "GOVT", "DEPARTMENT", "Dept", true));
        when(problemRepository.existsBySubmittedByUserIdAndIdempotencyKey(submitter.getUserId(), "key123"))
                .thenReturn(true);

        assertThatThrownBy(() -> draftService.saveDraft(req, submitter, "127.0.0.1"))
                .isInstanceOf(ApiException.class)
                .extracting(ex -> ((ApiException) ex).getStatus())
                .isEqualTo(HttpStatus.CONFLICT);

        verify(problemRepository, never()).save(any(Problem.class));
    }
}
