package com.securecart.controller;

import com.securecart.dto.response.PaginatedResponse;
import com.securecart.dto.response.ProductResponse;
import com.securecart.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/products")
@Tag(name = "Products", description = "Public storefront product catalog browsing endpoints")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    @Operation(summary = "Browse active products", description = "Paginated product search with category filtering and sorting.")
    public ResponseEntity<PaginatedResponse<ProductResponse>> getProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        return ResponseEntity.ok(
                productService.getCustomerProducts(categoryId, keyword, page, size, sortBy, direction)
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product details", description = "Fetches complete product details with category, price, and stock status.")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }
}
