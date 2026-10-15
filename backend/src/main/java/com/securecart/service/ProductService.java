package com.securecart.service;

import com.securecart.dto.request.ProductCreateRequest;
import com.securecart.dto.request.ProductUpdateRequest;
import com.securecart.dto.response.PaginatedResponse;
import com.securecart.dto.response.ProductResponse;
import com.securecart.entity.Category;
import com.securecart.entity.Product;
import com.securecart.exception.BadRequestException;
import com.securecart.exception.ResourceNotFoundException;
import com.securecart.mapper.ProductMapper;
import com.securecart.repository.CategoryRepository;
import com.securecart.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
public class ProductService {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id", "name", "price", "stockQuantity", "createdAt"
    );
    private static final int MAX_PAGE_SIZE = 50;

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository, ProductMapper productMapper) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.productMapper = productMapper;
    }

    @Transactional(readOnly = true)
    public PaginatedResponse<ProductResponse> getCustomerProducts(
            Long categoryId, String keyword, int page, int size, String sortBy, String direction) {

        Pageable pageable = createValidatedPageable(page, size, sortBy, direction);
        Page<Product> productPage = productRepository.findActiveProductsWithCategory(categoryId, keyword, pageable);
        return PaginatedResponse.fromPage(productPage.map(productMapper::toResponse));
    }

    @Transactional(readOnly = true)
    public PaginatedResponse<ProductResponse> getAdminProducts(
            Long categoryId, String keyword, Boolean active, int page, int size, String sortBy, String direction) {

        Pageable pageable = createValidatedPageable(page, size, sortBy, direction);
        Page<Product> productPage = productRepository.findAllProductsAdmin(categoryId, keyword, active, pageable);
        return PaginatedResponse.fromPage(productPage.map(productMapper::toResponse));
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findByIdWithCategory(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return productMapper.toResponse(product);
    }

    @Transactional
    public ProductResponse createProduct(ProductCreateRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        Product product = Product.builder()
                .category(category)
                .name(request.getName().trim())
                .description(request.getDescription())
                .price(request.getPrice())
                .stockQuantity(request.getStockQuantity())
                .imageUrl(request.getImageUrl())
                .active(true)
                .build();

        return productMapper.toResponse(productRepository.save(product));
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductUpdateRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        product.setCategory(category);
        product.setName(request.getName().trim());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setImageUrl(request.getImageUrl());
        product.setActive(request.getActive());

        return productMapper.toResponse(productRepository.save(product));
    }

    /**
     * Updates inventory using pessimistic lock to participate in the same concurrency locking policy
     * as customer checkout transactions.
     */
    @Transactional
    public ProductResponse updateProductStock(Long id, int newStock) {
        if (newStock < 0) {
            throw new BadRequestException("Stock quantity cannot be negative.");
        }

        Product product = productRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        product.setStockQuantity(newStock);
        return productMapper.toResponse(productRepository.save(product));
    }

    /**
     * Soft archives or reactivates a product. Preserves historical integrity of past orders.
     */
    @Transactional
    public ProductResponse toggleProductStatus(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        product.setActive(!product.isActive());
        return productMapper.toResponse(productRepository.save(product));
    }

    private Pageable createValidatedPageable(int page, int size, String sortBy, String direction) {
        int boundedPage = Math.max(0, page);
        int boundedSize = Math.min(Math.max(1, size), MAX_PAGE_SIZE);

        String validatedSort = ALLOWED_SORT_FIELDS.contains(sortBy) ? sortBy : "createdAt";
        Sort.Direction sortDirection = "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;

        return PageRequest.of(boundedPage, boundedSize, Sort.by(sortDirection, validatedSort));
    }
}
