package com.chanderparkash.internx.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.chanderparkash.internx.DTO.ProfileResponse;
import com.chanderparkash.internx.DTO.RatingResponse;
import com.chanderparkash.internx.DTO.SkillResponse;
import com.chanderparkash.internx.Entities.Role;
import com.chanderparkash.internx.Entities.User;
import com.chanderparkash.internx.Repository.RatingRepository;
import com.chanderparkash.internx.Repository.SubmissionRepository;
import com.chanderparkash.internx.Repository.UserRepository;
import com.chanderparkash.internx.Repository.UserSkillsRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final SubmissionRepository submissionRepository;
    private final RatingRepository ratingRepository;
    private final UserSkillsRepository userSkillsRepository;

    public ProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(()
                -> new RuntimeException("User not found"));
        Role role = user.getRole();
        List<SkillResponse> skills = userSkillsRepository.findByUser(user).stream()
                .map(us -> {
                    SkillResponse sr = new SkillResponse();
                    sr.setId(us.getId());
                    sr.setSkillName(us.getSkill().getSkillName());
                    sr.setLevel(us.getLevel());
                    return sr;
                }).toList();
        List<RatingResponse> userRatings = ratingRepository.findByToUser(user).stream()
                .map(us -> {
                    RatingResponse rr = new RatingResponse();
                    rr.setFromUser(us.getFromUser().getName());
                    rr.setId(us.getId());
                    rr.setTaskTitle(us.getTask().getTitle());
                    rr.setRating(us.getRating());
                    rr.setFeedback(us.getFeedback());
                    rr.setRatedAt(us.getRatedAt().toString());
                    rr.setToUser(us.getToUser().getName());
                    return rr;

                }).toList();
        double averageRating = userRatings.stream()
                .mapToInt(RatingResponse::getRating)
                .average()
                .orElse(0.0);
        int count = submissionRepository.findByApplicant(user).size();
        ProfileResponse response = new ProfileResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(role.name());
        response.setSkills(skills);
        response.setRatings(userRatings);
        response.setAverageRating(averageRating);
        response.setTotalTaskCompleted(count);
        return response;

    }

}
