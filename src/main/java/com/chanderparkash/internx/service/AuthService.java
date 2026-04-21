package com.chanderparkash.internx.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.chanderparkash.internx.DTO.LoginRequest;
import com.chanderparkash.internx.DTO.LoginResponse;
import com.chanderparkash.internx.DTO.RegisterRequest;
import com.chanderparkash.internx.Entities.Role;
import com.chanderparkash.internx.Entities.User;
import com.chanderparkash.internx.Repository.UserRepository;
import com.chanderparkash.internx.config.jwtUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final jwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final EmailService Emailservice;

    public String register(RegisterRequest request) {
        if (userRepo.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("User already exists with email : " + request.getEmail());
        }
        if (request.getRole() == Role.ADMIN) {
            throw new RuntimeException("Cannot register as admin");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setRole(request.getRole());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepo.save(user);
        String message = "Dear " + request.getName() + ",\n\n"
                + "Welcome to InternX!\n\n"
                + "Thank you for registering with us. We are delighted to have you on board and look forward to supporting you throughout your journey.\n\n"
                + "Here are your registration details:\n"
                + "Email: " + request.getEmail() + "\n"
                + "Role: " + request.getRole() + "\n\n"
                + "If you have any questions or need assistance, please feel free to reach out to our support team.\n\n"
                + "We wish you a productive and successful experience with InternX.\n\n"
                + "Best regards,\n"
                + "InternX Team";
        return "User registered successfully";
    }

    public LoginResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(), request.getPassword()));
        User user = userRepo.findByEmail(request.getEmail()).orElseThrow(() -> new RuntimeException("User not found "));
        String token = jwtUtil.generateToken(user.getEmail());
        return new LoginResponse(token, user.getRole().name(), user.getName());

    }

}
