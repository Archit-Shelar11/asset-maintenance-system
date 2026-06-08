package com.example.asset.asset_maintenance.service;

import com.example.asset.asset_maintenance.entity.MaintenanceTask;
import com.example.asset.asset_maintenance.entity.MaterialRequest;
import com.example.asset.asset_maintenance.entity.TaskHistory;
import com.example.asset.asset_maintenance.entity.User;
import com.example.asset.asset_maintenance.repository.MaintenanceTaskRepository;
import com.example.asset.asset_maintenance.repository.MaterialRequestRepository;
import com.example.asset.asset_maintenance.repository.TaskHistoryRepository;
import com.example.asset.asset_maintenance.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MaterialRequestService {

    @Autowired
    private MaterialRequestRepository materialRequestRepository;

    @Autowired
    private MaintenanceTaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskHistoryRepository taskHistoryRepository;

    public MaterialRequest requestMaterial(Long taskId, String materialName,
                                           Integer quantity, String technicianEmail) {

        MaintenanceTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        User user = userRepository.findByEmail(technicianEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (task.getAssignedTo() == null || !task.getAssignedTo().getEmail().equals(technicianEmail)) {
            throw new RuntimeException("Only the assigned technician can request materials for this task");
        }

        MaintenanceTask.TaskStatus oldStatus = task.getStatus();

        MaterialRequest request = new MaterialRequest();
        request.setTask(task);
        request.setMaterialName(materialName);
        request.setQuantity(quantity);
        request.setRequestedBy(user);
        request.setStatus(MaterialRequest.RequestStatus.PENDING);

        MaterialRequest savedRequest = materialRequestRepository.save(request);

        task.setStatus(MaintenanceTask.TaskStatus.MATERIAL_REQUESTED);
        taskRepository.save(task);

        addHistory(task, "MATERIAL_REQUESTED", oldStatus,
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

        request.setApprovedBy(manager);
        request.setStatus(MaterialRequest.RequestStatus.APPROVED);

        MaterialRequest savedRequest = materialRequestRepository.save(request);

        MaintenanceTask.TaskStatus oldStatus = task.getStatus();
        task.setStatus(MaintenanceTask.TaskStatus.MATERIAL_APPROVED);
        taskRepository.save(task);

        addHistory(task, "MATERIAL_APPROVED", oldStatus,
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

        request.setApprovedBy(manager);
        request.setStatus(MaterialRequest.RequestStatus.REJECTED);

        MaterialRequest savedRequest = materialRequestRepository.save(request);

        MaintenanceTask.TaskStatus oldStatus = task.getStatus();
        task.setStatus(MaintenanceTask.TaskStatus.MATERIAL_REJECTED);
        taskRepository.save(task);

        addHistory(task, "MATERIAL_REJECTED", oldStatus,
                MaintenanceTask.TaskStatus.MATERIAL_REJECTED,
                manager, "Material request rejected by manager");

        return savedRequest;
    }

    public List<MaterialRequest> getAllRequests() {
        return materialRequestRepository.findAll();
    }

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
}
