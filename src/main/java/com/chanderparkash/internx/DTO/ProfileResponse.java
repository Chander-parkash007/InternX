package com.chanderparkash.internx.DTO;

import java.util.List;

import lombok.Data;

@Data
public class ProfileResponse {

    private Long id;
    private String name;
    private String email;
    private String role;
    private List<SkillResponse> skills;
    private Double averageRating;
    private int totalTaskCompleted;
    private List<RatingResponse> ratings;
    private String bio;
    private String location;
    private String website;
    private String profilePicture;
    private String headline;
    private String createdAt;
    private String coverPhoto;
}
