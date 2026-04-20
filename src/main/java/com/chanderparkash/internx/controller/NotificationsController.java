package com.chanderparkash.internx.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chanderparkash.internx.DTO.NotificationsResponse;
import com.chanderparkash.internx.service.NotificationsService;

@RestController
@RequestMapping("/api/notifications")
public class NotificationsController {

    @Autowired
    private NotificationsService notificationsService;

    @GetMapping
    public ResponseEntity<List<NotificationsResponse>> getAllNotifications() {
        return ResponseEntity.ok(notificationsService.getAllNotifications());
    }

    @PutMapping
    public ResponseEntity<String> markAllAsRead() {
        notificationsService.markAsRead();
        return ResponseEntity.ok("All notifications marked as read");
    }
}
