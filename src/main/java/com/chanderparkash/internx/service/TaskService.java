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
        emailService.sendEmail(
                email,
                "Task Created - InternX",
                "Your task '" + savedTask.getTitle() + "' has been created successfully and is now open for applications. Good luck!"
        );
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
        emailService.sendEmail(
                email,
                "Task Completed - InternX",
                "Your task '" + savedTask.getTitle() + "' has been marked as completed. Thank you for using InternX!"
        );
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
