package com.securecart.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.securecart.dto.request.LoginRequest;
import com.securecart.dto.request.RegisterRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("POST /api/v1/auth/register should create user, return access token and set HttpOnly refresh cookie")
    void register_Success() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("newuser@securecart.com");
        request.setPassword("SecurePassword@123");
        request.setFirstName("Alice");
        request.setLastName("Wonder");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(cookie().exists("securecart_refresh_token"))
                .andExpect(cookie().httpOnly("securecart_refresh_token", true))
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.user.email").value("newuser@securecart.com"))
                .andExpect(jsonPath("$.user.firstName").value("Alice"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login should authenticate registered user and issue token")
    void login_Success() throws Exception {
        // First register
        RegisterRequest reg = new RegisterRequest();
        reg.setEmail("loginuser@securecart.com");
        reg.setPassword("SecurePassword@123");
        reg.setFirstName("Bob");
        reg.setLastName("Builder");

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reg)));

        // Then login
        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("loginuser@securecart.com");
        loginReq.setPassword("SecurePassword@123");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("securecart_refresh_token"))
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.user.email").value("loginuser@securecart.com"));
    }
}
