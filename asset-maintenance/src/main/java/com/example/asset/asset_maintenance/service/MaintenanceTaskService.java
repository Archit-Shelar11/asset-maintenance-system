package com.example.asset.asset_maintenance.service;

import com.example.asset.asset_maintenance.dto.CreateTaskRequest;
import com.example.asset.asset_maintenance.dto.TaskHistoryResponse;
import com.example.asset.asset_maintenance.entity.Asset;
import com.example.asset.asset_maintenance.entity.MaintenanceTask;
import com.example.asset.asset_maintenance.entity.TaskHistory;
import com.example.asset.asset_maintenance.entity.User;
import com.example.asset.asset_maintenance.repository.AssetRepository;
import com.example.asset.asset_maintenance.repository.MaintenanceTaskRepository;
import com.example.asset.asset_maintenance.repository.TaskHistoryRepository;
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

    @Autowired
    private TaskHistoryRepository taskHistoryRepository;

    //  CREATE TASK
    public MaintenanceTask createTask(CreateTaskRequest request, String email) {
        if (request.getAssetId() == null) {
            throw new IllegalArgumentException("Asset ID must not be null");
        }

        Asset asset = assetRepository.findById(request.getAssetId())
                .orElseThrow(() -> new RuntimeException("Asset not found"));

        if (email == null) {
            throw new IllegalArgumentException("Email must not be null");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        MaintenanceTask task = new MaintenanceTask();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(MaintenanceTask.Priority.valueOf(request.getPriority()));
        task.setStatus(MaintenanceTask.TaskStatus.REPORTED);
        task.setAsset(asset);
        task.setReportedBy(user);
        task.setTaskCode(generateUniqueTaskCode());

        MaintenanceTask savedTask = taskRepository.save(task);

        addHistory(savedTask, "CREATED", null,
                MaintenanceTask.TaskStatus.REPORTED, user, "Task created");

        return savedTask;
    }

    //  FETCH
    public List<MaintenanceTask> getTasksByUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return taskRepository.findByReportedBy(user);
    }

    public List<MaintenanceTask> getTasksAssignedToTechnician(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return taskRepository.findByAssignedTo(user);
    }

    // ASSIGN TASK (UPDATED WITH OWNERSHIP)
    public MaintenanceTask assignTask(Long taskId, String managerEmail, Long technicianId) {
        if (taskId == null) {
            throw new IllegalArgumentException("Task ID must not be null");
        }
        if (technicianId == null) {
            throw new IllegalArgumentException("Technician ID must not be null");
        }
        if (managerEmail == null) {
            throw new IllegalArgumentException("Manager email must not be null");
        }

        MaintenanceTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new RuntimeException("Technician not found"));

        User manager = userRepository.findByEmail(managerEmail)
                .orElseThrow(() -> new RuntimeException("Manager not found"));

        MaintenanceTask.TaskStatus oldStatus = task.getStatus();

        task.setAssignedTo(technician);
        task.setAssignedBy(manager); //  IMPORTANT
        task.setStatus(MaintenanceTask.TaskStatus.ASSIGNED);

        MaintenanceTask savedTask = taskRepository.save(task);

        addHistory(savedTask, "ASSIGNED", oldStatus,
                MaintenanceTask.TaskStatus.ASSIGNED,
                manager, "Task assigned by manager");

        return savedTask;
    }

    //  STATUS UPDATE
    public MaintenanceTask updateTaskStatus(Long taskId, String status, String technicianEmail) {
        if (taskId == null) {
            throw new IllegalArgumentException("Task ID must not be null");
        }
        if (status == null) {
            throw new IllegalArgumentException("Status must not be null");
        }
        if (technicianEmail == null) {
            throw new IllegalArgumentException("Technician email must not be null");
        }

        MaintenanceTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        User tech = userRepository.findByEmail(technicianEmail)
                .orElseThrow(() -> new RuntimeException("Technician not found"));

        if (task.getAssignedTo() == null || !task.getAssignedTo().getEmail().equals(technicianEmail)) {
            throw new RuntimeException("Only the assigned technician can update status of this task");
        }

        MaintenanceTask.TaskStatus oldStatus = task.getStatus();
        MaintenanceTask.TaskStatus newStatus =
                MaintenanceTask.TaskStatus.valueOf(status);

        task.setStatus(newStatus);

        MaintenanceTask savedTask = taskRepository.save(task);

        addHistory(savedTask, "STATUS_UPDATE", oldStatus,
                newStatus, tech, "Status updated to " + status);

        return savedTask;
    }

    //  APPROVE (WITH OWNERSHIP CHECK)
    public MaintenanceTask approveTask(Long taskId, String managerEmail, String remarks) {
        if (taskId == null) {
            throw new IllegalArgumentException("Task ID must not be null");
        }
        if (managerEmail == null) {
            throw new IllegalArgumentException("Manager email must not be null");
        }

        MaintenanceTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        User manager = userRepository.findByEmail(managerEmail)
                .orElseThrow(() -> new RuntimeException("Manager not found"));

        if (task.getAssignedBy() == null ||
                !task.getAssignedBy().getEmail().equals(managerEmail)) {
            throw new RuntimeException("Only assigned manager can approve this task");
        }

        MaintenanceTask.TaskStatus oldStatus = task.getStatus();

        task.setApprovedBy(manager);
        task.setManagerRemarks(remarks);
        task.setStatus(MaintenanceTask.TaskStatus.APPROVED);

        MaintenanceTask savedTask = taskRepository.save(task);

        addHistory(savedTask, "APPROVED", oldStatus,
                MaintenanceTask.TaskStatus.APPROVED,
                manager, remarks);

        return savedTask;
    }

    //  REJECT (WITH OWNERSHIP CHECK)
    public MaintenanceTask rejectTask(Long taskId, String managerEmail, String remarks) {
        if (taskId == null) {
            throw new IllegalArgumentException("Task ID must not be null");
        }
        if (managerEmail == null) {
            throw new IllegalArgumentException("Manager email must not be null");
        }

        MaintenanceTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        User manager = userRepository.findByEmail(managerEmail)
                .orElseThrow(() -> new RuntimeException("Manager not found"));

        if (task.getAssignedBy() == null ||
                !task.getAssignedBy().getEmail().equals(managerEmail)) {
            throw new RuntimeException("Only assigned manager can reject this task");
        }

        MaintenanceTask.TaskStatus oldStatus = task.getStatus();

        task.setApprovedBy(manager);
        task.setManagerRemarks(remarks);
        task.setStatus(MaintenanceTask.TaskStatus.REJECTED);

        MaintenanceTask savedTask = taskRepository.save(task);

        addHistory(savedTask, "REJECTED", oldStatus,
                MaintenanceTask.TaskStatus.REJECTED,
                manager, remarks);

        return savedTask;
    }

    //  HISTORY LOGGER
    private void addHistory(MaintenanceTask task,
                            String action,
                            MaintenanceTask.TaskStatus fromStatus,
                            MaintenanceTask.TaskStatus toStatus,
                            User user,
                            String remarks) {

        TaskHistory history = new TaskHistory();
        history.setTask(task);
        history.setAction(action);
        history.setFromStatus(fromStatus);
        history.setToStatus(toStatus);
        history.setPerformedBy(user);
        history.setRemarks(remarks);

        taskHistoryRepository.save(history);
    }

    //  FETCH HISTORY (DTO)
    public List<TaskHistoryResponse> getTaskHistory(Long taskId) {

        List<TaskHistory> historyList = taskHistoryRepository.findByTaskId(taskId);

        return historyList.stream().map(h -> {
            TaskHistoryResponse res = new TaskHistoryResponse();
            res.setAction(h.getAction());
            res.setFromStatus(h.getFromStatus() != null ? h.getFromStatus().name() : null);
            res.setToStatus(h.getToStatus() != null ? h.getToStatus().name() : null);
            res.setPerformedBy(h.getPerformedBy().getFullName());
            res.setRemarks(h.getRemarks());
            res.setTime(h.getActionTime().toString());
            return res;
        }).toList();
    }

    // GET ALL TASKS
    public List<MaintenanceTask> getAllTasks() {
        return taskRepository.findAll();
    }

    // UNIQUE ALPHANUMERIC TASK CODE GENERATOR (TSK-XXXX-YYY)
    private String generateUniqueTaskCode() {
        java.util.Random random = new java.util.Random();
        while (true) {
            int number = 1000 + random.nextInt(9000);
            StringBuilder letterCode = new StringBuilder();
            for (int i = 0; i < 3; i++) {
                letterCode.append((char) ('A' + random.nextInt(26)));
            }
            String code = "TSK-" + number + "-" + letterCode.toString();
            if (!taskRepository.existsByTaskCode(code)) {
                return code;
            }
        }
    }
}
