package com.securecart.service;

import com.securecart.dto.response.AdminDashboardMetricsResponse;
import com.securecart.entity.OrderStatus;
import com.securecart.entity.Role;
import com.securecart.repository.CategoryRepository;
import com.securecart.repository.OrderRepository;
import com.securecart.repository.ProductRepository;
import com.securecart.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class AdminDashboardService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public AdminDashboardService(OrderRepository orderRepository, ProductRepository productRepository, CategoryRepository categoryRepository, UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public AdminDashboardMetricsResponse getMetrics() {
        long totalOrders = orderRepository.count();
        BigDecimal totalOrderValue = orderRepository.calculateTotalOrderValue();
        BigDecimal deliveredOrderValue = orderRepository.calculateOrderValueByStatus(OrderStatus.DELIVERED);

        long placedCount = orderRepository.countByStatus(OrderStatus.PLACED);
        long processingCount = orderRepository.countByStatus(OrderStatus.PROCESSING);
        long shippedCount = orderRepository.countByStatus(OrderStatus.SHIPPED);
        long deliveredCount = orderRepository.countByStatus(OrderStatus.DELIVERED);
        long cancelledCount = orderRepository.countByStatus(OrderStatus.CANCELLED);

        long activeProducts = productRepository.countByActiveTrue();
        long totalCategories = categoryRepository.count();
        long registeredCustomers = userRepository.countByRole(Role.ROLE_CUSTOMER);

        return AdminDashboardMetricsResponse.builder()
                .totalOrders(totalOrders)
                .totalOrderValue(totalOrderValue)
                .deliveredOrderValue(deliveredOrderValue)
                .placedOrdersCount(placedCount)
                .processingOrdersCount(processingCount)
                .shippedOrdersCount(shippedCount)
                .deliveredOrdersCount(deliveredCount)
                .cancelledOrdersCount(cancelledCount)
                .activeProductsCount(activeProducts)
                .totalCategoriesCount(totalCategories)
                .registeredCustomersCount(registeredCustomers)
                .build();
    }
}
