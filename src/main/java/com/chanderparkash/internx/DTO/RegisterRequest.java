package com.chanderparkash.internx.DTO;

import com.chanderparkash.internx.Entities.Role;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    private String name;
    @NotBlank
    @Email(message = "valid Email is required")
    private String email;
    @NotBlank
    @Size(min = 6, message = "Password is required and it must be at least 6 characters long")
    private String password;
    @NotNull(message = "Role is required")
    private Role role;
}
