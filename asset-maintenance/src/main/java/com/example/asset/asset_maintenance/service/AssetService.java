package com.example.asset.asset_maintenance.service;

import com.example.asset.asset_maintenance.entity.Asset;
import com.example.asset.asset_maintenance.entity.User;
import com.example.asset.asset_maintenance.repository.AssetRepository;
import com.example.asset.asset_maintenance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AssetService {

    private final AssetRepository assetRepository;
    private final UserRepository userRepository;

    /**
     * Create a new asset and associate it with the manager who creates it.
     */
    public Asset createAsset(Asset asset, Principal principal) {
        // Generate unique asset code
        asset.setAssetCode("ASSET-" + System.currentTimeMillis());
        // Find manager user entity from principal
        User manager = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Manager user not found"));
        asset.setManager(manager);
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