package com.example.asset.asset_maintenance.controller;

import com.example.asset.asset_maintenance.dto.CreateTaskRequest;
import com.example.asset.asset_maintenance.dto.TaskHistoryResponse;
import com.example.asset.asset_maintenance.entity.MaintenanceTask;
import com.example.asset.asset_maintenance.service.MaintenanceTaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/tasks")
public class MaintenanceTaskController {

    @Autowired
    private MaintenanceTaskService taskService;

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'TECHNICIAN', 'MANAGER')")
    public MaintenanceTask createTask(@RequestBody CreateTaskRequest request, Principal principal) {
        return taskService.createTask(request, principal.getName());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public List<MaintenanceTask> getAllTasks() {
        return taskService.getAllTasks();
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('USER', 'TECHNICIAN', 'MANAGER')")
    public List<MaintenanceTask> getUserTasks(Principal principal) {
        return taskService.getTasksByUser(principal.getName());
    }

    @GetMapping("/assigned")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public List<MaintenanceTask> getTechnicianTasks(Principal principal) {
        return taskService.getTasksAssignedToTechnician(principal.getName());
    }

    @PutMapping("/{taskId}/assign/{userId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public MaintenanceTask assignTask(
            @PathVariable Long taskId,
            @PathVariable Long userId,
            Principal principal) {

        return taskService.assignTask(taskId, principal.getName(), userId);
    }

    @PutMapping("/{taskId}/status/{status}")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'MANAGER')")
    public MaintenanceTask updateTaskStatus(
            @PathVariable Long taskId,
            @PathVariable String status,
            Principal principal) {

        return taskService.updateTaskStatus(taskId, status, principal.getName());
    }

    @PutMapping("/{taskId}/approve")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public MaintenanceTask approveTask(
            @PathVariable Long taskId,
            @RequestParam String remarks,
            Principal principal) {

        return taskService.approveTask(taskId, principal.getName(), remarks);
    }

    @PutMapping("/{taskId}/reject")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public MaintenanceTask rejectTask(
            @PathVariable Long taskId,
            @RequestParam String remarks,
            Principal principal) {

        return taskService.rejectTask(taskId, principal.getName(), remarks);
    }

    @PutMapping("/{taskId}/reject-reported")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public MaintenanceTask rejectReportedTask(
            @PathVariable Long taskId,
            @RequestParam String remarks,
            Principal principal) {

        return taskService.rejectReportedTask(taskId, principal.getName(), remarks);
    }


    @GetMapping("/{taskId}/history")
    @PreAuthorize("isAuthenticated()")
    public List<TaskHistoryResponse> getHistory(@PathVariable Long taskId) {
        return taskService.getTaskHistory(taskId);
    }
}