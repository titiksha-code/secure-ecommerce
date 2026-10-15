package com.securecart.service;

import com.securecart.dto.request.AddToCartRequest;
import com.securecart.dto.request.UpdateCartItemRequest;
import com.securecart.dto.response.CartResponse;
import com.securecart.entity.Cart;
import com.securecart.entity.CartItem;
import com.securecart.entity.Product;
import com.securecart.entity.User;
import com.securecart.exception.BadRequestException;
import com.securecart.exception.ResourceNotFoundException;
import com.securecart.mapper.CartMapper;
import com.securecart.repository.CartItemRepository;
import com.securecart.repository.CartRepository;
import com.securecart.repository.ProductRepository;
import com.securecart.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartMapper cartMapper;

    public CartService(CartRepository cartRepository, CartItemRepository cartItemRepository, ProductRepository productRepository, UserRepository userRepository, CartMapper cartMapper) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.cartMapper = cartMapper;
    }

    @Transactional
    public CartResponse getCartForUser(Long userId) {
        Cart cart = getOrCreateCart(userId);
        return cartMapper.toResponse(cart);
    }

    @Transactional
    public CartResponse addToCart(Long userId, AddToCartRequest request) {
        if (request.getQuantity() <= 0) {
            throw new BadRequestException("Quantity must be greater than zero.");
        }

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        if (!product.isActive()) {
            throw new BadRequestException("Product '" + product.getName() + "' is not currently available for purchase.");
        }

        Cart cart = getOrCreateCart(userId);

        Optional<CartItem> existingItemOpt = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId());

        if (existingItemOpt.isPresent()) {
            CartItem existingItem = existingItemOpt.get();
            int newQuantity = existingItem.getQuantity() + request.getQuantity();

            if (newQuantity > product.getStockQuantity()) {
                throw new BadRequestException(
                        "Cannot add " + request.getQuantity() + " more items. Total requested (" +
                        newQuantity + ") exceeds available stock (" + product.getStockQuantity() + ")."
                );
            }

            existingItem.setQuantity(newQuantity);
            cartItemRepository.save(existingItem);
        } else {
            if (request.getQuantity() > product.getStockQuantity()) {
                throw new BadRequestException(
                        "Requested quantity (" + request.getQuantity() + ") exceeds available stock (" +
                        product.getStockQuantity() + ")."
                );
            }

            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .build();

            cart.addItem(newItem);
            cartItemRepository.save(newItem);
        }

        // Re-fetch with details to return fully calculated cart
        Cart updatedCart = cartRepository.findByUserIdWithDetails(userId)
                .orElse(cart);
        return cartMapper.toResponse(updatedCart);
    }

    @Transactional
    public CartResponse updateCartItem(Long userId, Long cartItemId, UpdateCartItemRequest request) {
        if (request.getQuantity() <= 0) {
            throw new BadRequestException("Quantity must be greater than zero.");
        }

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + cartItemId));

        // Strict ownership verification
        if (!item.getCart().getUser().getId().equals(userId)) {
            throw new BadRequestException("You do not own this cart item.");
        }

        Product product = item.getProduct();
        if (request.getQuantity() > product.getStockQuantity()) {
            throw new BadRequestException(
                    "Requested quantity (" + request.getQuantity() + ") exceeds available stock (" +
                    product.getStockQuantity() + ")."
            );
        }

        item.setQuantity(request.getQuantity());
        cartItemRepository.save(item);

        Cart cart = cartRepository.findByUserIdWithDetails(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));
        return cartMapper.toResponse(cart);
    }

    @Transactional
    public CartResponse removeCartItem(Long userId, Long cartItemId) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + cartItemId));

        // Strict ownership verification
        if (!item.getCart().getUser().getId().equals(userId)) {
            throw new BadRequestException("You do not own this cart item.");
        }

        Cart cart = item.getCart();
        cart.removeItem(item);
        cartItemRepository.delete(item);

        Cart refreshedCart = cartRepository.findByUserIdWithDetails(userId)
                .orElse(cart);
        return cartMapper.toResponse(refreshedCart);
    }

    @Transactional
    public CartResponse clearCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        cart.clearItems();
        cartRepository.save(cart);

        return cartMapper.toResponse(cart);
    }

    private Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserIdWithDetails(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
                    Cart newCart = Cart.builder().user(user).build();
                    return cartRepository.save(newCart);
                });
    }
}
