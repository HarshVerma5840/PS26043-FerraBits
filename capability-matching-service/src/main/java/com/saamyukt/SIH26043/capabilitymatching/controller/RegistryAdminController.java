package com.saamyukt.SIH26043.capabilitymatching.controller;

import com.saamyukt.SIH26043.capabilitymatching.dto.admin.AdminDTOs.*;
import com.saamyukt.SIH26043.capabilitymatching.entity.*;
import com.saamyukt.SIH26043.capabilitymatching.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.Map;

@RestController
@RequestMapping("/capability/admin/registry")
@PreAuthorize("hasRole('ADMIN')")
public class RegistryAdminController {

    private final InstitutionRepository institutionRepository;
    private final DepartmentRepository departmentRepository;
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;
    private final LabRepository labRepository;
    private final EquipmentRepository equipmentRepository;
    private final SkillRepository skillRepository;
    private final FacultySkillRepository facultySkillRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final RegistryVersionRepository registryVersionRepository;

    public RegistryAdminController(InstitutionRepository institutionRepository, DepartmentRepository departmentRepository,
                                   FacultyRepository facultyRepository, StudentRepository studentRepository,
                                   LabRepository labRepository, EquipmentRepository equipmentRepository,
                                   SkillRepository skillRepository, FacultySkillRepository facultySkillRepository,
                                   StudentSkillRepository studentSkillRepository, TeamRepository teamRepository,
                                   TeamMemberRepository teamMemberRepository, RegistryVersionRepository registryVersionRepository) {
        this.institutionRepository = institutionRepository;
        this.departmentRepository = departmentRepository;
        this.facultyRepository = facultyRepository;
        this.studentRepository = studentRepository;
        this.labRepository = labRepository;
        this.equipmentRepository = equipmentRepository;
        this.skillRepository = skillRepository;
        this.facultySkillRepository = facultySkillRepository;
        this.studentSkillRepository = studentSkillRepository;
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.registryVersionRepository = registryVersionRepository;
    }

    @PostMapping("/institutions")
    @Transactional
    public ResponseEntity<?> createInstitution(@RequestBody InstitutionDto dto) {
        if (dto.getName() == null || dto.getName().isBlank()) return ResponseEntity.badRequest().body(Map.of("error", "Name is required"));
        if (dto.getAisheIdentifier() != null && institutionRepository.findByAisheIdentifier(dto.getAisheIdentifier()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Duplicate institution code (AISHE)"));
        }
        Institution inst = new Institution();
        inst.setInstitutionId(UUID.randomUUID());
        inst.setName(dto.getName());
        inst.setType(dto.getType());
        inst.setAisheIdentifier(dto.getAisheIdentifier());
        inst.setState(dto.getState());
        inst.setDistrict(dto.getDistrict());
        inst.setLatitude(dto.getLatitude());
        inst.setLongitude(dto.getLongitude());
        inst.setVerificationStatus(dto.getVerificationStatus() != null ? dto.getVerificationStatus() : "UNVERIFIED");
        inst.setActiveStatus(dto.getActiveStatus() != null ? dto.getActiveStatus() : true);
        inst.setCreatedAt(OffsetDateTime.now());
        inst.setUpdatedAt(OffsetDateTime.now());
        institutionRepository.save(inst);
        return ResponseEntity.ok(Map.of("id", inst.getInstitutionId()));
    }

    @PutMapping("/institutions/{id}")
    @Transactional
    public ResponseEntity<?> updateInstitution(@PathVariable UUID id, @RequestBody InstitutionDto dto) {
        return institutionRepository.findById(id).map(inst -> {
            checkNotPublished(inst);
            if (dto.getName() != null && !dto.getName().isBlank()) inst.setName(dto.getName());
            if (dto.getType() != null) inst.setType(dto.getType());
            if (dto.getAisheIdentifier() != null) {
                if (!dto.getAisheIdentifier().equals(inst.getAisheIdentifier()) && 
                    institutionRepository.findByAisheIdentifier(dto.getAisheIdentifier()).isPresent()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Duplicate institution code (AISHE)"));
                }
                inst.setAisheIdentifier(dto.getAisheIdentifier());
            }
            if (dto.getState() != null) inst.setState(dto.getState());
            if (dto.getDistrict() != null) inst.setDistrict(dto.getDistrict());
            if (dto.getLatitude() != null) inst.setLatitude(dto.getLatitude());
            if (dto.getLongitude() != null) inst.setLongitude(dto.getLongitude());
            if (dto.getVerificationStatus() != null) inst.setVerificationStatus(dto.getVerificationStatus());
            if (dto.getActiveStatus() != null) inst.setActiveStatus(dto.getActiveStatus());
            inst.setUpdatedAt(OffsetDateTime.now());
            institutionRepository.save(inst);
            return ResponseEntity.ok(Map.of("id", inst.getInstitutionId()));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/departments")
    @Transactional
    public ResponseEntity<?> createDepartment(@RequestBody DepartmentDto dto) {
        if (dto.getName() == null || dto.getName().isBlank()) return ResponseEntity.badRequest().body(Map.of("error", "Name is required"));
        Optional<Institution> instOpt = institutionRepository.findById(dto.getInstitutionId());
        if (instOpt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "Institution not found"));
        Institution inst = instOpt.get();
        checkNotPublished(inst);
        Department d = new Department();
        d.setDepartmentId(UUID.randomUUID());
        d.setInstitution(inst);
        d.setName(dto.getName());
        d.setDescription(dto.getDescription());
        departmentRepository.save(d);
        return ResponseEntity.ok(Map.of("id", d.getDepartmentId()));
    }

    @PostMapping("/faculty/{id}/skills")
    @Transactional
    public ResponseEntity<?> addFacultyCapability(@PathVariable UUID id, @RequestBody FacultyCapabilityDto dto) {
        Optional<Faculty> facOpt = facultyRepository.findById(id);
        Optional<Skill> skillOpt = skillRepository.findById(dto.getSkillId());
        if (facOpt.isEmpty() || skillOpt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "Faculty or Skill not found"));
        Faculty fac = facOpt.get();
        checkNotPublished(fac.getDepartment().getInstitution());
        
        FacultySkill fs = new FacultySkill();
        fs.getId().setFacultyId(id);
        fs.getId().setSkillId(dto.getSkillId());
        fs.setFaculty(fac);
        fs.setSkill(skillOpt.get());
        fs.setProficiencyLevel(dto.getProficiencyLevel());
        facultySkillRepository.save(fs);
        return ResponseEntity.ok(Map.of("status", "success"));
    }

    @PostMapping("/students/{id}/skills")
    @Transactional
    public ResponseEntity<?> addStudentSkill(@PathVariable UUID id, @RequestBody StudentSkillDto dto) {
        Optional<Student> stuOpt = studentRepository.findById(id);
        Optional<Skill> skillOpt = skillRepository.findById(dto.getSkillId());
        if (stuOpt.isEmpty() || skillOpt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "Student or Skill not found"));
        Student stu = stuOpt.get();
        checkNotPublished(stu.getInstitution());

        StudentSkill ss = new StudentSkill();
        ss.getId().setStudentId(id);
        ss.getId().setSkillId(dto.getSkillId());
        ss.setStudent(stu);
        ss.setSkill(skillOpt.get());
        ss.setProficiencyLevel(dto.getProficiencyLevel());
        studentSkillRepository.save(ss);
        return ResponseEntity.ok(Map.of("status", "success"));
    }

    @PostMapping("/labs")
    @Transactional
    public ResponseEntity<?> addLab(@RequestBody LabDto dto) {
        if (dto.getName() == null || dto.getName().isBlank()) return ResponseEntity.badRequest().body(Map.of("error", "Name is required"));
        Optional<Institution> instOpt = institutionRepository.findById(dto.getInstitutionId());
        if (instOpt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "Institution not found"));
        Institution inst = instOpt.get();
        checkNotPublished(inst);
        Lab l = new Lab();
        l.setLabId(UUID.randomUUID());
        l.setInstitution(inst);
        l.setName(dto.getName());
        labRepository.save(l);
        return ResponseEntity.ok(Map.of("id", l.getLabId()));
    }

    @PostMapping("/labs/{labId}/equipment")
    @Transactional
    public ResponseEntity<?> addEquipment(@PathVariable UUID labId, @RequestBody EquipmentDto dto) {
        if (dto.getName() == null || dto.getName().isBlank()) return ResponseEntity.badRequest().body(Map.of("error", "Name is required"));
        Optional<Lab> labOpt = labRepository.findById(labId);
        if (labOpt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "Lab not found"));
        Lab lab = labOpt.get();
        checkNotPublished(lab.getInstitution());
        Equipment eq = new Equipment();
        eq.setEquipmentId(UUID.randomUUID());
        eq.setLab(lab);
        eq.setName(dto.getName());
        eq.setIsOperational(dto.getIsOperational() != null ? dto.getIsOperational() : true);
        equipmentRepository.save(eq);
        return ResponseEntity.ok(Map.of("id", eq.getEquipmentId()));
    }

    @PutMapping("/equipment/{id}/status")
    @Transactional
    public ResponseEntity<?> updateEquipmentStatus(@PathVariable UUID id, @RequestParam Boolean isOperational) {
        return equipmentRepository.findById(id).map(eq -> {
            checkNotPublished(eq.getLab().getInstitution());
            eq.setIsOperational(isOperational);
            equipmentRepository.save(eq);
            return ResponseEntity.ok(Map.of("id", eq.getEquipmentId()));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/faculty/{id}/capacity")
    @Transactional
    public ResponseEntity<?> updateCapacity(@PathVariable UUID id, @RequestBody CapacityDto dto) {
        return facultyRepository.findById(id).map(f -> {
            checkNotPublished(f.getDepartment().getInstitution());
            if (dto.getWorkloadCapacityPct() != null) f.setWorkloadCapacityPct(dto.getWorkloadCapacityPct());
            if (dto.getCurrentWorkloadPct() != null) f.setCurrentWorkloadPct(dto.getCurrentWorkloadPct());
            facultyRepository.save(f);
            return ResponseEntity.ok(Map.of("id", f.getFacultyId()));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/teams")
    @Transactional
    public ResponseEntity<?> createTeam(@RequestBody TeamDto dto) {
        if (dto.getName() == null || dto.getName().isBlank()) return ResponseEntity.badRequest().body(Map.of("error", "Name is required"));
        Optional<Institution> instOpt = institutionRepository.findById(dto.getInstitutionId());
        if (instOpt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "Institution not found"));
        Institution inst = instOpt.get();
        checkNotPublished(inst);
        Team t = new Team();
        t.setTeamId(UUID.randomUUID());
        t.setInstitution(inst);
        t.setName(dto.getName());
        t.setDescription(dto.getDescription());
        t.setCreatedAt(OffsetDateTime.now());
        teamRepository.save(t);
        return ResponseEntity.ok(Map.of("id", t.getTeamId()));
    }

    @PostMapping("/teams/{teamId}/members")
    @Transactional
    public ResponseEntity<?> addTeamMember(@PathVariable UUID teamId, @RequestBody TeamMemberDto dto) {
        Optional<Team> teamOpt = teamRepository.findById(teamId);
        if (teamOpt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "Team not found"));
        Team team = teamOpt.get();
        checkNotPublished(team.getInstitution());
        
        TeamMember tm = new TeamMember();
        tm.setTeamMemberId(UUID.randomUUID());
        tm.setTeam(team);
        tm.setRole(dto.getRole());
        
        if (dto.getFacultyId() != null) {
            facultyRepository.findById(dto.getFacultyId()).ifPresent(tm::setFaculty);
        } else if (dto.getStudentId() != null) {
            studentRepository.findById(dto.getStudentId()).ifPresent(tm::setStudent);
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Must provide facultyId or studentId"));
        }
        
        teamMemberRepository.save(tm);
        return ResponseEntity.ok(Map.of("id", tm.getTeamMemberId()));
    }

    private void checkNotPublished(Institution inst) {
        if (inst.getRegistryVersionId() != null) {
            registryVersionRepository.findById(inst.getRegistryVersionId()).ifPresent(rv -> {
                if (rv.getPublishedAt() != null) {
                    throw new IllegalStateException("Cannot modify entities belonging to a published registry version.");
                }
            });
        }
    }
}
