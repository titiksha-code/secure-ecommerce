package com.securecart.controller;

import com.securecart.dto.request.CheckoutRequest;
import com.securecart.dto.response.OrderResponse;
import com.securecart.dto.response.PaginatedResponse;
import com.securecart.security.UserPrincipal;
import com.securecart.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/orders")
@Tag(name = "Orders & Checkout", description = "Customer checkout and personal order history endpoints")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/checkout")
    @Operation(summary = "Place order (Checkout)", description = "Atomically verifies stock with pessimistic locks, snapshots historical items, deducts inventory, clears cart, and records idempotency key.")
    public ResponseEntity<OrderResponse> checkout(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CheckoutRequest request,
            @Parameter(description = "Optional unique idempotency key (UUID) to prevent duplicate checkouts upon retries.")
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.checkout(principal.getId(), request, idempotencyKey));
    }

    @GetMapping
    @Operation(summary = "Get personal order history", description = "Retrieves paginated list of orders placed by the authenticated customer.")
    public ResponseEntity<PaginatedResponse<OrderResponse>> getUserOrders(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        int boundedPage = Math.max(0, page);
        int boundedSize = Math.min(Math.max(1, size), 50);
        Pageable pageable = PageRequest.of(boundedPage, boundedSize, Sort.by(Sort.Direction.DESC, "createdAt"));

        return ResponseEntity.ok(orderService.getUserOrders(principal.getId(), pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get personal order details", description = "Retrieves order details by ID. Strictly validates that order belongs to authenticated customer.")
    public ResponseEntity<OrderResponse> getUserOrderById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(orderService.getUserOrderById(principal.getId(), id));
    }
}
