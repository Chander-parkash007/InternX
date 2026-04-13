package com.chanderparkash.internx.DTO;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponse {

    private Long id;
    private String title;
    private String description;
    private String type;
    private String difficulty;
    private LocalDate deadline;
    private String status;
    private String postedBy;
}
