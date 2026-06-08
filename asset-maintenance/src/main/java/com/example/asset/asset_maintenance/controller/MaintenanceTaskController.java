package com.example.asset.asset_maintenance.controller;

import com.example.asset.asset_maintenance.dto.CreateTaskRequest;
import com.example.asset.asset_maintenance.dto.TaskHistoryResponse;
import com.example.asset.asset_maintenance.entity.MaintenanceTask;
import com.example.asset.asset_maintenance.entity.User;
import com.example.asset.asset_maintenance.repository.UserRepository;
import com.example.asset.asset_maintenance.service.MaintenanceTaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tasks")
public class MaintenanceTaskController {

    @Autowired
    private MaintenanceTaskService taskService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public MaintenanceTask createTask(@RequestBody CreateTaskRequest request) {
        return taskService.createTask(request);
    }

    @GetMapping("/user/{userId}")
    public List<MaintenanceTask> getUserTasks(@PathVariable Long userId) {
        return taskService.getTasksByUser(userId);
    }

    @GetMapping("/technician/{userId}")
    public List<MaintenanceTask> getTechnicianTasks(@PathVariable Long userId) {
        return taskService.getTasksAssignedToTechnician(userId);
    }

    //  UPDATED: managerId added
    @PutMapping("/{taskId}/assign/{managerId}/{userId}")
    public MaintenanceTask assignTask(
            @PathVariable Long taskId,
            @PathVariable Long managerId,
            @PathVariable Long userId) {

        return taskService.assignTask(taskId, managerId, userId);
    }

    @PutMapping("/{taskId}/status/{status}")
    public MaintenanceTask updateTaskStatus(
            @PathVariable Long taskId,
            @PathVariable String status) {

        return taskService.updateTaskStatus(taskId, status);
    }

    @PutMapping("/{taskId}/approve/{managerId}")
    public MaintenanceTask approveTask(
            @PathVariable Long taskId,
            @PathVariable Long managerId,
            @RequestParam String remarks) {

        return taskService.approveTask(taskId, managerId, remarks);
    }

    @PutMapping("/{taskId}/reject/{managerId}")
    public MaintenanceTask rejectTask(
            @PathVariable Long taskId,
            @PathVariable Long managerId,
            @RequestParam String remarks) {

        return taskService.rejectTask(taskId, managerId, remarks);
    }

    // Optional test API (you can remove later)
    @PostMapping("/test")
    public User createUser() {
        User user = new User();
        user.setFullName("Debug User");
        user.setEmail("debug@test.com");
        user.setPassword("1234");
        return userRepository.save(user);
    }

    @GetMapping("/{taskId}/history")
    public List<TaskHistoryResponse> getHistory(@PathVariable Long taskId) {
        return taskService.getTaskHistory(taskId);
    }
}