package com.chanderparkash.internx.DTO;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RatingRequest {

    @NotNull(message = "toUserId is required")
    private Long toUserId;
    @NotNull(message = "taskId is required")
    private Long taskId;
    @NotNull
    @Min(1)
    @Max(5)
    private Double rating;
    private String feedback;
}
