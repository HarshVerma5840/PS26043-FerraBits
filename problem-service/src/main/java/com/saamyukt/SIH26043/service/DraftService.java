package com.saamyukt.SIH26043.service;

import com.saamyukt.SIH26043.client.SourceAccountGateway;
import com.saamyukt.SIH26043.entity.Location;
import com.saamyukt.SIH26043.entity.Problem;
import com.saamyukt.SIH26043.enums.AuditAction;
import com.saamyukt.SIH26043.enums.ProblemStatus;
import com.saamyukt.SIH26043.enums.SourceBucket;
import com.saamyukt.SIH26043.enums.SubEntityType;
import com.saamyukt.SIH26043.enums.Urgency;
import com.saamyukt.SIH26043.exception.ApiException;
import com.saamyukt.SIH26043.internal.SourceAccountResponse;
import com.saamyukt.SIH26043.repository.LocationRepository;
import com.saamyukt.SIH26043.repository.ProblemRepository;
import com.saamyukt.SIH26043.security.AuthUser;
import com.saamyukt.SIH26043.web.dto.ProblemSubmitRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class DraftService {

    private final ProblemRepository problemRepository;
    private final LocationRepository locationRepository;
    private final SourceAccountGateway sourceAccountGateway;
    private final AuditService auditService;

    public DraftService(ProblemRepository problemRepository, LocationRepository locationRepository, 
                        SourceAccountGateway sourceAccountGateway, AuditService auditService) {
        this.problemRepository = problemRepository;
        this.locationRepository = locationRepository;
        this.sourceAccountGateway = sourceAccountGateway;
        this.auditService = auditService;
    }

    @Transactional
    public Problem saveDraft(ProblemSubmitRequest req, AuthUser submitter, String ip) {
        SourceAccountResponse account = sourceAccountGateway.fetch(req.sourceAccountId());
        if (!account.ownerUserId().equals(submitter.getUserId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not your source account");
        }

        if (req.idempotencyKey() != null && !req.idempotencyKey().isBlank()) {
            if (problemRepository.existsBySubmittedByUserIdAndIdempotencyKey(submitter.getUserId(), req.idempotencyKey())) {
                throw new ApiException(HttpStatus.CONFLICT, "Duplicate submission request: idempotency key already used");
            }
        }

        Problem problem = new Problem();
        problem.setProblemId(UUID.randomUUID());
        problem.setStatus(ProblemStatus.DRAFT);
        problem.setIdempotencyKey(req.idempotencyKey());
        
        // Provide defaults for mandatory fields if a draft is incomplete
        problem.setTitle(req.title() != null && !req.title().isBlank() ? req.title() : "Untitled Draft");
        problem.setDescription(req.description() != null ? req.description() : "");
        problem.setUrgency(req.urgency() != null ? req.urgency() : Urgency.LONG_TERM);
        problem.setSeverity(req.severity());

        problem.setSourceBucket(SourceBucket.valueOf(account.sourceBucket()));
        problem.setSubEntityType(SubEntityType.valueOf(account.sourceType()));
        problem.setSourceId(account.sourceId());
        problem.setSourceAccountId(account.sourceAccountId());
        problem.setSubmittedByUserId(submitter.getUserId());
        
        if (req.location() != null) {
            Location loc = new Location();
            loc.setLocationId(UUID.randomUUID());
            loc.setState(req.location().state() != null ? req.location().state() : "");
            loc.setDistrict(req.location().district() != null ? req.location().district() : "");
            loc.setBlockTehsil(req.location().blockTehsil());
            loc.setVillageWard(req.location().villageWard());
            loc.setPincode(req.location().pincode());
            loc.setLatitude(req.location().latitude() != null ? BigDecimal.valueOf(req.location().latitude()) : BigDecimal.ZERO);
            loc.setLongitude(req.location().longitude() != null ? BigDecimal.valueOf(req.location().longitude()) : BigDecimal.ZERO);
            loc.setLandmark(req.location().landmark());
            loc.setLgdCode(req.location().lgdCode());
            if (req.location().accuracyMeters() != null) loc.setAccuracyMeters(BigDecimal.valueOf(req.location().accuracyMeters()));
            loc.setCapturedAt(req.location().capturedAt());
            loc.setSourceType(req.location().sourceType());
            locationRepository.save(loc);
            problem.setLocationId(loc.getLocationId());
        }

        problemRepository.save(problem);
        auditService.record(problem.getProblemId(), AuditAction.DRAFT_CREATED, submitter.getUserId(), null, problem, ip);
        
        return problem;
    }

    @Transactional
    public Problem updateDraft(UUID draftId, ProblemSubmitRequest req, AuthUser submitter, String ip) {
        Problem problem = problemRepository.findById(draftId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Draft not found"));

        if (!problem.getSubmittedByUserId().equals(submitter.getUserId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not your draft");
        }
        if (problem.getStatus() != ProblemStatus.DRAFT) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Problem is not a draft");
        }

        Problem before = copy(problem);

        if (req.title() != null && !req.title().isBlank()) problem.setTitle(req.title());
        if (req.description() != null) problem.setDescription(req.description());
        if (req.urgency() != null) problem.setUrgency(req.urgency());
        if (req.severity() != null) problem.setSeverity(req.severity());
        if (req.affectedPopulation() != null) problem.setAffectedPopulation(req.affectedPopulation());
        if (req.expectedOutcome() != null) problem.setExpectedOutcome(req.expectedOutcome());
        if (req.existingIntervention() != null) problem.setExistingIntervention(req.existingIntervention());

        if (req.location() != null) {
            Location loc = problem.getLocationId() != null ? 
                locationRepository.findById(problem.getLocationId()).orElse(new Location()) : new Location();
            
            if (loc.getLocationId() == null) loc.setLocationId(UUID.randomUUID());
            if (req.location().state() != null) loc.setState(req.location().state());
            if (req.location().district() != null) loc.setDistrict(req.location().district());
            if (req.location().blockTehsil() != null) loc.setBlockTehsil(req.location().blockTehsil());
            if (req.location().villageWard() != null) loc.setVillageWard(req.location().villageWard());
            if (req.location().pincode() != null) loc.setPincode(req.location().pincode());
            if (req.location().latitude() != null) loc.setLatitude(BigDecimal.valueOf(req.location().latitude()));
            if (req.location().longitude() != null) loc.setLongitude(BigDecimal.valueOf(req.location().longitude()));
            if (req.location().landmark() != null) loc.setLandmark(req.location().landmark());
            if (req.location().lgdCode() != null) loc.setLgdCode(req.location().lgdCode());
            if (req.location().accuracyMeters() != null) loc.setAccuracyMeters(BigDecimal.valueOf(req.location().accuracyMeters()));
            if (req.location().capturedAt() != null) loc.setCapturedAt(req.location().capturedAt());
            if (req.location().sourceType() != null) loc.setSourceType(req.location().sourceType());
            locationRepository.save(loc);
            problem.setLocationId(loc.getLocationId());
        }

        problemRepository.save(problem);
        auditService.record(problem.getProblemId(), AuditAction.DRAFT_UPDATED, submitter.getUserId(), before, problem, ip);
        
        return problem;
    }

    private Problem copy(Problem src) {
        Problem c = new Problem();
        c.setStatus(src.getStatus());
        c.setTitle(src.getTitle());
        c.setDescription(src.getDescription());
        c.setVersion(src.getVersion());
        c.setSourceBucket(src.getSourceBucket());
        return c;
    }
}
