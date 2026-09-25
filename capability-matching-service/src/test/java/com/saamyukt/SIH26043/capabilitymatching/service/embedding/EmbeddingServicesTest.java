package com.saamyukt.SIH26043.capabilitymatching.service.embedding;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.saamyukt.SIH26043.capabilitymatching.dto.ProblemFingerprint;
import com.saamyukt.SIH26043.capabilitymatching.dto.embedding.EmbeddingDTOs.EmbeddingRequest;
import com.saamyukt.SIH26043.capabilitymatching.dto.embedding.EmbeddingDTOs.EmbeddingResult;
import com.saamyukt.SIH26043.capabilitymatching.entity.EmbeddingRecord;
import com.saamyukt.SIH26043.capabilitymatching.entity.Institution;
import com.saamyukt.SIH26043.capabilitymatching.repository.EmbeddingRecordRepository;
import com.saamyukt.SIH26043.capabilitymatching.repository.InstitutionRepository;
import com.saamyukt.SIH26043.capabilitymatching.service.EmbeddingProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class EmbeddingServicesTest {

    private EmbeddingProvider mockProvider;
    private EmbeddingRecordRepository recordRepo;
    private InstitutionRepository instRepo;
    private ObjectMapper objectMapper;
    
    private EmbeddingGenerationService generationService;
    private DenseRetrievalService retrievalService;

    @BeforeEach
    void setUp() {
        mockProvider = Mockito.mock(EmbeddingProvider.class);
        recordRepo = Mockito.mock(EmbeddingRecordRepository.class);
        instRepo = Mockito.mock(InstitutionRepository.class);
        objectMapper = new ObjectMapper();

        generationService = new EmbeddingGenerationService(mockProvider, recordRepo, objectMapper);
        retrievalService = new DenseRetrievalService(recordRepo, instRepo, mockProvider, objectMapper);
    }

    @Test
    public void testEmbeddingGenerationAndUnchangedSkip() {
        Institution inst = new Institution();
        inst.setInstitutionId(UUID.randomUUID());
        inst.setName("Test Inst");
        inst.setRegistryVersionId(1);

        when(recordRepo.findByEntityTypeAndEntityIdAndRegistryVersionId("INSTITUTION", inst.getInstitutionId(), 1))
                .thenReturn(Optional.empty());

        EmbeddingResult successResult = EmbeddingResult.builder()
                .success(true)
                .vector(Arrays.asList(0.1, 0.2, 0.3))
                .build();
        when(mockProvider.embed(any())).thenReturn(successResult);

        // 1. Generation
        generationService.generateForInstitution(inst);
        
        ArgumentCaptor<EmbeddingRecord> captor = ArgumentCaptor.forClass(EmbeddingRecord.class);
        verify(recordRepo, times(2)).save(captor.capture()); // Saved initial PENDING, then SUCCESS
        EmbeddingRecord saved = captor.getValue();
        assertEquals("SUCCESS", saved.getStatus());
        assertNotNull(saved.getContentHash());

        // 2. Unchanged Skip
        when(recordRepo.findByEntityTypeAndEntityIdAndRegistryVersionId("INSTITUTION", inst.getInstitutionId(), 1))
                .thenReturn(Optional.of(saved));
        
        // Calling again should skip
        generationService.generateForInstitution(inst);
        verify(mockProvider, times(1)).embed(any()); // Embed called only once total
    }

    @Test
    public void testProviderFailure() {
        Institution inst = new Institution();
        inst.setInstitutionId(UUID.randomUUID());
        inst.setName("Fail Inst");
        
        when(recordRepo.findByEntityTypeAndEntityIdAndRegistryVersionId(any(), any(), any())).thenReturn(Optional.empty());
        
        EmbeddingResult failResult = EmbeddingResult.builder()
                .success(false)
                .errorMessage("API Timeout")
                .build();
        when(mockProvider.embed(any())).thenReturn(failResult);

        generationService.generateForInstitution(inst);
        
        ArgumentCaptor<EmbeddingRecord> captor = ArgumentCaptor.forClass(EmbeddingRecord.class);
        verify(recordRepo, times(2)).save(captor.capture());
        EmbeddingRecord saved = captor.getValue();
        assertEquals("FAILED", saved.getStatus());
        assertEquals("API Timeout", saved.getErrorMessage());
        assertEquals(1, saved.getRetryCount());
    }

    @Test
    public void testDenseRetrievalFeatures() throws Exception {
        UUID inst1Id = UUID.randomUUID();
        UUID inst2Id = UUID.randomUUID();
        UUID inst3Id = UUID.randomUUID();
        UUID inst4Id = UUID.randomUUID(); // Dimension mismatch

        EmbeddingRecord r1 = new EmbeddingRecord(); r1.setEntityId(inst1Id); r1.setEmbeddingVector("[0.1, 0.1, 0.1]");
        EmbeddingRecord r2 = new EmbeddingRecord(); r2.setEntityId(inst2Id); r2.setEmbeddingVector("[0.9, 0.9, 0.9]"); // Best match
        EmbeddingRecord r3 = new EmbeddingRecord(); r3.setEntityId(inst3Id); r3.setEmbeddingVector("[0.2, 0.2, 0.2]"); // Inactive
        EmbeddingRecord r4 = new EmbeddingRecord(); r4.setEntityId(inst4Id); r4.setEmbeddingVector("[0.1, 0.1]"); // Mismatch dimension

        when(recordRepo.findByEntityTypeAndRegistryVersionIdAndStatus("INSTITUTION", 1, "SUCCESS"))
                .thenReturn(Arrays.asList(r1, r2, r3, r4));

        Institution i1 = new Institution(); i1.setInstitutionId(inst1Id); i1.setActiveStatus(true); i1.setVerificationStatus("VERIFIED");
        Institution i2 = new Institution(); i2.setInstitutionId(inst2Id); i2.setActiveStatus(true); i2.setVerificationStatus("VERIFIED");
        Institution i3 = new Institution(); i3.setInstitutionId(inst3Id); i3.setActiveStatus(false); i3.setVerificationStatus("VERIFIED");
        Institution i4 = new Institution(); i4.setInstitutionId(inst4Id); i4.setActiveStatus(true); i4.setVerificationStatus("VERIFIED");

        when(instRepo.findById(inst1Id)).thenReturn(Optional.of(i1));
        when(instRepo.findById(inst2Id)).thenReturn(Optional.of(i2));
        when(instRepo.findById(inst3Id)).thenReturn(Optional.of(i3));
        when(instRepo.findById(inst4Id)).thenReturn(Optional.of(i4));

        // Mock cosine similarity manually for the test cases
        when(mockProvider.cosineSimilarity(any(), any())).thenAnswer(inv -> {
            List<Double> v2 = inv.getArgument(1);
            if (v2.get(0) == 0.9) return 0.99;
            if (v2.get(0) == 0.1) return 0.11;
            return 0.0;
        });

        EmbeddingResult targetResult = EmbeddingResult.builder().success(true).vector(Arrays.asList(1.0, 1.0, 1.0)).build();
        when(mockProvider.embed(any())).thenReturn(targetResult);

        ProblemFingerprint fp = new ProblemFingerprint();
        fp.setDomain("AI");
        fp.setSubDomain("ML");

        // 1. Top-K retrieval & Inactive exclusion & Dimension mismatch skip
        List<DenseRetrievalService.DenseRetrievalResult> top1 = retrievalService.retrieveTopK(fp, 1, 1);
        assertEquals(1, top1.size());
        assertEquals(inst2Id, top1.get(0).getInstitutionId()); // Best match won

        List<DenseRetrievalService.DenseRetrievalResult> top5 = retrievalService.retrieveTopK(fp, 5, 1);
        assertEquals(2, top5.size()); // Excluded inactive (r3) and dimension mismatch (r4)
        
        // 2. Registry version isolation (If queried version 2, returning empty)
        when(recordRepo.findByEntityTypeAndRegistryVersionIdAndStatus("INSTITUTION", 2, "SUCCESS"))
                .thenReturn(Collections.emptyList());
        List<DenseRetrievalService.DenseRetrievalResult> version2 = retrievalService.retrieveTopK(fp, 5, 2);
        assertTrue(version2.isEmpty());
    }
}
