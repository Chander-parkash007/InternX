package com.chanderparkash.internx.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.chanderparkash.internx.DTO.SkillRequest;
import com.chanderparkash.internx.DTO.SkillResponse;
import com.chanderparkash.internx.Entities.Skill;
import com.chanderparkash.internx.Entities.User;
import com.chanderparkash.internx.Entities.UserSkills;
import com.chanderparkash.internx.Repository.SkillsRepository;
import com.chanderparkash.internx.Repository.UserRepository;
import com.chanderparkash.internx.Repository.UserSkillsRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SkillService {

    private final UserSkillsRepository userSkillsRepository;
    private final SkillsRepository skillRepository;
    private final UserRepository userRepository;

    private SkillResponse mapToResponse(UserSkills us) {
        SkillResponse response = new SkillResponse();
        response.setId(us.getId());
        response.setSkillName(us.getSkill().getSkillName());
        response.setLevel(us.getLevel());
        return response;
    }

    public SkillResponse addSkill(SkillRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(()
                -> new RuntimeException("User not found with email : " + email));
        Skill skill = skillRepository.findBySkillName(request.getSkillName()).orElseGet(() -> {
            Skill newSkill = new Skill();
            newSkill.setSkillName(request.getSkillName());
            return skillRepository.save(newSkill);
        });
        if (userSkillsRepository.existsByUserAndSkill(user, skill)) {
            throw new RuntimeException("You have already added this skill");
        }
        UserSkills userSkill = new UserSkills();
        userSkill.setUser(user);
        userSkill.setSkill(skill);
        userSkill.setLevel(request.getLevel());
        UserSkills saved = userSkillsRepository.save(userSkill);
        SkillResponse response = new SkillResponse();
        response.setId(saved.getId());
        response.setSkillName(saved.getSkill().getSkillName());
        response.setLevel(saved.getLevel());
        return response;

    }

    public List<SkillResponse> getMySkills() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(()
                -> new RuntimeException("User not found with email : " + email));
        List<UserSkills> userSkills = userSkillsRepository.findByUser(user);
        if (userSkills.isEmpty()) {
            throw new RuntimeException("No skills found for user");
        }
        return userSkills.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

    }

    public List<SkillResponse> getUserSkills(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(()
                -> new RuntimeException("User not found with id : " + userId));
        List<UserSkills> userSkills = userSkillsRepository.findByUser(user);
        return userSkills.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
}
