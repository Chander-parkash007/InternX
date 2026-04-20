package com.chanderparkash.internx.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.chanderparkash.internx.DTO.RatingRequest;
import com.chanderparkash.internx.DTO.RatingResponse;
import com.chanderparkash.internx.Entities.Rating;
import com.chanderparkash.internx.Entities.Tasks;
import com.chanderparkash.internx.Entities.User;
import com.chanderparkash.internx.Repository.RatingRepository;
import com.chanderparkash.internx.Repository.SubmissionRepository;
import com.chanderparkash.internx.Repository.TasksRepository;
import com.chanderparkash.internx.Repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RatingService {

    private final RatingRepository ratingRepository;
    private final UserRepository userRepository;
    private final TasksRepository tasksRepository;
    private final SubmissionRepository submissionRepository;
    private final EmailService emailService;
    private final NotificationsService notificationsService;

    private RatingResponse mapToResponse(Rating rating) {
        RatingResponse response = new RatingResponse();
        response.setId(rating.getId());
        response.setFromUser(rating.getFromUser().getName());
        response.setToUser(rating.getToUser().getName());
        response.setTaskTitle(rating.getTask().getTitle());
        response.setRating(rating.getRating());
        response.setFeedback(rating.getFeedback());
        response.setRatedAt(rating.getRatedAt().toString());
        return response;
    }

    public RatingResponse rateUser(RatingRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User fromUser = userRepository.findByEmail(email).orElseThrow(()
                -> new RuntimeException("User not found with email : " + email));
        Tasks task = tasksRepository.findById(request.getTaskId()).orElseThrow(()
                -> new RuntimeException("Task not found with id : " + request.getTaskId()));
        if (!tasksRepository.findByPostedBy(fromUser).contains(task)) {
            throw new RuntimeException("You can only rate for tasks you posted");
        }
        User toUser = userRepository.findById(request.getToUserId()).orElseThrow(()
                -> new RuntimeException("User not found with id : " + request.getToUserId()));
        if (!submissionRepository.existsByTaskAndApplicant(task, toUser)) {
            throw new RuntimeException("You can only rate users who have submitted for your tasks");
        }
        if (ratingRepository.existsByTaskAndToUser(task, toUser)) {
            throw new RuntimeException("You have already rated this user for this task");
        }
        Rating rating = new Rating();
        rating.setFromUser(fromUser);
        rating.setToUser(toUser);
        rating.setTask(task);
        rating.setRating(request.getRating());
        rating.setFeedback(request.getFeedback());
        Rating saved = ratingRepository.save(rating);
        //app notification
        notificationsService.createNotification(toUser, "Dear " + toUser.getName() + ",\n\n"
                + "We hope you are doing well.\n\n"
                + "You have received a new rating for your recent submission on InternX.\n\n"
                + "Details:\n"
                + "Task Title : " + task.getTitle() + "\n"
                + "Rating     : " + request.getRating() + "\n"
                + "Feedback   : " + request.getFeedback() + "\n\n"
                + "We encourage you to review the feedback and continue improving your work.\n\n"
                + "If you have any questions, feel free to reach out to our support team.\n\n"
                + "Best regards,\n"
                + "InternX Team");
        //email
        String message = "Dear " + toUser.getName() + ",\n\n"
                + "We hope you are doing well.\n\n"
                + "You have received a new rating for your recent submission on InternX.\n\n"
                + "Details:\n"
                + "Task Title : " + task.getTitle() + "\n"
                + "Rating     : " + request.getRating() + "\n"
                + "Feedback   : " + request.getFeedback() + "\n\n"
                + "We encourage you to review the feedback and continue improving your work.\n\n"
                + "If you have any questions, feel free to reach out to our support team.\n\n"
                + "Best regards,\n"
                + "InternX Team";
        emailService.sendEmail(
                toUser.getEmail(),
                "You received a new rating - InternX", message);
        return mapToResponse(saved);

    }

    public List<RatingResponse> getStudentRatings(Long userId) {
        return ratingRepository.findByToUser(userRepository.findById(userId).orElseThrow(()
                -> new RuntimeException("User not found with id : " + userId)))
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

    }
}
