package com.saamyukt.SIH26043.service;

import com.saamyukt.SIH26043.entity.Evidence;
import com.saamyukt.SIH26043.entity.Problem;
import com.saamyukt.SIH26043.enums.EvidenceType;
import com.saamyukt.SIH26043.enums.KycStatus;
import com.saamyukt.SIH26043.enums.ProblemStatus;
import com.saamyukt.SIH26043.enums.UserRole;
import com.saamyukt.SIH26043.exception.ApiException;
import com.saamyukt.SIH26043.repository.EvidenceRepository;
import com.saamyukt.SIH26043.repository.ProblemRepository;
import com.saamyukt.SIH26043.security.AuthUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.file.Path;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class EvidenceUploadServiceTest {

    private final EvidenceRepository evidenceRepository = mock(EvidenceRepository.class);
    private final ProblemRepository problemRepository = mock(ProblemRepository.class);
    private final AuditService auditService = mock(AuditService.class);

    @TempDir
    Path tempDir;

    private EvidenceUploadService service;
    private AuthUser me;
    private Problem draft;

    @BeforeEach
    void setUp() {
        service = new EvidenceUploadService(
                evidenceRepository, problemRepository, auditService,
                tempDir.toString(), 50000, new String[]{"image/jpeg", "image/png", "application/pdf"}
        );
        me = new AuthUser(UUID.randomUUID(), "9876543210", UserRole.SUBMITTER, KycStatus.VERIFIED);
        draft = new Problem();
        draft.setProblemId(UUID.randomUUID());
        draft.setSubmittedByUserId(me.getUserId());
        draft.setStatus(ProblemStatus.DRAFT);
    }

    @Test
    void shouldUploadSuccessfully() {
        when(problemRepository.findById(draft.getProblemId())).thenReturn(Optional.of(draft));
        MockMultipartFile file = new MockMultipartFile("file", "test.jpg", "image/jpeg", "hello world".getBytes());

        Evidence e = service.upload(draft.getProblemId(), file, EvidenceType.PHOTO, "client123", me, "127.0.0.1");

        assertThat(e.getFileUrl()).startsWith(tempDir.toString());
        assertThat(e.getClientUploadId()).isEqualTo("client123");
        verify(evidenceRepository).save(any(Evidence.class));
    }

    @Test
    void shouldRejectOversizedFile() {
        byte[] large = new byte[50001]; // max is 50000
        MockMultipartFile file = new MockMultipartFile("file", "test.jpg", "image/jpeg", large);

        assertThatThrownBy(() -> service.upload(draft.getProblemId(), file, EvidenceType.PHOTO, null, me, "127.0.0.1"))
                .isInstanceOf(ApiException.class)
                .extracting(ex -> ((ApiException) ex).getStatus())
                .isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void shouldRejectUnsupportedMimeType() {
        MockMultipartFile file = new MockMultipartFile("file", "test.txt", "text/plain", "hello".getBytes());
        
        assertThatThrownBy(() -> service.upload(draft.getProblemId(), file, EvidenceType.DOCUMENT, null, me, "127.0.0.1"))
                .isInstanceOf(ApiException.class)
                .extracting(ex -> ((ApiException) ex).getStatus())
                .isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void shouldRejectEmptyFile() {
        MockMultipartFile file = new MockMultipartFile("file", "test.jpg", "image/jpeg", new byte[0]);
        
        assertThatThrownBy(() -> service.upload(draft.getProblemId(), file, EvidenceType.PHOTO, null, me, "127.0.0.1"))
                .isInstanceOf(ApiException.class)
                .extracting(ex -> ((ApiException) ex).getStatus())
                .isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void shouldReturnExistingOnDuplicateClientUploadId() {
        when(problemRepository.findById(draft.getProblemId())).thenReturn(Optional.of(draft));
        MockMultipartFile file = new MockMultipartFile("file", "test.jpg", "image/jpeg", "hello".getBytes());
        
        Evidence existing = new Evidence();
        when(evidenceRepository.findByProblemIdAndClientUploadId(draft.getProblemId(), "client123"))
                .thenReturn(Optional.of(existing));

        Evidence e = service.upload(draft.getProblemId(), file, EvidenceType.PHOTO, "client123", me, "127.0.0.1");

        assertThat(e).isSameAs(existing);
        verify(evidenceRepository, never()).save(any(Evidence.class));
    }

    @Test
    void shouldRejectPathTraversalAttempt() {
        when(problemRepository.findById(draft.getProblemId())).thenReturn(Optional.of(draft));
        // The service sanitizes filenames by replacing non-alphanumeric with _, so traversal fails implicitly.
        MockMultipartFile file = new MockMultipartFile("file", "../../../etc/passwd", "image/jpeg", "hello".getBytes());

        Evidence e = service.upload(draft.getProblemId(), file, EvidenceType.PHOTO, null, me, "127.0.0.1");
        
        // Assert that the filename was sanitized safely, stripping ../
        assertThat(e.getFileUrl()).doesNotContain("..");
    }
}
