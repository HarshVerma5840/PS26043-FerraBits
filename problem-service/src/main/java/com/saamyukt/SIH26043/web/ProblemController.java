package com.saamyukt.SIH26043.web;

import com.saamyukt.SIH26043.entity.Evidence;
import com.saamyukt.SIH26043.entity.Problem;
import com.saamyukt.SIH26043.enums.EvidenceType;
import com.saamyukt.SIH26043.enums.ProblemStatus;
import com.saamyukt.SIH26043.enums.UserRole;
import com.saamyukt.SIH26043.exception.ApiException;
import com.saamyukt.SIH26043.repository.ProblemRepository;
import com.saamyukt.SIH26043.security.AuthUser;
import com.saamyukt.SIH26043.service.EvidenceUploadService;
import com.saamyukt.SIH26043.service.ProblemStatusService;
import com.saamyukt.SIH26043.service.ProblemSubmissionService;
import com.saamyukt.SIH26043.web.dto.ProblemResponse;
import com.saamyukt.SIH26043.web.dto.ProblemSubmitRequest;
import com.saamyukt.SIH26043.web.dto.StatusPatchRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/problems")
public class ProblemController {

    private final ProblemSubmissionService submissionService;
    private final ProblemStatusService statusService;
    private final ProblemRepository problemRepository;
    private final com.saamyukt.SIH26043.repository.LocationRepository locationRepository;
    private final EvidenceUploadService evidenceUploadService;
    private final com.saamyukt.SIH26043.repository.EvidenceRepository evidenceRepository;
    private final com.saamyukt.SIH26043.service.AuditService auditService;
    private final com.saamyukt.SIH26043.repository.ProblemFingerprintVersionRepository versionRepository;
    private final com.saamyukt.SIH26043.service.analysis.Batch2OrchestrationWorkflowService orchestrator;

    @org.springframework.beans.factory.annotation.Value("${app.nearby.max-radius-km:50.0}")
    private double maxRadiusKm;

    @org.springframework.beans.factory.annotation.Value("${app.nearby.default-radius-km:5.0}")
    private double defaultRadiusKm;

    public ProblemController(ProblemSubmissionService submissionService,
                             ProblemStatusService statusService,
                             ProblemRepository problemRepository,
                             com.saamyukt.SIH26043.repository.LocationRepository locationRepository,
                             EvidenceUploadService evidenceUploadService,
                             com.saamyukt.SIH26043.repository.EvidenceRepository evidenceRepository,
                             com.saamyukt.SIH26043.service.AuditService auditService,
                             com.saamyukt.SIH26043.repository.ProblemFingerprintVersionRepository versionRepository,
                             com.saamyukt.SIH26043.service.analysis.Batch2OrchestrationWorkflowService orchestrator) {
        this.submissionService = submissionService;
        this.statusService = statusService;
        this.problemRepository = problemRepository;
        this.locationRepository = locationRepository;
        this.evidenceUploadService = evidenceUploadService;
        this.evidenceRepository = evidenceRepository;
        this.auditService = auditService;
        this.versionRepository = versionRepository;
        this.orchestrator = orchestrator;
    }

    @GetMapping("/nearby-legacy")
    public org.springframework.data.domain.Page<com.saamyukt.SIH26043.web.dto.PublicProblemSummary> getNearbyProblems(
            @RequestParam("latitude") double latitude,
            @RequestParam("longitude") double longitude,
            @RequestParam(value = "radiusKm", required = false) Double radiusKm,
            @RequestParam(value = "query", required = false) String query,
            org.springframework.data.domain.Pageable pageable) {

        if (latitude < -90 || latitude > 90) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Latitude must be between -90 and 90");
        }
        if (longitude < -180 || longitude > 180) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Longitude must be between -180 and 180");
        }

        double searchRadius = radiusKm != null ? radiusKm : defaultRadiusKm;
        if (searchRadius > maxRadiusKm) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Radius exceeds maximum allowed (" + maxRadiusKm + " km)");
        }
        if (searchRadius <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Radius must be positive");
        }

        return problemRepository.findNearbyProblems(latitude, longitude, searchRadius, query, pageable)
                .map(p -> {
                    com.saamyukt.SIH26043.entity.Location loc = null;
                    if (p.getLocationId() != null) {
                        loc = locationRepository.findById(p.getLocationId()).orElse(null);
                    }
                    return com.saamyukt.SIH26043.web.dto.PublicProblemSummary.from(p, loc);
                });
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProblemResponse submit(@Valid @RequestBody ProblemSubmitRequest req,
                                  @AuthenticationPrincipal AuthUser me,
                                  jakarta.servlet.http.HttpServletRequest http) {
        Problem created = submissionService.submit(req, me, clientIp(http));
        return ProblemResponse.from(created);
    }

    @GetMapping("/{id}")
    public ProblemResponse get(@PathVariable UUID id, @AuthenticationPrincipal AuthUser me) {
        Problem p = problemRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Problem not found"));
        if (me.getRole() == UserRole.SUBMITTER
                && !p.getSubmittedByUserId().equals(me.getUserId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not your submission");
        }
        return ProblemResponse.from(p);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','EVALUATOR')")
    public ProblemResponse patchStatus(@PathVariable UUID id,
                                       @Valid @RequestBody StatusPatchRequest req,
                                       @AuthenticationPrincipal AuthUser me,
                                       jakarta.servlet.http.HttpServletRequest http) {
        Problem updated = statusService.transition(id, req.status(), me.getUserId(),
                req.expectedVersion(), clientIp(http));
        return ProblemResponse.from(updated);
    }

    @PostMapping("/{id}/evidence")
    public com.saamyukt.SIH26043.web.dto.EvidenceResponse addEvidence(@PathVariable UUID id,
                                 @RequestParam("file") MultipartFile file,
                                 @RequestParam(value = "evidenceType", defaultValue = "DOCUMENT") EvidenceType evidenceType,
                                 @RequestParam(value = "clientUploadId", required = false) String clientUploadId,
                                 @AuthenticationPrincipal AuthUser me,
                                 jakarta.servlet.http.HttpServletRequest http) {
        Problem p = problemRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Problem not found"));
        if (me.getRole() == UserRole.SUBMITTER) {
            if (!p.getSubmittedByUserId().equals(me.getUserId())) {
                throw new ApiException(HttpStatus.FORBIDDEN, "Not your submission");
            }
            if (p.getStatus() != ProblemStatus.DRAFT) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Can only upload evidence while in DRAFT status");
            }
        }
        Evidence evidence = evidenceUploadService.upload(id, file, evidenceType, clientUploadId, me, clientIp(http));
        return com.saamyukt.SIH26043.web.dto.EvidenceResponse.from(evidence);
    }

    @GetMapping("/{id}/evidence")
    public java.util.List<com.saamyukt.SIH26043.web.dto.EvidenceResponse> getEvidence(@PathVariable UUID id, @AuthenticationPrincipal AuthUser me) {
        Problem p = problemRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Problem not found"));
        if (me.getRole() == UserRole.SUBMITTER
                && !p.getSubmittedByUserId().equals(me.getUserId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not your submission");
        }
        return evidenceRepository.findByProblemId(id).stream()
                .map(com.saamyukt.SIH26043.web.dto.EvidenceResponse::from)
                .toList();
    }
    
    @GetMapping("/{id}/evidence/{evidenceId}/download")
    public org.springframework.http.ResponseEntity<org.springframework.core.io.Resource> downloadEvidence(
            @PathVariable UUID id, @PathVariable UUID evidenceId, @AuthenticationPrincipal AuthUser me) {
        Problem p = problemRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Problem not found"));
        if (me.getRole() == UserRole.SUBMITTER && !p.getSubmittedByUserId().equals(me.getUserId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not your submission");
        }
        
        Evidence e = evidenceRepository.findById(evidenceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Evidence not found"));
        if (!e.getProblemId().equals(id)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Evidence does not belong to this problem");
        }
        
        try {
            java.nio.file.Path file = java.nio.file.Path.of(e.getFileUrl());
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                String mimeType = (String) e.getMetadata().get("mimeType");
                if (mimeType == null) mimeType = "application/octet-stream";
                return org.springframework.http.ResponseEntity.ok()
                        .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, 
                                "attachment; filename=\"" + e.getMetadata().get("fileName") + "\"")
                        .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, mimeType)
                        .body(resource);
            } else {
                throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "File not readable");
            }
        } catch (java.net.MalformedURLException ex) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Error reading file");
        }
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/{id}/evidence/{evidenceId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEvidence(@PathVariable UUID id, @PathVariable UUID evidenceId, @AuthenticationPrincipal AuthUser me, jakarta.servlet.http.HttpServletRequest http) {
        Problem p = problemRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Problem not found"));
        if (me.getRole() == UserRole.SUBMITTER
                && !p.getSubmittedByUserId().equals(me.getUserId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not your submission");
        }
        if (p.getStatus() != ProblemStatus.DRAFT) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Can only delete evidence while in DRAFT status");
        }
        
        Evidence e = evidenceRepository.findById(evidenceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Evidence not found"));
        
        if (!e.getProblemId().equals(id)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Evidence does not belong to this problem");
        }
        
        evidenceRepository.delete(e);
        auditService.record(id, com.saamyukt.SIH26043.enums.AuditAction.UPDATED, me.getUserId(), java.util.Map.of("evidenceId", e.getEvidenceId()), null, clientIp(http));
    }

    @GetMapping("/{id}/fingerprint")
    public com.saamyukt.SIH26043.web.dto.ProblemFingerprintPayload getFingerprint(@PathVariable UUID id, @AuthenticationPrincipal AuthUser me) {
        Problem p = problemRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Problem not found"));
        if (me.getRole() == UserRole.SUBMITTER && !p.getSubmittedByUserId().equals(me.getUserId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not your submission");
        }
        com.saamyukt.SIH26043.entity.ProblemFingerprintVersion fp = versionRepository.findByProblemIdAndIsLatestTrue(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Fingerprint not found or processing has not completed"));
        return fp.getFingerprintData();
    }

    @GetMapping("/{id}/fingerprint/history")
    @PreAuthorize("hasAnyRole('ADMIN','EVALUATOR')")
    public java.util.List<com.saamyukt.SIH26043.web.dto.ProblemFingerprintPayload> getFingerprintHistory(@PathVariable UUID id) {
        return versionRepository.findAll().stream()
                .filter(v -> v.getProblemId().equals(id))
                .sorted(java.util.Comparator.comparing(com.saamyukt.SIH26043.entity.ProblemFingerprintVersion::getVersionNumber).reversed())
                .map(com.saamyukt.SIH26043.entity.ProblemFingerprintVersion::getFingerprintData)
                .toList();
    }

    @PostMapping("/{id}/process-ai")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public com.saamyukt.SIH26043.web.dto.AiProcessingSummaryResponse processAi(@PathVariable UUID id, @AuthenticationPrincipal AuthUser me) {
        Problem p = problemRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Problem not found"));
        if (me.getRole() == UserRole.SUBMITTER && !p.getSubmittedByUserId().equals(me.getUserId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not your submission");
        }
        orchestrator.processProblemAsync(id);
        return orchestrator.getStatus(id);
    }

    @GetMapping("/{id}/ai-status")
    public com.saamyukt.SIH26043.web.dto.AiProcessingSummaryResponse getAiStatus(@PathVariable UUID id, @AuthenticationPrincipal AuthUser me) {
        Problem p = problemRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Problem not found"));
        if (me.getRole() == UserRole.SUBMITTER && !p.getSubmittedByUserId().equals(me.getUserId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not your submission");
        }
        return orchestrator.getStatus(id);
    }

    private String clientIp(jakarta.servlet.http.HttpServletRequest http) {
        String xff = http.getHeader("X-Forwarded-For");
        return xff != null ? xff.split(",")[0].trim() : http.getRemoteAddr();
    }
}
