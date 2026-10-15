package com.securecart.dto.response;

import java.math.BigDecimal;
import java.util.List;

public class CartResponse {
    private Long id;
    private List<CartItemResponse> items;
    private int totalItems;
    private BigDecimal totalAmount;

    public CartResponse() {}

    public CartResponse(Long id, List<CartItemResponse> items, int totalItems, BigDecimal totalAmount) {
        this.id = id;
        this.items = items;
        this.totalItems = totalItems;
        this.totalAmount = totalAmount;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private List<CartItemResponse> items;
        private int totalItems;
        private BigDecimal totalAmount;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder items(List<CartItemResponse> items) { this.items = items; return this; }
        public Builder totalItems(int totalItems) { this.totalItems = totalItems; return this; }
        public Builder totalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; return this; }

        public CartResponse build() {
            return new CartResponse(id, items, totalItems, totalAmount);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public List<CartItemResponse> getItems() { return items; }
    public void setItems(List<CartItemResponse> items) { this.items = items; }
    public int getTotalItems() { return totalItems; }
    public void setTotalItems(int totalItems) { this.totalItems = totalItems; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
}
