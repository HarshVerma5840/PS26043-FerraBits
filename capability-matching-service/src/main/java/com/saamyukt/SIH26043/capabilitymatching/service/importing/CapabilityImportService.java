package com.saamyukt.SIH26043.capabilitymatching.service.importing;

import com.saamyukt.SIH26043.capabilitymatching.dto.importing.ImportDTOs.*;
import com.saamyukt.SIH26043.capabilitymatching.entity.Institution;
import com.saamyukt.SIH26043.capabilitymatching.entity.RegistryVersion;
import com.saamyukt.SIH26043.capabilitymatching.repository.InstitutionRepository;
import com.saamyukt.SIH26043.capabilitymatching.repository.RegistryVersionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class CapabilityImportService {

    private final InstitutionRepository institutionRepository;
    private final RegistryVersionRepository registryVersionRepository;

    public CapabilityImportService(InstitutionRepository institutionRepository, 
                                   RegistryVersionRepository registryVersionRepository) {
        this.institutionRepository = institutionRepository;
        this.registryVersionRepository = registryVersionRepository;
    }

    @Transactional
    public ImportResultSummary importRegistry(RegistryImportRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Import request cannot be null");
        }
        if (request.getSource() == null || request.getSource().isBlank()) {
            throw new IllegalArgumentException("Source is required");
        }
        List<String> allowedSources = List.of("AISHE", "UNIVERSITY", "MANUAL", "SEEDED");
        if (!allowedSources.contains(request.getSource().toUpperCase())) {
            throw new IllegalArgumentException("Source not allowed: " + request.getSource());
        }
        if (request.getInstitutions() == null || request.getInstitutions().isEmpty()) {
            throw new IllegalArgumentException("Institution list cannot be null or empty");
        }

        ImportResultSummary summary = new ImportResultSummary();
        summary.setRejectedReasons(new ArrayList<>());
        
        int accepted = 0;
        int rejected = 0;

        RegistryVersion version = new RegistryVersion();
        version.setVersionName("import-" + request.getSource() + "-" + System.currentTimeMillis());
        version.setPublishedAt(OffsetDateTime.now());
        version.setIsActive(false);
        version = registryVersionRepository.save(version);

        List<Institution> allInsts = institutionRepository.findAll();
        java.util.Set<String> existingAishe = new java.util.HashSet<>();
        java.util.Set<String> existingNames = new java.util.HashSet<>();
        for (Institution i : allInsts) {
            if (i.getAisheIdentifier() != null) {
                existingAishe.add(i.getAisheIdentifier().trim().toUpperCase());
            }
            if (i.getName() != null) {
                existingNames.add(i.getName().trim().toLowerCase());
            }
        }

        for (InstitutionImportDto dto : request.getInstitutions()) {
            if (dto.getName() == null || dto.getName().trim().isEmpty()) {
                rejected++;
                summary.getRejectedReasons().add("Missing institution name.");
                continue;
            }

            if (dto.getLatitude() != null && (dto.getLatitude() < -90 || dto.getLatitude() > 90)) {
                rejected++;
                summary.getRejectedReasons().add("Invalid latitude for " + dto.getName());
                continue;
            }
            if (dto.getLongitude() != null && (dto.getLongitude() < -180 || dto.getLongitude() > 180)) {
                rejected++;
                summary.getRejectedReasons().add("Invalid longitude for " + dto.getName());
                continue;
            }

            String normalizedName = dto.getName().trim().replaceAll("\\s+", " ");
            String aishe = dto.getAisheIdentifier() != null ? dto.getAisheIdentifier().trim().toUpperCase() : null;

            if (aishe != null && existingAishe.contains(aishe)) {
                rejected++;
                summary.getRejectedReasons().add("Duplicate AISHE detected: " + aishe);
                continue;
            }
            if (existingNames.contains(normalizedName.toLowerCase())) {
                rejected++;
                summary.getRejectedReasons().add("Duplicate institution detected: " + normalizedName);
                continue;
            }

            Institution inst = new Institution();
            inst.setInstitutionId(UUID.randomUUID());
            inst.setName(normalizedName);
            inst.setType(dto.getType());
            inst.setAisheIdentifier(aishe);
            inst.setState(dto.getState());
            inst.setDistrict(dto.getDistrict());
            inst.setLatitude(dto.getLatitude());
            inst.setLongitude(dto.getLongitude());
            inst.setSource(request.getSource());
            inst.setRawImportData(dto.getRawJsonData());
            inst.setImportedAt(OffsetDateTime.now());
            if ("AISHE".equalsIgnoreCase(request.getSource()) || "SEEDED".equalsIgnoreCase(request.getSource())) {
                inst.setVerificationStatus("VERIFIED");
                inst.setVerifiedAt(OffsetDateTime.now());
            } else {
                inst.setVerificationStatus("UNVERIFIED");
            }
            inst.setActiveStatus(true);
            inst.setRegistryVersionId(version.getVersionId());
            inst.setCreatedAt(OffsetDateTime.now());
            inst.setUpdatedAt(OffsetDateTime.now());

            institutionRepository.save(inst);
            if (aishe != null) existingAishe.add(aishe);
            existingNames.add(normalizedName.toLowerCase());
            accepted++;
        }

        summary.setAcceptedCount(accepted);
        summary.setRejectedCount(rejected);
        summary.setNewRegistryVersionId(version.getVersionId());

        return summary;
    }
}
