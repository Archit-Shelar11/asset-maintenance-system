package com.example.asset.asset_maintenance.controller;

import com.example.asset.asset_maintenance.dto.MaterialRequestDTO;
import com.example.asset.asset_maintenance.entity.MaterialRequest;
import com.example.asset.asset_maintenance.service.MaterialRequestService;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/materials")
@RequiredArgsConstructor
public class MaterialRequestController {

    private final MaterialRequestService materialService;

    @PostMapping("/request")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public MaterialRequest requestMaterial(@Valid @RequestBody MaterialRequestDTO request, Principal principal) {
        return materialService.requestMaterial(
                request.getTaskId(),
                request.getMaterialName(),
                request.getQuantity(),
                principal.getName()
        );
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public MaterialRequest approveRequest(@PathVariable Long id, Principal principal) {
        return materialService.approveRequest(id, principal.getName());
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public MaterialRequest rejectRequest(@PathVariable Long id, Principal principal) {
        return materialService.rejectRequest(id, principal.getName());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public List<MaterialRequest> getAllRequests() {
        return materialService.getAllRequests();
    }
}
