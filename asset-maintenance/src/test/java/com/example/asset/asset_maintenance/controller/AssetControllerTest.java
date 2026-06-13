package com.example.asset.asset_maintenance.controller;

import com.example.asset.asset_maintenance.entity.Asset;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AssetControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(username = "manager@factory.com", roles = {"MANAGER"})
    void testCreateAssetAsManagerSuccess() throws Exception {
        Asset asset = Asset.builder()
                .assetName("Laser Engraver")
                .location("Section D")
                .status("OPERATIONAL")
                .build();

        mockMvc.perform(post("/assets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(asset)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assetName").value("Laser Engraver"))
                .andExpect(jsonPath("$.assetCode").isNotEmpty())
                .andExpect(jsonPath("$.manager.email").value("manager@factory.com"));
    }

    @Test
    @WithMockUser(username = "user1@factory.com", roles = {"USER"})
    void testCreateAssetAsOperatorForbidden() throws Exception {
        Asset asset = Asset.builder()
                .assetName("Laser Engraver")
                .location("Section D")
                .status("OPERATIONAL")
                .build();

        mockMvc.perform(post("/assets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(asset)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "user1@factory.com", roles = {"USER"})
    void testGetAllAssetsAuthenticated() throws Exception {
        mockMvc.perform(get("/assets"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].assetCode").exists());
    }

    @Test
    void testGetAllAssetsUnauthenticated() throws Exception {
        mockMvc.perform(get("/assets"))
                .andExpect(status().isUnauthorized());
    }
}
