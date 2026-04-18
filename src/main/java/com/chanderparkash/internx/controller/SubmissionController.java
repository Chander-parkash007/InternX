package com.chanderparkash.internx.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chanderparkash.internx.DTO.SubmissionRequest;
import com.chanderparkash.internx.DTO.SubmissionResponse;
import com.chanderparkash.internx.service.SubmissionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    @PostMapping("/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<SubmissionResponse> submitTaskResponse(@Valid @RequestBody SubmissionRequest request) {
        return ResponseEntity.ok(submissionService.submitTask(request));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<SubmissionResponse>> getMySubmissions() {
        return ResponseEntity.ok(submissionService.getMySubmissions());
    }

    @GetMapping("/task/{taskId}")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<List<SubmissionResponse>> getSubmissionsForTask(@PathVariable Long taskId) {
        return ResponseEntity.ok(submissionService.getSubmissionsForMyTask(taskId));
    }
}
