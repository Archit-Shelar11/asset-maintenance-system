package com.example.asset.asset_maintenance.controller;

import com.example.asset.asset_maintenance.entity.Asset;
import com.example.asset.asset_maintenance.service.AssetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/assets")
public class AssetController {

    @Autowired
    private AssetService assetService;

    //  CREATE ASSET
    @PostMapping
    public Asset createAsset(@RequestBody Asset asset) {
        return assetService.createAsset(asset);
    }

    // GET ALL ASSETS
    @GetMapping
    public List<Asset> getAllAssets() {
        return assetService.getAllAssets();
    }

    //  GET ONE ASSET
    @GetMapping("/{id}")
    public Asset getAsset(@PathVariable Long id) {
        return assetService.getAssetById(id);
    }
}