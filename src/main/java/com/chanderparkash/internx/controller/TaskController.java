package com.chanderparkash.internx.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.chanderparkash.internx.DTO.TaskRequest;
import com.chanderparkash.internx.DTO.TaskResponse;
import com.chanderparkash.internx.service.TaskService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<TaskResponse> createTask(@Valid @RequestBody TaskRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.createTask(request));
    }

    @GetMapping
    public ResponseEntity<Page<TaskResponse>> getAllTasks(
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            Pageable pageable) {
        return ResponseEntity.ok(taskService.getAllTasks(difficulty, type, status, pageable));

    }

    @PutMapping("/{taskId}/complete")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<TaskResponse> compeleteTask(@PathVariable Long taskId) {
        return ResponseEntity.ok(taskService.completeTask(taskId));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<List<TaskResponse>> getMyTasks() {
        return ResponseEntity.ok(taskService.getMyTasks());
    }
}
