package com.example.asset.asset_maintenance.service;

import com.example.asset.asset_maintenance.entity.MaintenanceTask;
import com.example.asset.asset_maintenance.entity.TaskHistory;
import com.example.asset.asset_maintenance.entity.User;
import com.example.asset.asset_maintenance.repository.TaskHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TaskHistoryService {

    private final TaskHistoryRepository taskHistoryRepository;

    @Autowired
    public TaskHistoryService(TaskHistoryRepository taskHistoryRepository) {
        this.taskHistoryRepository = taskHistoryRepository;
    }

    public void logAction(MaintenanceTask task, String action,
                          MaintenanceTask.TaskStatus fromStatus,
                          MaintenanceTask.TaskStatus toStatus,
                          User user, String remarks) {
        TaskHistory history = TaskHistory.builder()
                .task(task)
                .action(action)
                .fromStatus(fromStatus)
                .toStatus(toStatus)
                .performedBy(user)
                .remarks(remarks)
                .build();

        taskHistoryRepository.save(history);
    }
}
