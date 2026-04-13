package com.chanderparkash.internx.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chanderparkash.internx.DTO.RatingRequest;
import com.chanderparkash.internx.DTO.RatingResponse;
import com.chanderparkash.internx.service.RatingService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/ratings")
public class RatingController {

    private final RatingService ratingService;

    @PostMapping
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<RatingResponse> rateUser(@Valid @RequestBody RatingRequest request) {
        return ResponseEntity.ok(ratingService.rateUser(request));
    }

    @GetMapping("/student/{userId}")
    public ResponseEntity<List<RatingResponse>> getRatingsForStudent(@PathVariable Long userId) {
        return ResponseEntity.ok(ratingService.getStudentRatings(userId));

    }
}
