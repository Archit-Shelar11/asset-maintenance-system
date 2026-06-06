package com.example.asset.asset_maintenance.controller;

import com.example.asset.asset_maintenance.dto.MaterialRequestDTO;
import com.example.asset.asset_maintenance.entity.MaterialRequest;
import com.example.asset.asset_maintenance.service.MaterialRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/materials")
public class MaterialRequestController {

    @Autowired
    private MaterialRequestService materialService;


    @PostMapping("/request")
    public MaterialRequest requestMaterial(@RequestBody MaterialRequestDTO request) {

        return materialService.requestMaterial(
                request.getTaskId(),
                request.getMaterialName(),
                request.getQuantity(),
                request.getUserId()
        );
    }

    @PutMapping("/{id}/approve/{managerId}")
    public MaterialRequest approveRequest(@PathVariable Long id,
                                          @PathVariable Long managerId) {

        return materialService.approveRequest(id, managerId);
    }

    @PutMapping("/{id}/reject/{managerId}")
    public MaterialRequest rejectRequest(@PathVariable Long id,
                                         @PathVariable Long managerId) {

        return materialService.rejectRequest(id, managerId);
    }
}
