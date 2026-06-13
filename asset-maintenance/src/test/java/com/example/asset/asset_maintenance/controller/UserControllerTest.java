package com.example.asset.asset_maintenance.controller;

import com.example.asset.asset_maintenance.dto.RegisterRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testRegisterUserSuccess() throws Exception {
        RegisterRequest request = new RegisterRequest("New Operator", "new_op@factory.com", "password123");

        mockMvc.perform(post("/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("New Operator"))
                .andExpect(jsonPath("$.email").value("new_op@factory.com"))
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    void testRegisterUserDuplicateEmail() {
        // user1@factory.com is seeded in DatabaseSeeder
        RegisterRequest request = new RegisterRequest("Duplicate", "user1@factory.com", "password123");

        Exception exception = org.junit.jupiter.api.Assertions.assertThrows(Exception.class, () -> {
            mockMvc.perform(post("/users/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)));
        });

        org.junit.jupiter.api.Assertions.assertNotNull(exception.getCause());
        org.junit.jupiter.api.Assertions.assertTrue(exception.getCause() instanceof RuntimeException);
        org.junit.jupiter.api.Assertions.assertEquals("User with this email already exists", exception.getCause().getMessage());
    }

    @Test
    @WithMockUser(username = "user1@factory.com", roles = {"USER"})
    void testGetProfileAuthenticated() throws Exception {
        mockMvc.perform(get("/users/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("user1@factory.com"));
    }

    @Test
    void testGetProfileUnauthenticated() throws Exception {
        mockMvc.perform(get("/users/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "admin@factory.com", roles = {"ADMIN"})
    void testChangeUserRoleAdminSuccess() throws Exception {
        // user2@factory.com is seeded with role USER. We want to update it to TECHNICIAN.
        // First retrieve user list or hardcode user ID based on DB structure, or we can just mock
        // Since we are running on real seeded DB, let's find user2's ID.
        // Wait, to be safe and robust, let's look at updating a role.
        // In the database user2 is seeded. Let's see if we can perform change role.
        // If we don't know the exact ID, we can register a user first, get their ID, and then update their role!
        // That is very robust and guarantees we have the correct user ID. Let's do that!
        
        String registerJson = mockMvc.perform(post("/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RegisterRequest("Temp User", "temp@factory.com", "password123"))))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        // Extract ID
        Number id = objectMapper.readTree(registerJson).get("id").numberValue();
        
        mockMvc.perform(put("/users/" + id + "/role/TECHNICIAN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("TECHNICIAN"));
    }

    @Test
    @WithMockUser(username = "user1@factory.com", roles = {"USER"})
    void testChangeUserRoleForbiddenForNonAdmin() throws Exception {
        mockMvc.perform(put("/users/1/role/TECHNICIAN"))
                .andExpect(status().isForbidden());
    }
}
