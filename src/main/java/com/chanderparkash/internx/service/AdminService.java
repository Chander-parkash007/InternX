package com.chanderparkash.internx.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.chanderparkash.internx.DTO.UserResponse;
import com.chanderparkash.internx.Entities.Applications;
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
public class AdminService {

    private final UserRepository userRepository;
    private final TasksRepository tasksRepository;
    private final EmailService emailService;
    private final NotificationsService notificationService;
    private final ApplicationsRepository applicationsRepository;
    private final RatingRepository ratingRepository;
    private final SubmissionRepository submissionRepository;

    private UserResponse mapToDTO(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole().toString());
        response.setActive(user.isActive());
        response.setCreatedAt(user.getCreatedAt().toString());

        return response;
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(this::mapToDTO).toList();

    }

    public void deleteTask(Long taskId) {
        Tasks task = tasksRepository.findById(taskId).orElseThrow(() -> new RuntimeException("Task not found."));
        // to the pwner
        emailService.sendEmail(task.getPostedBy().getEmail(), "Task removed  - IntenrX", "Dear \n\n" + task.getPostedBy().getName() + "\n\n We regret to say that your task : " + task.getTitle()
                + "\nhas been removed from the InternX platform due to failing the terms and conditions of the InternX platfrom"
                + "\n\n We apologize for the inconviniance "
                + "\n\n You may post the new task that regulates the term and conditions of the platfrom"
                + "\n\n NOTE : Fake or distrupting task may lead to the account closure kindly post your tasktask accordingly!"
                + "\n\n Thank you for choosing InternX"
                + "\n\n Best regards, Team InternX.");
//to the applicants
        List<Applications> applications = applicationsRepository.findByTask(task);
        for (Applications app : applications) {
            emailService.sendEmail(app.getUser().getEmail(), "Task Removed  - InternX", "Dear : " + app.getUser().getName()
                    + "\n\nwe regret to say that the task : " + task.getTitle() + " you applied for has been removed by our team"
                    + "\n\nWe apoloize for any inconvenience you may faced "
                    + "\n\nWe can apply to other tasks of your interest"
                    + "\n\n Thank you for choosing InternX"
                    + "\n\n Best regards, Team InternX.");

            notificationService.createNotification(app.getUser(), "Dear : " + app.getUser().getName()
                    + "\n\nwe regret to say that the task : " + task.getTitle() + " you applied for has been removed by our team"
                    + "\n\nWe apoloize for any inconvenience you may faced "
                    + "\n\nWe can apply to other tasks of your interest");
        }
        ratingRepository.deleteAll(ratingRepository.findByTask(task));
        submissionRepository.deleteAll(submissionRepository.findByTask(task));
        applicationsRepository.deleteAll(applications);
        tasksRepository.deleteById(taskId);

    }

    public void banUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(false);
        userRepository.save(user);
        emailService.sendEmail(user.getEmail(), "Account banned  - Internx", "Dear : " + user.getName()
                + "\n\n We regret to say that your account has been banned from our platfrom due to not following community guidelines"
                + "\n\n If you think your account has been banned by mistake you can contact our support team,Thank you! "
                + "\n\n Best regards,"
                + "\n\n Team InternX.");
    }

    public void unBanUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(true);
        userRepository.save(user);
        emailService.sendEmail(user.getEmail(), "Account Unbanned  - Internx", "Dear : " + user.getName()
                + "\n\n We sincerely apologize for mistakely banning your account, your account has been Unbanned by our team you can now use InternX flawlessly"
                + "\n\n Thank you! "
                + "\n\n Best regards,"
                + "\n\n Team InternX.");
    }

    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("Cannot delete admin accounts");
        }
        emailService.sendEmail(user.getEmail(), "Account Removed - InternX",
                "Dear " + user.getName() + ",\n\nYour account has been permanently removed from InternX by our admin team due to violation of community guidelines.\n\nBest regards,\nTeam InternX.");
        userRepository.delete(user);
    }

}
