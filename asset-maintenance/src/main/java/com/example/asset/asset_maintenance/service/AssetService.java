package com.example.asset.asset_maintenance.service;

import com.example.asset.asset_maintenance.entity.Asset;
import com.example.asset.asset_maintenance.repository.AssetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AssetService {

    @Autowired
    private AssetRepository assetRepository;

    public Asset createAsset(Asset asset) {
        asset.setAssetCode("ASSET-" + System.currentTimeMillis());
        return assetRepository.save(asset);
    }

    public List<Asset> getAllAssets() {
        return assetRepository.findAll();
    }

    public Asset getAssetById(Long id) {
        return assetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Asset not found"));
    }
}