package com.chanderparkash.internx.DTO;

import com.chanderparkash.internx.Entities.Message;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {
    private Long id;
    private Long senderId;
    private Long receiverId;
    private String content;
    private boolean isRead;
    private String type;
    private LocalDateTime createdAt;

    public static MessageResponse fromMessage(Message message) {
        MessageResponse response = new MessageResponse();
        response.setId(message.getId());
        response.setSenderId(message.getSender().getId());
        response.setReceiverId(message.getReceiver().getId());
        response.setContent(message.getContent());
        response.setRead(message.isRead());
        response.setType(message.getType().name());
        response.setCreatedAt(message.getCreatedAt());
        return response;
    }
}
