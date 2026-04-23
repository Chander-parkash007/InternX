package com.chanderparkash.internx.controller;

import com.chanderparkash.internx.DTO.ConnectionStatsResponse;
import com.chanderparkash.internx.DTO.UserBasicResponse;
import com.chanderparkash.internx.Entities.Connection;
import com.chanderparkash.internx.Entities.User;
import com.chanderparkash.internx.Repository.ConnectionRepository;
import com.chanderparkash.internx.Repository.UserRepository;
import com.chanderparkash.internx.service.ConnectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/connections")
@RequiredArgsConstructor
public class ConnectionController {

    private final ConnectionService connectionService;
    private final UserRepository userRepository;
    private final ConnectionRepository connectionRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping("/request/{userId}")
    public ResponseEntity<String> sendConnectionRequest(@PathVariable Long userId) {
        User currentUser = getCurrentUser();
        connectionService.sendConnectionRequest(currentUser.getId(), userId);
        return ResponseEntity.ok("Connection request sent");
    }

    @PostMapping("/accept/{userId}")
    public ResponseEntity<String> acceptConnection(@PathVariable Long userId) {
        User currentUser = getCurrentUser();
        connectionService.acceptConnection(currentUser.getId(), userId);
        return ResponseEntity.ok("Connection accepted");
    }

    @PostMapping("/reject/{userId}")
    public ResponseEntity<String> rejectConnection(@PathVariable Long userId) {
        User currentUser = getCurrentUser();
        connectionService.rejectConnection(currentUser.getId(), userId);
        return ResponseEntity.ok("Connection rejected");
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<String> removeConnection(@PathVariable Long userId) {
        User currentUser = getCurrentUser();
        connectionService.removeConnection(currentUser.getId(), userId);
        return ResponseEntity.ok("Connection removed");
    }

    @GetMapping("/followers")
    public ResponseEntity<List<UserBasicResponse>> getFollowers() {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(connectionService.getFollowers(currentUser.getId()));
    }

    @GetMapping("/following")
    public ResponseEntity<List<UserBasicResponse>> getFollowing() {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(connectionService.getFollowing(currentUser.getId()));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<UserBasicResponse>> getPendingRequests() {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(connectionService.getPendingRequests(currentUser.getId()));
    }

    @GetMapping("/stats")
    public ResponseEntity<ConnectionStatsResponse> getStats() {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(connectionService.getStats(currentUser.getId()));
    }

    @GetMapping("/status/{userId}")
    public ResponseEntity<String> getConnectionStatus(@PathVariable Long userId) {
        User currentUser = getCurrentUser();
        User other = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<Connection> conn = connectionRepository.findConnectionBetweenUsers(currentUser, other);
        if (conn.isEmpty()) return ResponseEntity.ok("NONE");
        return switch (conn.get().getStatus()) {
            case ACCEPTED -> ResponseEntity.ok("CONNECTED");
            case PENDING  -> ResponseEntity.ok("PENDING");
            default       -> ResponseEntity.ok("NONE");
        };
    }
}
