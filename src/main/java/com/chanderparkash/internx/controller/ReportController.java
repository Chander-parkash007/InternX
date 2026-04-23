package com.chanderparkash.internx.controller;

import com.chanderparkash.internx.DTO.ReportRequest;
import com.chanderparkash.internx.DTO.ReportResponse;
import com.chanderparkash.internx.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    // Any logged-in user can submit a report
    @PostMapping
    public ResponseEntity<ReportResponse> submitReport(@RequestBody ReportRequest request) {
        return ResponseEntity.ok(reportService.submitReport(request));
    }

    // Any user can see their own reports
    @GetMapping("/my")
    public ResponseEntity<List<ReportResponse>> getMyReports() {
        return ResponseEntity.ok(reportService.getMyReports());
    }

    // Admin only endpoints
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ReportResponse>> getAllReports(
            @RequestParam(required = false) String status) {
        if (status != null && !status.isEmpty()) {
            return ResponseEntity.ok(reportService.getReportsByStatus(status));
        }
        return ResponseEntity.ok(reportService.getAllReports());
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Long>> getStats() {
        return ResponseEntity.ok(reportService.getReportStats());
    }

    @PutMapping("/{reportId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReportResponse> updateStatus(
            @PathVariable Long reportId,
            @RequestParam String status,
            @RequestParam(required = false) String adminNote) {
        return ResponseEntity.ok(reportService.updateReportStatus(reportId, status, adminNote));
    }
}
