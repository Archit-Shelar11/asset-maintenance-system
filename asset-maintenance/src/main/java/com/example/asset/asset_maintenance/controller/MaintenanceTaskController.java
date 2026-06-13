package com.example.asset.asset_maintenance.controller;

import com.example.asset.asset_maintenance.dto.CreateTaskRequest;
import com.example.asset.asset_maintenance.dto.TaskHistoryResponse;
import com.example.asset.asset_maintenance.entity.Attachment;
import com.example.asset.asset_maintenance.entity.MaintenanceTask;
import com.example.asset.asset_maintenance.service.MaintenanceTaskService;
import com.example.asset.asset_maintenance.service.PdfReportService;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
public class MaintenanceTaskController {

    private final MaintenanceTaskService taskService;
    private final PdfReportService pdfReportService;

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'TECHNICIAN', 'MANAGER', 'ADMIN')")
    public MaintenanceTask createTask(@Valid @RequestBody CreateTaskRequest request, Principal principal) {
        return taskService.createTask(request, principal.getName());
    }

    @GetMapping("/search")
    @PreAuthorize("isAuthenticated()")
    public List<MaintenanceTask> searchTasks(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String keyword,
            Principal principal) {

        MaintenanceTask.TaskStatus taskStatus = (status != null && !status.trim().isEmpty()) ? MaintenanceTask.TaskStatus.valueOf(status.toUpperCase()) : null;
        MaintenanceTask.Priority taskPriority = (priority != null && !priority.trim().isEmpty()) ? MaintenanceTask.Priority.valueOf(priority.toUpperCase()) : null;

        return taskService.searchTasks(taskStatus, taskPriority, keyword, principal.getName());
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

    @GetMapping("/{taskId}")
    @PreAuthorize("isAuthenticated()")
    public MaintenanceTask getTaskById(@PathVariable Long taskId) {
        return taskService.getTaskById(taskId);
    }

    @GetMapping(value = "/{taskId}/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<InputStreamResource> downloadPdf(@PathVariable Long taskId) {
        MaintenanceTask task = taskService.getTaskById(taskId);
        java.io.ByteArrayInputStream bis = pdfReportService.generateMaintenanceReport(task);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "inline; filename=service_report_" + task.getTaskCode() + ".pdf");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }

    @PostMapping("/{taskId}/attachments")
    @PreAuthorize("hasAnyRole('USER', 'TECHNICIAN', 'MANAGER', 'ADMIN')")
    public Attachment uploadAttachment(
            @PathVariable Long taskId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") String type,
            Principal principal) {
        return taskService.addAttachment(taskId, file, type, principal.getName());
    }

    @PostMapping("/{taskId}/report")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public MaintenanceTask submitReport(
            @PathVariable Long taskId,
            @Valid @RequestBody SubmitReportRequest request,
            Principal principal) {
        return taskService.submitServiceReport(
                taskId,
                request.getRootCause(),
                request.getWorkPerformed(),
                request.getTimeSpentMinutes(),
                request.getRecommendations(),
                principal.getName()
        );
    }

    @lombok.Data
    public static class SubmitReportRequest {
        @jakarta.validation.constraints.NotBlank(message = "Root cause is required")
        private String rootCause;
        
        @jakarta.validation.constraints.NotBlank(message = "Work performed is required")
        private String workPerformed;
        
        @jakarta.validation.constraints.NotNull(message = "Time spent is required")
        @jakarta.validation.constraints.Min(value = 1, message = "Time spent must be positive")
        private Integer timeSpentMinutes;
        
        private String recommendations;
    }
}