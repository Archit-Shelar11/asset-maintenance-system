package com.example.asset.asset_maintenance.controller;

import com.example.asset.asset_maintenance.dto.TaskDiscussionResponse;
import com.example.asset.asset_maintenance.entity.TaskDiscussion;
import com.example.asset.asset_maintenance.service.TaskDiscussionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tasks")
public class TaskDiscussionController {

    @Autowired
    private TaskDiscussionService discussionService;

    @PostMapping("/{taskId}/comments")
    public TaskDiscussion addComment(
            @PathVariable Long taskId,
            @RequestParam Long userId,
            @RequestParam String message) {

        return discussionService.addComment(taskId, userId, message);
    }

    @GetMapping("/{taskId}/comments")
    public List<TaskDiscussionResponse> getComments(@PathVariable Long taskId) {
        return discussionService.getComments(taskId);
    }

}
