package com.example.asset.asset_maintenance.repository;

import com.example.asset.asset_maintenance.entity.TaskHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskHistoryRepository extends JpaRepository<TaskHistory, Long> {
    List<TaskHistory> findByTaskId(Long taskId);
}