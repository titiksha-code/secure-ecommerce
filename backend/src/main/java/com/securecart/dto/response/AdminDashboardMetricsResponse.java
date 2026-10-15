package com.securecart.dto.response;

import java.math.BigDecimal;

public class AdminDashboardMetricsResponse {
    private long totalOrders;
    private BigDecimal totalOrderValue;
    private BigDecimal deliveredOrderValue;
    private long placedOrdersCount;
    private long processingOrdersCount;
    private long shippedOrdersCount;
    private long deliveredOrdersCount;
    private long cancelledOrdersCount;
    private long activeProductsCount;
    private long totalCategoriesCount;
    private long registeredCustomersCount;

    public AdminDashboardMetricsResponse() {}

    public AdminDashboardMetricsResponse(long totalOrders, BigDecimal totalOrderValue, BigDecimal deliveredOrderValue,
                                         long placedOrdersCount, long processingOrdersCount, long shippedOrdersCount,
                                         long deliveredOrdersCount, long cancelledOrdersCount, long activeProductsCount,
                                         long totalCategoriesCount, long registeredCustomersCount) {
        this.totalOrders = totalOrders;
        this.totalOrderValue = totalOrderValue;
        this.deliveredOrderValue = deliveredOrderValue;
        this.placedOrdersCount = placedOrdersCount;
        this.processingOrdersCount = processingOrdersCount;
        this.shippedOrdersCount = shippedOrdersCount;
        this.deliveredOrdersCount = deliveredOrdersCount;
        this.cancelledOrdersCount = cancelledOrdersCount;
        this.activeProductsCount = activeProductsCount;
        this.totalCategoriesCount = totalCategoriesCount;
        this.registeredCustomersCount = registeredCustomersCount;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private long totalOrders;
        private BigDecimal totalOrderValue;
        private BigDecimal deliveredOrderValue;
        private long placedOrdersCount;
        private long processingOrdersCount;
        private long shippedOrdersCount;
        private long deliveredOrdersCount;
        private long cancelledOrdersCount;
        private long activeProductsCount;
        private long totalCategoriesCount;
        private long registeredCustomersCount;

        public Builder totalOrders(long totalOrders) { this.totalOrders = totalOrders; return this; }
        public Builder totalOrderValue(BigDecimal totalOrderValue) { this.totalOrderValue = totalOrderValue; return this; }
        public Builder deliveredOrderValue(BigDecimal deliveredOrderValue) { this.deliveredOrderValue = deliveredOrderValue; return this; }
        public Builder placedOrdersCount(long placedOrdersCount) { this.placedOrdersCount = placedOrdersCount; return this; }
        public Builder processingOrdersCount(long processingOrdersCount) { this.processingOrdersCount = processingOrdersCount; return this; }
        public Builder shippedOrdersCount(long shippedOrdersCount) { this.shippedOrdersCount = shippedOrdersCount; return this; }
        public Builder deliveredOrdersCount(long deliveredOrdersCount) { this.deliveredOrdersCount = deliveredOrdersCount; return this; }
        public Builder cancelledOrdersCount(long cancelledOrdersCount) { this.cancelledOrdersCount = cancelledOrdersCount; return this; }
        public Builder activeProductsCount(long activeProductsCount) { this.activeProductsCount = activeProductsCount; return this; }
        public Builder totalCategoriesCount(long totalCategoriesCount) { this.totalCategoriesCount = totalCategoriesCount; return this; }
        public Builder registeredCustomersCount(long registeredCustomersCount) { this.registeredCustomersCount = registeredCustomersCount; return this; }

        public AdminDashboardMetricsResponse build() {
            return new AdminDashboardMetricsResponse(totalOrders, totalOrderValue, deliveredOrderValue,
                    placedOrdersCount, processingOrdersCount, shippedOrdersCount, deliveredOrdersCount,
                    cancelledOrdersCount, activeProductsCount, totalCategoriesCount, registeredCustomersCount);
        }
    }

    public long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(long totalOrders) { this.totalOrders = totalOrders; }
    public BigDecimal getTotalOrderValue() { return totalOrderValue; }
    public void setTotalOrderValue(BigDecimal totalOrderValue) { this.totalOrderValue = totalOrderValue; }
    public BigDecimal getDeliveredOrderValue() { return deliveredOrderValue; }
    public void setDeliveredOrderValue(BigDecimal deliveredOrderValue) { this.deliveredOrderValue = deliveredOrderValue; }
    public long getPlacedOrdersCount() { return placedOrdersCount; }
    public void setPlacedOrdersCount(long placedOrdersCount) { this.placedOrdersCount = placedOrdersCount; }
    public long getProcessingOrdersCount() { return processingOrdersCount; }
    public void setProcessingOrdersCount(long processingOrdersCount) { this.processingOrdersCount = processingOrdersCount; }
    public long getShippedOrdersCount() { return shippedOrdersCount; }
    public void setShippedOrdersCount(long shippedOrdersCount) { this.shippedOrdersCount = shippedOrdersCount; }
    public long getDeliveredOrdersCount() { return deliveredOrdersCount; }
    public void setDeliveredOrdersCount(long deliveredOrdersCount) { this.deliveredOrdersCount = deliveredOrdersCount; }
    public long getCancelledOrdersCount() { return cancelledOrdersCount; }
    public void setCancelledOrdersCount(long cancelledOrdersCount) { this.cancelledOrdersCount = cancelledOrdersCount; }
    public long getActiveProductsCount() { return activeProductsCount; }
    public void setActiveProductsCount(long activeProductsCount) { this.activeProductsCount = activeProductsCount; }
    public long getTotalCategoriesCount() { return totalCategoriesCount; }
    public void setTotalCategoriesCount(long totalCategoriesCount) { this.totalCategoriesCount = totalCategoriesCount; }
    public long getRegisteredCustomersCount() { return registeredCustomersCount; }
    public void setRegisteredCustomersCount(long registeredCustomersCount) { this.registeredCustomersCount = registeredCustomersCount; }
}
