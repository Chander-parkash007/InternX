package com.chanderparkash.internx.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @Email
    @NotBlank
    private String email;
    @NotBlank(message = "Password is required")
    private String password;
}
