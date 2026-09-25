package com.saamyukt.SIH26043.capabilitymatching.controller.registry;

import com.saamyukt.SIH26043.capabilitymatching.dto.registry.RegistryDTOs.*;
import com.saamyukt.SIH26043.capabilitymatching.service.registry.RegistryService;
import com.saamyukt.SIH26043.capabilitymatching.service.importing.CapabilityImportService;
import com.saamyukt.SIH26043.capabilitymatching.dto.importing.ImportDTOs.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/capability/registry")
public class RegistryApiController {

    private final RegistryService registryService;
    private final CapabilityImportService importService;

    public RegistryApiController(RegistryService registryService, CapabilityImportService importService) {
        this.registryService = registryService;
        this.importService = importService;
    }

    @GetMapping("/versions")
    public ResponseEntity<Page<RegistryVersionDto>> getVersions(Pageable pageable) {
        return ResponseEntity.ok(registryService.getVersions(pageable));
    }

    @GetMapping("/versions/{versionId}")
    public ResponseEntity<RegistryVersionDto> getVersion(@PathVariable Integer versionId) {
        return ResponseEntity.ok(registryService.getVersion(versionId));
    }

    @GetMapping("/institutions")
    public ResponseEntity<Page<RegistryInstitutionDto>> getInstitutions(RegistryFilterRequest filterRequest, Pageable pageable) {
        return ResponseEntity.ok(registryService.getInstitutions(filterRequest, pageable));
    }

    @GetMapping("/institutions/{institutionId}")
    public ResponseEntity<RegistryInstitutionDetailDto> getInstitution(@PathVariable UUID institutionId) {
        return ResponseEntity.ok(registryService.getInstitutionDetail(institutionId));
    }

    @GetMapping("/institutions/{institutionId}/capabilities")
    public ResponseEntity<Page<CapabilityDetailDto>> getInstitutionCapabilities(@PathVariable UUID institutionId, Pageable pageable) {
        return ResponseEntity.ok(registryService.getInstitutionCapabilities(institutionId, pageable));
    }

    @PostMapping("/import")
    @PreAuthorize("hasAnyRole('ADMIN', 'REGISTRY_MANAGER')")
    public ResponseEntity<ImportResultSummary> importRegistry(@RequestBody RegistryImportRequest request) {
        return ResponseEntity.ok(importService.importRegistry(request));
    }

    @PostMapping("/versions/{versionId}/publish")
    @PreAuthorize("hasAnyRole('ADMIN', 'REGISTRY_MANAGER')")
    public ResponseEntity<RegistryVersionDto> publishVersion(@PathVariable Integer versionId) {
        return ResponseEntity.ok(registryService.publishVersion(versionId));
    }

    @PostMapping("/versions/{versionId}/archive")
    @PreAuthorize("hasAnyRole('ADMIN', 'REGISTRY_MANAGER')")
    public ResponseEntity<RegistryVersionDto> archiveVersion(@PathVariable Integer versionId) {
        return ResponseEntity.ok(registryService.archiveVersion(versionId));
    }
}
