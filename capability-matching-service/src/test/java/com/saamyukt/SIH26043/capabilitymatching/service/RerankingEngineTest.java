package com.saamyukt.SIH26043.capabilitymatching.service;

import com.saamyukt.SIH26043.capabilitymatching.dto.MatchResult;
import com.saamyukt.SIH26043.capabilitymatching.dto.ProblemFingerprint;
import com.saamyukt.SIH26043.capabilitymatching.dto.retrieval.RetrievalDTOs.RrfResult;
import com.saamyukt.SIH26043.capabilitymatching.entity.*;
import com.saamyukt.SIH26043.capabilitymatching.repository.InstitutionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

public class RerankingEngineTest {

    private RerankingEngine engine;
    private InstitutionRepository repo;
    private GeoDistanceCalculator geo;
    private AlgorithmConfig config;

    @BeforeEach
    void setUp() {
        repo = Mockito.mock(InstitutionRepository.class);
        geo = new GeoDistanceCalculator();
        engine = new RerankingEngine(repo, geo);

        config = new AlgorithmConfig();
        config.setSemanticWeight(0.25);
        config.setSkillWeight(0.20);
        config.setInfrastructureWeight(0.20);
        config.setPastPerformanceWeight(0.15);
        config.setCapacityWeight(0.10);
        config.setGeographyWeight(0.10);
        config.setCapacityThreshold(100);
        config.setMaxDistanceKm(500.0);
    }

    private Institution createInst(UUID id, double workload, double perf, double lat, double lon) {
        Institution inst = new Institution();
        inst.setInstitutionId(id);
        inst.setActiveStatus(true);
        inst.setVerificationStatus("VERIFIED");
        inst.setLatitude(lat);
        inst.setLongitude(lon);

        Department d = new Department();
        Faculty f = new Faculty();
        f.setCurrentWorkloadPct((int) workload);
        f.setPastPerformanceScore(perf);
        
        Skill s1 = new Skill(); s1.setName("Java");
        FacultySkill fs1 = new FacultySkill(); fs1.setSkill(s1);
        
        Skill s2 = new Skill(); s2.setName("Spring");
        FacultySkill fs2 = new FacultySkill(); fs2.setSkill(s2);

        f.setSkills(new HashSet<>(Arrays.asList(fs1, fs2)));
        d.setFaculty(Arrays.asList(f));

        Lab l = new Lab();
        Equipment e = new Equipment();
        e.setName("Microscope");
        e.setIsOperational(true);
        l.setEquipmentList(Arrays.asList(e));
        inst.setLabs(Arrays.asList(l));

        inst.setDepartments(Arrays.asList(d));
        return inst;
    }

    @Test
    void testHardConstraintsAndExactEquipmentFailure() {
        UUID id = UUID.randomUUID();
        Institution inst = createInst(id, 50, 0.8, 10.0, 10.0);
        when(repo.findById(id)).thenReturn(Optional.of(inst));

        RrfResult c = RrfResult.builder().institutionId(id).rrfScore(0.8).exactEquipmentMiss(true).build();
        ProblemFingerprint p = new ProblemFingerprint();
        
        // Should drop because exactEquipmentMiss = true
        List<MatchResult.MatchedInstitution> res = engine.rerank(Arrays.asList(c), p, config);
        assertTrue(res.isEmpty());
    }

    @Test
    void testCapacityExhaustion() {
        UUID id = UUID.randomUUID();
        Institution inst = createInst(id, 100, 0.8, 10.0, 10.0); // 100 workload
        when(repo.findById(id)).thenReturn(Optional.of(inst));

        RrfResult c = RrfResult.builder().institutionId(id).rrfScore(0.8).exactEquipmentMiss(false).build();
        ProblemFingerprint p = new ProblemFingerprint();
        
        // Should drop because capacity threshold is 100
        List<MatchResult.MatchedInstitution> res = engine.rerank(Arrays.asList(c), p, config);
        assertTrue(res.isEmpty());
    }

    @Test
    void testScoreNormalizationAndNearbyVsDistant() {
        UUID nearId = UUID.randomUUID();
        UUID farId = UUID.randomUUID();
        
        Institution nearInst = createInst(nearId, 50, 0.8, 10.0, 10.0);
        Institution farInst = createInst(farId, 50, 0.8, 10.0, 14.0); // further longitude
        
        when(repo.findById(nearId)).thenReturn(Optional.of(nearInst));
        when(repo.findById(farId)).thenReturn(Optional.of(farInst));

        RrfResult cNear = RrfResult.builder().institutionId(nearId).denseScore(0.9).exactEquipmentMiss(false).build();
        RrfResult cFar = RrfResult.builder().institutionId(farId).denseScore(0.9).exactEquipmentMiss(false).build();

        ProblemFingerprint p = new ProblemFingerprint();
        p.setLatitude(10.0);
        p.setLongitude(10.0);
        p.setMaxDistanceKm(500.0);

        List<MatchResult.MatchedInstitution> res = engine.rerank(Arrays.asList(cNear, cFar), p, config);
        assertEquals(2, res.size());
        
        // Near should win due to geography score
        assertEquals(nearId, res.get(0).getInstitutionId());
        assertTrue(res.get(0).getScoreBreakdown().getGeographicProximity() > res.get(1).getScoreBreakdown().getGeographicProximity());
    }

    @Test
    void testHighSkillAlignmentVsMissingSkill() {
        UUID id = UUID.randomUUID();
        Institution inst = createInst(id, 50, 0.8, 10.0, 10.0); // Has Java, Spring
        when(repo.findById(id)).thenReturn(Optional.of(inst));

        RrfResult c = RrfResult.builder().institutionId(id).denseScore(0.9).exactEquipmentMiss(false).build();
        
        // Case 1: High Alignment
        ProblemFingerprint p1 = new ProblemFingerprint();
        ProblemFingerprint.RequiredCapability req1 = new ProblemFingerprint.RequiredCapability();
        req1.setSkill("Java");
        p1.setRequiredCapabilities(Arrays.asList(req1));

        List<MatchResult.MatchedInstitution> res1 = engine.rerank(Arrays.asList(c), p1, config);
        assertEquals(1.0, res1.get(0).getScoreBreakdown().getSkillAlignment());

        // Case 2: Missing secondary skill
        ProblemFingerprint p2 = new ProblemFingerprint();
        ProblemFingerprint.RequiredCapability req2 = new ProblemFingerprint.RequiredCapability();
        req2.setSkill("Python");
        p2.setRequiredCapabilities(Arrays.asList(req1, req2));

        List<MatchResult.MatchedInstitution> res2 = engine.rerank(Arrays.asList(c), p2, config);
        assertEquals(0.5, res2.get(0).getScoreBreakdown().getSkillAlignment()); // 1 out of 2
    }

    @Test
    void testNoLocationInput() {
        UUID id = UUID.randomUUID();
        Institution inst = createInst(id, 50, 0.8, 10.0, 10.0);
        when(repo.findById(id)).thenReturn(Optional.of(inst));

        RrfResult c = RrfResult.builder().institutionId(id).denseScore(0.9).exactEquipmentMiss(false).build();
        
        ProblemFingerprint p = new ProblemFingerprint();
        List<MatchResult.MatchedInstitution> res = engine.rerank(Arrays.asList(c), p, config);
        
        assertEquals(0.5, res.get(0).getScoreBreakdown().getGeographicProximity());
    }

    @Test
    void testDeterministicTieBreaking() {
        UUID id1 = UUID.fromString("00000000-0000-0000-0000-000000000002");
        UUID id2 = UUID.fromString("00000000-0000-0000-0000-000000000001");
        
        Institution inst1 = createInst(id1, 50, 0.8, 10.0, 10.0);
        Institution inst2 = createInst(id2, 50, 0.8, 10.0, 10.0);
        when(repo.findById(id1)).thenReturn(Optional.of(inst1));
        when(repo.findById(id2)).thenReturn(Optional.of(inst2));

        // Same RRF scores
        RrfResult c1 = RrfResult.builder().institutionId(id1).denseScore(0.9).rrfScore(0.5).exactEquipmentMiss(false).build();
        RrfResult c2 = RrfResult.builder().institutionId(id2).denseScore(0.9).rrfScore(0.5).exactEquipmentMiss(false).build();
        
        ProblemFingerprint p = new ProblemFingerprint();
        List<MatchResult.MatchedInstitution> res = engine.rerank(Arrays.asList(c1, c2), p, config);
        
        // Exact same attributes, they should tie.
        assertEquals(res.get(0).getOverallScore(), res.get(1).getOverallScore());
        
        // Tie breaker is UUID ascending, so id2 should be first
        assertEquals(id2, res.get(0).getInstitutionId());
        assertEquals(id1, res.get(1).getInstitutionId());
    }
}
