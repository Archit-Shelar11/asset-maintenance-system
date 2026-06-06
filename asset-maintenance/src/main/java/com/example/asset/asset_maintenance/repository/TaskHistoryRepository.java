package com.example.asset.asset_maintenance.repository;

import com.example.asset.asset_maintenance.entity.TaskHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskHistoryRepository extends JpaRepository<TaskHistory, Long> {
}