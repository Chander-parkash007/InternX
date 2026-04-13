package com.chanderparkash.internx.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chanderparkash.internx.DTO.LoginRequest;
import com.chanderparkash.internx.DTO.LoginResponse;
import com.chanderparkash.internx.DTO.RegisterRequest;
import com.chanderparkash.internx.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService AuthService;

    @PostMapping("/register")
    public ResponseEntity<String> registeration(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(AuthService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(AuthService.login(request));
    }

}
