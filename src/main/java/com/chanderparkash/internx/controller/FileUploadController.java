package com.chanderparkash.internx.controller;

import com.chanderparkash.internx.DTO.ProfileResponse;
import com.chanderparkash.internx.Entities.User;
import com.chanderparkash.internx.Repository.UserRepository;
import com.chanderparkash.internx.service.ProfileService;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class FileUploadController {

    private final UserRepository userRepository;
    private final ProfileService profileService;
    private final Cloudinary cloudinary;

    @PostMapping("/avatar")
    public ResponseEntity<ProfileResponse> uploadAvatar(@RequestParam("file") MultipartFile file) throws IOException {
        String url = uploadToCloudinary(file, "internx/avatars");
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        user.setProfilePicture(url);
        userRepository.save(user);
        return ResponseEntity.ok(profileService.getProfile(user.getId()));
    }

    @PostMapping("/cover")
    public ResponseEntity<ProfileResponse> uploadCover(@RequestParam("file") MultipartFile file) throws IOException {
        String url = uploadToCloudinary(file, "internx/covers");
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        user.setCoverPhoto(url);
        userRepository.save(user);
        return ResponseEntity.ok(profileService.getProfile(user.getId()));
    }

    @SuppressWarnings("unchecked")
    private String uploadToCloudinary(MultipartFile file, String folder) throws IOException {
        Map<String, Object> result = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap("folder", folder, "resource_type", "image")
        );
        return (String) result.get("secure_url");
    }
}
