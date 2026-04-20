package com.chanderparkash.internx.service;

import java.util.List;

import org.hibernate.engine.spi.Resolution;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.chanderparkash.internx.DTO.DashboardResponse;
import com.chanderparkash.internx.Entities.ApplicationStatus;
import com.chanderparkash.internx.Entities.Rating;
import com.chanderparkash.internx.Entities.Role;
import com.chanderparkash.internx.Entities.TaskStatus;
import com.chanderparkash.internx.Entities.Tasks;
import com.chanderparkash.internx.Entities.User;
import com.chanderparkash.internx.Repository.ApplicationsRepository;
import com.chanderparkash.internx.Repository.RatingRepository;
import com.chanderparkash.internx.Repository.SubmissionRepository;
import com.chanderparkash.internx.Repository.TasksRepository;
import com.chanderparkash.internx.Repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final ApplicationsRepository applicationRepository;
    private final SubmissionRepository submissionRepository;
    private final RatingRepository ratingRepository;
    private final TasksRepository taskRepository;

    public DashboardResponse getDashboard() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getRole() == Role.STUDENT) {
            int total = applicationRepository.findByUser(user).size();
            int accepted = applicationRepository.findByUserAndStatus(user, ApplicationStatus.ACCEPTED).size();
            int pending = applicationRepository.findByUserAndStatus(user, ApplicationStatus.PENDING).size();
            int rejected = applicationRepository.findByUserAndStatus(user, ApplicationStatus.REJECTED).size();
            int submissions = submissionRepository.findByApplicant(user).size();
            double avgRating = ratingRepository.findByToUser(user).stream().mapToDouble(Rating::getRating).average().orElse(0.0);

            DashboardResponse response = new DashboardResponse();
            response.setTotalApplications(total);
            response.setAcceptedApplicatons(accepted);
            response.setPendingApplications(pending);
            response.setRejectedApplications(rejected);
            response.setTotalSubmissions(submissions);
            response.setAverageRating(avgRating);
            return response;

        } else if (user.getRole() == Role.COMPANY) {
            List<Tasks> tasks = taskRepository.findByPostedBy(user);
            int totalPosted = tasks.size();
            int totalApplicants = tasks.stream().mapToInt(t -> applicationRepository.findByTask(t).size()).sum();
            int completed = (int) tasks.stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count();
            int opened = (int) tasks.stream().filter(t -> t.getStatus() == TaskStatus.OPEN).count();
            int inProgress = (int) tasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count();
            int cancelled = (int) tasks.stream().filter(t -> t.getStatus() == TaskStatus.CANCELLED).count();

            DashboardResponse response = new DashboardResponse();
            response.setTotalTaskPosted(totalPosted);
            response.setTotalApplicationsReceived(totalApplicants);
            response.setTotalTaskCompleted(completed);
            response.setTotalTaskOpened(opened);
            response.setTotalTaskInProgress(inProgress);
            response.setTotalTaskCancelled(cancelled);
            return response;
        }
        return new DashboardResponse();
    }
}
