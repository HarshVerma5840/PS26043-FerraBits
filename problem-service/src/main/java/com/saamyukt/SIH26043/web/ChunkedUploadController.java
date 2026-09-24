package com.saamyukt.SIH26043.web;

import com.saamyukt.SIH26043.entity.Evidence;
import com.saamyukt.SIH26043.entity.UploadSession;
import com.saamyukt.SIH26043.security.AuthUser;
import com.saamyukt.SIH26043.service.ChunkedUploadService;
import com.saamyukt.SIH26043.web.dto.UploadInitRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
@RequestMapping("/uploads")
@PreAuthorize("hasRole('SUBMITTER')")
public class ChunkedUploadController {

    private final ChunkedUploadService chunkedUploadService;

    public ChunkedUploadController(ChunkedUploadService chunkedUploadService) {
        this.chunkedUploadService = chunkedUploadService;
    }

    @PostMapping("/init")
    @ResponseStatus(HttpStatus.CREATED)
    public UploadSession initiateUpload(@Valid @RequestBody UploadInitRequest req,
                                        @RequestParam(required = false) UUID problemId,
                                        @AuthenticationPrincipal AuthUser me) {
        return chunkedUploadService.initiateSession(
                problemId, me.getUserId(), req.filename(), req.contentType(), req.evidenceType(), req.totalBytes()
        );
    }

    @PostMapping("/{sessionId}/chunk")
    public UploadSession uploadChunk(@PathVariable UUID sessionId,
                                     @RequestParam("chunk") MultipartFile chunk,
                                     @AuthenticationPrincipal AuthUser me) {
        return chunkedUploadService.appendChunk(sessionId, me.getUserId(), chunk);
    }

    @PostMapping("/{sessionId}/complete")
    public Evidence completeUpload(@PathVariable UUID sessionId,
                                   @AuthenticationPrincipal AuthUser me) {
        return chunkedUploadService.completeSession(sessionId, me.getUserId());
    }
}
