package com.example.asset.asset_maintenance.service;

import com.example.asset.asset_maintenance.entity.MaintenanceTask.TaskStatus;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class TaskStatusTransitionTest {

    @Test
    void testAllowedTechnicianTransitions() {
        // Technician can transition ASSIGNED -> IN_PROGRESS
        assertTrue(TaskStatusTransition.isAllowed(TaskStatus.ASSIGNED, TaskStatus.IN_PROGRESS, "TECHNICIAN"));
        
        // Technician can transition IN_PROGRESS -> COMPLETED
        assertTrue(TaskStatusTransition.isAllowed(TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED, "TECHNICIAN"));
        
        // Technician can transition IN_PROGRESS -> MATERIAL_REQUESTED
        assertTrue(TaskStatusTransition.isAllowed(TaskStatus.IN_PROGRESS, TaskStatus.MATERIAL_REQUESTED, "TECHNICIAN"));
        
        // Technician can transition REJECTED -> IN_PROGRESS (for rework)
        assertTrue(TaskStatusTransition.isAllowed(TaskStatus.REJECTED, TaskStatus.IN_PROGRESS, "TECHNICIAN"));
    }

    @Test
    void testAllowedManagerTransitions() {
        // Manager can transition REPORTED -> ASSIGNED
        assertTrue(TaskStatusTransition.isAllowed(TaskStatus.REPORTED, TaskStatus.ASSIGNED, "MANAGER"));
        
        // Manager can transition COMPLETED -> APPROVED
        assertTrue(TaskStatusTransition.isAllowed(TaskStatus.COMPLETED, TaskStatus.APPROVED, "MANAGER"));
        
        // Manager can transition MATERIAL_REQUESTED -> MATERIAL_APPROVED
        assertTrue(TaskStatusTransition.isAllowed(TaskStatus.MATERIAL_REQUESTED, TaskStatus.MATERIAL_APPROVED, "MANAGER"));
    }

    @Test
    void testAdminSuperPrivilege() {
        // ADMIN should be treated as MANAGER, and thus pass manager-only transitions
        assertTrue(TaskStatusTransition.isAllowed(TaskStatus.REPORTED, TaskStatus.ASSIGNED, "ADMIN"));
        assertTrue(TaskStatusTransition.isAllowed(TaskStatus.COMPLETED, TaskStatus.APPROVED, "ADMIN"));
        assertTrue(TaskStatusTransition.isAllowed(TaskStatus.MATERIAL_REQUESTED, TaskStatus.MATERIAL_APPROVED, "ADMIN"));
    }

    @Test
    void testInvalidTransitions() {
        // Technician cannot perform manager-only transitions
        assertFalse(TaskStatusTransition.isAllowed(TaskStatus.REPORTED, TaskStatus.ASSIGNED, "TECHNICIAN"));
        assertFalse(TaskStatusTransition.isAllowed(TaskStatus.COMPLETED, TaskStatus.APPROVED, "TECHNICIAN"));

        // Manager cannot perform technician-only transitions
        assertFalse(TaskStatusTransition.isAllowed(TaskStatus.ASSIGNED, TaskStatus.IN_PROGRESS, "MANAGER"));
        assertFalse(TaskStatusTransition.isAllowed(TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED, "MANAGER"));

        // Operator/User cannot perform any transitions in the enum
        assertFalse(TaskStatusTransition.isAllowed(TaskStatus.REPORTED, TaskStatus.ASSIGNED, "USER"));
        assertFalse(TaskStatusTransition.isAllowed(TaskStatus.ASSIGNED, TaskStatus.IN_PROGRESS, "USER"));

        // Random illegal transitions
        assertFalse(TaskStatusTransition.isAllowed(TaskStatus.REPORTED, TaskStatus.APPROVED, "MANAGER"));
        assertFalse(TaskStatusTransition.isAllowed(TaskStatus.ASSIGNED, TaskStatus.COMPLETED, "TECHNICIAN"));
    }
}
