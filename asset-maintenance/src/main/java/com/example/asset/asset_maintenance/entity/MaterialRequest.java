package com.example.asset.asset_maintenance.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "material_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaterialRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Linked Task
    @ManyToOne
    @JoinColumn(name = "task_id")
    private MaintenanceTask task;

    //  Technician requesting
    @ManyToOne
    @JoinColumn(name = "requested_by")
    private User requestedBy;

    //  Manager approving
    @ManyToOne
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    private String materialName;

    private Integer quantity;

    @Enumerated(EnumType.STRING)
    private RequestStatus status;

    private String remarks;

    private LocalDateTime requestedAt;
    private LocalDateTime approvedAt;

    @PrePersist
    protected void onCreate() {
        requestedAt = LocalDateTime.now();
    }

    public enum RequestStatus {
        PENDING,
        APPROVED,
        REJECTED
    }
}