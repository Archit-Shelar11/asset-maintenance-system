package com.example.asset.asset_maintenance.controller;

import com.example.asset.asset_maintenance.entity.Asset;
import com.example.asset.asset_maintenance.service.AssetService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/assets")
@RequiredArgsConstructor
public class AssetController {

    private final AssetService assetService;

    // CREATE ASSET - MANAGER and ADMIN can create assets
    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public Asset createAsset(@RequestBody Asset asset, Principal principal) {
        return assetService.createAsset(asset, principal);
    }

    // GET ALL ASSETS - any authenticated user can view
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<Asset> getAllAssets() {
        return assetService.getAllAssets();
    }

    // GET ONE ASSET - any authenticated user can view
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public Asset getAsset(@PathVariable Long id) {
        return assetService.getAssetById(id);
    }
}