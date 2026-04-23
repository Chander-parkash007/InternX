package com.chanderparkash.internx.config;

import com.chanderparkash.internx.Entities.Role;
import com.chanderparkash.internx.Entities.User;
import com.chanderparkash.internx.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        userRepository.findByEmail("admin@internx.com").ifPresentOrElse(
            admin -> {
                // Reset password to admin@123 every startup so it's always known
                admin.setPassword(passwordEncoder.encode("admin@123"));
                admin.setActive(true);
                userRepository.save(admin);
            },
            () -> {
                User admin = new User();
                admin.setName("Admin");
                admin.setEmail("admin@internx.com");
                admin.setPassword(passwordEncoder.encode("admin@123"));
                admin.setRole(Role.ADMIN);
                admin.setActive(true);
                userRepository.save(admin);
            }
        );
    }
}
