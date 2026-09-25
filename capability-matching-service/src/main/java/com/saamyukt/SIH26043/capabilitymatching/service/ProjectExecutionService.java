package com.saamyukt.SIH26043.capabilitymatching.service;

import com.saamyukt.SIH26043.capabilitymatching.dto.ProjectExecutionDTOs.*;
import com.saamyukt.SIH26043.capabilitymatching.entity.*;
import com.saamyukt.SIH26043.capabilitymatching.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Arrays;

@Service
public class ProjectExecutionService {

    private final ActiveProjectRepository projectRepository;
    private final ProjectMilestoneRepository milestoneRepository;
    private final ProjectTaskRepository taskRepository;
    private final TaskActivityRepository activityRepository;
    private final FieldTestRepository fieldTestRepository;
    private final DeploymentRepository deploymentRepository;

    private static final List<String> VALID_STATUSES = Arrays.asList(
        "BACKLOG", "TODO", "IN_PROGRESS", "BLOCKED", "REVIEW", "DONE"
    );

    public ProjectExecutionService(ActiveProjectRepository projectRepository,
                                   ProjectMilestoneRepository milestoneRepository,
                                   ProjectTaskRepository taskRepository,
                                   TaskActivityRepository activityRepository,
                                   FieldTestRepository fieldTestRepository,
                                   DeploymentRepository deploymentRepository) {
        this.projectRepository = projectRepository;
        this.milestoneRepository = milestoneRepository;
        this.taskRepository = taskRepository;
        this.activityRepository = activityRepository;
        this.fieldTestRepository = fieldTestRepository;
        this.deploymentRepository = deploymentRepository;
    }

    @Transactional
    public MilestoneDto createMilestone(UUID projectId, MilestoneDto dto) {
        ActiveProject project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        ProjectMilestone milestone = new ProjectMilestone();
        milestone.setMilestoneId(UUID.randomUUID());
        milestone.setProject(project);
        milestone.setTitle(dto.getTitle());
        milestone.setDescription(dto.getDescription());
        milestone.setDueDate(dto.getDueDate());
        milestone.setStatus("PENDING");
        milestone.setCreatedAt(OffsetDateTime.now());
        
        milestoneRepository.save(milestone);
        return mapToMilestoneDto(milestone);
    }

    @Transactional(readOnly = true)
    public List<MilestoneDto> getMilestones(UUID projectId) {
        return milestoneRepository.findByProject_ProjectId(projectId).stream()
                .map(this::mapToMilestoneDto).collect(Collectors.toList());
    }

    @Transactional
    public MilestoneDto updateMilestone(UUID milestoneId, MilestoneDto dto) {
        ProjectMilestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new IllegalArgumentException("Milestone not found"));
        if (dto.getTitle() != null) milestone.setTitle(dto.getTitle());
        if (dto.getDescription() != null) milestone.setDescription(dto.getDescription());
        if (dto.getDueDate() != null) milestone.setDueDate(dto.getDueDate());
        if (dto.getStatus() != null) milestone.setStatus(dto.getStatus());
        milestoneRepository.save(milestone);
        return mapToMilestoneDto(milestone);
    }

    @Transactional
    public void deleteMilestone(UUID milestoneId) {
        milestoneRepository.deleteById(milestoneId);
    }

    @Transactional
    public TaskDto createTask(UUID projectId, TaskDto dto, UUID actorId) {
        ActiveProject project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        ProjectTask task = new ProjectTask();
        task.setTaskId(UUID.randomUUID());
        task.setProject(project);
        
        if (dto.getMilestoneId() != null) {
            ProjectMilestone milestone = milestoneRepository.findById(dto.getMilestoneId())
                    .orElseThrow(() -> new IllegalArgumentException("Milestone not found"));
            task.setMilestone(milestone);
        }
        
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setAssigneeId(dto.getAssigneeId());
        task.setPriority(dto.getPriority());
        task.setDueDate(dto.getDueDate());
        task.setStatus("TODO");
        task.setPositionIndex(dto.getPositionIndex() != null ? dto.getPositionIndex() : 0);
        task.setAttachments(dto.getAttachments());
        task.setCreatedAt(OffsetDateTime.now());
        task.setUpdatedAt(OffsetDateTime.now());
        
        taskRepository.save(task);
        logActivity(task, actorId, "CREATED", "Task created");
        
        return mapToTaskDto(task);
    }

    @Transactional(readOnly = true)
    public List<TaskDto> getTasks(UUID projectId) {
        return taskRepository.findByProject_ProjectIdOrderByPositionIndexAsc(projectId).stream()
                .map(this::mapToTaskDto).collect(Collectors.toList());
    }

    @Transactional
    public TaskDto updateTask(UUID taskId, TaskDto dto, UUID actorId) {
        ProjectTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        
        if (dto.getTitle() != null) task.setTitle(dto.getTitle());
        if (dto.getDescription() != null) task.setDescription(dto.getDescription());
        if (dto.getAssigneeId() != null) task.setAssigneeId(dto.getAssigneeId());
        if (dto.getPriority() != null) task.setPriority(dto.getPriority());
        if (dto.getDueDate() != null) task.setDueDate(dto.getDueDate());
        if (dto.getAttachments() != null) task.setAttachments(dto.getAttachments());
        if (dto.getMilestoneId() != null) {
            ProjectMilestone milestone = milestoneRepository.findById(dto.getMilestoneId())
                    .orElseThrow(() -> new IllegalArgumentException("Milestone not found"));
            task.setMilestone(milestone);
        }
        task.setUpdatedAt(OffsetDateTime.now());
        
        taskRepository.save(task);
        logActivity(task, actorId, "UPDATED", "Task details updated");
        return mapToTaskDto(task);
    }

    @Transactional
    public TaskDto updateTaskStatus(UUID taskId, String newStatus, UUID actorId) {
        ProjectTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        
        if (!VALID_STATUSES.contains(newStatus)) {
            throw new IllegalArgumentException("Invalid status: " + newStatus);
        }
        
        String oldStatus = task.getStatus();
        task.setStatus(newStatus);
        task.setUpdatedAt(OffsetDateTime.now());
        taskRepository.save(task);
        
        logActivity(task, actorId, "STATUS_CHANGED", "Status changed from " + oldStatus + " to " + newStatus);
        return mapToTaskDto(task);
    }

    @Transactional
    public TaskDto updateTaskPosition(UUID taskId, Integer positionIndex, UUID actorId) {
        ProjectTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        task.setPositionIndex(positionIndex);
        task.setUpdatedAt(OffsetDateTime.now());
        taskRepository.save(task);
        logActivity(task, actorId, "POSITION_CHANGED", "Task moved to position " + positionIndex);
        return mapToTaskDto(task);
    }

    @Transactional
    public void deleteTask(UUID taskId) {
        taskRepository.deleteById(taskId);
    }

    @Transactional
    public FieldTestDto createFieldTest(UUID projectId, FieldTestDto dto) {
        ActiveProject project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        FieldTest ft = new FieldTest();
        ft.setTestId(UUID.randomUUID());
        ft.setProject(project);
        ft.setTestPlan(dto.getTestPlan());
        ft.setLocation(dto.getLocation());
        ft.setStartDate(dto.getStartDate());
        ft.setEndDate(dto.getEndDate());
        ft.setObservations(dto.getObservations());
        ft.setEvidence(dto.getEvidence());
        ft.setResult(dto.getResult());
        ft.setApprovalStatus(dto.getApprovalStatus() != null ? dto.getApprovalStatus() : "PENDING");
        ft.setCreatedAt(OffsetDateTime.now());
        fieldTestRepository.save(ft);
        return mapToFieldTestDto(ft);
    }

    @Transactional(readOnly = true)
    public List<FieldTestDto> getFieldTests(UUID projectId) {
        return fieldTestRepository.findByProject_ProjectId(projectId).stream()
                .map(this::mapToFieldTestDto).collect(Collectors.toList());
    }

    @Transactional
    public DeploymentDto createDeployment(UUID projectId, DeploymentDto dto) {
        ActiveProject project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        Deployment dep = new Deployment();
        dep.setDeploymentId(UUID.randomUUID());
        dep.setProject(project);
        dep.setDeploymentTarget(dto.getDeploymentTarget());
        dep.setDeploymentDate(dto.getDeploymentDate());
        dep.setStatus(dto.getStatus() != null ? dto.getStatus() : "PLANNED");
        dep.setVersion(dto.getVersion());
        dep.setResponsibleTeam(dto.getResponsibleTeam());
        dep.setVerificationNotes(dto.getVerificationNotes());
        dep.setRollbackState(dto.getRollbackState());
        dep.setCreatedAt(OffsetDateTime.now());
        deploymentRepository.save(dep);
        return mapToDeploymentDto(dep);
    }

    @Transactional(readOnly = true)
    public List<DeploymentDto> getDeployments(UUID projectId) {
        return deploymentRepository.findByProject_ProjectId(projectId).stream()
                .map(this::mapToDeploymentDto).collect(Collectors.toList());
    }

    private void logActivity(ProjectTask task, UUID actorId, String action, String details) {
        TaskActivity activity = new TaskActivity();
        activity.setActivityId(UUID.randomUUID());
        activity.setTask(task);
        activity.setActorId(actorId);
        activity.setAction(action);
        activity.setDetails(details);
        activity.setCreatedAt(OffsetDateTime.now());
        activityRepository.save(activity);
    }

    private MilestoneDto mapToMilestoneDto(ProjectMilestone milestone) {
        MilestoneDto dto = new MilestoneDto();
        dto.setMilestoneId(milestone.getMilestoneId());
        dto.setProjectId(milestone.getProject().getProjectId());
        dto.setTitle(milestone.getTitle());
        dto.setDescription(milestone.getDescription());
        dto.setDueDate(milestone.getDueDate());
        dto.setStatus(milestone.getStatus());
        dto.setCreatedAt(milestone.getCreatedAt());
        return dto;
    }

    private TaskDto mapToTaskDto(ProjectTask task) {
        TaskDto dto = new TaskDto();
        dto.setTaskId(task.getTaskId());
        dto.setProjectId(task.getProject().getProjectId());
        if (task.getMilestone() != null) dto.setMilestoneId(task.getMilestone().getMilestoneId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setAssigneeId(task.getAssigneeId());
        dto.setPriority(task.getPriority());
        dto.setDueDate(task.getDueDate());
        dto.setStatus(task.getStatus());
        dto.setPositionIndex(task.getPositionIndex());
        dto.setAttachments(task.getAttachments());
        dto.setCreatedAt(task.getCreatedAt());
        dto.setUpdatedAt(task.getUpdatedAt());
        return dto;
    }

    private FieldTestDto mapToFieldTestDto(FieldTest ft) {
        FieldTestDto dto = new FieldTestDto();
        dto.setTestId(ft.getTestId());
        dto.setProjectId(ft.getProject().getProjectId());
        dto.setTestPlan(ft.getTestPlan());
        dto.setLocation(ft.getLocation());
        dto.setStartDate(ft.getStartDate());
        dto.setEndDate(ft.getEndDate());
        dto.setObservations(ft.getObservations());
        dto.setEvidence(ft.getEvidence());
        dto.setResult(ft.getResult());
        dto.setApprovalStatus(ft.getApprovalStatus());
        dto.setCreatedAt(ft.getCreatedAt());
        return dto;
    }

    private DeploymentDto mapToDeploymentDto(Deployment dep) {
        DeploymentDto dto = new DeploymentDto();
        dto.setDeploymentId(dep.getDeploymentId());
        dto.setProjectId(dep.getProject().getProjectId());
        dto.setDeploymentTarget(dep.getDeploymentTarget());
        dto.setDeploymentDate(dep.getDeploymentDate());
        dto.setStatus(dep.getStatus());
        dto.setVersion(dep.getVersion());
        dto.setResponsibleTeam(dep.getResponsibleTeam());
        dto.setVerificationNotes(dep.getVerificationNotes());
        dto.setRollbackState(dep.getRollbackState());
        dto.setCreatedAt(dep.getCreatedAt());
        return dto;
    }
}
