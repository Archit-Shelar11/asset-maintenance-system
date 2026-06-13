package com.example.asset.asset_maintenance.service;

import com.example.asset.asset_maintenance.entity.MaintenanceTask.TaskStatus;
import java.util.Arrays;

public enum TaskStatusTransition {
    // Technician transitions
    ASSIGNED_TO_IN_PROGRESS(TaskStatus.ASSIGNED, TaskStatus.IN_PROGRESS, "TECHNICIAN"),
    IN_PROGRESS_TO_COMPLETED(TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED, "TECHNICIAN"),
    MATERIAL_APPROVED_TO_COMPLETED(TaskStatus.MATERIAL_APPROVED, TaskStatus.COMPLETED, "TECHNICIAN"),
    MATERIAL_REJECTED_TO_COMPLETED(TaskStatus.MATERIAL_REJECTED, TaskStatus.COMPLETED, "TECHNICIAN"),
    IN_PROGRESS_TO_MATERIAL_REQUESTED(TaskStatus.IN_PROGRESS, TaskStatus.MATERIAL_REQUESTED, "TECHNICIAN"),
    MATERIAL_APPROVED_TO_MATERIAL_REQUESTED(TaskStatus.MATERIAL_APPROVED, TaskStatus.MATERIAL_REQUESTED, "TECHNICIAN"),
    MATERIAL_REJECTED_TO_MATERIAL_REQUESTED(TaskStatus.MATERIAL_REJECTED, TaskStatus.MATERIAL_REQUESTED, "TECHNICIAN"),

    // Technician rework after manager rejection
    REJECTED_TO_IN_PROGRESS(TaskStatus.REJECTED, TaskStatus.IN_PROGRESS, "TECHNICIAN"),
    REJECTED_TO_MATERIAL_REQUESTED(TaskStatus.REJECTED, TaskStatus.MATERIAL_REQUESTED, "TECHNICIAN"),
    REJECTED_TO_COMPLETED(TaskStatus.REJECTED, TaskStatus.COMPLETED, "TECHNICIAN"),

    // Manager transitions
    REPORTED_TO_ASSIGNED(TaskStatus.REPORTED, TaskStatus.ASSIGNED, "MANAGER"),
    REPORTED_TO_REJECTED(TaskStatus.REPORTED, TaskStatus.REJECTED, "MANAGER"),
    COMPLETED_TO_APPROVED(TaskStatus.COMPLETED, TaskStatus.APPROVED, "MANAGER"),
    COMPLETED_TO_REJECTED(TaskStatus.COMPLETED, TaskStatus.REJECTED, "MANAGER"),
    MATERIAL_REQUESTED_TO_MATERIAL_APPROVED(TaskStatus.MATERIAL_REQUESTED, TaskStatus.MATERIAL_APPROVED, "MANAGER"),
    MATERIAL_REQUESTED_TO_MATERIAL_REJECTED(TaskStatus.MATERIAL_REQUESTED, TaskStatus.MATERIAL_REJECTED, "MANAGER");

    private final TaskStatus from;
    private final TaskStatus to;
    private final String allowedRole;

    TaskStatusTransition(TaskStatus from, TaskStatus to, String allowedRole) {
        this.from = from;
        this.to = to;
        this.allowedRole = allowedRole;
    }

    public TaskStatus getFrom() {
        return from;
    }

    public TaskStatus getTo() {
        return to;
    }

    public String getAllowedRole() {
        return allowedRole;
    }

    public static boolean isAllowed(TaskStatus from, TaskStatus to, String role) {
        // ADMIN has super privilege: can do any MANAGER transitions
        String effectiveRole = "ADMIN".equalsIgnoreCase(role) ? "MANAGER" : role;
        
        return Arrays.stream(values())
                .anyMatch(t -> t.from == from && t.to == to && t.allowedRole.equalsIgnoreCase(effectiveRole));
    }
}
