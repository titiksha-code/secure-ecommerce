package com.securecart.controller;

import com.securecart.dto.response.AdminDashboardMetricsResponse;
import com.securecart.service.AdminDashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin: Dashboard", description = "Administrative telemetry and analytics metrics endpoints")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    public AdminDashboardController(AdminDashboardService adminDashboardService) {
        this.adminDashboardService = adminDashboardService;
    }

    @GetMapping
    @Operation(summary = "Get dashboard analytics metrics", description = "Retrieves live telemetry on orders, inventory, customers, and order values.")
    public ResponseEntity<AdminDashboardMetricsResponse> getDashboardMetrics() {
        return ResponseEntity.ok(adminDashboardService.getMetrics());
    }
}
