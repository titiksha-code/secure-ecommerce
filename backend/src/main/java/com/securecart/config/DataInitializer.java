package com.securecart.config;

import com.securecart.entity.Cart;
import com.securecart.entity.Category;
import com.securecart.entity.Product;
import com.securecart.entity.Role;
import com.securecart.entity.User;
import com.securecart.repository.CartRepository;
import com.securecart.repository.CategoryRepository;
import com.securecart.repository.ProductRepository;
import com.securecart.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           CartRepository cartRepository,
                           CategoryRepository categoryRepository,
                           ProductRepository productRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.cartRepository = cartRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Value("${app.admin.email:admin@securecart.com}")
    private String adminEmail;

    @Value("${app.admin.password:AdminSecure@2026!}")
    private String adminPassword;

    @Value("${app.admin.first-name:System}")
    private String adminFirstName;

    @Value("${app.admin.last-name:Administrator}")
    private String adminLastName;

    @Override
    @Transactional
    public void run(String... args) {
        seedAdmin();
        seedCustomer();
        seedCatalogIfEmpty();
    }

    private void seedAdmin() {
        String normalizedEmail = adminEmail.trim().toLowerCase();
        if (userRepository.findByEmailIgnoreCase(normalizedEmail).isEmpty()) {
            User admin = User.builder()
                    .email(normalizedEmail)
                    .passwordHash(passwordEncoder.encode(adminPassword))
                    .firstName(adminFirstName.trim())
                    .lastName(adminLastName.trim())
                    .role(Role.ROLE_ADMIN)
                    .enabled(true)
                    .build();

            User saved = userRepository.save(admin);
            cartRepository.save(Cart.builder().user(saved).build());
            log.info("Initialized default system administrator account: {}", normalizedEmail);
        }
    }

    private void seedCustomer() {
        String customerEmail = "john@example.com";
        if (userRepository.findByEmailIgnoreCase(customerEmail).isEmpty()) {
            User customer = User.builder()
                    .email(customerEmail)
                    .passwordHash(passwordEncoder.encode("CustomerPass@123"))
                    .firstName("John")
                    .lastName("Doe")
                    .role(Role.ROLE_CUSTOMER)
                    .enabled(true)
                    .build();

            User saved = userRepository.save(customer);
            cartRepository.save(Cart.builder().user(saved).build());
            log.info("Initialized demo customer account: {}", customerEmail);
        }
    }

    private void seedCatalogIfEmpty() {
        if (categoryRepository.count() > 0) {
            return;
        }

        log.info("Catalog is empty. Seeding initial categories and products...");

        Category electronics = categoryRepository.save(Category.builder().name("Electronics").description("Flagship laptops, ultra-responsive displays, and portable computing.").build());
        Category audio = categoryRepository.save(Category.builder().name("Audio & Sound").description("Studio-grade noise-cancelling headphones and true wireless earbuds.").build());
        Category wearables = categoryRepository.save(Category.builder().name("Wearables").description("Premium fitness trackers and smartwatches with ECG.").build());
        Category workspace = categoryRepository.save(Category.builder().name("Desk & Workspace").description("Ergonomic mechanical keyboards and precision mice.").build());
        Category power = categoryRepository.save(Category.builder().name("Power & Accessories").description("GaN high-speed chargers and braided Thunderbolt cables.").build());

        List<Product> products = List.of(
                Product.builder().category(electronics).name("ProBook Ultra 16\" OLED Laptop").description("Powered by 14-core processor, 32GB RAM, 1TB NVMe Gen4 SSD, and 3.2K 120Hz OLED display.").price(new BigDecimal("1499.00")).stockQuantity(25).imageUrl("https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80").active(true).build(),
                Product.builder().category(electronics).name("Quantum 27\" 4K HDR Monitor").description("27-inch IPS panel with 99% DCI-P3 coverage, 144Hz refresh rate, USB-C 90W power delivery.").price(new BigDecimal("429.00")).stockQuantity(40).imageUrl("https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80").active(true).build(),
                Product.builder().category(audio).name("AeroSound Pro Wireless ANC Headphones").description("Hybrid Active Noise Cancellation with transparency mode, 40-hour battery life, lossless LDAC codec.").price(new BigDecimal("189.00")).stockQuantity(60).imageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80").active(true).build(),
                Product.builder().category(audio).name("Pulse True Wireless Earbuds").description("IPX7 water resistant, dual beamforming microphones with AI background filtering, 32hr playback.").price(new BigDecimal("79.00")).stockQuantity(85).imageUrl("https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80").active(true).build(),
                Product.builder().category(wearables).name("Titan Chrono Smartwatch GPS").description("Sapphire crystal face, aerospace titanium casing, continuous dual-frequency GPS, SpO2 sensor.").price(new BigDecimal("279.00")).stockQuantity(30).imageUrl("https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80").active(true).build(),
                Product.builder().category(wearables).name("FitTrack Active Fitness Band").description("Ultra-lightweight 24g fitness tracker with AMOLED touch screen, 50m water resistance, 14-day battery.").price(new BigDecimal("49.00")).stockQuantity(110).imageUrl("https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=800&q=80").active(true).build(),
                Product.builder().category(workspace).name("Apex Mechanical Keypad (Hot-Swappable)").description("Gasket-mounted 75% layout, pre-lubed linear switches, RGB backlighting, Bluetooth 5.2.").price(new BigDecimal("99.00")).stockQuantity(45).imageUrl("https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80").active(true).build(),
                Product.builder().category(workspace).name("Precision Master Ergonomic Mouse").description("4000 DPI Darkfield sensor tracks on glass, hyper-fast electromagnetic scroll wheel.").price(new BigDecimal("69.00")).stockQuantity(70).imageUrl("https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80").active(true).build(),
                Product.builder().category(power).name("HyperCharge 100W GaN 4-Port Charger").description("Next-generation GaN technology with 3 USB-C and 1 USB-A ports. Fast charges laptop and phone.").price(new BigDecimal("39.00")).stockQuantity(95).imageUrl("https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80").active(true).build(),
                Product.builder().category(power).name("Braided Armored Thunderbolt 4 Cable (2m)").description("Certified 40Gbps high-speed data transfer, 100W Power Delivery, 8K video output.").price(new BigDecimal("24.00")).stockQuantity(150).imageUrl("https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80").active(true).build()
        );

        productRepository.saveAll(products);
        log.info("Successfully seeded 5 categories and {} products.", products.size());
    }
}
