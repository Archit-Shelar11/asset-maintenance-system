package com.example.asset.asset_maintenance.service;

import com.example.asset.asset_maintenance.dto.TaskDiscussionResponse;
import com.example.asset.asset_maintenance.entity.MaintenanceTask;
import com.example.asset.asset_maintenance.entity.TaskDiscussion;
import com.example.asset.asset_maintenance.entity.User;
import com.example.asset.asset_maintenance.repository.MaintenanceTaskRepository;
import com.example.asset.asset_maintenance.repository.TaskDiscussionRepository;
import com.example.asset.asset_maintenance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskDiscussionService {

    private final TaskDiscussionRepository discussionRepository;
    private final MaintenanceTaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskDiscussion addComment(Long taskId, String userEmail, String message) {

        MaintenanceTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        TaskDiscussion discussion = new TaskDiscussion();
        discussion.setTask(task);
        discussion.setUser(user);
        discussion.setMessage(message);

        return discussionRepository.save(discussion);
    }


    public List<TaskDiscussionResponse> getComments(Long taskId) {

        return discussionRepository.findByTaskId(taskId)
                .stream()
                .map(d -> {
                    TaskDiscussionResponse res = new TaskDiscussionResponse();

                    res.setMessage(d.getMessage());
                    res.setUser(d.getUser().getFullName());
                    res.setTime(d.getCreatedAt().toString());

                    return res;
                })
                .toList();
    }
}
