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
        ImportResultSummary summary = new ImportResultSummary();
        summary.setRejectedReasons(new ArrayList<>());
        
        int accepted = 0;
        int rejected = 0;

        // Create new version for this import
        RegistryVersion version = new RegistryVersion();
        version.setVersionName("import-" + request.getSource() + "-" + System.currentTimeMillis());
        version.setPublishedAt(OffsetDateTime.now());
        version.setIsActive(true);
        version = registryVersionRepository.save(version);

        for (InstitutionImportDto dto : request.getInstitutions()) {
            if (dto.getName() == null || dto.getName().trim().isEmpty()) {
                rejected++;
                summary.getRejectedReasons().add("Missing institution name.");
                continue;
            }

            String normalizedName = dto.getName().trim().replaceAll("\\s+", " ");
            String aishe = dto.getAisheIdentifier() != null ? dto.getAisheIdentifier().trim() : null;

            // Simple duplicate check - in a real scenario we'd do a DB lookup or batch query
            boolean isDuplicate = false;
            if (aishe != null) {
                isDuplicate = institutionRepository.findAll().stream()
                        .anyMatch(i -> aishe.equals(i.getAisheIdentifier()));
            } else {
                isDuplicate = institutionRepository.findAll().stream()
                        .anyMatch(i -> normalizedName.equalsIgnoreCase(i.getName()));
            }

            if (isDuplicate) {
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
            // Assume AISHE is trusted, manual requires verification
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

            // Normalization of departments, skills, equipment can be extended similarly.
            // For now, we focus on institution tracking per the core prompt requirements.

            institutionRepository.save(inst);
            accepted++;
        }

        summary.setAcceptedCount(accepted);
        summary.setRejectedCount(rejected);
        summary.setNewRegistryVersionId(version.getVersionId());

        return summary;
    }
}
