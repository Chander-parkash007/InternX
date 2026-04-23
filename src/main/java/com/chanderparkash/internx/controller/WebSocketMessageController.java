package com.chanderparkash.internx.controller;

import com.chanderparkash.internx.DTO.MessageResponse;
import com.chanderparkash.internx.DTO.SendMessageRequest;
import com.chanderparkash.internx.Entities.User;
import com.chanderparkash.internx.Repository.UserRepository;
import com.chanderparkash.internx.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class WebSocketMessageController {

    private final MessageService messageService;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload SendMessageRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User sender = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Save message to database
        MessageResponse message = messageService.sendMessage(
                sender.getId(),
                request.getReceiverId(),
                request.getContent()
        );

        // Send to receiver via WebSocket
        messagingTemplate.convertAndSendToUser(
                request.getReceiverId().toString(),
                "/queue/messages",
                message
        );

        // Send confirmation to sender
        messagingTemplate.convertAndSendToUser(
                sender.getId().toString(),
                "/queue/messages",
                message
        );
    }
}
