package com.securecart.service;

import com.securecart.dto.response.ProductResponse;
import com.securecart.entity.Category;
import com.securecart.entity.Product;
import com.securecart.exception.BadRequestException;
import com.securecart.mapper.ProductMapper;
import com.securecart.repository.CategoryRepository;
import com.securecart.repository.ProductRepository;
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
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    private ProductMapper productMapper = new ProductMapper();

    private ProductService productService;

    private Product sampleProduct;

    @BeforeEach
    void setUp() {
        productService = new ProductService(
                productRepository,
                categoryRepository,
                productMapper
        );

        Category category = Category.builder().id(1L).name("Security Keys").build();
        sampleProduct = Product.builder()
                .id(10L)
                .name("Hardware Key")
                .price(new BigDecimal("49.99"))
                .stockQuantity(20)
                .category(category)
                .active(true)
                .build();
    }

    @Test
    @DisplayName("Should successfully update stock quantity using locked query")
    void updateProductStock_Success() {
        when(productRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(sampleProduct));
        when(productRepository.save(sampleProduct)).thenReturn(sampleProduct);

        ProductResponse response = productService.updateProductStock(10L, 50);

        assertThat(response).isNotNull();
        assertThat(sampleProduct.getStockQuantity()).isEqualTo(50);
        assertThat(response.getStockQuantity()).isEqualTo(50);
        verify(productRepository, times(1)).save(sampleProduct);
    }

    @Test
    @DisplayName("Should throw BadRequestException when updating to negative stock")
    void updateProductStock_NegativeStock_ThrowsException() {
        assertThatThrownBy(() -> productService.updateProductStock(10L, -5))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("cannot be negative");

        verify(productRepository, never()).findByIdForUpdate(any());
    }

    @Test
    @DisplayName("Should toggle active status from true to false")
    void toggleProductStatus_Success() {
        when(productRepository.findById(10L)).thenReturn(Optional.of(sampleProduct));
        when(productRepository.save(sampleProduct)).thenReturn(sampleProduct);

        ProductResponse response = productService.toggleProductStatus(10L);

        assertThat(response).isNotNull();
        assertThat(sampleProduct.isActive()).isFalse();
        assertThat(response.isActive()).isFalse();
        verify(productRepository, times(1)).save(sampleProduct);
    }
}
