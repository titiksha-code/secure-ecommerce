package com.securecart.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "idempotency_keys", uniqueConstraints = {
    @UniqueConstraint(name = "uk_user_idempotency", columnNames = {"user_id", "idempotency_key"})
})
public class IdempotencyRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "idempotency_key", nullable = false, length = 128)
    private String idempotencyKey;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "request_hash", nullable = false, length = 64)
    private String requestHash;

    @Column(name = "response_order_id")
    private Long responseOrderId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public IdempotencyRecord() {
    }

    public IdempotencyRecord(Long id, String idempotencyKey, User user, String requestHash, Long responseOrderId) {
        this.id = id;
        this.idempotencyKey = idempotencyKey;
        this.user = user;
        this.requestHash = requestHash;
        this.responseOrderId = responseOrderId;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String idempotencyKey;
        private User user;
        private String requestHash;
        private Long responseOrderId;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder idempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; return this; }
        public Builder user(User user) { this.user = user; return this; }
        public Builder requestHash(String requestHash) { this.requestHash = requestHash; return this; }
        public Builder responseOrderId(Long responseOrderId) { this.responseOrderId = responseOrderId; return this; }

        public IdempotencyRecord build() {
            return new IdempotencyRecord(id, idempotencyKey, user, requestHash, responseOrderId);
        }
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getIdempotencyKey() { return idempotencyKey; }
    public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getRequestHash() { return requestHash; }
    public void setRequestHash(String requestHash) { this.requestHash = requestHash; }
    public Long getResponseOrderId() { return responseOrderId; }
    public void setResponseOrderId(Long responseOrderId) { this.responseOrderId = responseOrderId; }
    public Instant getCreatedAt() { return createdAt; }
}
