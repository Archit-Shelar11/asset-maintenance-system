package com.example.asset.asset_maintenance.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "task_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "task_id")
    private MaintenanceTask task;


    @ManyToOne
    @JoinColumn(name = "performed_by")
    private User performedBy;


    private String action;


    @Enumerated(EnumType.STRING)
    private MaintenanceTask.TaskStatus fromStatus;


    @Enumerated(EnumType.STRING)
    private MaintenanceTask.TaskStatus toStatus;


    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "action_time")
    private LocalDateTime actionTime;

    @PrePersist
    protected void onCreate() {
        actionTime = LocalDateTime.now();
    }
}