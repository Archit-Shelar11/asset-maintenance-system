package com.example.asset.asset_maintenance.service;

import com.example.asset.asset_maintenance.entity.Notification;
import com.example.asset.asset_maintenance.entity.Role;
import com.example.asset.asset_maintenance.entity.User;
import com.example.asset.asset_maintenance.repository.NotificationRepository;
import com.example.asset.asset_maintenance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional
    public void sendNotification(User recipient, String message) {
        if (recipient == null) return;
        Notification notification = Notification.builder()
                .recipient(recipient)
                .message(message)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    @Transactional
    public void sendNotificationToRole(Role.RoleName roleName, String message) {
        // Query users with roleName
        List<User> recipients = userRepository.findAll().stream()
                .filter(u -> u.getUserRoles().stream()
                        .anyMatch(ur -> ur.getRole().getRoleName() == roleName))
                .toList();
        
        for (User u : recipients) {
            sendNotification(u, message);
        }
    }

    public List<Notification> getNotificationsForUser(String email) {
        return notificationRepository.findByRecipientEmailOrderByCreatedAtDesc(email);
    }

    @Transactional
    public void markAsRead(Long id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        n.setRead(true);
        notificationRepository.save(n);
    }

    @Transactional
    public void markAllAsRead(String email) {
        List<Notification> unread = notificationRepository.findByRecipientEmailAndIsReadOrderByCreatedAtDesc(email, false);
        for (Notification n : unread) {
            n.setRead(true);
        }
        notificationRepository.saveAll(unread);
    }
}
