package com.securecart.service;

import com.securecart.dto.request.CheckoutRequest;
import com.securecart.dto.response.OrderItemResponse;
import com.securecart.dto.response.OrderResponse;
import com.securecart.dto.response.PaginatedResponse;
import com.securecart.entity.*;
import com.securecart.exception.BadRequestException;
import com.securecart.exception.IdempotencyConflictException;
import com.securecart.exception.InsufficientStockException;
import com.securecart.exception.InvalidOrderTransitionException;
import com.securecart.exception.ResourceNotFoundException;
import com.securecart.mapper.OrderMapper;
import com.securecart.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final IdempotencyRecordRepository idempotencyRecordRepository;
    private final OrderMapper orderMapper;

    public OrderService(OrderRepository orderRepository, OrderItemRepository orderItemRepository, CartRepository cartRepository, ProductRepository productRepository, UserRepository userRepository, IdempotencyRecordRepository idempotencyRecordRepository, OrderMapper orderMapper) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.idempotencyRecordRepository = idempotencyRecordRepository;
        this.orderMapper = orderMapper;
    }

    /**
     * Executes atomic checkout with:
     * 1. Idempotency validation per customer
     * 2. Deterministic ascending product locking (SELECT FOR UPDATE) to eliminate deadlock risk
     * 3. Stock validation & inventory deduction
     * 4. Server-side price calculation
     * 5. Immutable product name & price snapshotting
     * 6. Atomic cart clearing
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public OrderResponse checkout(Long userId, CheckoutRequest request, String idempotencyKey) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Cart cart = cartRepository.findByUserIdWithDetails(userId)
                .orElseThrow(() -> new BadRequestException("No cart found for user."));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new BadRequestException("Cannot proceed to checkout with an empty shopping cart.");
        }

        // Compute SHA-256 fingerprint of the checkout request payload
        String requestHash = computeRequestHash(request);

        // Verify Idempotency Key if provided by client
        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            Optional<IdempotencyRecord> existingRecordOpt =
                    idempotencyRecordRepository.findByUserIdAndIdempotencyKey(userId, idempotencyKey.trim());

            if (existingRecordOpt.isPresent()) {
                IdempotencyRecord record = existingRecordOpt.get();
                if (record.getRequestHash().equals(requestHash)) {
                    log.info("Idempotent checkout retry detected for user {} with key {}. Returning existing order.",
                            userId, idempotencyKey);
                    Order existingOrder = orderRepository.findByIdWithItems(record.getResponseOrderId())
                            .orElseThrow(() -> new ResourceNotFoundException("Previously placed order not found."));
                    return orderMapper.toResponse(existingOrder);
                } else {
                    throw new IdempotencyConflictException(
                            "Idempotency key '" + idempotencyKey + "' was previously submitted with different request parameters."
                    );
                }
            }
        }

        // Sort product IDs in strict ascending order to prevent deadlocks under concurrent checkouts
        List<Long> sortedProductIds = cart.getItems().stream()
                .map(item -> item.getProduct().getId())
                .distinct()
                .sorted()
                .toList();

        // Acquire pessimistic write locks (SELECT ... FOR UPDATE) on all items
        List<Product> lockedProducts = productRepository.findByIdInOrderByIdAscForUpdate(sortedProductIds);
        Map<Long, Product> productMap = lockedProducts.stream()
                .collect(Collectors.toMap(Product::getId, Function.identity()));

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        // Validate stock, calculate prices server-side, and deduct inventory
        for (CartItem item : cart.getItems()) {
            Product product = productMap.get(item.getProduct().getId());
            if (product == null || !product.isActive()) {
                throw new BadRequestException("Product '" + (product != null ? product.getName() : "Item") +
                        "' is inactive or unavailable.");
            }

            if (product.getStockQuantity() < item.getQuantity()) {
                throw new InsufficientStockException(
                        "Insufficient inventory for product '" + product.getName() + "'. Available: " +
                        product.getStockQuantity() + ", requested: " + item.getQuantity()
                );
            }

            // Deduct stock atomically within the locked row transaction
            product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
            productRepository.save(product);

            // Server-side calculation
            BigDecimal unitPrice = product.getPrice().setScale(2, RoundingMode.HALF_UP);
            BigDecimal itemTotal = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity())).setScale(2, RoundingMode.HALF_UP);
            totalAmount = totalAmount.add(itemTotal);

            // Snapshot product details so future edits/archives never affect past order history
            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .productNameSnapshot(product.getName())
                    .quantity(item.getQuantity())
                    .unitPriceSnapshot(unitPrice)
                    .totalPrice(itemTotal)
                    .build();

            orderItems.add(orderItem);
        }

        String orderNumber = generateUniqueOrderNumber();

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .user(user)
                .totalAmount(totalAmount.setScale(2, RoundingMode.HALF_UP))
                .status(OrderStatus.PLACED)
                .paymentMethod("CASH_ON_DELIVERY")
                .shippingFullName(request.getShippingFullName().trim())
                .shippingAddressLine1(request.getShippingAddressLine1().trim())
                .shippingAddressLine2(request.getShippingAddressLine2() != null ? request.getShippingAddressLine2().trim() : null)
                .shippingCity(request.getShippingCity().trim())
                .shippingState(request.getShippingState().trim())
                .shippingPostalCode(request.getShippingPostalCode().trim())
                .shippingCountry(request.getShippingCountry().trim())
                .shippingPhone(request.getShippingPhone().trim())
                .build();

        for (OrderItem orderItem : orderItems) {
            order.addItem(orderItem);
        }

        Order savedOrder = orderRepository.save(order);

        // Clear user's cart in the same transaction
        cart.clearItems();
        cartRepository.save(cart);

        // Store idempotency record
        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            IdempotencyRecord record = IdempotencyRecord.builder()
                    .user(user)
                    .idempotencyKey(idempotencyKey.trim())
                    .requestHash(requestHash)
                    .responseOrderId(savedOrder.getId())
                    .build();
            idempotencyRecordRepository.save(record);
        }

        log.info("Order {} successfully created for user {}. Total amount: INR {}",
                savedOrder.getOrderNumber(), user.getEmail(), savedOrder.getTotalAmount());

        return orderMapper.toResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public PaginatedResponse<OrderResponse> getUserOrders(Long userId, Pageable pageable) {
        Page<Order> orderPage = orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return PaginatedResponse.fromPage(orderPage.map(orderMapper::toResponse));
    }

    @Transactional(readOnly = true)
    public OrderResponse getUserOrderById(Long userId, Long orderId) {
        Order order = orderRepository.findByIdAndUserIdWithItems(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        return orderMapper.toResponse(order);
    }

    @Transactional(readOnly = true)
    public PaginatedResponse<OrderResponse> getAllOrdersAdmin(Pageable pageable) {
        Page<Order> orderPage = orderRepository.findAllByOrderByCreatedAtDesc(pageable);
        return PaginatedResponse.fromPage(orderPage.map(orderMapper::toResponse));
    }

    @Transactional(readOnly = true)
    public OrderResponse getAdminOrderById(Long orderId) {
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        return orderMapper.toResponse(order);
    }

    /**
     * Enforces permitted state machine transitions:
     * PLACED -> PROCESSING -> SHIPPED -> DELIVERED
     * PLACED or PROCESSING -> CANCELLED
     */
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getStatus().canTransitionTo(newStatus)) {
            throw new InvalidOrderTransitionException(
                    "Invalid order status transition from '" + order.getStatus() + "' to '" + newStatus +
                    "'. Permitted transitions: " + order.getStatus().getPermittedTransitions()
            );
        }

        order.setStatus(newStatus);
        Order updated = orderRepository.save(order);
        log.info("Order {} status transitioned to {}", updated.getOrderNumber(), newStatus);
        return orderMapper.toResponse(updated);
    }

    private String generateUniqueOrderNumber() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomSuffix = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return "ORD-" + datePart + "-" + randomSuffix;
    }

    private String computeRequestHash(CheckoutRequest request) {
        String payload = String.join("|",
                request.getShippingFullName(),
                request.getShippingAddressLine1(),
                request.getShippingCity(),
                request.getShippingState(),
                request.getShippingPostalCode(),
                request.getShippingCountry(),
                request.getShippingPhone(),
                request.getPaymentMethod() != null ? request.getPaymentMethod() : "CASH_ON_DELIVERY"
        );
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(payload.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm missing", e);
        }
    }
}
