package com.securecart.service;

import com.securecart.dto.request.CheckoutRequest;
import com.securecart.dto.response.OrderResponse;
import com.securecart.entity.*;
import com.securecart.exception.InsufficientStockException;
import com.securecart.mapper.OrderMapper;
import com.securecart.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private CartRepository cartRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private IdempotencyRecordRepository idempotencyRecordRepository;

    private OrderMapper orderMapper = new OrderMapper();

    private OrderService orderService;

    private User sampleUser;
    private Product sampleProduct;
    private Cart sampleCart;
    private CartItem sampleCartItem;
    private CheckoutRequest sampleCheckoutRequest;

    @BeforeEach
    void setUp() {
        orderService = new OrderService(
                orderRepository,
                orderItemRepository,
                cartRepository,
                productRepository,
                userRepository,
                idempotencyRecordRepository,
                orderMapper
        );

        sampleUser = User.builder()
                .id(1L)
                .email("customer@example.com")
                .firstName("Alice")
                .lastName("Smith")
                .role(Role.ROLE_CUSTOMER)
                .build();

        sampleProduct = Product.builder()
                .id(10L)
                .name("Secure YubiKey 5C")
                .price(new BigDecimal("50.00"))
                .stockQuantity(10)
                .active(true)
                .build();

        sampleCart = Cart.builder()
                .id(100L)
                .user(sampleUser)
                .build();

        sampleCartItem = CartItem.builder()
                .id(200L)
                .cart(sampleCart)
                .product(sampleProduct)
                .quantity(2)
                .build();

        sampleCart.getItems().add(sampleCartItem);

        sampleCheckoutRequest = CheckoutRequest.builder()
                .shippingFullName("Alice Smith")
                .shippingAddressLine1("123 Cyber Way")
                .shippingCity("San Jose")
                .shippingState("CA")
                .shippingPostalCode("95134")
                .shippingCountry("USA")
                .shippingPhone("+14085551234")
                .paymentMethod("CASH_ON_DELIVERY")
                .build();
    }

    @Test
    @DisplayName("Should successfully execute checkout, deduct stock, clear cart, and record idempotency")
    void checkout_Success() {
        String idempotencyKey = UUID.randomUUID().toString();

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(cartRepository.findByUserIdWithDetails(1L)).thenReturn(Optional.of(sampleCart));
        when(idempotencyRecordRepository.findByUserIdAndIdempotencyKey(1L, idempotencyKey)).thenReturn(Optional.empty());
        when(productRepository.findByIdInOrderByIdAscForUpdate(anyList())).thenReturn(List.of(sampleProduct));

        Order savedOrder = Order.builder()
                .id(500L)
                .orderNumber("ORD-20261004-TEST")
                .user(sampleUser)
                .totalAmount(new BigDecimal("100.00"))
                .status(OrderStatus.PLACED)
                .build();

        when(orderRepository.save(any(Order.class))).thenReturn(savedOrder);

        OrderResponse response = orderService.checkout(1L, sampleCheckoutRequest, idempotencyKey);

        assertThat(response).isNotNull();
        assertThat(response.getOrderNumber()).isEqualTo("ORD-20261004-TEST");
        assertThat(sampleProduct.getStockQuantity()).isEqualTo(8); // 10 - 2

        verify(productRepository, times(1)).save(sampleProduct);
        verify(cartRepository, times(1)).save(sampleCart);
        verify(idempotencyRecordRepository, times(1)).save(any(IdempotencyRecord.class));
    }

    @Test
    @DisplayName("Should throw InsufficientStockException when item quantity exceeds available inventory")
    void checkout_InsufficientStock_ThrowsException() {
        sampleProduct.setStockQuantity(1); // Requested 2

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(cartRepository.findByUserIdWithDetails(1L)).thenReturn(Optional.of(sampleCart));
        when(productRepository.findByIdInOrderByIdAscForUpdate(anyList())).thenReturn(List.of(sampleProduct));

        assertThatThrownBy(() -> orderService.checkout(1L, sampleCheckoutRequest, null))
                .isInstanceOf(InsufficientStockException.class)
                .hasMessageContaining("Insufficient inventory");

        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should return existing order on duplicate idempotency key retry")
    void checkout_IdempotentRetry_ReturnsExistingOrder() throws Exception {
        String idempotencyKey = UUID.randomUUID().toString();

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(cartRepository.findByUserIdWithDetails(1L)).thenReturn(Optional.of(sampleCart));

        String payload = String.join("|",
                sampleCheckoutRequest.getShippingFullName(),
                sampleCheckoutRequest.getShippingAddressLine1(),
                sampleCheckoutRequest.getShippingCity(),
                sampleCheckoutRequest.getShippingState(),
                sampleCheckoutRequest.getShippingPostalCode(),
                sampleCheckoutRequest.getShippingCountry(),
                sampleCheckoutRequest.getShippingPhone(),
                sampleCheckoutRequest.getPaymentMethod()
        );
        java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
        String requestHash = java.util.HexFormat.of().formatHex(digest.digest(payload.getBytes(java.nio.charset.StandardCharsets.UTF_8)));

        IdempotencyRecord record = IdempotencyRecord.builder()
                .id(1L)
                .user(sampleUser)
                .idempotencyKey(idempotencyKey)
                .requestHash(requestHash)
                .responseOrderId(500L)
                .build();

        when(idempotencyRecordRepository.findByUserIdAndIdempotencyKey(1L, idempotencyKey))
                .thenReturn(Optional.of(record));

        Order existingOrder = Order.builder()
                .id(500L)
                .orderNumber("ORD-EXISTING")
                .user(sampleUser)
                .totalAmount(new BigDecimal("100.00"))
                .status(OrderStatus.PLACED)
                .build();
        when(orderRepository.findByIdWithItems(500L)).thenReturn(Optional.of(existingOrder));

        OrderResponse response = orderService.checkout(1L, sampleCheckoutRequest, idempotencyKey);

        assertThat(response).isNotNull();
        assertThat(response.getOrderNumber()).isEqualTo("ORD-EXISTING");
        verify(orderRepository, never()).save(any());
    }
}
