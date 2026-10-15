package com.securecart.mapper;

import com.securecart.dto.response.CartItemResponse;
import com.securecart.dto.response.CartResponse;
import com.securecart.entity.Cart;
import com.securecart.entity.CartItem;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Component
public class CartMapper {

    public CartResponse toResponse(Cart cart) {
        if (cart == null) {
            return CartResponse.builder()
                    .items(List.of())
                    .totalItems(0)
                    .totalAmount(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP))
                    .build();
        }

        List<CartItemResponse> itemResponses = new ArrayList<>();
        int totalItems = 0;
        BigDecimal totalAmount = BigDecimal.ZERO;

        if (cart.getItems() != null) {
            for (CartItem item : cart.getItems()) {
                CartItemResponse itemResp = toItemResponse(item);
                itemResponses.add(itemResp);
                totalItems += item.getQuantity();
                totalAmount = totalAmount.add(itemResp.getTotalPrice());
            }
        }

        return CartResponse.builder()
                .id(cart.getId())
                .items(itemResponses)
                .totalItems(totalItems)
                .totalAmount(totalAmount.setScale(2, RoundingMode.HALF_UP))
                .build();
    }

    public CartItemResponse toItemResponse(CartItem item) {
        BigDecimal unitPrice = item.getProduct().getPrice().setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalPrice = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity())).setScale(2, RoundingMode.HALF_UP);

        return CartItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .productImageUrl(item.getProduct().getImageUrl())
                .unitPrice(unitPrice)
                .quantity(item.getQuantity())
                .totalPrice(totalPrice)
                .availableStock(item.getProduct().getStockQuantity())
                .active(item.getProduct().isActive())
                .build();
    }
}
