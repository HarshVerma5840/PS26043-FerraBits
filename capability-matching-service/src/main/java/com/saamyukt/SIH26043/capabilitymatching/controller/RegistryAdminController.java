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

@RestController
@RequestMapping("/api/v1/admin/registry")
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
    public ResponseEntity<Institution> createInstitution(@RequestBody InstitutionDto dto) {
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
        return ResponseEntity.ok(institutionRepository.save(inst));
    }

    @PutMapping("/institutions/{id}")
    @Transactional
    public ResponseEntity<Institution> updateInstitution(@PathVariable UUID id, @RequestBody InstitutionDto dto) {
        return institutionRepository.findById(id).map(inst -> {
            inst.setName(dto.getName());
            inst.setType(dto.getType());
            inst.setAisheIdentifier(dto.getAisheIdentifier());
            inst.setState(dto.getState());
            inst.setDistrict(dto.getDistrict());
            inst.setLatitude(dto.getLatitude());
            inst.setLongitude(dto.getLongitude());
            inst.setVerificationStatus(dto.getVerificationStatus());
            inst.setActiveStatus(dto.getActiveStatus());
            inst.setUpdatedAt(OffsetDateTime.now());
            return ResponseEntity.ok(institutionRepository.save(inst));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/departments")
    @Transactional
    public ResponseEntity<Department> createDepartment(@RequestBody DepartmentDto dto) {
        Optional<Institution> instOpt = institutionRepository.findById(dto.getInstitutionId());
        if (instOpt.isEmpty()) return ResponseEntity.badRequest().build();
        Department d = new Department();
        d.setDepartmentId(UUID.randomUUID());
        d.setInstitution(instOpt.get());
        d.setName(dto.getName());
        d.setDescription(dto.getDescription());
        return ResponseEntity.ok(departmentRepository.save(d));
    }

    @PostMapping("/faculty/{id}/skills")
    @Transactional
    public ResponseEntity<FacultySkill> addFacultyCapability(@PathVariable UUID id, @RequestBody FacultyCapabilityDto dto) {
        Optional<Faculty> facOpt = facultyRepository.findById(id);
        Optional<Skill> skillOpt = skillRepository.findById(dto.getSkillId());
        if (facOpt.isEmpty() || skillOpt.isEmpty()) return ResponseEntity.badRequest().build();
        
        FacultySkill fs = new FacultySkill();
        fs.getId().setFacultyId(id);
        fs.getId().setSkillId(dto.getSkillId());
        fs.setFaculty(facOpt.get());
        fs.setSkill(skillOpt.get());
        fs.setProficiencyLevel(dto.getProficiencyLevel());
        return ResponseEntity.ok(facultySkillRepository.save(fs));
    }

    @PostMapping("/students/{id}/skills")
    @Transactional
    public ResponseEntity<StudentSkill> addStudentSkill(@PathVariable UUID id, @RequestBody StudentSkillDto dto) {
        Optional<Student> stuOpt = studentRepository.findById(id);
        Optional<Skill> skillOpt = skillRepository.findById(dto.getSkillId());
        if (stuOpt.isEmpty() || skillOpt.isEmpty()) return ResponseEntity.badRequest().build();

        StudentSkill ss = new StudentSkill();
        ss.getId().setStudentId(id);
        ss.getId().setSkillId(dto.getSkillId());
        ss.setStudent(stuOpt.get());
        ss.setSkill(skillOpt.get());
        ss.setProficiencyLevel(dto.getProficiencyLevel());
        return ResponseEntity.ok(studentSkillRepository.save(ss));
    }

    @PostMapping("/labs")
    @Transactional
    public ResponseEntity<Lab> addLab(@RequestBody LabDto dto) {
        Optional<Institution> instOpt = institutionRepository.findById(dto.getInstitutionId());
        if (instOpt.isEmpty()) return ResponseEntity.badRequest().build();
        Lab l = new Lab();
        l.setLabId(UUID.randomUUID());
        l.setInstitution(instOpt.get());
        l.setName(dto.getName());
        return ResponseEntity.ok(labRepository.save(l));
    }

    @PostMapping("/labs/{labId}/equipment")
    @Transactional
    public ResponseEntity<Equipment> addEquipment(@PathVariable UUID labId, @RequestBody EquipmentDto dto) {
        Optional<Lab> labOpt = labRepository.findById(labId);
        if (labOpt.isEmpty()) return ResponseEntity.badRequest().build();
        Equipment eq = new Equipment();
        eq.setEquipmentId(UUID.randomUUID());
        eq.setLab(labOpt.get());
        eq.setName(dto.getName());
        eq.setIsOperational(dto.getIsOperational() != null ? dto.getIsOperational() : true);
        return ResponseEntity.ok(equipmentRepository.save(eq));
    }

    @PutMapping("/equipment/{id}/status")
    @Transactional
    public ResponseEntity<Equipment> updateEquipmentStatus(@PathVariable UUID id, @RequestParam Boolean isOperational) {
        return equipmentRepository.findById(id).map(eq -> {
            eq.setIsOperational(isOperational);
            return ResponseEntity.ok(equipmentRepository.save(eq));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/faculty/{id}/capacity")
    @Transactional
    public ResponseEntity<Faculty> updateCapacity(@PathVariable UUID id, @RequestBody CapacityDto dto) {
        return facultyRepository.findById(id).map(f -> {
            if (dto.getWorkloadCapacityPct() != null) f.setWorkloadCapacityPct(dto.getWorkloadCapacityPct());
            if (dto.getCurrentWorkloadPct() != null) f.setCurrentWorkloadPct(dto.getCurrentWorkloadPct());
            return ResponseEntity.ok(facultyRepository.save(f));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/teams")
    @Transactional
    public ResponseEntity<Team> createTeam(@RequestBody TeamDto dto) {
        Optional<Institution> instOpt = institutionRepository.findById(dto.getInstitutionId());
        if (instOpt.isEmpty()) return ResponseEntity.badRequest().build();
        Team t = new Team();
        t.setTeamId(UUID.randomUUID());
        t.setInstitution(instOpt.get());
        t.setName(dto.getName());
        t.setDescription(dto.getDescription());
        t.setCreatedAt(OffsetDateTime.now());
        return ResponseEntity.ok(teamRepository.save(t));
    }

    @PostMapping("/teams/{teamId}/members")
    @Transactional
    public ResponseEntity<TeamMember> addTeamMember(@PathVariable UUID teamId, @RequestBody TeamMemberDto dto) {
        Optional<Team> teamOpt = teamRepository.findById(teamId);
        if (teamOpt.isEmpty()) return ResponseEntity.badRequest().build();
        
        TeamMember tm = new TeamMember();
        tm.setTeamMemberId(UUID.randomUUID());
        tm.setTeam(teamOpt.get());
        tm.setRole(dto.getRole());
        
        if (dto.getFacultyId() != null) {
            facultyRepository.findById(dto.getFacultyId()).ifPresent(tm::setFaculty);
        } else if (dto.getStudentId() != null) {
            studentRepository.findById(dto.getStudentId()).ifPresent(tm::setStudent);
        } else {
            return ResponseEntity.badRequest().build();
        }
        
        return ResponseEntity.ok(teamMemberRepository.save(tm));
    }

    @PostMapping("/versions")
    @Transactional
    public ResponseEntity<RegistryVersion> publishVersion(@RequestParam String versionName) {
        RegistryVersion v = new RegistryVersion();
        v.setVersionName(versionName);
        v.setPublishedAt(OffsetDateTime.now());
        v.setIsActive(true);
        // Deactivate others
        registryVersionRepository.findAll().forEach(old -> {
            old.setIsActive(false);
            registryVersionRepository.save(old);
        });
        return ResponseEntity.ok(registryVersionRepository.save(v));
    }
}
