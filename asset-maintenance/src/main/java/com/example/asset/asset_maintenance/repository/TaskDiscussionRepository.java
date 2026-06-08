package com.example.asset.asset_maintenance.repository;

import com.example.asset.asset_maintenance.entity.TaskDiscussion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskDiscussionRepository extends JpaRepository<TaskDiscussion, Long> {
    List<TaskDiscussion> findByTaskId(Long taskId);
}
