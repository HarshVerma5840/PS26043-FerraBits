package com.saamyukt.SIH26043.capabilitymatching.service.importing;

import com.saamyukt.SIH26043.capabilitymatching.dto.importing.ImportDTOs.*;
import com.saamyukt.SIH26043.capabilitymatching.entity.Institution;
import com.saamyukt.SIH26043.capabilitymatching.entity.RegistryVersion;
import com.saamyukt.SIH26043.capabilitymatching.repository.InstitutionRepository;
import com.saamyukt.SIH26043.capabilitymatching.repository.RegistryVersionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Arrays;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

public class CapabilityImportServiceTest {

    private InstitutionRepository institutionRepository;
    private RegistryVersionRepository registryVersionRepository;
    private CapabilityImportService service;

    @BeforeEach
    void setUp() {
        institutionRepository = Mockito.mock(InstitutionRepository.class);
        registryVersionRepository = Mockito.mock(RegistryVersionRepository.class);
        service = new CapabilityImportService(institutionRepository, registryVersionRepository);

        RegistryVersion rv = new RegistryVersion();
        rv.setVersionId(1);
        when(registryVersionRepository.save(any())).thenReturn(rv);
    }

    @Test
    public void testSuccessfulImport() {
        when(institutionRepository.findAll()).thenReturn(Collections.emptyList());

        RegistryImportRequest req = new RegistryImportRequest();
        req.setSource("AISHE");
        InstitutionImportDto dto = new InstitutionImportDto();
        dto.setName("  Test University  ");
        dto.setAisheIdentifier("U-1234");
        req.setInstitutions(Arrays.asList(dto));

        ImportResultSummary res = service.importRegistry(req);

        assertEquals(1, res.getAcceptedCount());
        assertEquals(0, res.getRejectedCount());
        assertNotNull(res.getNewRegistryVersionId());
    }

    @Test
    public void testDuplicateAndInvalidImport() {
        Institution existing = new Institution();
        existing.setAisheIdentifier("U-DUPE");
        when(institutionRepository.findAll()).thenReturn(Arrays.asList(existing));

        RegistryImportRequest req = new RegistryImportRequest();
        req.setSource("MANUAL");
        
        InstitutionImportDto duplicateDto = new InstitutionImportDto();
        duplicateDto.setName("Dupe Univ");
        duplicateDto.setAisheIdentifier("U-DUPE");

        InstitutionImportDto invalidDto = new InstitutionImportDto();
        invalidDto.setName("   "); // Invalid name
        invalidDto.setAisheIdentifier("U-NEW");

        req.setInstitutions(Arrays.asList(duplicateDto, invalidDto));

        ImportResultSummary res = service.importRegistry(req);

        assertEquals(0, res.getAcceptedCount());
        assertEquals(2, res.getRejectedCount());
        assertEquals(2, res.getRejectedReasons().size());
        assertTrue(res.getRejectedReasons().get(0).contains("Missing") || res.getRejectedReasons().get(1).contains("Missing"));
        assertTrue(res.getRejectedReasons().get(0).contains("Duplicate") || res.getRejectedReasons().get(1).contains("Duplicate"));
    }

    @Test
    public void testInvalidRequestValidation() {
        assertThrows(IllegalArgumentException.class, () -> service.importRegistry(null));

        RegistryImportRequest req = new RegistryImportRequest();
        assertThrows(IllegalArgumentException.class, () -> service.importRegistry(req));

        req.setSource("INVALID");
        assertThrows(IllegalArgumentException.class, () -> service.importRegistry(req));

        req.setSource("MANUAL");
        req.setInstitutions(Collections.emptyList());
        assertThrows(IllegalArgumentException.class, () -> service.importRegistry(req));
    }
}
