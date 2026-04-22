package com.chanderparkash.internx.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.chanderparkash.internx.DTO.ForgotPasswordRequest;
import com.chanderparkash.internx.DTO.LoginRequest;
import com.chanderparkash.internx.DTO.LoginResponse;
import com.chanderparkash.internx.DTO.RegisterRequest;
import com.chanderparkash.internx.DTO.ResetPasswordRequest;
import com.chanderparkash.internx.Entities.PasswordResetToken;
import com.chanderparkash.internx.Entities.Role;
import com.chanderparkash.internx.Entities.User;
import com.chanderparkash.internx.Repository.PasswordResetTokenRepository;
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
    private final EmailService emailService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

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

    public String forgotPassword(ForgotPasswordRequest request) {
        User user = userRepo.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("No account found with this email"));

        // generate token
        String token = UUID.randomUUID().toString();

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(15));
        resetToken.setUsed(false);
        passwordResetTokenRepository.save(resetToken);

        // send email
        emailService.sendEmail(
                user.getEmail(),
                "Password Reset - InternX",
                "Dear " + user.getName() + ",\n\n"
                + "Your password reset token is:\n\n"
                + token + "\n\n"
                + "This token expires in 15 minutes.\n\n"
                + "Best regards,\nInternX Team"
        );

        return "Password reset email sent";
    }

    public String resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        if (resetToken.isUsed()) {
            throw new RuntimeException("Token already used");
        }
        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepo.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
        emailService.sendEmail(
                user.getEmail(),
                "Password Reset - InternX",
                "Dear " + user.getName() + ",\n\n"
                + "Your password has been changed to your new password.\n\n"
                + "You may now login to the InternX with your Email and new password.\n\n"
                + "Best regards,\nInternX Team"
        );

        return "Password reset successfully";
    }

}
