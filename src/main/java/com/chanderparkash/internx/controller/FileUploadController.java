package com.chanderparkash.internx.controller;

import com.chanderparkash.internx.DTO.ProfileResponse;
import com.chanderparkash.internx.Entities.User;
import com.chanderparkash.internx.Repository.UserRepository;
import com.chanderparkash.internx.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class FileUploadController {

    private final UserRepository userRepository;
    private final ProfileService profileService;
    private static final String UPLOAD_DIR = "uploads/";

    @PostMapping("/avatar")
    public ResponseEntity<ProfileResponse> uploadAvatar(@RequestParam("file") MultipartFile file) throws IOException {
        String url = saveFile(file, "avatar_");
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        user.setProfilePicture(url);
        userRepository.save(user);
        return ResponseEntity.ok(profileService.getProfile(user.getId()));
    }

    @PostMapping("/cover")
    public ResponseEntity<ProfileResponse> uploadCover(@RequestParam("file") MultipartFile file) throws IOException {
        String url = saveFile(file, "cover_");
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        user.setCoverPhoto(url);
        userRepository.save(user);
        return ResponseEntity.ok(profileService.getProfile(user.getId()));
    }

    private String saveFile(MultipartFile file, String prefix) throws IOException {
        String filename = prefix + UUID.randomUUID() + "_" + file.getOriginalFilename().replaceAll("[^a-zA-Z0-9._-]", "_");
        Path uploadPath = Paths.get(UPLOAD_DIR);
        Files.createDirectories(uploadPath);
        Files.copy(file.getInputStream(), uploadPath.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
        return "/uploads/" + filename;
    }
}
