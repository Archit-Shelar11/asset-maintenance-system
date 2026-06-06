package com.example.asset.asset_maintenance.dto;

import lombok.Data;

@Data
public class MaterialRequestDTO {

    private Long taskId;
    private String materialName;
    private Integer quantity;
    private Long userId;
}
