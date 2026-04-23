package com.chanderparkash.internx.DTO;

import com.chanderparkash.internx.Entities.Report;
import lombok.Data;

@Data
public class ReportRequest {
    private Report.ReportType type;
    private String subject;
    private String description;
    private Long reportedUserId;
    private Long taskId;
    private Long messageId;
}
