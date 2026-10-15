package com.securecart.service;

import com.securecart.dto.request.LoginRequest;
import com.securecart.dto.request.RegisterRequest;
import com.securecart.dto.response.AuthResponse;
import com.securecart.dto.response.UserResponse;
import com.securecart.entity.Cart;
import com.securecart.entity.Role;
import com.securecart.entity.User;
import com.securecart.exception.BadRequestException;
import com.securecart.exception.DuplicateResourceException;
import com.securecart.exception.ResourceNotFoundException;
import com.securecart.mapper.UserMapper;
import com.securecart.repository.CartRepository;
import com.securecart.repository.UserRepository;
import com.securecart.security.JwtTokenProvider;
import com.securecart.security.LoginAttemptService;
import com.securecart.security.RefreshTokenService;
import com.securecart.security.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final LoginAttemptService loginAttemptService;
    private final UserMapper userMapper;

    public AuthService(UserRepository userRepository, CartRepository cartRepository, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, JwtTokenProvider jwtTokenProvider, RefreshTokenService refreshTokenService, LoginAttemptService loginAttemptService, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.cartRepository = cartRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.refreshTokenService = refreshTokenService;
        this.loginAttemptService = loginAttemptService;
        this.userMapper = userMapper;
    }

    @Value("${app.jwt.access-token-expiration-ms:900000}")
    private long accessTokenExpirationMs;

    public record AuthResult(AuthResponse authResponse, String rawRefreshToken) {}

    @Transactional
    public AuthResult register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new DuplicateResourceException("An account with email " + normalizedEmail + " already exists.");
        }

        // Public registration always assigns ROLE_CUSTOMER
        User user = User.builder()
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .role(Role.ROLE_CUSTOMER)
                .enabled(true)
                .build();

        User savedUser = userRepository.save(user);

        // Initialize persistent cart for the new user
        Cart cart = Cart.builder()
                .user(savedUser)
                .build();
        cartRepository.save(cart);

        UserPrincipal principal = UserPrincipal.fromUser(savedUser);
        String accessToken = jwtTokenProvider.generateAccessToken(principal);
        String rawRefreshToken = refreshTokenService.createRefreshToken(savedUser);

        AuthResponse authResponse = AuthResponse.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .expiresInMs(accessTokenExpirationMs)
                .user(userMapper.toResponse(savedUser))
                .build();

        return new AuthResult(authResponse, rawRefreshToken);
    }

    public AuthResult login(LoginRequest request, HttpServletRequest httpRequest) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        String clientIp = getClientIp(httpRequest);
        String rateLimitKey = clientIp + ":" + normalizedEmail;

        // Check if client is throttled due to repeated brute-force failures
        loginAttemptService.checkLoginAllowed(rateLimitKey);

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword())
            );

            // Reset rate limiter on successful authentication
            loginAttemptService.loginSucceeded(rateLimitKey);

            UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
            User user = userRepository.findById(principal.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            String accessToken = jwtTokenProvider.generateAccessToken(principal);
            String rawRefreshToken = refreshTokenService.createRefreshToken(user);

            AuthResponse authResponse = AuthResponse.builder()
                    .accessToken(accessToken)
                    .tokenType("Bearer")
                    .expiresInMs(accessTokenExpirationMs)
                    .user(userMapper.toResponse(user))
                    .build();

            return new AuthResult(authResponse, rawRefreshToken);

        } catch (BadCredentialsException ex) {
            loginAttemptService.recordFailedAttempt(rateLimitKey);
            log.warn("Failed login attempt for user {} from IP {}", normalizedEmail, clientIp);
            throw new BadRequestException("Invalid email or password.");
        }
    }

    @Transactional
    public AuthResult refreshAccessToken(String rawRefreshToken) {
        RefreshTokenService.RotationResult result = refreshTokenService.rotateRefreshToken(rawRefreshToken);
        User user = result.user();
        UserPrincipal principal = UserPrincipal.fromUser(user);

        String newAccessToken = jwtTokenProvider.generateAccessToken(principal);

        AuthResponse authResponse = AuthResponse.builder()
                .accessToken(newAccessToken)
                .tokenType("Bearer")
                .expiresInMs(accessTokenExpirationMs)
                .user(userMapper.toResponse(user))
                .build();

        return new AuthResult(authResponse, result.rawNewToken());
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        if (rawRefreshToken != null && !rawRefreshToken.isBlank()) {
            refreshTokenService.revokeToken(rawRefreshToken);
        }
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + principal.getId()));
        return userMapper.toResponse(user);
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isBlank()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
}
