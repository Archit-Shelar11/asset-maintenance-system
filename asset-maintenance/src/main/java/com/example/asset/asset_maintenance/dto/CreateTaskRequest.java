package com.example.asset.asset_maintenance.dto;

import lombok.Data;

@Data
public class CreateTaskRequest {

    private String title;
    private String description;
    private String priority;

    private Long assetId;
    private Long reportedByUserId;
}