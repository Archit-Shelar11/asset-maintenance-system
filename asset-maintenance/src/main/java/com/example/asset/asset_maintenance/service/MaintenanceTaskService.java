package com.example.asset.asset_maintenance.service;

import com.example.asset.asset_maintenance.dto.CreateTaskRequest;
import com.example.asset.asset_maintenance.dto.TaskHistoryResponse;
import com.example.asset.asset_maintenance.entity.Asset;
import com.example.asset.asset_maintenance.entity.Attachment;
import com.example.asset.asset_maintenance.entity.MaintenanceTask;
import com.example.asset.asset_maintenance.entity.ServiceReport;
import com.example.asset.asset_maintenance.entity.TaskHistory;
import com.example.asset.asset_maintenance.entity.User;
import com.example.asset.asset_maintenance.repository.AssetRepository;
import com.example.asset.asset_maintenance.repository.AttachmentRepository;
import com.example.asset.asset_maintenance.repository.MaintenanceTaskRepository;
import com.example.asset.asset_maintenance.repository.ServiceReportRepository;
import com.example.asset.asset_maintenance.repository.TaskHistoryRepository;
import com.example.asset.asset_maintenance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MaintenanceTaskService {

    private final MaintenanceTaskRepository taskRepository;
    private final AssetRepository assetRepository;
    private final UserRepository userRepository;
    private final TaskHistoryRepository taskHistoryRepository;
    private final TaskHistoryService historyService;
    private final NotificationService notificationService;
    private final AttachmentRepository attachmentRepository;
    private final ServiceReportRepository serviceReportRepository;

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

        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        switch (task.getPriority()) {
            case CRITICAL:
                task.setDueDate(now.plusHours(4));
                break;
            case HIGH:
                task.setDueDate(now.plusHours(24));
                break;
            case MEDIUM:
                task.setDueDate(now.plusDays(3));
                break;
            case LOW:
            default:
                task.setDueDate(now.plusDays(7));
                break;
        }

        MaintenanceTask savedTask = taskRepository.save(task);

        historyService.logAction(savedTask, "CREATED", null,
                MaintenanceTask.TaskStatus.REPORTED, user, "Task created");

        notificationService.sendNotificationToRole(
                com.example.asset.asset_maintenance.entity.Role.RoleName.MANAGER,
                "New work order " + savedTask.getTaskCode() + " reported for machine: " + asset.getAssetName()
        );

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

    // ASSIGN TASK (UPDATED WITH STATE VALIDATION)
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
        String managerRole = manager.getUserRoles().get(0).getRole().getRoleName().name();

        // Validate state transition rules
        if (!TaskStatusTransition.isAllowed(oldStatus, MaintenanceTask.TaskStatus.ASSIGNED, managerRole)) {
            throw new IllegalStateException("Cannot transition task from " + oldStatus + " to ASSIGNED by role " + managerRole);
        }

        task.setAssignedTo(technician);
        task.setAssignedBy(manager); 
        task.setStatus(MaintenanceTask.TaskStatus.ASSIGNED);

        MaintenanceTask savedTask = taskRepository.save(task);

        historyService.logAction(savedTask, "ASSIGNED", oldStatus,
                MaintenanceTask.TaskStatus.ASSIGNED,
                manager, "Task assigned by manager");

        notificationService.sendNotification(
                technician,
                "You have been assigned to task " + savedTask.getTaskCode() + " by Manager " + manager.getFullName()
        );

        return savedTask;
    }

    //  STATUS UPDATE (UPDATED WITH STATE VALIDATION)
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
        MaintenanceTask.TaskStatus newStatus = MaintenanceTask.TaskStatus.valueOf(status.toUpperCase());
        String techRole = tech.getUserRoles().get(0).getRole().getRoleName().name();

        // Validate state transition rules
        if (!TaskStatusTransition.isAllowed(oldStatus, newStatus, techRole)) {
            throw new IllegalStateException("Cannot transition task from " + oldStatus + " to " + newStatus + " by role " + techRole);
        }

        task.setStatus(newStatus);

        MaintenanceTask savedTask = taskRepository.save(task);

        historyService.logAction(savedTask, "STATUS_UPDATE", oldStatus,
                newStatus, tech, "Status updated to " + status);

        if (newStatus == MaintenanceTask.TaskStatus.IN_PROGRESS) {
            notificationService.sendNotification(
                    savedTask.getReportedBy(),
                    "Your reported task " + savedTask.getTaskCode() + " is now IN_PROGRESS"
            );
        } else if (newStatus == MaintenanceTask.TaskStatus.COMPLETED) {
            if (savedTask.getAssignedBy() != null) {
                notificationService.sendNotification(
                        savedTask.getAssignedBy(),
                        "Technician " + tech.getFullName() + " marked task " + savedTask.getTaskCode() + " as COMPLETED"
                );
            } else {
                notificationService.sendNotificationToRole(
                        com.example.asset.asset_maintenance.entity.Role.RoleName.MANAGER,
                        "Technician " + tech.getFullName() + " marked task " + savedTask.getTaskCode() + " as COMPLETED"
                );
            }
        }

        return savedTask;
    }

    //  APPROVE (UPDATED WITH STATE VALIDATION)
    @Transactional
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

        MaintenanceTask.TaskStatus oldStatus = task.getStatus();
        String managerRole = manager.getUserRoles().get(0).getRole().getRoleName().name();

        // Validate state transition rules
        if (!TaskStatusTransition.isAllowed(oldStatus, MaintenanceTask.TaskStatus.APPROVED, managerRole)) {
            throw new IllegalStateException("Cannot transition task from " + oldStatus + " to APPROVED by role " + managerRole);
        }

        task.setApprovedBy(manager);
        task.setManagerRemarks(remarks);
        task.setStatus(MaintenanceTask.TaskStatus.APPROVED);

        MaintenanceTask savedTask = taskRepository.save(task);

        historyService.logAction(savedTask, "APPROVED", oldStatus,
                MaintenanceTask.TaskStatus.APPROVED,
                manager, remarks);

        // Send notifications
        notificationService.sendNotification(
                savedTask.getReportedBy(),
                "Your reported task " + savedTask.getTaskCode() + " has been APPROVED by Manager " + manager.getFullName()
        );
        if (savedTask.getAssignedTo() != null) {
            notificationService.sendNotification(
                    savedTask.getAssignedTo(),
                    "Your completed task " + savedTask.getTaskCode() + " has been APPROVED by Manager " + manager.getFullName()
            );
        }

        return savedTask;
    }

    //  REJECT (UPDATED WITH STATE VALIDATION)
    @Transactional
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

        MaintenanceTask.TaskStatus oldStatus = task.getStatus();
        String managerRole = manager.getUserRoles().get(0).getRole().getRoleName().name();

        // Validate state transition rules
        if (!TaskStatusTransition.isAllowed(oldStatus, MaintenanceTask.TaskStatus.REJECTED, managerRole)) {
            throw new IllegalStateException("Cannot transition task from " + oldStatus + " to REJECTED by role " + managerRole);
        }

        task.setApprovedBy(manager);
        task.setManagerRemarks(remarks);
        task.setStatus(MaintenanceTask.TaskStatus.REJECTED);

        MaintenanceTask savedTask = taskRepository.save(task);

        historyService.logAction(savedTask, "REJECTED", oldStatus,
                MaintenanceTask.TaskStatus.REJECTED,
                manager, remarks);

        // Send notifications
        notificationService.sendNotification(
                savedTask.getReportedBy(),
                "Your reported task " + savedTask.getTaskCode() + " has been REJECTED by Manager " + manager.getFullName() + ". Remarks: " + remarks
        );
        if (savedTask.getAssignedTo() != null) {
            notificationService.sendNotification(
                    savedTask.getAssignedTo(),
                    "Your completed task " + savedTask.getTaskCode() + " has been REJECTED by Manager " + manager.getFullName() + ". Remarks: " + remarks
            );
        }

        return savedTask;
    }

    //  REJECT REPORTED TASK (UPDATED WITH STATE VALIDATION)
    @Transactional
    public MaintenanceTask rejectReportedTask(Long taskId, String managerEmail, String remarks) {
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

        MaintenanceTask.TaskStatus oldStatus = task.getStatus();
        String managerRole = manager.getUserRoles().get(0).getRole().getRoleName().name();

        // Validate state transition rules
        if (!TaskStatusTransition.isAllowed(oldStatus, MaintenanceTask.TaskStatus.REJECTED, managerRole)) {
            throw new IllegalStateException("Cannot transition task from " + oldStatus + " to REJECTED by role " + managerRole);
        }

        task.setApprovedBy(manager);
        task.setManagerRemarks(remarks);
        task.setStatus(MaintenanceTask.TaskStatus.REJECTED);

        MaintenanceTask savedTask = taskRepository.save(task);

        historyService.logAction(savedTask, "REJECTED_REPORTED", oldStatus,
                MaintenanceTask.TaskStatus.REJECTED,
                manager, remarks);

        // Send notification
        notificationService.sendNotification(
                savedTask.getReportedBy(),
                "Your reported task " + savedTask.getTaskCode() + " has been REJECTED by Manager " + manager.getFullName() + ". Remarks: " + remarks
        );

        return savedTask;
    }

    // ATTACHMENT UPLOAD
    @Transactional
    public Attachment addAttachment(Long taskId, org.springframework.web.multipart.MultipartFile file, String type, String email) {
        MaintenanceTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            originalFilename = "file";
        }
        String fileName = System.currentTimeMillis() + "_" + originalFilename.replaceAll("\\s+", "_");
        java.io.File uploadDir = new java.io.File("uploads");
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }

        java.io.File destFile = new java.io.File(uploadDir, fileName);
        try {
            file.transferTo(destFile);
        } catch (java.io.IOException e) {
            throw new RuntimeException("Failed to store attachment file", e);
        }

        Attachment.AttachmentType attachmentType;
        try {
            attachmentType = Attachment.AttachmentType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid attachment type: " + type);
        }

        Attachment attachment = Attachment.builder()
                .fileName(originalFilename)
                .fileType(file.getContentType())
                .filePath("/uploads/" + fileName)
                .attachmentType(attachmentType)
                .uploadedBy(user)
                .task(task)
                .build();

        Attachment savedAttachment = attachmentRepository.save(attachment);

        historyService.logAction(task, "ATTACHMENT_ADDED", null, task.getStatus(), user,
                "Uploaded " + attachmentType + " attachment: " + originalFilename);

        return savedAttachment;
    }

    // SUBMIT SERVICE REPORT
    @Transactional
    public MaintenanceTask submitServiceReport(Long taskId, String rootCause, String workPerformed, Integer timeSpentMinutes, String recommendations, String technicianEmail) {
        MaintenanceTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        User tech = userRepository.findByEmail(technicianEmail)
                .orElseThrow(() -> new RuntimeException("Technician not found"));

        if (task.getAssignedTo() == null || !task.getAssignedTo().getEmail().equals(technicianEmail)) {
            throw new RuntimeException("Only the assigned technician can submit a service report for this task");
        }

        MaintenanceTask.TaskStatus oldStatus = task.getStatus();
        MaintenanceTask.TaskStatus newStatus = MaintenanceTask.TaskStatus.COMPLETED;
        String techRole = tech.getUserRoles().get(0).getRole().getRoleName().name();

        if (!TaskStatusTransition.isAllowed(oldStatus, newStatus, techRole)) {
            throw new IllegalStateException("Cannot transition task from " + oldStatus + " to " + newStatus + " by role " + techRole);
        }

        // Delete old service report if re-submitting after rejection
        ServiceReport existingReport = task.getServiceReport();
        if (existingReport != null) {
            task.setServiceReport(null);
            taskRepository.save(task);
            serviceReportRepository.delete(existingReport);
            serviceReportRepository.flush();
        }

        // Save new service report
        ServiceReport report = ServiceReport.builder()
                .task(task)
                .rootCause(rootCause)
                .workPerformed(workPerformed)
                .timeSpentMinutes(timeSpentMinutes)
                .recommendations(recommendations)
                .build();
        serviceReportRepository.save(report);
        task.setServiceReport(report);

        // Reset completedAt for fresh timestamp and update status to COMPLETED
        task.setCompletedAt(null);
        task.setStatus(newStatus);
        MaintenanceTask savedTask = taskRepository.save(task);

        // Log history
        historyService.logAction(savedTask, "COMPLETED", oldStatus, newStatus, tech,
                "Service report submitted and task marked completed.");

        // Send notifications
        if (savedTask.getAssignedBy() != null) {
            notificationService.sendNotification(
                    savedTask.getAssignedBy(),
                    "Technician " + tech.getFullName() + " submitted a service report and marked task " + savedTask.getTaskCode() + " as COMPLETED"
            );
        } else {
            notificationService.sendNotificationToRole(
                    com.example.asset.asset_maintenance.entity.Role.RoleName.MANAGER,
                    "Technician " + tech.getFullName() + " submitted a service report and marked task " + savedTask.getTaskCode() + " as COMPLETED"
            );
        }

        return savedTask;
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

    // SEARCH TASKS (WITH ROLE-BASED VISIBILITY FILTERING)
    public List<MaintenanceTask> searchTasks(MaintenanceTask.TaskStatus status, MaintenanceTask.Priority priority, String keyword, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String roleName = user.getUserRoles().get(0).getRole().getRoleName().name();
        String keywordParam = keyword != null && !keyword.trim().isEmpty() ? keyword.trim() : null;

        List<MaintenanceTask> results = taskRepository.searchTasks(status, priority, keywordParam);

        if (roleName.equals("ADMIN") || roleName.equals("MANAGER")) {
            return results;
        } else if (roleName.equals("TECHNICIAN")) {
            return results.stream()
                    .filter(t -> (t.getAssignedTo() != null && t.getAssignedTo().getEmail().equals(email))
                            || t.getReportedBy().getEmail().equals(email))
                    .toList();
        } else {
            return results.stream()
                    .filter(t -> t.getReportedBy().getEmail().equals(email))
                    .toList();
        }
    }

    public MaintenanceTask getTaskById(Long taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
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
