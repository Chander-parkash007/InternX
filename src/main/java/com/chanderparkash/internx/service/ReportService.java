package com.chanderparkash.internx.service;

import com.chanderparkash.internx.DTO.ReportRequest;
import com.chanderparkash.internx.DTO.ReportResponse;
import com.chanderparkash.internx.Entities.Report;
import com.chanderparkash.internx.Entities.User;
import com.chanderparkash.internx.Repository.ReportRepository;
import com.chanderparkash.internx.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final NotificationsService notificationsService;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public ReportResponse submitReport(ReportRequest request) {
        User reporter = getCurrentUser();

        if (request.getDescription() == null || request.getDescription().trim().isEmpty()) {
            throw new RuntimeException("Description is required");
        }
        if (request.getSubject() == null || request.getSubject().trim().isEmpty()) {
            throw new RuntimeException("Subject is required");
        }

        Report report = new Report();
        report.setReporter(reporter);
        report.setType(request.getType());
        report.setSubject(request.getSubject().trim());
        report.setDescription(request.getDescription().trim());
        report.setTaskId(request.getTaskId());
        report.setMessageId(request.getMessageId());
        report.setStatus(Report.ReportStatus.PENDING);

        if (request.getReportedUserId() != null) {
            User reported = userRepository.findById(request.getReportedUserId())
                    .orElseThrow(() -> new RuntimeException("Reported user not found"));
            if (reported.getId().equals(reporter.getId())) {
                throw new RuntimeException("You cannot report yourself");
            }
            report.setReportedUser(reported);
        }

        Report saved = reportRepository.save(report);

        // Notify admins
        userRepository.findAll().stream()
                .filter(u -> u.getRole().name().equals("ADMIN"))
                .forEach(admin -> notificationsService.createNotification(admin,
                        "New report submitted by " + reporter.getName() + ": " + request.getSubject()));

        return ReportResponse.from(saved);
    }

    public List<ReportResponse> getAllReports() {
        return reportRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(ReportResponse::from).collect(Collectors.toList());
    }

    public List<ReportResponse> getReportsByStatus(String status) {
        Report.ReportStatus s = Report.ReportStatus.valueOf(status.toUpperCase());
        return reportRepository.findByStatusOrderByCreatedAtDesc(s)
                .stream().map(ReportResponse::from).collect(Collectors.toList());
    }

    public List<ReportResponse> getMyReports() {
        User user = getCurrentUser();
        return reportRepository.findByReporterOrderByCreatedAtDesc(user)
                .stream().map(ReportResponse::from).collect(Collectors.toList());
    }

    public ReportResponse updateReportStatus(Long reportId, String status, String adminNote) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        report.setStatus(Report.ReportStatus.valueOf(status.toUpperCase()));
        if (adminNote != null && !adminNote.trim().isEmpty()) {
            report.setAdminNote(adminNote.trim());
        }
        if (!status.equalsIgnoreCase("PENDING")) {
            report.setResolvedAt(LocalDateTime.now());
        }

        Report saved = reportRepository.save(report);

        // Notify reporter
        notificationsService.createNotification(report.getReporter(),
                "Your report \"" + report.getSubject() + "\" has been " + status.toLowerCase() + " by admin.");

        return ReportResponse.from(saved);
    }

    public Map<String, Long> getReportStats() {
        return Map.of(
                "total", reportRepository.count(),
                "pending", reportRepository.countByStatus(Report.ReportStatus.PENDING),
                "reviewed", reportRepository.countByStatus(Report.ReportStatus.REVIEWED),
                "resolved", reportRepository.countByStatus(Report.ReportStatus.RESOLVED),
                "dismissed", reportRepository.countByStatus(Report.ReportStatus.DISMISSED)
        );
    }
}
