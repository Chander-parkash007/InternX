package com.chanderparkash.internx.DTO;

import lombok.Data;

@Data
public class SubmissionResponse {

    private Long id;
    private String taskTitle;
    private String studentName;
    private String githubLink;
    private String fileUrl;
    private String description;
    private String submittedAt;
}
