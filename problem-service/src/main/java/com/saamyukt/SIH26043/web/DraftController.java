package com.saamyukt.SIH26043.web;

import com.saamyukt.SIH26043.entity.Problem;
import com.saamyukt.SIH26043.enums.ProblemStatus;
import com.saamyukt.SIH26043.web.dto.ProblemResponse;
import com.saamyukt.SIH26043.web.dto.ProblemSubmitRequest;
import com.saamyukt.SIH26043.repository.ProblemRepository;
import com.saamyukt.SIH26043.security.AuthUser;
import com.saamyukt.SIH26043.service.DraftService;
import com.saamyukt.SIH26043.service.ProblemCollectionEngine;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/problems")
@PreAuthorize("hasRole('SUBMITTER')")
public class DraftController {

    private final DraftService draftService;
    private final ProblemCollectionEngine submissionEngine;
    private final ProblemRepository problemRepository;
    private final com.saamyukt.SIH26043.repository.LocationRepository locationRepository;
    private final com.saamyukt.SIH26043.repository.EvidenceRepository evidenceRepository;
    private final com.saamyukt.SIH26043.repository.AuditLogRepository auditLogRepository;
    private final com.saamyukt.SIH26043.service.ProblemStatusService statusService;

    public DraftController(DraftService draftService, 
                           ProblemCollectionEngine submissionEngine, 
                           ProblemRepository problemRepository,
                           com.saamyukt.SIH26043.repository.LocationRepository locationRepository,
                           com.saamyukt.SIH26043.repository.EvidenceRepository evidenceRepository,
                           com.saamyukt.SIH26043.repository.AuditLogRepository auditLogRepository,
                           com.saamyukt.SIH26043.service.ProblemStatusService statusService) {
        this.draftService = draftService;
        this.submissionEngine = submissionEngine;
        this.problemRepository = problemRepository;
        this.locationRepository = locationRepository;
        this.evidenceRepository = evidenceRepository;
        this.auditLogRepository = auditLogRepository;
        this.statusService = statusService;
    }

    @PostMapping("/drafts")
    @ResponseStatus(HttpStatus.CREATED)
    public ProblemResponse createDraft(@RequestBody ProblemSubmitRequest req,
                                       @AuthenticationPrincipal AuthUser me,
                                       HttpServletRequest http) {
        Problem draft = draftService.saveDraft(req, me, clientIp(http));
        return ProblemResponse.from(draft);
    }

    @PatchMapping("/{id}/draft")
    public ProblemResponse updateDraft(@PathVariable UUID id,
                                       @RequestBody ProblemSubmitRequest req,
                                       @AuthenticationPrincipal AuthUser me,
                                       HttpServletRequest http) {
        Problem draft = draftService.updateDraft(id, req, me, clientIp(http));
        return ProblemResponse.from(draft);
    }

    @PostMapping("/{id}/submit")
    public ProblemResponse submitDraft(@PathVariable UUID id,
                                       @RequestBody ProblemSubmitRequest req,
                                       @AuthenticationPrincipal AuthUser me,
                                       HttpServletRequest http) {
        Problem draft = draftService.updateDraft(id, req, me, clientIp(http));
        // flush to ensure version is updated before transition
        problemRepository.flush(); 
        Problem submitted = statusService.transition(id, ProblemStatus.SUBMITTED, me.getUserId(), draft.getVersion(), clientIp(http));
        return ProblemResponse.from(submitted);
    }

    @GetMapping("/my")
    public Page<com.saamyukt.SIH26043.web.dto.CitizenProblemResponse> listMyProblems(@AuthenticationPrincipal AuthUser me, Pageable pageable) {
        return problemRepository.findBySubmittedByUserId(me.getUserId(), pageable)
                .map(this::toCitizenResponse);
    }

    @GetMapping("/my/{id}")
    public com.saamyukt.SIH26043.web.dto.CitizenProblemResponse getMyProblem(@PathVariable UUID id, @AuthenticationPrincipal AuthUser me) {
        Problem p = problemRepository.findById(id)
                .orElseThrow(() -> new com.saamyukt.SIH26043.exception.ApiException(HttpStatus.NOT_FOUND, "Problem not found"));
        if (!p.getSubmittedByUserId().equals(me.getUserId())) {
            throw new com.saamyukt.SIH26043.exception.ApiException(HttpStatus.FORBIDDEN, "Not your problem");
        }
        return toCitizenResponse(p);
    }

    @GetMapping("/my/{id}/status-history")
    public java.util.List<com.saamyukt.SIH26043.web.dto.CitizenStatusHistoryEntry> getStatusHistory(@PathVariable UUID id, @AuthenticationPrincipal AuthUser me) {
        Problem p = problemRepository.findById(id)
                .orElseThrow(() -> new com.saamyukt.SIH26043.exception.ApiException(HttpStatus.NOT_FOUND, "Problem not found"));
        if (!p.getSubmittedByUserId().equals(me.getUserId())) {
            throw new com.saamyukt.SIH26043.exception.ApiException(HttpStatus.FORBIDDEN, "Not your problem");
        }
        return auditLogRepository.findByProblemIdOrderByPerformedAtAsc(id).stream()
                .map(com.saamyukt.SIH26043.web.dto.CitizenStatusHistoryEntry::from)
                .toList();
    }
    
    @GetMapping("/{id}/status")
    public Map<String, Object> getStatus(@PathVariable UUID id, @AuthenticationPrincipal AuthUser me) {
        Problem p = problemRepository.findById(id)
                .orElseThrow(() -> new com.saamyukt.SIH26043.exception.ApiException(HttpStatus.NOT_FOUND, "Problem not found"));
        if (!p.getSubmittedByUserId().equals(me.getUserId())) {
            throw new com.saamyukt.SIH26043.exception.ApiException(HttpStatus.FORBIDDEN, "Not your problem");
        }
        return Map.of("problemId", p.getProblemId(), "status", p.getStatus());
    }

    private com.saamyukt.SIH26043.web.dto.CitizenProblemResponse toCitizenResponse(Problem p) {
        com.saamyukt.SIH26043.entity.Location loc = null;
        if (p.getLocationId() != null) {
            loc = locationRepository.findById(p.getLocationId()).orElse(null);
        }
        int evidenceCount = (int) evidenceRepository.countByProblemId(p.getProblemId());
        return com.saamyukt.SIH26043.web.dto.CitizenProblemResponse.from(p, loc, evidenceCount);
    }

    private String clientIp(HttpServletRequest http) {
        String xff = http.getHeader("X-Forwarded-For");
        return xff != null ? xff.split(",")[0].trim() : http.getRemoteAddr();
    }
}
