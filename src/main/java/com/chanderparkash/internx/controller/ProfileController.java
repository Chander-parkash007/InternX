package com.chanderparkash.internx.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.chanderparkash.internx.DTO.ProfileResponse;
import com.chanderparkash.internx.DTO.UpdateProfileRequest;
import com.chanderparkash.internx.Entities.User;
import com.chanderparkash.internx.Repository.UserRepository;
import com.chanderparkash.internx.service.ProfileService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;
    private final UserRepository userRepository;

    @GetMapping("/{userId}")
    public ResponseEntity<ProfileResponse> getProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(profileService.getProfile(userId));
    }

    @GetMapping("/myprofile")
    public ResponseEntity<ProfileResponse> getMyProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(()
                -> new RuntimeException("User not found with email : " + email));
        return ResponseEntity.ok(profileService.getProfile(user.getId()));
    }

    @PutMapping("/update")
    public ResponseEntity<ProfileResponse> updateProfile(@RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(profileService.updateProfile(request));
    }
}
