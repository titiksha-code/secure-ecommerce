package com.securecart.controller;

import com.securecart.dto.request.ProductCreateRequest;
import com.securecart.dto.request.ProductUpdateRequest;
import com.securecart.dto.request.StockUpdateRequest;
import com.securecart.dto.response.PaginatedResponse;
import com.securecart.dto.response.ProductResponse;
import com.securecart.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/products")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin: Products", description = "Product catalog and inventory administration endpoints")
public class AdminProductController {

    private final ProductService productService;

    public AdminProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    @Operation(summary = "List all products (Admin)", description = "Returns active and archived products with filters.")
    public ResponseEntity<PaginatedResponse<ProductResponse>> getAdminProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        return ResponseEntity.ok(
                productService.getAdminProducts(categoryId, keyword, active, page, size, sortBy, direction)
        );
    }

    @PostMapping
    @Operation(summary = "Create product", description = "Creates a new catalog product.")
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productService.createProduct(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update product", description = "Updates product details and status.")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductUpdateRequest request
    ) {
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }

    @PatchMapping("/{id}/stock")
    @Operation(summary = "Update inventory stock", description = "Adjusts available quantity using pessimistic write locks.")
    public ResponseEntity<ProductResponse> updateStock(
            @PathVariable Long id,
            @Valid @RequestBody StockUpdateRequest request
    ) {
        return ResponseEntity.ok(productService.updateProductStock(id, request.getStockQuantity()));
    }

    @PatchMapping("/{id}/toggle-status")
    @Operation(summary = "Archive or reactivate product", description = "Toggles product active status without cascading deletes into past order history.")
    public ResponseEntity<ProductResponse> toggleStatus(@PathVariable Long id) {
        return ResponseEntity.ok(productService.toggleProductStatus(id));
    }
}
