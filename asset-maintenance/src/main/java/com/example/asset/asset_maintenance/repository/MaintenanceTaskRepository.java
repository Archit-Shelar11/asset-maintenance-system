package com.example.asset.asset_maintenance.repository;

import com.example.asset.asset_maintenance.entity.MaintenanceTask;
import com.example.asset.asset_maintenance.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MaintenanceTaskRepository extends JpaRepository<MaintenanceTask, Long> {


    List<MaintenanceTask> findByReportedBy(User user);


    List<MaintenanceTask> findByAssignedTo(User user);

    boolean existsByTaskCode(String taskCode);
}
