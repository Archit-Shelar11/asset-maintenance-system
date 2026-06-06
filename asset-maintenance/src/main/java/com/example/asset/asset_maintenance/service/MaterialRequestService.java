
package com.example.asset.asset_maintenance.service;

import com.example.asset.asset_maintenance.entity.MaintenanceTask;
import com.example.asset.asset_maintenance.entity.MaterialRequest;
import com.example.asset.asset_maintenance.entity.User;
import com.example.asset.asset_maintenance.repository.MaintenanceTaskRepository;
import com.example.asset.asset_maintenance.repository.MaterialRequestRepository;
import com.example.asset.asset_maintenance.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MaterialRequestService {

    @Autowired
    private MaterialRequestRepository materialRequestRepository;

    @Autowired
    private MaintenanceTaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    public MaterialRequest requestMaterial(Long taskId, String materialName,
                                           Integer quantity, Long userId) {

        MaintenanceTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        MaterialRequest request = new MaterialRequest();
        request.setTask(task);
        request.setMaterialName(materialName);
        request.setQuantity(quantity);
        request.setRequestedBy(user);
        request.setStatus(MaterialRequest.RequestStatus.PENDING);

        return materialRequestRepository.save(request);
    }

    public MaterialRequest approveRequest(Long requestId, Long managerId) {

        MaterialRequest request = materialRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        User manager = userRepository.findById(managerId)
                .orElseThrow(() -> new RuntimeException("Manager not found"));

        request.setApprovedBy(manager);
        request.setStatus(MaterialRequest.RequestStatus.APPROVED);

        return materialRequestRepository.save(request);
    }
    public MaterialRequest rejectRequest(Long requestId, Long managerId) {

        MaterialRequest request = materialRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        User manager = userRepository.findById(managerId)
                .orElseThrow(() -> new RuntimeException("Manager not found"));

        request.setApprovedBy(manager);
        request.setStatus(MaterialRequest.RequestStatus.REJECTED);

        return materialRequestRepository.save(request);
    }
}

