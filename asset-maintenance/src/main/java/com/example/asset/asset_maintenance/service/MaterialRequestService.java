package com.example.asset.asset_maintenance.service;

import com.example.asset.asset_maintenance.entity.MaintenanceTask;
import com.example.asset.asset_maintenance.entity.MaterialRequest;
import com.example.asset.asset_maintenance.entity.User;
import com.example.asset.asset_maintenance.repository.MaintenanceTaskRepository;
import com.example.asset.asset_maintenance.repository.MaterialRequestRepository;
import com.example.asset.asset_maintenance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MaterialRequestService {

    private final MaterialRequestRepository materialRequestRepository;
    private final MaintenanceTaskRepository taskRepository;
    private final UserRepository userRepository;
    private final TaskHistoryService historyService;

    public MaterialRequest requestMaterial(Long taskId, String materialName,
                                           Integer quantity, String technicianEmail) {

        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }

        if (materialName == null || materialName.trim().isEmpty()) {
            throw new IllegalArgumentException("Material name is required");
        }

        MaintenanceTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        User user = userRepository.findByEmail(technicianEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (task.getAssignedTo() == null || !task.getAssignedTo().getEmail().equals(technicianEmail)) {
            throw new RuntimeException("Only the assigned technician can request materials for this task");
        }

        MaintenanceTask.TaskStatus oldStatus = task.getStatus();
        String userRole = user.getUserRoles().get(0).getRole().getRoleName().name();

        // Validate state transition
        if (!TaskStatusTransition.isAllowed(oldStatus, MaintenanceTask.TaskStatus.MATERIAL_REQUESTED, userRole)) {
            throw new IllegalStateException("Cannot transition task from " + oldStatus + " to MATERIAL_REQUESTED by role " + userRole);
        }

        MaterialRequest request = new MaterialRequest();
        request.setTask(task);
        request.setMaterialName(materialName);
        request.setQuantity(quantity);
        request.setRequestedBy(user);
        request.setStatus(MaterialRequest.RequestStatus.PENDING);

        MaterialRequest savedRequest = materialRequestRepository.save(request);

        task.setStatus(MaintenanceTask.TaskStatus.MATERIAL_REQUESTED);
        taskRepository.save(task);

        historyService.logAction(task, "MATERIAL_REQUESTED", oldStatus,
                MaintenanceTask.TaskStatus.MATERIAL_REQUESTED,
                user, "Requested material: " + materialName + " (Qty: " + quantity + ")");

        return savedRequest;
    }

    public MaterialRequest approveRequest(Long requestId, String managerEmail) {

        MaterialRequest request = materialRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        User manager = userRepository.findByEmail(managerEmail)
                .orElseThrow(() -> new RuntimeException("Manager not found"));

        MaintenanceTask task = request.getTask();
        if (task.getAssignedBy() == null || !task.getAssignedBy().getEmail().equals(managerEmail)) {
            throw new RuntimeException("Only the assigned manager can approve material requests for this task");
        }

        MaintenanceTask.TaskStatus oldStatus = task.getStatus();
        String managerRole = manager.getUserRoles().get(0).getRole().getRoleName().name();

        // Validate state transition
        if (!TaskStatusTransition.isAllowed(oldStatus, MaintenanceTask.TaskStatus.MATERIAL_APPROVED, managerRole)) {
            throw new IllegalStateException("Cannot transition task from " + oldStatus + " to MATERIAL_APPROVED by role " + managerRole);
        }

        request.setApprovedBy(manager);
        request.setStatus(MaterialRequest.RequestStatus.APPROVED);

        MaterialRequest savedRequest = materialRequestRepository.save(request);

        task.setStatus(MaintenanceTask.TaskStatus.MATERIAL_APPROVED);
        taskRepository.save(task);

        historyService.logAction(task, "MATERIAL_APPROVED", oldStatus,
                MaintenanceTask.TaskStatus.MATERIAL_APPROVED,
                manager, "Material request approved by manager");

        return savedRequest;
    }

    public MaterialRequest rejectRequest(Long requestId, String managerEmail) {

        MaterialRequest request = materialRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        User manager = userRepository.findByEmail(managerEmail)
                .orElseThrow(() -> new RuntimeException("Manager not found"));

        MaintenanceTask task = request.getTask();
        if (task.getAssignedBy() == null || !task.getAssignedBy().getEmail().equals(managerEmail)) {
            throw new RuntimeException("Only the assigned manager can reject material requests for this task");
        }

        MaintenanceTask.TaskStatus oldStatus = task.getStatus();
        String managerRole = manager.getUserRoles().get(0).getRole().getRoleName().name();

        // Validate state transition
        if (!TaskStatusTransition.isAllowed(oldStatus, MaintenanceTask.TaskStatus.MATERIAL_REJECTED, managerRole)) {
            throw new IllegalStateException("Cannot transition task from " + oldStatus + " to MATERIAL_REJECTED by role " + managerRole);
        }

        request.setApprovedBy(manager);
        request.setStatus(MaterialRequest.RequestStatus.REJECTED);

        MaterialRequest savedRequest = materialRequestRepository.save(request);

        task.setStatus(MaintenanceTask.TaskStatus.MATERIAL_REJECTED);
        taskRepository.save(task);

        historyService.logAction(task, "MATERIAL_REJECTED", oldStatus,
                MaintenanceTask.TaskStatus.MATERIAL_REJECTED,
                manager, "Material request rejected by manager");

        return savedRequest;
    }

    public List<MaterialRequest> getAllRequests() {
        return materialRequestRepository.findAll();
    }
}
