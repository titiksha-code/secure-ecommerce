package com.securecart.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class CheckoutRequest {

    @NotBlank(message = "Recipient full name is required")
    @Size(max = 150, message = "Recipient full name cannot exceed 150 characters")
    private String shippingFullName;

    @NotBlank(message = "Address line 1 is required")
    @Size(max = 255, message = "Address line 1 cannot exceed 255 characters")
    private String shippingAddressLine1;

    @Size(max = 255, message = "Address line 2 cannot exceed 255 characters")
    private String shippingAddressLine2;

    @NotBlank(message = "City is required")
    @Size(max = 100, message = "City cannot exceed 100 characters")
    private String shippingCity;

    @NotBlank(message = "State/Province is required")
    @Size(max = 100, message = "State/Province cannot exceed 100 characters")
    private String shippingState;

    @NotBlank(message = "Postal code is required")
    @Pattern(regexp = "^[0-9A-Za-z -]{3,10}$", message = "Postal code must be between 3 and 10 alphanumeric characters")
    private String shippingPostalCode;

    @NotBlank(message = "Country is required")
    @Size(max = 100, message = "Country cannot exceed 100 characters")
    private String shippingCountry;

    @NotBlank(message = "Contact phone number is required")
    @Pattern(regexp = "^[+0-9 -]{7,20}$", message = "Phone number must be a valid international or domestic format (7-20 digits)")
    private String shippingPhone;

    private String paymentMethod = "CASH_ON_DELIVERY";

    public CheckoutRequest() {}

    public CheckoutRequest(String shippingFullName, String shippingAddressLine1, String shippingAddressLine2,
                           String shippingCity, String shippingState, String shippingPostalCode,
                           String shippingCountry, String shippingPhone, String paymentMethod) {
        this.shippingFullName = shippingFullName;
        this.shippingAddressLine1 = shippingAddressLine1;
        this.shippingAddressLine2 = shippingAddressLine2;
        this.shippingCity = shippingCity;
        this.shippingState = shippingState;
        this.shippingPostalCode = shippingPostalCode;
        this.shippingCountry = shippingCountry;
        this.shippingPhone = shippingPhone;
        this.paymentMethod = paymentMethod != null ? paymentMethod : "CASH_ON_DELIVERY";
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String shippingFullName;
        private String shippingAddressLine1;
        private String shippingAddressLine2;
        private String shippingCity;
        private String shippingState;
        private String shippingPostalCode;
        private String shippingCountry;
        private String shippingPhone;
        private String paymentMethod = "CASH_ON_DELIVERY";

        public Builder shippingFullName(String shippingFullName) { this.shippingFullName = shippingFullName; return this; }
        public Builder shippingAddressLine1(String shippingAddressLine1) { this.shippingAddressLine1 = shippingAddressLine1; return this; }
        public Builder shippingAddressLine2(String shippingAddressLine2) { this.shippingAddressLine2 = shippingAddressLine2; return this; }
        public Builder shippingCity(String shippingCity) { this.shippingCity = shippingCity; return this; }
        public Builder shippingState(String shippingState) { this.shippingState = shippingState; return this; }
        public Builder shippingPostalCode(String shippingPostalCode) { this.shippingPostalCode = shippingPostalCode; return this; }
        public Builder shippingCountry(String shippingCountry) { this.shippingCountry = shippingCountry; return this; }
        public Builder shippingPhone(String shippingPhone) { this.shippingPhone = shippingPhone; return this; }
        public Builder paymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; return this; }

        public CheckoutRequest build() {
            return new CheckoutRequest(shippingFullName, shippingAddressLine1, shippingAddressLine2,
                    shippingCity, shippingState, shippingPostalCode, shippingCountry, shippingPhone, paymentMethod);
        }
    }

    public String getShippingFullName() { return shippingFullName; }
    public void setShippingFullName(String shippingFullName) { this.shippingFullName = shippingFullName; }
    public String getShippingAddressLine1() { return shippingAddressLine1; }
    public void setShippingAddressLine1(String shippingAddressLine1) { this.shippingAddressLine1 = shippingAddressLine1; }
    public String getShippingAddressLine2() { return shippingAddressLine2; }
    public void setShippingAddressLine2(String shippingAddressLine2) { this.shippingAddressLine2 = shippingAddressLine2; }
    public String getShippingCity() { return shippingCity; }
    public void setShippingCity(String shippingCity) { this.shippingCity = shippingCity; }
    public String getShippingState() { return shippingState; }
    public void setShippingState(String shippingState) { this.shippingState = shippingState; }
    public String getShippingPostalCode() { return shippingPostalCode; }
    public void setShippingPostalCode(String shippingPostalCode) { this.shippingPostalCode = shippingPostalCode; }
    public String getShippingCountry() { return shippingCountry; }
    public void setShippingCountry(String shippingCountry) { this.shippingCountry = shippingCountry; }
    public String getShippingPhone() { return shippingPhone; }
    public void setShippingPhone(String shippingPhone) { this.shippingPhone = shippingPhone; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
}
