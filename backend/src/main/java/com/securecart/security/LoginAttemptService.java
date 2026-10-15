package com.securecart.security;

import com.securecart.exception.RateLimitExceededException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory login attempt throttling service.
 * <p>
 * Note for interviews & production architecture:
 * In a single-instance deployment, ConcurrentHashMap provides thread-safe, low-latency rate limiting.
 * In a horizontally scaled multi-instance cluster, this state is not shared across nodes, so
 * an attacker could distribute brute-force attempts across instances. A production distributed
 * deployment must back this service with Redis (using Redis INCR and EXPIRE or Redisson rate limiters).
 */
@Service
public class LoginAttemptService {

    private record AttemptRecord(int attempts, Instant firstAttemptTime) {}

    private final Map<String, AttemptRecord> attemptsCache = new ConcurrentHashMap<>();

    @Value("${app.rate-limit.login-max-attempts:5}")
    private int maxAttempts;

    @Value("${app.rate-limit.login-window-seconds:300}")
    private int windowSeconds;

    public void checkLoginAllowed(String key) {
        AttemptRecord record = attemptsCache.get(key);
        if (record == null) {
            return;
        }

        if (Instant.now().isAfter(record.firstAttemptTime.plusSeconds(windowSeconds))) {
            attemptsCache.remove(key);
            return;
        }

        if (record.attempts >= maxAttempts) {
            long remainingSeconds = record.firstAttemptTime.plusSeconds(windowSeconds).getEpochSecond() - Instant.now().getEpochSecond();
            throw new RateLimitExceededException(
                    "Too many failed login attempts. Please wait " + Math.max(1, remainingSeconds) + " seconds before trying again."
            );
        }
    }

    public void recordFailedAttempt(String key) {
        attemptsCache.compute(key, (k, existing) -> {
            Instant now = Instant.now();
            if (existing == null || now.isAfter(existing.firstAttemptTime.plusSeconds(windowSeconds))) {
                return new AttemptRecord(1, now);
            }
            return new AttemptRecord(existing.attempts + 1, existing.firstAttemptTime);
        });
    }

    public void loginSucceeded(String key) {
        attemptsCache.remove(key);
    }
}
