package com.example.asset.asset_maintenance.repository;

import com.example.asset.asset_maintenance.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientEmailOrderByCreatedAtDesc(String email);
    List<Notification> findByRecipientEmailAndIsReadOrderByCreatedAtDesc(String email, boolean isRead);
}
