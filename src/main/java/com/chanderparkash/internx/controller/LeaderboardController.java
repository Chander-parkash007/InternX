package com.chanderparkash.internx.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chanderparkash.internx.DTO.LeaderboardResponse;
import com.chanderparkash.internx.service.LeaderboardService;

@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

    @Autowired
    private LeaderboardService leaderboardService;

    @GetMapping()
    public ResponseEntity<List<LeaderboardResponse>> getTopStudents() {
        return ResponseEntity.ok(leaderboardService.getTopStudents());
    }

}
