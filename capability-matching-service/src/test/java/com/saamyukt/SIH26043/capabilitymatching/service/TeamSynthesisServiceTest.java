package com.saamyukt.SIH26043.capabilitymatching.service;

import com.saamyukt.SIH26043.capabilitymatching.dto.ProblemFingerprint;
import com.saamyukt.SIH26043.capabilitymatching.dto.TeamSynthesisResult;
import com.saamyukt.SIH26043.capabilitymatching.entity.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

public class TeamSynthesisServiceTest {

    private TeamSynthesisService service;
    private AlgorithmConfig config;

    @BeforeEach
    void setUp() {
        GeoDistanceCalculator geo = new GeoDistanceCalculator();
        service = new TeamSynthesisService(geo);
        config = new AlgorithmConfig();
        config.setCapacityThreshold(100);
        config.setVersion("v1.0.0");
    }

    private Institution createInstitution() {
        Institution inst = new Institution();
        inst.setRegistryVersionId(5);

        // Civil Dept
        Department dCivil = new Department();
        dCivil.setName("Civil Engineering");
        Faculty f1 = new Faculty();
        f1.setFacultyId(UUID.fromString("00000000-0000-0000-0000-000000000001"));
        f1.setCurrentWorkloadPct(50);
        f1.setPastPerformanceScore(0.9);
        Skill s1 = new Skill(); s1.setName("Water Quality Testing");
        FacultySkill fs1 = new FacultySkill(); fs1.setSkill(s1);
        f1.setSkills(new HashSet<>(Arrays.asList(fs1)));
        dCivil.setFaculty(Arrays.asList(f1));

        // CS Dept
        Department dCS = new Department();
        dCS.setName("Computer Science");
        Faculty f2 = new Faculty();
        f2.setFacultyId(UUID.fromString("00000000-0000-0000-0000-000000000002"));
        f2.setCurrentWorkloadPct(50);
        f2.setPastPerformanceScore(0.8);
        Skill s2 = new Skill(); s2.setName("IoT");
        FacultySkill fs2 = new FacultySkill(); fs2.setSkill(s2);
        f2.setSkills(new HashSet<>(Arrays.asList(fs2)));

        Faculty f3 = new Faculty(); // Exhausted capacity
        f3.setFacultyId(UUID.fromString("00000000-0000-0000-0000-000000000003"));
        f3.setCurrentWorkloadPct(100);
        Skill s3 = new Skill(); s3.setName("AI");
        FacultySkill fs3 = new FacultySkill(); fs3.setSkill(s3);
        f3.setSkills(new HashSet<>(Arrays.asList(fs3)));

        Faculty f4 = new Faculty(); // Tie breaker (same skill as f2, but better performance)
        f4.setFacultyId(UUID.fromString("00000000-0000-0000-0000-000000000004"));
        f4.setCurrentWorkloadPct(40);
        f4.setPastPerformanceScore(0.95);
        FacultySkill fs4 = new FacultySkill(); fs4.setSkill(s2); // IoT
        f4.setSkills(new HashSet<>(Arrays.asList(fs4)));

        dCS.setFaculty(Arrays.asList(f2, f3, f4));

        inst.setDepartments(Arrays.asList(dCivil, dCS));

        // Labs
        Lab l1 = new Lab();
        l1.setName("Environmental Lab");
        Equipment e1 = new Equipment();
        e1.setName("Spectrometer");
        e1.setIsOperational(true);
        
        Equipment e2 = new Equipment();
        e2.setName("Broken Sensor");
        e2.setIsOperational(false);
        l1.setEquipmentList(Arrays.asList(e1, e2));
        
        inst.setLabs(Arrays.asList(l1));

        return inst;
    }

    @Test
    void testSingleDisciplineProblem() {
        Institution inst = createInstitution();
        ProblemFingerprint p = new ProblemFingerprint();
        ProblemFingerprint.RequiredCapability req1 = new ProblemFingerprint.RequiredCapability();
        req1.setSkill("Water Quality Testing");
        req1.setImportance("HIGH");
        p.setRequiredCapabilities(Arrays.asList(req1));

        TeamSynthesisResult res = service.synthesizeTeam(inst, p, config);

        assertEquals(1, res.getMembers().size());
        assertEquals("00000000-0000-0000-0000-000000000001", res.getMembers().get(0).getMemberReference());
        assertEquals("Civil Engineering", res.getMembers().get(0).getDepartment());
        assertEquals(1, res.getCoveredSkills().size());
        assertEquals(0, res.getSkillGaps().size());
    }

    @Test
    void testMultidisciplinaryProblemAndDeterministicSelection() {
        Institution inst = createInstitution();
        ProblemFingerprint p = new ProblemFingerprint();
        ProblemFingerprint.RequiredCapability req1 = new ProblemFingerprint.RequiredCapability();
        req1.setSkill("Water Quality Testing");
        ProblemFingerprint.RequiredCapability req2 = new ProblemFingerprint.RequiredCapability();
        req2.setSkill("IoT");
        p.setRequiredCapabilities(Arrays.asList(req1, req2));

        TeamSynthesisResult res = service.synthesizeTeam(inst, p, config);

        assertEquals(2, res.getMembers().size());
        assertTrue(res.getCoveredSkills().contains("Water Quality Testing"));
        assertTrue(res.getCoveredSkills().contains("IoT"));

        // Deterministic check: For IoT, both f2 (0.8 perf) and f4 (0.95 perf) have it. f4 should win.
        boolean f4Found = res.getMembers().stream().anyMatch(m -> m.getMemberReference().equals("00000000-0000-0000-0000-000000000004"));
        assertTrue(f4Found, "f4 should be selected due to higher past performance");
    }

    @Test
    void testMissingSkillAndCapacityFailure() {
        Institution inst = createInstitution();
        ProblemFingerprint p = new ProblemFingerprint();
        ProblemFingerprint.RequiredCapability req1 = new ProblemFingerprint.RequiredCapability();
        req1.setSkill("AI"); // Held by f3 who is at 100% capacity
        req1.setImportance("HIGH");
        ProblemFingerprint.RequiredCapability req2 = new ProblemFingerprint.RequiredCapability();
        req2.setSkill("Blockchain"); // Nobody has this
        p.setRequiredCapabilities(Arrays.asList(req1, req2));

        TeamSynthesisResult res = service.synthesizeTeam(inst, p, config);

        assertEquals(0, res.getMembers().size()); // No one was added
        assertEquals(2, res.getSkillGaps().size());
        assertTrue(res.getSkillGaps().contains("AI"));
        assertTrue(res.getSkillGaps().contains("Blockchain"));
        
        boolean highImportanceMsg = res.getEvidence().stream().anyMatch(e -> e.contains("Required high-importance skill 'AI' is MISSING"));
        assertTrue(highImportanceMsg);
    }

    @Test
    void testEquipmentEvidence() {
        Institution inst = createInstitution();
        ProblemFingerprint p = new ProblemFingerprint();
        p.setRequiredEquipment(Arrays.asList("Spectrometer", "Broken Sensor", "Drone"));

        TeamSynthesisResult res = service.synthesizeTeam(inst, p, config);

        assertEquals(3, res.getEquipmentEvidence().size());
        
        TeamSynthesisResult.EquipmentEvidence spec = res.getEquipmentEvidence().stream().filter(e -> e.getEquipment().equals("Spectrometer")).findFirst().get();
        assertEquals("VERIFIED_AVAILABLE", spec.getStatus());
        assertEquals("Environmental Lab", spec.getLab());

        TeamSynthesisResult.EquipmentEvidence broken = res.getEquipmentEvidence().stream().filter(e -> e.getEquipment().equals("Broken Sensor")).findFirst().get();
        assertEquals("UNAVAILABLE", broken.getStatus());

        TeamSynthesisResult.EquipmentEvidence drone = res.getEquipmentEvidence().stream().filter(e -> e.getEquipment().equals("Drone")).findFirst().get();
        assertEquals("NOT_FOUND", drone.getStatus());
    }
}
