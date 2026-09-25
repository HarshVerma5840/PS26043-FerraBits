package com.saamyukt.SIH26043.capabilitymatching.service.registry;

import com.saamyukt.SIH26043.capabilitymatching.dto.registry.RegistryDTOs.*;
import com.saamyukt.SIH26043.capabilitymatching.entity.*;
import com.saamyukt.SIH26043.capabilitymatching.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class RegistryServiceTest {

    @Mock
    private RegistryVersionRepository versionRepository;

    @Mock
    private InstitutionRepository institutionRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private com.saamyukt.SIH26043.capabilitymatching.service.embedding.EmbeddingGenerationService embeddingService;

    @InjectMocks
    private RegistryService registryService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetVersions() {
        RegistryVersion v = new RegistryVersion();
        v.setVersionId(1);
        v.setVersionName("v1");
        when(versionRepository.findAll(any(PageRequest.class)))
                .thenReturn(new PageImpl<>(List.of(v)));

        Page<RegistryVersionDto> result = registryService.getVersions(PageRequest.of(0, 10));
        assertEquals(1, result.getTotalElements());
        assertEquals(1, result.getContent().get(0).getVersionId());
    }

    @Test
    void testPublishVersion_Success() {
        RegistryVersion v = new RegistryVersion();
        v.setVersionId(1);
        when(versionRepository.findById(1)).thenReturn(Optional.of(v));
        when(versionRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        RegistryVersionDto res = registryService.publishVersion(1);
        assertNotNull(res.getPublishedAt());
        assertTrue(res.getIsActive());
    }

    @Test
    void testPublishVersion_AlreadyPublished() {
        RegistryVersion v = new RegistryVersion();
        v.setVersionId(1);
        v.setPublishedAt(OffsetDateTime.now());
        when(versionRepository.findById(1)).thenReturn(Optional.of(v));

        assertThrows(IllegalStateException.class, () -> registryService.publishVersion(1));
    }

    @Test
    void testArchiveVersion_Success() {
        RegistryVersion v = new RegistryVersion();
        v.setVersionId(1);
        v.setPublishedAt(OffsetDateTime.now());
        v.setIsActive(true);
        when(versionRepository.findById(1)).thenReturn(Optional.of(v));
        when(versionRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        RegistryVersionDto res = registryService.archiveVersion(1);
        assertFalse(res.getIsActive());
    }

    @Test
    void testArchiveVersion_NotPublished() {
        RegistryVersion v = new RegistryVersion();
        v.setVersionId(1);
        // not published
        when(versionRepository.findById(1)).thenReturn(Optional.of(v));

        assertThrows(IllegalStateException.class, () -> registryService.archiveVersion(1));
    }

    @Test
    void testGetInstitutions() {
        Institution inst = new Institution();
        inst.setInstitutionId(UUID.randomUUID());
        inst.setName("Test Inst");

        when(institutionRepository.findAll(any(Specification.class), any(PageRequest.class)))
                .thenReturn(new PageImpl<>(List.of(inst)));

        RegistryFilterRequest req = new RegistryFilterRequest();
        req.setDistrict("Pune");
        Page<RegistryInstitutionDto> result = registryService.getInstitutions(req, PageRequest.of(0, 10));
        
        assertEquals(1, result.getTotalElements());
        assertEquals("Test Inst", result.getContent().get(0).getName());
    }
}
