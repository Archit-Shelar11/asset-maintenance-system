package com.example.asset.asset_maintenance.service;

import com.example.asset.asset_maintenance.dto.CreateTaskRequest;
import com.example.asset.asset_maintenance.dto.TaskHistoryResponse;
import com.example.asset.asset_maintenance.entity.*;
import com.example.asset.asset_maintenance.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MaintenanceTaskServiceTest {

    @Mock private MaintenanceTaskRepository taskRepository;
    @Mock private AssetRepository assetRepository;
    @Mock private UserRepository userRepository;
    @Mock private TaskHistoryRepository taskHistoryRepository;
    @Mock private TaskHistoryService historyService;
    @Mock private NotificationService notificationService;
    @Mock private AttachmentRepository attachmentRepository;
    @Mock private ServiceReportRepository serviceReportRepository;
    @Mock private EntityManager entityManager;
    @Mock private TypedQuery<MaintenanceTask> typedQuery;

    @InjectMocks
    private MaintenanceTaskService taskService;

    private User manager;
    private User technician;
    private User operator;
    private Asset asset;
    private MaintenanceTask task;

    @BeforeEach
    void setUp() {
        Role managerRole = Role.builder().id(1L).roleName(Role.RoleName.MANAGER).build();
        Role techRole = Role.builder().id(2L).roleName(Role.RoleName.TECHNICIAN).build();
        Role userRole = Role.builder().id(3L).roleName(Role.RoleName.USER).build();

        manager = User.builder().id(10L).email("manager@example.com").fullName("Manager").build();
        manager.setUserRoles(new ArrayList<>(List.of(UserRole.builder().user(manager).role(managerRole).build())));

        technician = User.builder().id(11L).email("tech@example.com").fullName("Technician").build();
        technician.setUserRoles(new ArrayList<>(List.of(UserRole.builder().user(technician).role(techRole).build())));

        operator = User.builder().id(12L).email("operator@example.com").fullName("Operator").build();
        operator.setUserRoles(new ArrayList<>(List.of(UserRole.builder().user(operator).role(userRole).build())));

        asset = Asset.builder().id(1L).assetName("Milling Machine").assetCode("ASSET-100").build();

        task = MaintenanceTask.builder()
                .id(20L)
                .taskCode("TSK-1234-ABC")
                .title("Belt Broken")
                .description("Main driving belt is broken")
                .priority(MaintenanceTask.Priority.HIGH)
                .status(MaintenanceTask.TaskStatus.REPORTED)
                .asset(asset)
                .reportedBy(operator)
                .build();
    }

    @Test
    void testCreateTaskSuccess() {
        CreateTaskRequest request = new CreateTaskRequest();
        request.setAssetId(1L);
        request.setTitle("Belt Broken");
        request.setDescription("Main driving belt is broken");
        request.setPriority("HIGH");

        when(assetRepository.findById(1L)).thenReturn(Optional.of(asset));
        when(userRepository.findByEmail("operator@example.com")).thenReturn(Optional.of(operator));
        when(taskRepository.save(any(MaintenanceTask.class))).thenAnswer(inv -> inv.getArgument(0));

        MaintenanceTask createdTask = taskService.createTask(request, "operator@example.com");

        assertNotNull(createdTask);
        assertEquals(MaintenanceTask.TaskStatus.REPORTED, createdTask.getStatus());
        assertEquals("Belt Broken", createdTask.getTitle());
        assertEquals(operator, createdTask.getReportedBy());
        assertEquals(asset, createdTask.getAsset());
        assertNotNull(createdTask.getDueDate());

        verify(historyService, times(1)).logAction(any(), eq("CREATED"), isNull(), eq(MaintenanceTask.TaskStatus.REPORTED), eq(operator), anyString());
        verify(notificationService, times(1)).sendNotificationToRole(eq(Role.RoleName.MANAGER), anyString());
    }

    @Test
    void testAssignTaskSuccess() {
        when(taskRepository.findById(20L)).thenReturn(Optional.of(task));
        when(userRepository.findById(11L)).thenReturn(Optional.of(technician));
        when(userRepository.findByEmail("manager@example.com")).thenReturn(Optional.of(manager));
        when(taskRepository.save(any(MaintenanceTask.class))).thenAnswer(inv -> inv.getArgument(0));

        MaintenanceTask assigned = taskService.assignTask(20L, "manager@example.com", 11L);

        assertEquals(MaintenanceTask.TaskStatus.ASSIGNED, assigned.getStatus());
        assertEquals(technician, assigned.getAssignedTo());
        assertEquals(manager, assigned.getAssignedBy());

        verify(historyService, times(1)).logAction(any(), eq("ASSIGNED"), eq(MaintenanceTask.TaskStatus.REPORTED), eq(MaintenanceTask.TaskStatus.ASSIGNED), eq(manager), anyString());
        verify(notificationService, times(1)).sendNotification(eq(technician), anyString());
    }

    @Test
    void testAssignTaskInvalidStateTransition() {
        task.setStatus(MaintenanceTask.TaskStatus.COMPLETED); // Completed task cannot be assigned directly
        when(taskRepository.findById(20L)).thenReturn(Optional.of(task));
        when(userRepository.findById(11L)).thenReturn(Optional.of(technician));
        when(userRepository.findByEmail("manager@example.com")).thenReturn(Optional.of(manager));

        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> 
                taskService.assignTask(20L, "manager@example.com", 11L)
        );

        assertTrue(exception.getMessage().contains("Cannot transition"));
        verify(taskRepository, never()).save(any());
    }

    @Test
    void testSubmitServiceReportSuccess() {
        task.setStatus(MaintenanceTask.TaskStatus.IN_PROGRESS);
        task.setAssignedTo(technician);
        task.setAssignedBy(manager);

        when(taskRepository.findById(20L)).thenReturn(Optional.of(task));
        when(userRepository.findByEmail("tech@example.com")).thenReturn(Optional.of(technician));
        when(taskRepository.save(any(MaintenanceTask.class))).thenAnswer(inv -> inv.getArgument(0));

        MaintenanceTask result = taskService.submitServiceReport(20L, "Root Cause A", "Replaced parts", 120, "Rec A", "tech@example.com");

        assertEquals(MaintenanceTask.TaskStatus.COMPLETED, result.getStatus());
        assertNotNull(result.getServiceReport());
        assertEquals("Root Cause A", result.getServiceReport().getRootCause());

        verify(serviceReportRepository, times(1)).save(any(ServiceReport.class));
        verify(historyService, times(1)).logAction(any(), eq("COMPLETED"), eq(MaintenanceTask.TaskStatus.IN_PROGRESS), eq(MaintenanceTask.TaskStatus.COMPLETED), eq(technician), anyString());
        verify(notificationService, times(1)).sendNotification(eq(manager), anyString());
    }

    @Test
    void testSubmitServiceReportNotAssignedTech() {
        task.setStatus(MaintenanceTask.TaskStatus.IN_PROGRESS);
        task.setAssignedTo(User.builder().email("other@example.com").build());

        when(taskRepository.findById(20L)).thenReturn(Optional.of(task));
        when(userRepository.findByEmail("tech@example.com")).thenReturn(Optional.of(technician));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
                taskService.submitServiceReport(20L, "Root Cause A", "Replaced parts", 120, "Rec A", "tech@example.com")
        );

        assertEquals("Only the assigned technician can submit a service report for this task", exception.getMessage());
    }

    @Test
    void testSearchTasksManagerHasFullVisibility() {
        when(userRepository.findByEmail("manager@example.com")).thenReturn(Optional.of(manager));
        List<MaintenanceTask> mockList = Arrays.asList(task);
        
        when(entityManager.createQuery(anyString(), eq(MaintenanceTask.class))).thenReturn(typedQuery);
        when(typedQuery.setParameter(anyString(), any())).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(mockList);

        List<MaintenanceTask> result = taskService.searchTasks(null, null, "Belt", "manager@example.com");

        assertEquals(1, result.size());
        verify(entityManager, times(1)).createQuery(anyString(), eq(MaintenanceTask.class));
        verify(typedQuery, times(1)).setParameter("keyword", "%Belt%");
        verify(typedQuery, times(1)).getResultList();
    }

    @Test
    void testSearchTasksTechnicianHasFilteredVisibility() {
        when(userRepository.findByEmail("tech@example.com")).thenReturn(Optional.of(technician));
        
        MaintenanceTask assignedToTech = MaintenanceTask.builder().reportedBy(operator).assignedTo(technician).build();
        MaintenanceTask assignedToOther = MaintenanceTask.builder().reportedBy(operator).assignedTo(User.builder().email("other@example.com").build()).build();
        
        when(entityManager.createQuery(anyString(), eq(MaintenanceTask.class))).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(Arrays.asList(assignedToTech, assignedToOther));

        List<MaintenanceTask> result = taskService.searchTasks(null, null, null, "tech@example.com");

        assertEquals(1, result.size());
        assertEquals(technician, result.get(0).getAssignedTo());
        verify(entityManager, times(1)).createQuery(anyString(), eq(MaintenanceTask.class));
        verify(typedQuery, times(1)).getResultList();
    }
}
