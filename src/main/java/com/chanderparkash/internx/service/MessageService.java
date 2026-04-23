package com.chanderparkash.internx.service;

import com.chanderparkash.internx.DTO.ConversationResponse;
import com.chanderparkash.internx.DTO.MessageResponse;
import com.chanderparkash.internx.DTO.UserBasicResponse;
import com.chanderparkash.internx.Entities.Message;
import com.chanderparkash.internx.Entities.User;
import com.chanderparkash.internx.Repository.ConnectionRepository;
import com.chanderparkash.internx.Repository.MessageRepository;
import com.chanderparkash.internx.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {
    
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ConnectionRepository connectionRepository;

    @Transactional
    public MessageResponse sendMessage(Long senderId, Long receiverId, String content) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        // Check if users are connected
        boolean areConnected = connectionRepository.areUsersConnected(sender, receiver);
        
        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(content);
        message.setRead(false);
        message.setType(areConnected ? Message.MessageType.DIRECT : Message.MessageType.REQUEST);
        
        Message savedMessage = messageRepository.save(message);
        return MessageResponse.fromMessage(savedMessage);
    }

    public List<MessageResponse> getMessagesBetweenUsers(Long userId1, Long userId2) {
        User user1 = userRepository.findById(userId1)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User user2 = userRepository.findById(userId2)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Message> messages = messageRepository.findMessagesBetweenUsers(user1, user2);
        return messages.stream()
                .map(MessageResponse::fromMessage)
                .collect(Collectors.toList());
    }

    public List<ConversationResponse> getConversations(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Message> lastMessages = messageRepository.findLastMessagesForUser(user);
        Map<Long, ConversationResponse> conversationMap = new HashMap<>();

        for (Message message : lastMessages) {
            User otherUser = message.getSender().getId().equals(userId) 
                    ? message.getReceiver() 
                    : message.getSender();
            
            if (!conversationMap.containsKey(otherUser.getId())) {
                long unreadCount = messageRepository.countUnreadMessages(otherUser, user);
                
                ConversationResponse conversation = new ConversationResponse();
                conversation.setOtherUser(UserBasicResponse.fromUser(otherUser));
                conversation.setLastMessage(MessageResponse.fromMessage(message));
                conversation.setUnreadCount(unreadCount);
                
                conversationMap.put(otherUser.getId(), conversation);
            }
        }

        return new ArrayList<>(conversationMap.values());
    }

    @Transactional
    public void markMessagesAsRead(Long userId, Long otherUserId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User otherUser = userRepository.findById(otherUserId)
                .orElseThrow(() -> new RuntimeException("Other user not found"));

        messageRepository.markMessagesAsRead(otherUser, user);
    }

    public long getUnreadCount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return messageRepository.countUnreadMessagesForUser(user);
    }
}
