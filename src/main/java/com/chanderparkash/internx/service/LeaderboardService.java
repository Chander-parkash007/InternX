package com.chanderparkash.internx.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.chanderparkash.internx.DTO.LeaderboardResponse;
import com.chanderparkash.internx.Entities.User;
import com.chanderparkash.internx.Repository.RatingRepository;
import com.chanderparkash.internx.Repository.SubmissionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final RatingRepository ratingRepository;
    private final SubmissionRepository submissionRepository;

    public List<LeaderboardResponse> getTopStudents() {
        List<Object[]> results = ratingRepository.findTopRatedStudents(PageRequest.of(0, 10));
        List<LeaderboardResponse> leaderboard = new ArrayList<>();
        int rank = 1;

        for (Object[] row : results) {
            User user = (User) row[0];           // cast to User
            Double avgRating = (Double) row[1];  // average rating
            Long totalRatings = (Long) row[2];   // count of ratings

            // count submissions separately
            int tasksCompleted = submissionRepository.findByApplicant(user).size();

            LeaderboardResponse response = new LeaderboardResponse();
            response.setRank(rank++);
            response.setStudentname(user.getName());
            response.setAverageRating(avgRating);
            response.setTotalRatings(totalRatings.intValue());
            response.setTotalTaskCompleted(tasksCompleted);
            leaderboard.add(response);
        }

        return leaderboard;
    }
}
