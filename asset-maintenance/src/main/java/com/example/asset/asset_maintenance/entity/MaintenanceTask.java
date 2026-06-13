package com.example.asset.asset_maintenance.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

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

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private Priority priority;

    @Enumerated(EnumType.STRING)
    private TaskStatus status;

    //  Asset
    @ManyToOne
    @JoinColumn(name = "asset_id")
    private Asset asset;

    //  Reporter (user who created task)
    @ManyToOne
    @JoinColumn(name = "reported_by")
    private User reportedBy;

    //  Technician assigned
    @ManyToOne
    @JoinColumn(name = "assigned_to")
    private User assignedTo;

    //  Manager who assigned (ownership)
    @ManyToOne
    @JoinColumn(name = "assigned_by")
    private User assignedBy;

    //  Manager who approved/rejected
    @ManyToOne
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    @Column(name = "manager_remarks", columnDefinition = "TEXT")
    private String managerRemarks;

    @Column(name = "due_date")
    private LocalDateTime dueDate;

    @OneToOne(mappedBy = "task", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private ServiceReport serviceReport;

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Attachment> attachments;

    //  Audit fields
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    //  Auto timestamps
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();

        //  Auto-set completed time (optional but useful)
        if (this.status == TaskStatus.COMPLETED && this.completedAt == null) {
            this.completedAt = LocalDateTime.now();
        }
    }

    //  Priority enum
    public enum Priority {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }

    //  Task lifecycle enum
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