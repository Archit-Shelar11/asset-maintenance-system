package com.example.asset.asset_maintenance.controller;

import com.example.asset.asset_maintenance.dto.CreateTaskRequest;
import com.example.asset.asset_maintenance.entity.MaintenanceTask;
import com.example.asset.asset_maintenance.service.MaintenanceTaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tasks")
public class MaintenanceTaskController {

    @Autowired
    private MaintenanceTaskService taskService;

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

}