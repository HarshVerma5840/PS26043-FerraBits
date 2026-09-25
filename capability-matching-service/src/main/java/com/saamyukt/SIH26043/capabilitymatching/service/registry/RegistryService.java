package com.saamyukt.SIH26043.capabilitymatching.service.registry;

import com.saamyukt.SIH26043.capabilitymatching.dto.registry.RegistryDTOs.*;
import com.saamyukt.SIH26043.capabilitymatching.entity.*;
import com.saamyukt.SIH26043.capabilitymatching.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RegistryService {

    private final RegistryVersionRepository versionRepository;
    private final InstitutionRepository institutionRepository;
    private final DepartmentRepository departmentRepository;
    private final com.saamyukt.SIH26043.capabilitymatching.service.embedding.EmbeddingGenerationService embeddingService;

    public RegistryService(RegistryVersionRepository versionRepository,
                           InstitutionRepository institutionRepository,
                           DepartmentRepository departmentRepository,
                           com.saamyukt.SIH26043.capabilitymatching.service.embedding.EmbeddingGenerationService embeddingService) {
        this.versionRepository = versionRepository;
        this.institutionRepository = institutionRepository;
        this.departmentRepository = departmentRepository;
        this.embeddingService = embeddingService;
    }

    @Transactional(readOnly = true)
    public Page<RegistryVersionDto> getVersions(Pageable pageable) {
        return versionRepository.findAll(pageable).map(this::mapToVersionDto);
    }

    @Transactional(readOnly = true)
    public RegistryVersionDto getVersion(Integer versionId) {
        return versionRepository.findById(versionId)
                .map(this::mapToVersionDto)
                .orElseThrow(() -> new IllegalArgumentException("Version not found"));
    }

    @Transactional
    public RegistryVersionDto publishVersion(Integer versionId) {
        RegistryVersion version = versionRepository.findById(versionId)
                .orElseThrow(() -> new IllegalArgumentException("Version not found"));
        
        if (version.getPublishedAt() != null) {
            throw new IllegalStateException("Version is already published");
        }

        // Deactivate currently active version
        versionRepository.findByIsActiveTrue().ifPresent(active -> {
            active.setIsActive(false);
            versionRepository.save(active);
        });

        version.setPublishedAt(OffsetDateTime.now());
        version.setIsActive(true);
        RegistryVersion saved = versionRepository.save(version);
        
        // Trigger embedding generation for all institutions in this version
        institutionRepository.findAllByRegistryVersionId(saved.getVersionId())
                .forEach(embeddingService::generateForInstitution);
                
        return mapToVersionDto(saved);
    }

    @Transactional
    public RegistryVersionDto archiveVersion(Integer versionId) {
        RegistryVersion version = versionRepository.findById(versionId)
                .orElseThrow(() -> new IllegalArgumentException("Version not found"));
        
        if (version.getPublishedAt() == null) {
            throw new IllegalStateException("Cannot archive an unpublished version");
        }
        
        version.setIsActive(false);
        return mapToVersionDto(versionRepository.save(version));
    }

    @Transactional(readOnly = true)
    public Page<RegistryInstitutionDto> getInstitutions(RegistryFilterRequest filter, Pageable pageable) {
        Specification<Institution> spec = (root, query, cb) -> {
            query.distinct(true);
            List<Predicate> predicates = new ArrayList<>();
            
            if (filter.getDistrict() != null && !filter.getDistrict().isBlank()) {
                predicates.add(cb.equal(root.get("district"), filter.getDistrict()));
            }
            if (filter.getState() != null && !filter.getState().isBlank()) {
                predicates.add(cb.equal(root.get("state"), filter.getState()));
            }
            if (filter.getType() != null && !filter.getType().isBlank()) {
                predicates.add(cb.equal(root.get("type"), filter.getType()));
            }
            if (filter.getVerificationStatus() != null && !filter.getVerificationStatus().isBlank()) {
                predicates.add(cb.equal(root.get("verificationStatus"), filter.getVerificationStatus()));
            }
            if (Boolean.TRUE.equals(filter.getActiveRegistryVersion())) {
                versionRepository.findByIsActiveTrue().ifPresent(activeVer -> 
                    predicates.add(cb.equal(root.get("registryVersionId"), activeVer.getVersionId()))
                );
            }

            if (filter.getLaboratory() != null && !filter.getLaboratory().isBlank()) {
                Join<Institution, Lab> labJoin = root.join("labs", JoinType.INNER);
                predicates.add(cb.equal(labJoin.get("name"), filter.getLaboratory()));
            }
            if (filter.getEquipment() != null && !filter.getEquipment().isBlank()) {
                Join<Institution, Lab> labJoin = root.join("labs", JoinType.INNER);
                Join<Lab, Equipment> eqJoin = labJoin.join("equipmentList", JoinType.INNER);
                predicates.add(cb.equal(eqJoin.get("name"), filter.getEquipment()));
            }
            if (filter.getSkill() != null && !filter.getSkill().isBlank()) {
                Join<Institution, Department> deptJoin = root.join("departments", JoinType.INNER);
                Join<Department, Faculty> facJoin = deptJoin.join("faculty", JoinType.INNER);
                Join<Faculty, FacultySkill> facSkillJoin = facJoin.join("skills", JoinType.INNER);
                Join<FacultySkill, Skill> skillJoin = facSkillJoin.join("skill", JoinType.INNER);
                predicates.add(cb.equal(skillJoin.get("name"), filter.getSkill()));
            }
            
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        // We need JpaSpecificationExecutor on InstitutionRepository
        // I will update the repository interfaces
        return institutionRepository.findAll(spec, pageable).map(this::mapToInstitutionDto);
    }

    @Transactional(readOnly = true)
    public RegistryInstitutionDetailDto getInstitutionDetail(UUID institutionId) {
        Institution inst = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new IllegalArgumentException("Institution not found"));
        
        RegistryInstitutionDetailDto dto = new RegistryInstitutionDetailDto();
        mapToInstitutionDto(inst, dto);
        dto.setLatitude(inst.getLatitude());
        dto.setLongitude(inst.getLongitude());
        dto.setImportedAt(inst.getImportedAt());
        dto.setVerifiedAt(inst.getVerifiedAt());
        
        // Populate capabilities simply
        dto.setCapabilities(getCapabilities(inst));
        
        return dto;
    }

    @Transactional(readOnly = true)
    public Page<CapabilityDetailDto> getInstitutionCapabilities(UUID institutionId, Pageable pageable) {
        Institution inst = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new IllegalArgumentException("Institution not found"));
        List<CapabilityDetailDto> allCaps = getCapabilities(inst);
        
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), allCaps.size());
        List<CapabilityDetailDto> paged = (start <= end) ? allCaps.subList(start, end) : new ArrayList<>();
        
        return new PageImpl<>(paged, pageable, allCaps.size());
    }

    private List<CapabilityDetailDto> getCapabilities(Institution inst) {
        List<CapabilityDetailDto> caps = new ArrayList<>();
        if (inst.getLabs() != null) {
            for (Lab lab : inst.getLabs()) {
                CapabilityDetailDto c = new CapabilityDetailDto();
                c.setSource("LAB");
                c.setName(lab.getName());
                caps.add(c);
                if (lab.getEquipmentList() != null) {
                    for (Equipment eq : lab.getEquipmentList()) {
                        CapabilityDetailDto ec = new CapabilityDetailDto();
                        ec.setSource("EQUIPMENT");
                        ec.setName(eq.getName());
                        ec.setLevel(eq.getIsOperational() ? "OPERATIONAL" : "NON_OPERATIONAL");
                        caps.add(ec);
                    }
                }
            }
        }
        if (inst.getDepartments() != null) {
            for (Department dept : inst.getDepartments()) {
                if (dept.getFaculty() != null) {
                    for (Faculty f : dept.getFaculty()) {
                        if (f.getSkills() != null) {
                            for (FacultySkill fs : f.getSkills()) {
                                CapabilityDetailDto sc = new CapabilityDetailDto();
                                sc.setSource("FACULTY_SKILL");
                                sc.setName(fs.getSkill().getName());
                                sc.setLevel(fs.getProficiencyLevel());
                                caps.add(sc);
                            }
                        }
                    }
                }
            }
        }
        return caps;
    }

    private RegistryVersionDto mapToVersionDto(RegistryVersion entity) {
        RegistryVersionDto dto = new RegistryVersionDto();
        dto.setVersionId(entity.getVersionId());
        dto.setVersionName(entity.getVersionName());
        dto.setPublishedAt(entity.getPublishedAt());
        dto.setIsActive(entity.getIsActive());
        return dto;
    }

    private RegistryInstitutionDto mapToInstitutionDto(Institution entity) {
        RegistryInstitutionDto dto = new RegistryInstitutionDto();
        mapToInstitutionDto(entity, dto);
        return dto;
    }

    private void mapToInstitutionDto(Institution entity, RegistryInstitutionDto dto) {
        dto.setInstitutionId(entity.getInstitutionId());
        dto.setName(entity.getName());
        dto.setType(entity.getType());
        dto.setAisheIdentifier(entity.getAisheIdentifier());
        dto.setState(entity.getState());
        dto.setDistrict(entity.getDistrict());
        dto.setVerificationStatus(entity.getVerificationStatus());
        dto.setActiveStatus(entity.getActiveStatus());
        dto.setRegistryVersionId(entity.getRegistryVersionId());
    }
}
