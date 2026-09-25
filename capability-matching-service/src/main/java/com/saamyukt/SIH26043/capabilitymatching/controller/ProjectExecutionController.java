package com.saamyukt.SIH26043.capabilitymatching.controller;

import com.saamyukt.SIH26043.capabilitymatching.dto.ProjectExecutionDTOs.*;
import com.saamyukt.SIH26043.capabilitymatching.service.ProjectExecutionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;
import java.util.List;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/capability/api/v1")
public class ProjectExecutionController {

    private final ProjectExecutionService executionService;

    public ProjectExecutionController(ProjectExecutionService executionService) {
        this.executionService = executionService;
    }

    private UUID getCurrentUserId() {
        try {
            return UUID.fromString(SecurityContextHolder.getContext().getAuthentication().getName());
        } catch (Exception e) {
            return UUID.randomUUID(); // Fallback for tests if needed
        }
    }

    @PostMapping("/projects/{projectId}/milestones")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<MilestoneDto> createMilestone(@PathVariable UUID projectId, @RequestBody MilestoneDto dto) {
        return ResponseEntity.ok(executionService.createMilestone(projectId, dto));
    }

    @GetMapping("/projects/{projectId}/milestones")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'REVIEWER', 'INTERNAL')")
    public ResponseEntity<List<MilestoneDto>> getMilestones(@PathVariable UUID projectId) {
        return ResponseEntity.ok(executionService.getMilestones(projectId));
    }

    @PatchMapping("/milestones/{milestoneId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<MilestoneDto> updateMilestone(@PathVariable UUID milestoneId, @RequestBody MilestoneDto dto) {
        return ResponseEntity.ok(executionService.updateMilestone(milestoneId, dto));
    }

    @DeleteMapping("/milestones/{milestoneId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<Void> deleteMilestone(@PathVariable UUID milestoneId) {
        executionService.deleteMilestone(milestoneId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/projects/{projectId}/tasks")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<TaskDto> createTask(@PathVariable UUID projectId, @RequestBody TaskDto dto) {
        return ResponseEntity.ok(executionService.createTask(projectId, dto, getCurrentUserId()));
    }

    @GetMapping("/projects/{projectId}/tasks")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'REVIEWER', 'INTERNAL')")
    public ResponseEntity<List<TaskDto>> getTasks(@PathVariable UUID projectId) {
        return ResponseEntity.ok(executionService.getTasks(projectId));
    }

    @PatchMapping("/tasks/{taskId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<TaskDto> updateTask(@PathVariable UUID taskId, @RequestBody TaskDto dto) {
        return ResponseEntity.ok(executionService.updateTask(taskId, dto, getCurrentUserId()));
    }

    @PatchMapping("/tasks/{taskId}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'INTERNAL')")
    public ResponseEntity<TaskDto> updateTaskStatus(@PathVariable UUID taskId, @RequestBody TaskStatusUpdateDto dto) {
        return ResponseEntity.ok(executionService.updateTaskStatus(taskId, dto.getStatus(), getCurrentUserId()));
    }

    @PatchMapping("/tasks/{taskId}/position")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'INTERNAL')")
    public ResponseEntity<TaskDto> updateTaskPosition(@PathVariable UUID taskId, @RequestBody TaskPositionUpdateDto dto) {
        return ResponseEntity.ok(executionService.updateTaskPosition(taskId, dto.getPositionIndex(), getCurrentUserId()));
    }

    @DeleteMapping("/tasks/{taskId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<Void> deleteTask(@PathVariable UUID taskId) {
        executionService.deleteTask(taskId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/projects/{projectId}/field-tests")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'INTERNAL')")
    public ResponseEntity<FieldTestDto> createFieldTest(@PathVariable UUID projectId, @RequestBody FieldTestDto dto) {
        return ResponseEntity.ok(executionService.createFieldTest(projectId, dto));
    }

    @GetMapping("/projects/{projectId}/field-tests")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'REVIEWER', 'INTERNAL')")
    public ResponseEntity<List<FieldTestDto>> getFieldTests(@PathVariable UUID projectId) {
        return ResponseEntity.ok(executionService.getFieldTests(projectId));
    }

    @PostMapping("/projects/{projectId}/deployments")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'INTERNAL')")
    public ResponseEntity<DeploymentDto> createDeployment(@PathVariable UUID projectId, @RequestBody DeploymentDto dto) {
        return ResponseEntity.ok(executionService.createDeployment(projectId, dto));
    }

    @GetMapping("/projects/{projectId}/deployments")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'REVIEWER', 'INTERNAL')")
    public ResponseEntity<List<DeploymentDto>> getDeployments(@PathVariable UUID projectId) {
        return ResponseEntity.ok(executionService.getDeployments(projectId));
    }
}
