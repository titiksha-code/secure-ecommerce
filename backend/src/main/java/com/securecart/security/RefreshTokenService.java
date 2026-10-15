package com.securecart.security;

import com.securecart.entity.RefreshToken;
import com.securecart.entity.User;
import com.securecart.exception.TokenRefreshException;
import com.securecart.repository.RefreshTokenRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private static final Logger log = LoggerFactory.getLogger(RefreshTokenService.class);

    private final RefreshTokenRepository refreshTokenRepository;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    @Value("${app.jwt.refresh-token-expiration-ms:604800000}")
    private long refreshTokenExpirationMs;

    public record RotationResult(String rawNewToken, User user) {}

    @Transactional
    public String createRefreshToken(User user) {
        String rawToken = generateSecureRawToken();
        String tokenHash = hashToken(rawToken);
        String tokenFamily = UUID.randomUUID().toString();

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .tokenHash(tokenHash)
                .tokenFamily(tokenFamily)
                .expiresAt(Instant.now().plusMillis(refreshTokenExpirationMs))
                .revoked(false)
                .build();

        refreshTokenRepository.save(refreshToken);
        return rawToken;
    }

    /**
     * Atomically rotates refresh token. If reuse of an already-revoked token is detected,
     * the entire token family is immediately revoked to protect against replay attacks.
     */
    @Transactional
    public RotationResult rotateRefreshToken(String rawOldToken) {
        if (rawOldToken == null || rawOldToken.isBlank()) {
            throw new TokenRefreshException("Refresh token is required.");
        }

        String oldTokenHash = hashToken(rawOldToken);
        RefreshToken oldToken = refreshTokenRepository.findByTokenHash(oldTokenHash)
                .orElseThrow(() -> new TokenRefreshException("Refresh token not found. Please log in again."));

        if (oldToken.isRevoked()) {
            // Replay attack detected! Revoke the entire token family!
            refreshTokenRepository.revokeAllByTokenFamily(oldToken.getTokenFamily());
            log.warn("SECURITY ALERT: Refresh token reuse detected for family {}. Entire family revoked.",
                    oldToken.getTokenFamily());
            throw new TokenRefreshException("Refresh token reuse detected. All sessions in this chain have been terminated.");
        }

        if (oldToken.isExpired()) {
            oldToken.setRevoked(true);
            refreshTokenRepository.save(oldToken);
            throw new TokenRefreshException("Refresh token expired. Please log in again.");
        }

        // Token is valid: Revoke old token and issue new token within same family
        oldToken.setRevoked(true);
        refreshTokenRepository.save(oldToken);

        String rawNewToken = generateSecureRawToken();
        String newTokenHash = hashToken(rawNewToken);

        RefreshToken newToken = RefreshToken.builder()
                .user(oldToken.getUser())
                .tokenHash(newTokenHash)
                .tokenFamily(oldToken.getTokenFamily())
                .expiresAt(Instant.now().plusMillis(refreshTokenExpirationMs))
                .revoked(false)
                .build();

        refreshTokenRepository.save(newToken);
        return new RotationResult(rawNewToken, oldToken.getUser());
    }

    @Transactional
    public void revokeToken(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return;
        }
        String tokenHash = hashToken(rawToken);
        refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(token -> {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
        });
    }

    @Transactional
    public void revokeAllForUser(Long userId) {
        refreshTokenRepository.revokeAllByUserId(userId);
    }

    private String generateSecureRawToken() {
        return UUID.randomUUID().toString().replace("-", "") + "." +
               UUID.randomUUID().toString().replace("-", "");
    }

    public String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm not available", e);
        }
    }
}
