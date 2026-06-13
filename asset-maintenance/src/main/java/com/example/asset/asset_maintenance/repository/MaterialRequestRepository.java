package com.example.asset.asset_maintenance.repository;

import com.example.asset.asset_maintenance.entity.MaterialRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MaterialRequestRepository extends JpaRepository<MaterialRequest, Long> {
    List<MaterialRequest> findByTaskId(Long taskId);
}
