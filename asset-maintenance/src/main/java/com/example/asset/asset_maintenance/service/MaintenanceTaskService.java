package com.example.asset.asset_maintenance.service;

import com.example.asset.asset_maintenance.dto.CreateTaskRequest;
import com.example.asset.asset_maintenance.entity.Asset;
import com.example.asset.asset_maintenance.entity.MaintenanceTask;
import com.example.asset.asset_maintenance.entity.User;
import com.example.asset.asset_maintenance.repository.AssetRepository;
import com.example.asset.asset_maintenance.repository.MaintenanceTaskRepository;
import com.example.asset.asset_maintenance.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MaintenanceTaskService {

    @Autowired
    private MaintenanceTaskRepository taskRepository;

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private UserRepository userRepository;

    public MaintenanceTask createTask(CreateTaskRequest request) {

        Asset asset = assetRepository.findById(request.getAssetId())
                .orElseThrow(() -> new RuntimeException("Asset not found"));

        User user = userRepository.findById(request.getReportedByUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        MaintenanceTask task = new MaintenanceTask();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());

        task.setPriority(MaintenanceTask.Priority.valueOf(request.getPriority()));
        task.setStatus(MaintenanceTask.TaskStatus.REPORTED);

        task.setAsset(asset);
        task.setReportedBy(user);


        task.setTaskCode("TSK-" + System.currentTimeMillis());

        return taskRepository.save(task);
    }


    public List<MaintenanceTask> getTasksByUser(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return taskRepository.findByReportedBy(user);
    }

    public List<MaintenanceTask> getTasksAssignedToTechnician(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return taskRepository.findByAssignedTo(user);
    }


}