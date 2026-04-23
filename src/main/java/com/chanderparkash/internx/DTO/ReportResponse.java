package com.chanderparkash.internx.DTO;

import com.chanderparkash.internx.Entities.Report;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReportResponse {
    private Long id;
    private String reporterName;
    private String reporterEmail;
    private Long reporterId;
    private String reportedUserName;
    private String reportedUserEmail;
    private Long reportedUserId;
    private String type;
    private String status;
    private String subject;
    private String description;
    private Long taskId;
    private Long messageId;
    private String adminNote;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;

    public static ReportResponse from(Report r) {
        ReportResponse res = new ReportResponse();
        res.setId(r.getId());
        res.setReporterName(r.getReporter().getName());
        res.setReporterEmail(r.getReporter().getEmail());
        res.setReporterId(r.getReporter().getId());
        if (r.getReportedUser() != null) {
            res.setReportedUserName(r.getReportedUser().getName());
            res.setReportedUserEmail(r.getReportedUser().getEmail());
            res.setReportedUserId(r.getReportedUser().getId());
        }
        res.setType(r.getType() != null ? r.getType().name() : null);
        res.setStatus(r.getStatus().name());
        res.setSubject(r.getSubject());
        res.setDescription(r.getDescription());
        res.setTaskId(r.getTaskId());
        res.setMessageId(r.getMessageId());
        res.setAdminNote(r.getAdminNote());
        res.setCreatedAt(r.getCreatedAt());
        res.setResolvedAt(r.getResolvedAt());
        return res;
    }
}
