package com.chanderparkash.internx.controller;

import com.chanderparkash.internx.DTO.ConversationResponse;
import com.chanderparkash.internx.DTO.MessageResponse;
import com.chanderparkash.internx.DTO.SendMessageRequest;
import com.chanderparkash.internx.Entities.User;
import com.chanderparkash.internx.Repository.UserRepository;
import com.chanderparkash.internx.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationResponse>> getConversations() {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(messageService.getConversations(currentUser.getId()));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<MessageResponse>> getMessages(@PathVariable Long userId) {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(messageService.getMessagesBetweenUsers(currentUser.getId(), userId));
    }

    @PostMapping("/send")
    public ResponseEntity<MessageResponse> sendMessage(@RequestBody SendMessageRequest request) {
        User currentUser = getCurrentUser();
        MessageResponse message = messageService.sendMessage(
                currentUser.getId(), 
                request.getReceiverId(), 
                request.getContent()
        );
        return ResponseEntity.ok(message);
    }

    @PutMapping("/{userId}/read")
    public ResponseEntity<String> markAsRead(@PathVariable Long userId) {
        User currentUser = getCurrentUser();
        messageService.markMessagesAsRead(currentUser.getId(), userId);
        return ResponseEntity.ok("Messages marked as read");
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount() {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(messageService.getUnreadCount(currentUser.getId()));
    }
}
