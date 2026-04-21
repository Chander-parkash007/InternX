package com.chanderparkash.internx.DTO;

import lombok.Data;

@Data
public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private String role;
    private boolean isActive;
    private String createdAt;
}
