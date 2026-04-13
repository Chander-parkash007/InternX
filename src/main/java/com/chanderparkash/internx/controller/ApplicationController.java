package com.chanderparkash.internx.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chanderparkash.internx.DTO.ApplicationResponse;
import com.chanderparkash.internx.service.ApplicationService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping("/{taskId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApplicationResponse> applyForTask(@PathVariable Long taskId) {
        return ResponseEntity.ok(applicationService.applyForTask(taskId));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<ApplicationResponse>> getMyApplications() {
        return ResponseEntity.ok(applicationService.getMyApplications());
    }

    @PreAuthorize("hasRole('COMPANY')")
    @GetMapping("task/{taskId}")
    public ResponseEntity<List<ApplicationResponse>> getApplicationsForTask(@PathVariable Long taskId) {
        return ResponseEntity.ok(applicationService.getAllApplications(taskId));
    }

    @PutMapping("/{applicationId}/accept")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<ApplicationResponse> acceptApplication(@PathVariable Long applicationId) {
        return ResponseEntity.ok(applicationService.acceptApplication(applicationId));
    }

    @PutMapping("/{applicationId}/reject")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<ApplicationResponse> rejectApplication(@PathVariable Long applicationId) {
        return ResponseEntity.ok(applicationService.rejectApplication(applicationId));
    }
}
