package com.chanderparkash.internx.DTO;

import lombok.Data;

@Data
public class ApplicationResponse {

    private Long id;
    private String taskTitle;
    private String studentName;
    private String status;
    private String appliedAt;
}
