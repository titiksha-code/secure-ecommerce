package com.securecart.controller;

import com.securecart.dto.request.UpdateOrderStatusRequest;
import com.securecart.dto.response.OrderResponse;
import com.securecart.dto.response.PaginatedResponse;
import com.securecart.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/orders")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin: Orders", description = "Order management and status transition endpoints")
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    @Operation(summary = "List all customer orders", description = "Retrieves paginated list of all orders across the system.")
    public ResponseEntity<PaginatedResponse<OrderResponse>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        int boundedPage = Math.max(0, page);
        int boundedSize = Math.min(Math.max(1, size), 50);
        Pageable pageable = PageRequest.of(boundedPage, boundedSize, Sort.by(Sort.Direction.DESC, "createdAt"));

        return ResponseEntity.ok(orderService.getAllOrdersAdmin(pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order details (Admin)", description = "Retrieves full order details including line item snapshots and shipping address.")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getAdminOrderById(id));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update order status", description = "Transitions order status through permitted state machine paths.")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request
    ) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, request.getStatus()));
    }
}
