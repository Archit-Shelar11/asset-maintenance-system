package com.example.asset.asset_maintenance.repository;

import com.example.asset.asset_maintenance.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssetRepository  extends JpaRepository<Asset,Long> {
}
