package com.example.asset.asset_maintenance.controller;

import com.example.asset.asset_maintenance.dto.TaskDiscussionResponse;
import com.example.asset.asset_maintenance.entity.TaskDiscussion;
import com.example.asset.asset_maintenance.service.TaskDiscussionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class TaskDiscussionController {

    private final TaskDiscussionService discussionService;

    @PostMapping("/{taskId}/comments")
    public TaskDiscussion addComment(
            @PathVariable Long taskId,
            Principal principal,
            @RequestParam String message) {

        return discussionService.addComment(taskId, principal.getName(), message);
    }

    @GetMapping("/{taskId}/comments")
    public List<TaskDiscussionResponse> getComments(@PathVariable Long taskId) {
        return discussionService.getComments(taskId);
    }

}
