package com.example.asset.asset_maintenance.repository;

import com.example.asset.asset_maintenance.entity.MaintenanceTask;
import com.example.asset.asset_maintenance.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface MaintenanceTaskRepository extends JpaRepository<MaintenanceTask, Long> {


    List<MaintenanceTask> findByReportedBy(User user);


    List<MaintenanceTask> findByAssignedTo(User user);

    boolean existsByTaskCode(String taskCode);

    @Query("SELECT t FROM MaintenanceTask t WHERE " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:priority IS NULL OR t.priority = :priority) AND " +
           "(:keyword IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(t.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<MaintenanceTask> searchTasks(
        @Param("status") com.example.asset.asset_maintenance.entity.MaintenanceTask.TaskStatus status,
        @Param("priority") com.example.asset.asset_maintenance.entity.MaintenanceTask.Priority priority,
        @Param("keyword") String keyword
    );
}
