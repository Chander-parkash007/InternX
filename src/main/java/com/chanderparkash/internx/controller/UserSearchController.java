package com.chanderparkash.internx.controller;

import com.chanderparkash.internx.DTO.UserBasicResponse;
import com.chanderparkash.internx.Entities.User;
import com.chanderparkash.internx.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserSearchController {

    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserBasicResponse>> searchUsers(@RequestParam String query) {
        User currentUser = getCurrentUser();
        
        List<User> users = userRepository.searchUsers(query.toLowerCase());
        
        // Exclude current user from results
        return ResponseEntity.ok(
            users.stream()
                .filter(u -> !u.getId().equals(currentUser.getId()))
                .map(UserBasicResponse::fromUser)
                .collect(Collectors.toList())
        );
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserBasicResponse> getUserById(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(UserBasicResponse.fromUser(user));
    }

    @GetMapping("/suggestions")
    public ResponseEntity<List<UserBasicResponse>> getSuggestions() {
        User currentUser = getCurrentUser();
        
        // Get users with same role (students see students, companies see companies)
        List<User> suggestions = userRepository.findByRoleAndIdNot(currentUser.getRole(), currentUser.getId());
        
        return ResponseEntity.ok(
            suggestions.stream()
                .limit(10) // Limit to 10 suggestions
                .map(UserBasicResponse::fromUser)
                .collect(Collectors.toList())
        );
    }
}
