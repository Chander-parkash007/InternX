package com.chanderparkash.internx.DTO;

import lombok.Data;

@Data
public class LeaderboardResponse {

    private Integer rank;
    private String studentname;
    private Double averageRating;
    private Integer totalTaskCompleted;
    private Integer totalRatings;

}
