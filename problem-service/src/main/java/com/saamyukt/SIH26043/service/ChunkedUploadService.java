package com.saamyukt.SIH26043.service;

import com.saamyukt.SIH26043.entity.Evidence;
import com.saamyukt.SIH26043.entity.Problem;
import com.saamyukt.SIH26043.entity.UploadSession;
import com.saamyukt.SIH26043.enums.EvidenceType;
import com.saamyukt.SIH26043.exception.ApiException;
import com.saamyukt.SIH26043.repository.EvidenceRepository;
import com.saamyukt.SIH26043.repository.ProblemRepository;
import com.saamyukt.SIH26043.repository.UploadSessionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.nio.file.StandardOpenOption;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Map;
import java.util.UUID;

@Service
public class ChunkedUploadService {

    private final UploadSessionRepository uploadSessionRepository;
    private final EvidenceRepository evidenceRepository;
    private final ProblemRepository problemRepository;
    private final Path storageRoot;

    public ChunkedUploadService(UploadSessionRepository uploadSessionRepository,
                                EvidenceRepository evidenceRepository,
                                ProblemRepository problemRepository,
                                @Value("${app.evidence.storage-dir}") String storageDir) {
        this.uploadSessionRepository = uploadSessionRepository;
        this.evidenceRepository = evidenceRepository;
        this.problemRepository = problemRepository;
        this.storageRoot = Path.of(storageDir).toAbsolutePath().normalize();
    }

    @Transactional
    public UploadSession initiateSession(UUID problemId, UUID userId, String filename, String contentType, EvidenceType evidenceType, long totalBytes) {
        if (problemId != null) {
            problemRepository.findById(problemId)
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Problem not found"));
        }

        String safeFilename = UUID.randomUUID() + "-" + sanitize(filename);
        Path target = storageRoot.resolve(safeFilename).normalize();

        UploadSession session = new UploadSession();
        session.setProblemId(problemId);
        session.setUserId(userId);
        session.setFilename(filename);
        session.setContentType(contentType);
        session.setEvidenceType(evidenceType);
        session.setTotalBytes(totalBytes);
        session.setStoragePath(target.toString());
        
        try {
            Files.createDirectories(storageRoot);
            // Create empty file
            Files.write(target, new byte[0]);
        } catch (IOException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to initialize storage for upload");
        }

        return uploadSessionRepository.save(session);
    }

    @Transactional
    public UploadSession appendChunk(UUID sessionId, UUID userId, MultipartFile chunk) {
        UploadSession session = uploadSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Upload session not found"));

        if (!session.getUserId().equals(userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not your upload session");
        }
        if (!"IN_PROGRESS".equals(session.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Session is " + session.getStatus());
        }

        Path target = Path.of(session.getStoragePath());
        try {
            Files.write(target, chunk.getBytes(), StandardOpenOption.APPEND);
            session.setUploadedBytes(session.getUploadedBytes() + chunk.getSize());
            session.setChunkCount(session.getChunkCount() + 1);
        } catch (IOException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to write chunk");
        }

        return uploadSessionRepository.save(session);
    }

    @Transactional
    public Evidence completeSession(UUID sessionId, UUID userId) {
        UploadSession session = uploadSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Upload session not found"));

        if (!session.getUserId().equals(userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not your upload session");
        }
        if (!"IN_PROGRESS".equals(session.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Session is " + session.getStatus());
        }

        if (session.getUploadedBytes() != session.getTotalBytes()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, 
                "Size mismatch: uploaded " + session.getUploadedBytes() + " of " + session.getTotalBytes());
        }

        Path target = Path.of(session.getStoragePath());
        String sha256;
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            try (var in = Files.newInputStream(target)) {
                byte[] buf = new byte[8192];
                int n;
                while ((n = in.read(buf)) != -1) {
                    md.update(buf, 0, n);
                }
            }
            sha256 = HexFormat.of().formatHex(md.digest());
        } catch (IOException | NoSuchAlgorithmException e) {
            session.setStatus("FAILED");
            uploadSessionRepository.save(session);
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "File hashing failed");
        }

        if (evidenceRepository.existsByFileHash(sha256)) {
            session.setStatus("FAILED");
            uploadSessionRepository.save(session);
            throw new ApiException(HttpStatus.CONFLICT, "Duplicate evidence: identical file already exists");
        }

        session.setStatus("COMPLETED");
        session.setSha256Partial(sha256);
        uploadSessionRepository.save(session);

        if (session.getProblemId() == null) {
             // For Drafts, Evidence is created, but not attached to a problem until submission
             return null; 
        }

        Evidence evidence = new Evidence();
        evidence.setEvidenceId(UUID.randomUUID());
        evidence.setProblemId(session.getProblemId());
        evidence.setEvidenceType(session.getEvidenceType());
        evidence.setFileUrl(session.getStoragePath());
        evidence.setFileHash(sha256);
        evidence.setMetadata(Map.of(
                "fileName", session.getFilename(),
                "mimeType", session.getContentType() != null ? session.getContentType() : "application/octet-stream",
                "fileSize", session.getTotalBytes()));
        evidence.setCapturedAt(Instant.now());
        evidence.setUploadedByUserId(userId);
        return evidenceRepository.save(evidence);
    }

    private String sanitize(String name) {
        if (name == null || name.isBlank()) return "file";
        String stripped = name.replaceAll("^[./\\\\]+", "");
        String safe = stripped.replaceAll("[^a-zA-Z0-9._-]", "_");
        return safe.length() > 180 ? safe.substring(0, 180) : safe;
    }
}
