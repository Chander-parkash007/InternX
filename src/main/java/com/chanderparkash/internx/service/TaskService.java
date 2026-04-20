package com.chanderparkash.internx.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.chanderparkash.internx.DTO.TaskRequest;
import com.chanderparkash.internx.DTO.TaskResponse;
import com.chanderparkash.internx.Entities.TaskStatus;
import com.chanderparkash.internx.Entities.Tasks;
import com.chanderparkash.internx.Entities.User;
import com.chanderparkash.internx.Repository.SubmissionRepository;
import com.chanderparkash.internx.Repository.TasksRepository;
import com.chanderparkash.internx.Repository.UserRepository;
import com.chanderparkash.internx.Specification.TaskSpecification;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class TaskService {

    private final TasksRepository taskRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final SubmissionRepository submissionRepository;
    private final NotificationsService notificationsService;

    public TaskResponse createTask(TaskRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found with email : " + email));
        Tasks task = new Tasks();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setType(request.getType());
        task.setDifficulty(request.getDifficulty());
        task.setDeadline(request.getDeadline());
        task.setStatus(TaskStatus.OPEN);
        task.setPostedBy(user);
        Tasks savedTask = taskRepository.save(task);
        //app notification
        notificationsService.createNotification(
                user,
                "Your task has been successfully created on InternX and is now live. "
                + "You will be notified when users apply or submit their work."
        );        //email
        String taskCreationmessage = "Dear User,\n\n"
                + "We are pleased to inform you that your task has been successfully created on InternX.\n\n"
                + "Task Title: " + savedTask.getTitle() + "\n\n"
                + "Your task is now live and open for applications. You will be notified when users apply or submit their work.\n\n"
                + "You can manage your task anytime from your dashboard.\n\n"
                + "Best regards,\n"
                + "InternX Team";
        emailService.sendEmail(
                email,
                "Task Created - InternX", taskCreationmessage);
        return new TaskResponse(savedTask.getId(), savedTask.getTitle(), savedTask.getDescription(), savedTask.getType(),
                savedTask.getDifficulty(), savedTask.getDeadline(), savedTask.getStatus().name(),
                savedTask.getPostedBy().getName());
    }

    public Page<TaskResponse> getAllTasks(String difficulty, String type, String status, Pageable pageable) {
        Specification<Tasks> spec = Specification
                .where(TaskSpecification.hasDifficulty(difficulty))
                .and(TaskSpecification.hasType(type))
                .and(TaskSpecification.hasStatus(status));
        Page<Tasks> tasks = taskRepository.findAll(spec, pageable);
        return tasks.map(task -> {
            TaskResponse response = new TaskResponse();
            response.setId(task.getId());
            response.setTitle(task.getTitle());
            response.setDescription(task.getDescription());
            response.setType(task.getType());
            response.setDifficulty(task.getDifficulty());
            response.setDeadline(task.getDeadline());
            response.setStatus(task.getStatus().name());
            response.setPostedBy(task.getPostedBy().getName());
            return response;
        });
    }

    public TaskResponse completeTask(Long taskId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found with email : " + email));
        Tasks task = taskRepository.findById(taskId).orElseThrow(() -> new RuntimeException("Task not found with Id : " + taskId));
        if (!task.getPostedBy().getEmail().equals(email)) {
            throw new RuntimeException("You can only complete tasks you posted");
        }
        if (!submissionRepository.existsByTask(task)) {
            throw new RuntimeException("No submission found for this task");
        }
        task.setStatus(TaskStatus.COMPLETED);
        Tasks savedTask = taskRepository.save(task);
        //app notification
        notificationsService.createNotification(
                user,
                "We would like to inform you that your task has been marked as completed on InternX. "
                + "You may now review the final outcomes from your dashboard."
        );
        //email
        String completeTaskmessage = "Dear User,\n\n"
                + "We would like to inform you that your task has been marked as completed on InternX.\n\n"
                + "Task Title: " + savedTask.getTitle() + "\n\n"
                + "This indicates that the task lifecycle has been successfully finished.\n\n"
                + "You may now review the final outcomes or archive the task from your dashboard.\n\n"
                + "Thank you for using InternX.\n\n"
                + "Best regards,\n"
                + "InternX Team";
        emailService.sendEmail(
                email,
                "Task Completed - InternX", completeTaskmessage);
        return new TaskResponse(savedTask.getId(), savedTask.getTitle(), savedTask.getDescription(), savedTask.getType(),
                savedTask.getDifficulty(), savedTask.getDeadline(), savedTask.getStatus().name(),
                savedTask.getPostedBy().getName());

    }

    public List<TaskResponse> getMyTasks() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found with this Email : " + email));
        List<Tasks> tasks = taskRepository.findByPostedBy(user);
        return tasks.stream().map(task -> {
            TaskResponse response = new TaskResponse();
            response.setId(task.getId());
            response.setTitle(task.getTitle());
            response.setDescription(task.getDescription());
            response.setType(task.getType());
            response.setDifficulty(task.getDifficulty());
            response.setDeadline(task.getDeadline());
            response.setStatus(task.getStatus().name());
            response.setPostedBy(task.getPostedBy().getName());
            return response;
        }).toList();
    }
}
