package com.example.asset.asset_maintenance.repository;

import com.example.asset.asset_maintenance.entity.ServiceReport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ServiceReportRepository extends JpaRepository<ServiceReport, Long> {
    Optional<ServiceReport> findByTaskId(Long taskId);
}
