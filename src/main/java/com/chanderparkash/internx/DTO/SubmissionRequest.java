package com.chanderparkash.internx.DTO;

import lombok.Data;

@Data
public class SubmissionRequest {

    private Long taskId;
    private String githubLink;
    private String fileUrl;
    private String description;
}
