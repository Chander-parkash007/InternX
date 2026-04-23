package com.chanderparkash.internx.service;

import com.chanderparkash.internx.DTO.ConnectionStatsResponse;
import com.chanderparkash.internx.DTO.UserBasicResponse;
import com.chanderparkash.internx.Entities.Connection;
import com.chanderparkash.internx.Entities.User;
import com.chanderparkash.internx.Repository.ConnectionRepository;
import com.chanderparkash.internx.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
@Service
@RequiredArgsConstructor
public class ConnectionService {
    
    private final ConnectionRepository connectionRepository;
    private final UserRepository userRepository;
    private final NotificationsService notificationsService;

    @Transactional
    public void sendConnectionRequest(Long requesterId, Long receiverId) {
        if (requesterId.equals(receiverId)) throw new RuntimeException("Cannot connect with yourself");
        User requester = userRepository.findById(requesterId).orElseThrow(() -> new RuntimeException("Requester not found"));
        User receiver  = userRepository.findById(receiverId).orElseThrow(() -> new RuntimeException("Receiver not found"));
        connectionRepository.findConnectionBetweenUsers(requester, receiver)
                .ifPresent(c -> { throw new RuntimeException("Connection already exists"); });
        Connection connection = new Connection();
        connection.setRequester(requester);
        connection.setReceiver(receiver);
        connection.setStatus(Connection.ConnectionStatus.PENDING);
        connectionRepository.save(connection);
        // Notify receiver
        notificationsService.createNotification(receiver,
                requester.getName() + " sent you a connection request.");
    }

    @Transactional
    public void acceptConnection(Long userId, Long requesterId) {
        User user      = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        User requester = userRepository.findById(requesterId).orElseThrow(() -> new RuntimeException("Requester not found"));
        Connection connection = connectionRepository.findConnectionBetweenUsers(user, requester)
                .orElseThrow(() -> new RuntimeException("Connection not found"));
        if (!connection.getReceiver().getId().equals(userId)) throw new RuntimeException("Not authorized");
        connection.setStatus(Connection.ConnectionStatus.ACCEPTED);
        connectionRepository.save(connection);
        // Notify requester
        notificationsService.createNotification(requester,
                user.getName() + " accepted your connection request.");
    }

    @Transactional
    public void rejectConnection(Long userId, Long requesterId) {
        User user      = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        User requester = userRepository.findById(requesterId).orElseThrow(() -> new RuntimeException("Requester not found"));
        Connection connection = connectionRepository.findConnectionBetweenUsers(user, requester)
                .orElseThrow(() -> new RuntimeException("Connection not found"));
        if (!connection.getReceiver().getId().equals(userId)) throw new RuntimeException("Not authorized");
        connectionRepository.delete(connection);
        notificationsService.createNotification(requester,
                user.getName() + " declined your connection request.");
    }

    @Transactional
    public void removeConnection(Long userId, Long otherUserId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User otherUser = userRepository.findById(otherUserId)
                .orElseThrow(() -> new RuntimeException("Other user not found"));

        Connection connection = connectionRepository.findConnectionBetweenUsers(user, otherUser)
                .orElseThrow(() -> new RuntimeException("Connection not found"));

        connectionRepository.delete(connection);
    }

    public List<UserBasicResponse> getFollowers(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return connectionRepository.findFollowers(user).stream()
                .map(c -> UserBasicResponse.fromUser(c.getRequester()))
                .collect(Collectors.toList());
    }

    public List<UserBasicResponse> getFollowing(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return connectionRepository.findFollowing(user).stream()
                .map(c -> UserBasicResponse.fromUser(c.getReceiver()))
                .collect(Collectors.toList());
    }

    public List<UserBasicResponse> getPendingRequests(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return connectionRepository.findPendingRequests(user).stream()
                .map(c -> UserBasicResponse.fromUser(c.getRequester()))
                .collect(Collectors.toList());
    }

    public ConnectionStatsResponse getStats(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        long followers = connectionRepository.countFollowers(user);
        long following = connectionRepository.countFollowing(user);
        long pending = connectionRepository.countPending(user);

        return new ConnectionStatsResponse(followers, following, pending);
    }

    public boolean areConnected(Long userId1, Long userId2) {
        User user1 = userRepository.findById(userId1)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User user2 = userRepository.findById(userId2)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return connectionRepository.areUsersConnected(user1, user2);
    }
}
