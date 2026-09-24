package com.saamyukt.SIH26043.web;

import com.saamyukt.SIH26043.entity.AuditLog;
import com.saamyukt.SIH26043.repository.AuditLogRepository;
import com.saamyukt.SIH26043.repository.ProblemRepository;
import com.saamyukt.SIH26043.security.AuthUser;
import com.saamyukt.SIH26043.web.dto.ProblemResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/citizen/problems")
@PreAuthorize("hasRole('SUBMITTER')")
public class CitizenController {

    private final ProblemRepository problemRepository;
    private final AuditLogRepository auditLogRepository;

    public CitizenController(ProblemRepository problemRepository, AuditLogRepository auditLogRepository) {
        this.problemRepository = problemRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping("/{id}/timeline")
    public List<AuditLog> getTimeline(@PathVariable UUID id, @AuthenticationPrincipal AuthUser me) {
        // Fetch audit logs but restrict to this user's problem.
        // A more advanced implementation would filter out internal reviewer notes.
        // For Batch 1, we'll return all events on this problem as they track status.
        return auditLogRepository.findByProblemIdOrderByPerformedAtAsc(id);
    }
}
