package com.securecart.service;

import com.securecart.dto.request.AddToCartRequest;
import com.securecart.dto.response.CartResponse;
import com.securecart.entity.Cart;
import com.securecart.entity.CartItem;
import com.securecart.entity.Product;
import com.securecart.entity.User;
import com.securecart.exception.BadRequestException;
import com.securecart.mapper.CartMapper;
import com.securecart.repository.CartItemRepository;
import com.securecart.repository.CartRepository;
import com.securecart.repository.ProductRepository;
import com.securecart.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private CartRepository cartRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    private CartMapper cartMapper = new CartMapper();

    private CartService cartService;

    private User sampleUser;
    private Product sampleProduct;
    private Cart sampleCart;

    @BeforeEach
    void setUp() {
        cartService = new CartService(
                cartRepository,
                cartItemRepository,
                productRepository,
                userRepository,
                cartMapper
        );

        sampleUser = User.builder().id(1L).email("user@test.com").build();
        sampleProduct = Product.builder()
                .id(10L)
                .name("Secure Hardware Token")
                .price(new BigDecimal("75.00"))
                .stockQuantity(15)
                .active(true)
                .build();
        sampleCart = Cart.builder().id(100L).user(sampleUser).build();
    }

    @Test
    @DisplayName("Should successfully add product to user cart")
    void addToCart_Success() {
        AddToCartRequest request = new AddToCartRequest(10L, 2);

        when(productRepository.findById(10L)).thenReturn(Optional.of(sampleProduct));
        when(cartRepository.findByUserIdWithDetails(1L)).thenReturn(Optional.of(sampleCart));
        when(cartItemRepository.findByCartIdAndProductId(100L, 10L)).thenReturn(Optional.empty());

        CartResponse response = cartService.addToCart(1L, request);

        assertThat(response).isNotNull();
        verify(cartItemRepository, times(1)).save(any(CartItem.class));
    }

    @Test
    @DisplayName("Should throw BadRequestException when adding inactive product")
    void addToCart_InactiveProduct_ThrowsException() {
        sampleProduct.setActive(false);
        AddToCartRequest request = new AddToCartRequest(10L, 1);

        when(productRepository.findById(10L)).thenReturn(Optional.of(sampleProduct));

        assertThatThrownBy(() -> cartService.addToCart(1L, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("not currently available");

        verify(cartItemRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should clear all items from user cart")
    void clearCart_Success() {
        when(cartRepository.findByUserIdWithDetails(1L)).thenReturn(Optional.of(sampleCart));
        when(cartRepository.save(any(Cart.class))).thenReturn(sampleCart);

        CartResponse response = cartService.clearCart(1L);

        assertThat(response).isNotNull();
        verify(cartRepository, times(1)).save(sampleCart);
    }
}
