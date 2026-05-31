package com.example.springrentMe.controllers;

import com.example.springrentMe.DTOs.ChatSessionResponseDTO;
import com.example.springrentMe.models.AuthProvider;
import com.example.springrentMe.models.User;
import com.example.springrentMe.models.UserRole;
import com.example.springrentMe.repositories.UserRepository;
import com.example.springrentMe.services.ChatService;
import com.example.springrentMe.utils.JwtTokenProvider;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@TestPropertySource(locations = "classpath:application-test.properties")
@DisplayName("ChatController Integration Tests")
class ChatControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private UserRepository userRepository;

    @MockitoBean
    private ChatService chatService;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        User user = new User();
        user.setEmail("renter@gmail.com");
        user.setFullName("Test Renter");
        user.setPassword("password");
        user.setRole(UserRole.RENTER);
        user.setAuthProvider(AuthProvider.LOCAL);
        user.setIsActive(true);
        user.setContactNumber("+1234567890");
        userRepository.save(user);
    }

    @Test
    @DisplayName("GET /api/v1/chat/sessions - Should allow authenticated user via MockUser")
    @WithMockUser(username = "renter@gmail.com", roles = {"RENTER"})
    void testGetMySessions_Authenticated() throws Exception {
        Page<ChatSessionResponseDTO> emptyPage = new PageImpl<>(Collections.emptyList());
        when(chatService.getMySessions(any(Pageable.class))).thenReturn(emptyPage);

        mockMvc.perform(get("/api/v1/chat/sessions")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/v1/chat/sessions - Should allow authenticated user via JWT cookie")
    void testGetMySessions_WithCookie() throws Exception {
        String token = jwtTokenProvider.generateTokenFromUsername("renter@gmail.com");
        Cookie cookie = new Cookie("jwt_token", token);

        Page<ChatSessionResponseDTO> emptyPage = new PageImpl<>(Collections.emptyList());
        when(chatService.getMySessions(any(Pageable.class))).thenReturn(emptyPage);

        mockMvc.perform(get("/api/v1/chat/sessions")
                .cookie(cookie)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/v1/chat/sessions - Should deny anonymous user")
    void testGetMySessions_Anonymous() throws Exception {
        mockMvc.perform(get("/api/v1/chat/sessions")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }
}
