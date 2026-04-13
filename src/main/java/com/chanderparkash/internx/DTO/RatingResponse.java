package com.chanderparkash.internx.DTO;

import lombok.Data;

@Data
public class RatingResponse {

    private Long id;
    private String fromUser;
    private String toUser;
    private String taskTitle;
    private int rating;
    private String feedback;
    private String ratedAt;

}
