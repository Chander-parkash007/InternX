package com.chanderparkash.internx.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.chanderparkash.internx.DTO.ApplicationResponse;
import com.chanderparkash.internx.Entities.ApplicationStatus;
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
    private final NotificationsService notificationsService;

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
        //app notification
        notificationsService.createNotification(
                user,
                "Your application for the task '" + task.getTitle() + "' has been received successfully. "
                + "It is currently under review, and you will be notified once there is an update."
        );
//email
        String applyMessage = "Dear " + application.getUser().getName() + ",\n\n"
                + "We have successfully received your application for the task titled:\n"
                + "'" + application.getTask().getTitle() + "'.\n\n"
                + "Our team will review your application and notify you once a decision has been made.\n\n"
                + "We appreciate your interest in InternX.\n\n"
                + "Best regards,\n"
                + "InternX Team";
        emailService.sendEmail(
                application.getUser().getEmail(),
                "Application Received - InternX", applyMessage);

        // to the owner
        notificationsService.createNotification(
                task.getPostedBy(),
                "You have received a new application for your task '" + task.getTitle() + "'. "
                + "It is now awaiting your review. You can accept or reject the application from your dashboard."
        );
//email to owner
        String applyMessageOwner = "Dear " + task.getPostedBy().getName() + ",\n\n"
                + "A new application has been received for your task titled:\n"
                + "'" + application.getTask().getTitle() + "'.\n\n"
                + "Applicant: " + application.getUser().getName() + "\n\n"
                + "You may now review the application and decide whether to accept or reject it from your dashboard.\n\n"
                + "Best regards,\n"
                + "InternX Team";
        emailService.sendEmail(task.getPostedBy().getEmail(), "Application Received - InternX", applyMessageOwner);

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
        //app notification
        notificationsService.createNotification(
                application.getUser(),
                "We are pleased to inform you that your application for the task '"
                + application.getTask().getTitle()
                + "' has been accepted. You may now proceed with the next steps as provided by the task owner."
        );
//email
        String acceptMessage = "Dear " + application.getUser().getName() + ",\n\n"
                + "We are pleased to inform you that your application for the task titled:\n"
                + "'" + application.getTask().getTitle() + "'\n"
                + "has been accepted.\n\n"
                + "You may now proceed with the next steps as outlined by the task owner.\n\n"
                + "We appreciate your participation on InternX and wish you success in your task.\n\n"
                + "Best regards,\n"
                + "InternX Team";
        emailService.sendEmail(application.getUser().getEmail(),
                "Application Accepted - InternX", acceptMessage);
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
        // app notification
        notificationsService.createNotification(
                application.getUser(),
                "We appreciate your application for '" + application.getTask().getTitle() + "'. "
                + "After review, it was not selected for this opportunity. "
                + "We encourage you to apply for other tasks on InternX that align with your skills and interests."
        );
//email
        String message = "Dear " + application.getUser().getName() + ",\n\n"
                + "We appreciate your interest in the task titled:\n"
                + "'" + application.getTask().getTitle() + "'.\n\n"
                + "After careful review, we regret to inform you that your application has not been selected for this task.\n\n"
                + "We encourage you to continue applying for other opportunities on InternX that match your skills and interests.\n\n"
                + "We truly value your effort and wish you the best in your future applications.\n\n"
                + "Best regards,\n"
                + "InternX Team";
        emailService.sendEmail(application.getUser().getEmail(),
                "Application Rejected - InternX", message);
        return mapToResponse(saved);

    }

    public String withdrawApplication(Long applicationId) {
        Applications application = applicationsRepository.findById(applicationId
        ).orElseThrow(() -> new RuntimeException("Applicaton not found."));
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not Found"));
        if (!application.getUser().equals(user)) {
            throw new RuntimeException("Apllication not found for user : " + user.getName());
        }
        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new RuntimeException("User can only withdraw pending applications." + "\n\n Your application status is currently : " + application.getStatus());

        }
        applicationsRepository.delete(application);
        // to user
        notificationsService.createNotification(user, "Your application : " + application.getTask().getTitle() + " has been sucessfully withdrawn");
        emailService.sendEmail(user.getEmail(),
                "Application withdrawn Sucessfully - InternX", "Dear " + application.getUser().getName() + ",\n\n"
                + "We are pleased to inform you that your application for the task titled:\n"
                + "'" + application.getTask().getTitle() + "'\n"
                + "has been withdrawn sucessfully.\n\n"
                + "You may now proceed with next tasks of your interest.\n\n"
                + "We appreciate your participation on InternX and wish you success in your next tasks.\n\n"
                + "Best regards,\n"
                + "InternX Team");

        // to owner
        notificationsService.createNotification(application.getTask().getPostedBy(), "Dear : " + application.getTask().getPostedBy().getName() + "\n\n User : " + user.getName() + " has withdrawn their apllication for your task : " + application.getTask().getTitle());
        return "Application deleted sucessfully";
    }

}
