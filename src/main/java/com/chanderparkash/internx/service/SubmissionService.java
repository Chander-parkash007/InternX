package com.chanderparkash.internx.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.chanderparkash.internx.DTO.SubmissionRequest;
import com.chanderparkash.internx.DTO.SubmissionResponse;
import com.chanderparkash.internx.Entities.ApplicationStatus;
import com.chanderparkash.internx.Entities.Submission;
import com.chanderparkash.internx.Entities.Tasks;
import com.chanderparkash.internx.Entities.User;
import com.chanderparkash.internx.Repository.ApplicationsRepository;
import com.chanderparkash.internx.Repository.SubmissionRepository;
import com.chanderparkash.internx.Repository.TasksRepository;
import com.chanderparkash.internx.Repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final UserRepository userRepository;
    private final TasksRepository tasksRepository;
    private final ApplicationsRepository applicationsRepository;
    private final EmailService emailService;
    private final NotificationsService notificationsService;

    private SubmissionResponse mapToResponse(Submission submission) {
        SubmissionResponse response = new SubmissionResponse();
        response.setId(submission.getId());
        response.setTaskTitle(submission.getTask().getTitle());
        response.setStudentName(submission.getApplicant().getName());
        response.setGithubLink(submission.getGitHubLink());
        response.setFileUrl(submission.getFileUrl());
        response.setDescription(submission.getDescription());
        response.setSubmittedAt(submission.getSubmittedAt().toString());
        return response;
    }

    public SubmissionResponse submitTask(SubmissionRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(()
                -> new RuntimeException("User not found with email : " + email));
        Tasks task = tasksRepository.findById(request.getTaskId()).orElseThrow(()
                -> new RuntimeException("Task not found with id : " + request.getTaskId()));
        if (!applicationsRepository.existsByTaskAndUserAndStatus(task, user, ApplicationStatus.ACCEPTED)) {
            throw new RuntimeException("You have not been accepted for this task yet");
        }
        if (submissionRepository.existsByTaskAndApplicant(task, user)) {
            throw new RuntimeException("You have already submitted for this task");
        }
        Submission submission = new Submission();
        submission.setApplicant(user);
        submission.setTask(task);
        submission.setGitHubLink(request.getGithubLink());
        submission.setFileUrl(request.getFileUrl());
        submission.setDescription(request.getDescription());
        Submission saved = submissionRepository.save(submission);
        // to the task owner
        notificationsService.createNotification(
                user,
                submission.getApplicant().getName() + " has submitted work for your task '"
                + submission.getTask().getTitle()
                + "'. Please review the submission and provide a rating and feedback."
        );
        String ownerMessage = "Dear Hiring Manager,\n\n"
                + "We would like to inform you that a new submission has been received for your task titled:\n"
                + "'" + submission.getTask().getTitle() + "'.\n\n"
                + "Applicant: " + submission.getApplicant().getName() + "\n\n"
                + "You may now review the submission at your convenience and provide a rating along with feedback through the InternX platform.\n\n"
                + "Your evaluation plays an important role in helping candidates improve and progress.\n\n"
                + "Best regards,\n"
                + "InternX Team";
        emailService.sendEmail(
                submission.getTask().getPostedBy().getEmail(),
                "New Submission - InternX", ownerMessage);
        // to the submitter      
        notificationsService.createNotification(
                submission.getApplicant(),
                "Your submission for the task '" + submission.getTask().getTitle() + "' has been received successfully. "
                + "The task owner will review it and you will be notified once feedback is available."
        );
        //email
        String submitterMessage = "Hello " + submission.getApplicant().getName() + ",\n\n"
                + "We are pleased to inform you that your submission for the task:\n"
                + "'" + submission.getTask().getTitle() + "'\n"
                + "has been successfully received.\n\n"
                + "The task owner will review your work and respond accordingly.\n\n"
                + "You will be notified once feedback has been provided.\n\n"
                + "Best regards,\n"
                + "InternX Team";
        emailService.sendEmail(
                submission.getApplicant().getEmail(),
                "Submission Successful - InternX", submitterMessage);

        return mapToResponse(saved);
    }

    public List<SubmissionResponse> getMySubmissions() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(()
                -> new RuntimeException("User not found with email : " + email));
        return submissionRepository.findByApplicant(user)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<SubmissionResponse> getSubmissionsForMyTask(Long taskId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(()
                -> new RuntimeException("User not found with email : " + email));
        Tasks task = tasksRepository.findById(taskId).orElseThrow(()
                -> new RuntimeException("Task not found with id : " + taskId));
        if (!task.getPostedBy().getId().equals(user.getId())) {
            throw new RuntimeException("You are not authorized to view submissions for this task");
        }
        return submissionRepository.findByTask(task)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }
}
