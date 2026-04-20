package com.chanderparkash.internx.service;

import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.chanderparkash.internx.DTO.NotificationsResponse;
import com.chanderparkash.internx.Entities.Notifications;
import com.chanderparkash.internx.Entities.User;
import com.chanderparkash.internx.Repository.NotificationsRepository;
import com.chanderparkash.internx.Repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor

public class NotificationsService {

    private final NotificationsRepository notificationsRepository;
    private final UserRepository userRepository;

    public void createNotification(User user, String message) {
        Notifications notifications = new Notifications();
        notifications.setUser(user);
        notifications.setMessage(message);
        notifications.setRead(false);
        notificationsRepository.save(notifications);
    }

    public List<NotificationsResponse> getAllNotifications() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not Found"));
        return notificationsRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(n -> {
                    NotificationsResponse response = new NotificationsResponse();
                    response.setId(n.getId());
                    response.setMessage(n.getMessage());
                    response.setIsRead(n.isRead());
                    response.setCreatedAt(n.getCreatedAt());
                    return response;
                }).toList();
    }

    public void markAsRead() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found."));
        List<Notifications> unread = notificationsRepository.findByUserAndIsRead(user, false);
        unread.forEach(n -> n.setRead(true));
        notificationsRepository.saveAll(unread);

    }

}
