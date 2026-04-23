package com.chanderparkash.internx.DTO;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String name;
    private String bio;
    private String location;
    private String website;
    private String profilePicture;
    private String headline;
}
