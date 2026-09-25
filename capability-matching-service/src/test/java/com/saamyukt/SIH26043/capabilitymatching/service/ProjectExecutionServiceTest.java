package com.saamyukt.SIH26043.capabilitymatching.service;

import com.saamyukt.SIH26043.capabilitymatching.dto.ProjectExecutionDTOs.*;
import com.saamyukt.SIH26043.capabilitymatching.entity.*;
import com.saamyukt.SIH26043.capabilitymatching.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;
import java.util.UUID;
import java.util.Arrays;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProjectExecutionServiceTest {

    @Mock
    private ActiveProjectRepository projectRepository;
    @Mock
    private ProjectMilestoneRepository milestoneRepository;
    @Mock
    private ProjectTaskRepository taskRepository;
    @Mock
    private TaskActivityRepository activityRepository;
    @Mock
    private FieldTestRepository fieldTestRepository;
    @Mock
    private DeploymentRepository deploymentRepository;

    @InjectMocks
    private ProjectExecutionService service;

    private UUID projectId;
    private ActiveProject project;

    @BeforeEach
    void setUp() {
        projectId = UUID.randomUUID();
        project = new ActiveProject();
        project.setProjectId(projectId);
    }

    @Test
    void testCreateTask() {
        TaskDto dto = new TaskDto();
        dto.setTitle("Test Task");
        dto.setDescription("Task desc");

        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        when(taskRepository.save(any(ProjectTask.class))).thenAnswer(invocation -> {
            ProjectTask task = invocation.getArgument(0);
            task.setTaskId(UUID.randomUUID());
            return task;
        });

        TaskDto created = service.createTask(projectId, dto, UUID.randomUUID());
        
        assertNotNull(created);
        assertEquals("Test Task", created.getTitle());
        assertEquals("TODO", created.getStatus());
        verify(taskRepository, times(1)).save(any(ProjectTask.class));
        verify(activityRepository, times(1)).save(any(TaskActivity.class));
    }

    @Test
    void testUpdateTaskStatus() {
        UUID taskId = UUID.randomUUID();
        ProjectTask task = new ProjectTask();
        task.setTaskId(taskId);
        task.setStatus("TODO");
        task.setProject(project);

        when(taskRepository.findById(taskId)).thenReturn(Optional.of(task));

        TaskDto updated = service.updateTaskStatus(taskId, "IN_PROGRESS", UUID.randomUUID());
        
        assertEquals("IN_PROGRESS", updated.getStatus());
        verify(taskRepository, times(1)).save(task);
        verify(activityRepository, times(1)).save(any(TaskActivity.class));
    }

    @Test
    void testUpdateTaskStatusInvalid() {
        UUID taskId = UUID.randomUUID();
        ProjectTask task = new ProjectTask();
        task.setTaskId(taskId);
        task.setStatus("TODO");

        when(taskRepository.findById(taskId)).thenReturn(Optional.of(task));

        assertThrows(IllegalArgumentException.class, () -> 
            service.updateTaskStatus(taskId, "INVALID_STATUS", UUID.randomUUID())
        );
    }
}
