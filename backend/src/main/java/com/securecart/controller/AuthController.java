package com.securecart.controller;

import com.securecart.dto.request.LoginRequest;
import com.securecart.dto.request.RegisterRequest;
import com.securecart.dto.response.AuthResponse;
import com.securecart.dto.response.UserResponse;
import com.securecart.exception.TokenRefreshException;
import com.securecart.security.CookieHelper;
import com.securecart.security.UserPrincipal;
import com.securecart.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Registration, login, refresh token rotation, and logout endpoints")
public class AuthController {

    private final AuthService authService;
    private final CookieHelper cookieHelper;

    public AuthController(AuthService authService, CookieHelper cookieHelper) {
        this.authService = authService;
        this.cookieHelper = cookieHelper;
    }

    @PostMapping("/register")
    @Operation(summary = "Register customer account", description = "Creates a new customer account and issues an access token and HttpOnly refresh cookie.")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthService.AuthResult result = authService.register(request);
        ResponseCookie refreshCookie = cookieHelper.createRefreshTokenCookie(result.rawRefreshToken());

        return ResponseEntity.status(HttpStatus.CREATED)
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(result.authResponse());
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user", description = "Validates credentials, checks rate limits, issues access token and HttpOnly refresh cookie.")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest
    ) {
        AuthService.AuthResult result = authService.login(request, httpRequest);
        ResponseCookie refreshCookie = cookieHelper.createRefreshTokenCookie(result.rawRefreshToken());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(result.authResponse());
    }

    @PostMapping("/refresh")
    @Operation(summary = "Rotate refresh token & issue new access token", description = "Reads HttpOnly refresh cookie, verifies validity, revokes old token, issues new token pair.")
    public ResponseEntity<AuthResponse> refresh(HttpServletRequest request) {
        String rawRefreshToken = cookieHelper.extractRefreshTokenFromCookies(request)
                .orElseThrow(() -> new TokenRefreshException("Refresh token cookie is missing. Please log in."));

        AuthService.AuthResult result = authService.refreshAccessToken(rawRefreshToken);
        ResponseCookie newRefreshCookie = cookieHelper.createRefreshTokenCookie(result.rawRefreshToken());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, newRefreshCookie.toString())
                .body(result.authResponse());
    }

    @PostMapping("/logout")
    @Operation(summary = "Log out user", description = "Revokes refresh token in database and clears the HttpOnly cookie.")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        cookieHelper.extractRefreshTokenFromCookies(request)
                .ifPresent(authService::logout);

        ResponseCookie cleanCookie = cookieHelper.createCleanRefreshTokenCookie();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cleanCookie.toString())
                .build();
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user", description = "Returns details of the currently authenticated principal derived from the JWT.")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(authService.getCurrentUser(principal));
    }
}
