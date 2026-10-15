package com.securecart.service;

import com.securecart.dto.request.RegisterRequest;
import com.securecart.entity.Role;
import com.securecart.entity.User;
import com.securecart.exception.DuplicateResourceException;
import com.securecart.mapper.UserMapper;
import com.securecart.repository.CartRepository;
import com.securecart.repository.UserRepository;
import com.securecart.security.JwtTokenProvider;
import com.securecart.security.LoginAttemptService;
import com.securecart.security.RefreshTokenService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CartRepository cartRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private LoginAttemptService loginAttemptService;

    private UserMapper userMapper = new UserMapper();

    private AuthService authService;

    private User sampleUser;
    private RegisterRequest registerRequest;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                userRepository,
                cartRepository,
                passwordEncoder,
                authenticationManager,
                jwtTokenProvider,
                refreshTokenService,
                loginAttemptService,
                userMapper
        );

        sampleUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .passwordHash("encodedPassword")
                .firstName("Test")
                .lastName("User")
                .role(Role.ROLE_CUSTOMER)
                .enabled(true)
                .build();

        registerRequest = new RegisterRequest();
        registerRequest.setEmail("test@example.com");
        registerRequest.setPassword("SecurePass@123");
        registerRequest.setFirstName("Test");
        registerRequest.setLastName("User");
    }

    @Test
    @DisplayName("Should successfully register new customer and initialize user cart")
    void register_Success() {
        when(userRepository.existsByEmailIgnoreCase("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(jwtTokenProvider.generateAccessToken(any())).thenReturn("mock-jwt-token");
        when(refreshTokenService.createRefreshToken(any(User.class))).thenReturn("mock-refresh-token");

        AuthService.AuthResult result = authService.register(registerRequest);

        assertThat(result).isNotNull();
        assertThat(result.authResponse().getAccessToken()).isEqualTo("mock-jwt-token");
        assertThat(result.rawRefreshToken()).isEqualTo("mock-refresh-token");
        assertThat(result.authResponse().getUser().getEmail()).isEqualTo("test@example.com");
        verify(cartRepository, times(1)).save(any());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw DuplicateResourceException when registering existing email")
    void register_DuplicateEmail_ThrowsException() {
        when(userRepository.existsByEmailIgnoreCase("test@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("already exists");

        verify(userRepository, never()).save(any());
        verify(cartRepository, never()).save(any());
    }
}
