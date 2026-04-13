package com.chanderparkash.internx.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chanderparkash.internx.DTO.SkillRequest;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.chanderparkash.internx.DTO.SkillResponse;
import com.chanderparkash.internx.service.SkillService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/api/skills")
@RequiredArgsConstructor
public class SkillController {

    private final SkillService skillService;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<SkillResponse> addSkill(@Valid @RequestBody SkillRequest request) {
        return ResponseEntity.ok(skillService.addSkill(request));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<SkillResponse>> getMySkills() {
        return ResponseEntity.ok(skillService.getMySkills());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SkillResponse>> getUserSkills(@PathVariable Long userId) {
        return ResponseEntity.ok(skillService.getUserSkills(userId));
    }

}
