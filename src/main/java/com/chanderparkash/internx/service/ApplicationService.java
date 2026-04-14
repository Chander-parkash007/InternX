package com.chanderparkash.internx.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.chanderparkash.internx.DTO.ApplicationResponse;
import com.chanderparkash.internx.Entities.Applications;
import com.chanderparkash.internx.Entities.Tasks;
import com.chanderparkash.internx.Entities.User;
import com.chanderparkash.internx.Repository.ApplicationsRepository;
import com.chanderparkash.internx.Repository.TasksRepository;
import com.chanderparkash.internx.Repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final TasksRepository taskRepository;
    private final ApplicationsRepository applicationsRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    private ApplicationResponse mapToResponse(Applications app) {
        ApplicationResponse response = new ApplicationResponse();
        response.setId(app.getId());
        response.setTaskTitle(app.getTask().getTitle());
        response.setStudentName(app.getUser().getName());
        response.setStatus(app.getStatus().name());
        response.setAppliedAt(app.getAppliedAt().toString());
        return response;
    }

    public ApplicationResponse applyForTask(Long taskId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(()
                -> new RuntimeException("User not found with email : " + email));
        Tasks task = taskRepository.findById(taskId).orElseThrow(()
                -> new RuntimeException("Task not found"));
        if (task.getStatus() != com.chanderparkash.internx.Entities.TaskStatus.OPEN) {
            throw new RuntimeException("Task is not open for applications");
        }
        if (applicationsRepository.existsByTaskAndUser(task, user)) {
            throw new RuntimeException("You have already applied for this task");
        }
        Applications application = new Applications();
        application.setTask(task);
        application.setUser(user);
        application.setStatus(com.chanderparkash.internx.Entities.ApplicationStatus.PENDING);
        Applications saved = applicationsRepository.save(application);
        emailService.sendEmail(
                application.getUser().getEmail(),
                "Application Received - InternX",
                "Thank you for applying to '" + application.getTask().getTitle() + "'. We will get back to you soon."
        );

        return mapToResponse(saved);

    }

    public List<ApplicationResponse> getMyApplications() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(()
                -> new RuntimeException("User not found with email : " + email));
        List<Applications> applications = applicationsRepository.findByUser(user);
        return applications.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ApplicationResponse> getAllApplications(Long taskId) {
        Tasks task = taskRepository.findById(taskId).orElseThrow(()
                -> new RuntimeException("Task not found"));
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(()
                -> new RuntimeException("User not found with email : " + email));
        if (!task.getPostedBy().getId().equals(user.getId())) {
            throw new RuntimeException("You are not authorized to view applications for this task");
        }
        List<Applications> applications = applicationsRepository.findByTask(task);
        return applications.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public ApplicationResponse acceptApplication(Long applicationId) {
        Applications application = applicationsRepository.findById(applicationId).orElseThrow(()
                -> new RuntimeException("Application not found"));
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(()
                -> new RuntimeException("User not found with email : " + email));
        if (!application.getTask().getPostedBy().getId().equals(user.getId())) {
            throw new RuntimeException("You are not authorized to accept this application");
        }
        application.setStatus(com.chanderparkash.internx.Entities.ApplicationStatus.ACCEPTED);
        Applications saved = applicationsRepository.save(application);
        emailService.sendEmail(application.getUser().getEmail(),
                "Application Accepted - InternX",
                "Congratulations! Your application for '" + application.getTask().getTitle() + "' has been accepted.");
        return mapToResponse(saved);
    }

    public ApplicationResponse rejectApplication(Long applicationId) {
        Applications application = applicationsRepository.findById(applicationId).orElseThrow(() -> new RuntimeException(
                "Application not found"));
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found with email : " + email));
        if (!application.getTask().getPostedBy().getId().equals(user.getId())) {
            throw new RuntimeException("You are not authorized to reject this application");
        }
        application.setStatus(com.chanderparkash.internx.Entities.ApplicationStatus.REJECTED);
        Applications saved = applicationsRepository.save(application);
        emailService.sendEmail(application.getUser().getEmail(),
                "Application Rejected - InternX",
                "We regret to inform you that your application for '" + application.getTask().getTitle() + "' has been rejected. We encourage you to apply for other tasks that match your skills and interests.");
        return mapToResponse(saved);

    }
}
