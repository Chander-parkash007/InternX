package com.chanderparkash.internx.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.chanderparkash.internx.DTO.TaskRequest;
import com.chanderparkash.internx.DTO.TaskResponse;
import com.chanderparkash.internx.Entities.TaskStatus;
import com.chanderparkash.internx.Entities.Tasks;
import com.chanderparkash.internx.Entities.User;
import com.chanderparkash.internx.Repository.TasksRepository;
import com.chanderparkash.internx.Repository.UserRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class TaskService {

    private final TasksRepository taskRepository;
    private final UserRepository userRepository;

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
        return new TaskResponse(savedTask.getId(), savedTask.getTitle(), savedTask.getDescription(), savedTask.getType(),
                savedTask.getDifficulty(), savedTask.getDeadline(), savedTask.getStatus().name(),
                savedTask.getPostedBy().getName());
    }

    public Page<TaskResponse> getAllTasks(Pageable pageable) {
        Page<Tasks> tasks = taskRepository.findAll(pageable);
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
}
