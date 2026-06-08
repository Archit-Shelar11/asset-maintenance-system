package com.example.asset.asset_maintenance.controller;

import com.example.asset.asset_maintenance.dto.MaterialRequestDTO;
import com.example.asset.asset_maintenance.entity.MaterialRequest;
import com.example.asset.asset_maintenance.service.MaterialRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/materials")
public class MaterialRequestController {

    @Autowired
    private MaterialRequestService materialService;

    @PostMapping("/request")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public MaterialRequest requestMaterial(@RequestBody MaterialRequestDTO request, Principal principal) {
        return materialService.requestMaterial(
                request.getTaskId(),
                request.getMaterialName(),
                request.getQuantity(),
                principal.getName()
        );
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('MANAGER')")
    public MaterialRequest approveRequest(@PathVariable Long id, Principal principal) {
        return materialService.approveRequest(id, principal.getName());
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('MANAGER')")
    public MaterialRequest rejectRequest(@PathVariable Long id, Principal principal) {
        return materialService.rejectRequest(id, principal.getName());
    }

    @GetMapping
    @PreAuthorize("hasRole('MANAGER')")
    public List<MaterialRequest> getAllRequests() {
        return materialService.getAllRequests();
    }
}
