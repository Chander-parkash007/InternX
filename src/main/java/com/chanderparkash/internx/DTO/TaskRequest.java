package com.chanderparkash.internx.DTO;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TaskRequest {

    @NotBlank(message = "Title is required")
    private String title;
    @NotBlank(message = "Description is required")
    private String description;
    private String type;
    private String difficulty;
    @NotNull(message = "Deadline is required")
    private LocalDate deadline;
}
