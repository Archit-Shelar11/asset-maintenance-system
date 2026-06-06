package com.example.asset.asset_maintenance.dto;

import lombok.Data;

@Data
public class TaskHistoryResponse {

    private String action;
    private String fromStatus;
    private String toStatus;
    private String performedBy;
    private String remarks;
    private String time;
}
