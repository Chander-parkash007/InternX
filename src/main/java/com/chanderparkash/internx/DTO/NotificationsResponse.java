package com.chanderparkash.internx.DTO;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class NotificationsResponse {

    private Long id;
    private String message;
    private Boolean isRead;
    private Long relatedEntityId;
    private String entityType;
    private LocalDateTime createdAt;
}
