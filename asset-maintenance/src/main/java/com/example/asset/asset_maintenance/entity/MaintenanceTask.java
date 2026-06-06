package com.example.asset.asset_maintenance.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "maintenance_tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "task_code", unique = true, nullable = false)
    private String taskCode;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;


    @Enumerated(EnumType.STRING)
    private Priority priority;

    @Enumerated(EnumType.STRING)
    private TaskStatus status;


    @ManyToOne
    @JoinColumn(name = "asset_id")
    private Asset asset;


    @ManyToOne
    @JoinColumn(name = "reported_by")
    private User reportedBy;

    @ManyToOne
    @JoinColumn(name = "assigned_to")
    private User assignedTo;


    @ManyToOne
    @JoinColumn(name = "approved_by")
    private User approvedBy;


    @Column(columnDefinition = "TEXT")
    private String managerRemarks;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private LocalDateTime completedAt;
    private LocalDateTime closedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }


    public enum Priority {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }


    public enum TaskStatus {
        REPORTED,
        ASSIGNED,
        IN_PROGRESS,

        MATERIAL_REQUESTED,
        MATERIAL_APPROVED,
        MATERIAL_REJECTED,

        COMPLETED,

        APPROVED,
        REJECTED,

        CLOSED
    }
}