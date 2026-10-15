-- =============================================================================
-- V2: Seed Initial Categories & Realistic Demo Products for SecureCart
-- Demo Currency: INR (₹)
-- =============================================================================

-- Seed Categories
INSERT INTO categories (id, name, description, created_at, updated_at) VALUES
(1, 'Electronics', 'Flagship laptops, ultra-responsive displays, and portable computing essentials.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Audio & Sound', 'Studio-grade noise-cancelling headphones, true wireless earbuds, and speakers.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'Wearables', 'Premium fitness trackers, smartwatches with ECG, and health accessories.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'Desk & Workspace', 'Ergonomic mechanical keyboards, precision mice, and desk protection pads.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'Power & Accessories', 'GaN high-speed chargers, braided Thunderbolt cables, and magnetic stands.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Seed Products
INSERT INTO products (id, category_id, name, description, price, stock_quantity, image_url, is_active, version, created_at, updated_at) VALUES
(1, 1, 'ProBook Ultra 16" OLED Laptop', 'Powered by 14-core processor, 32GB LPDDR5X RAM, 1TB NVMe Gen4 SSD, and a color-calibrated 3.2K 120Hz OLED display.', 149999.00, 25, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80', TRUE, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 1, 'Quantum 27" 4K HDR Monitor', '27-inch IPS panel with 99% DCI-P3 coverage, 144Hz refresh rate, USB-C 90W power delivery, and tilt-swivel stand.', 42999.00, 40, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80', TRUE, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 2, 'AeroSound Pro Wireless ANC Headphones', 'Hybrid Active Noise Cancellation with transparency mode, 40-hour battery life, lossless LDAC codec, and memory foam earcups.', 18999.00, 60, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', TRUE, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 2, 'Pulse True Wireless Earbuds', 'IPX7 water resistant, dual beamforming microphones with AI background filtering, Qi wireless charging case, and 32hr playback.', 7499.00, 85, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80', TRUE, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 3, 'Titan Chrono Smartwatch GPS', 'Sapphire crystal face, aerospace titanium casing, continuous dual-frequency GPS, heart-rate variability, and SpO2 sensor.', 27999.00, 30, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80', TRUE, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 3, 'FitTrack Active Fitness Band', 'Ultra-lightweight 24g fitness tracker with AMOLED touch screen, 50m water resistance, sleep score, and 14-day battery life.', 3499.00, 110, 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=800&q=80', TRUE, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(7, 4, 'Apex Mechanical Keypad (Hot-Swappable)', 'Gasket-mounted 75% layout, pre-lubed linear switches, sound-dampening silicone foam, RGB backlighting, and Bluetooth 5.2.', 9999.00, 45, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80', TRUE, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(8, 4, 'Precision Master Ergonomic Mouse', '4000 DPI Darkfield sensor tracks on glass, hyper-fast electromagnetic scroll wheel, and ergonomic sculpted thumb rest.', 6899.00, 70, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80', TRUE, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(9, 5, 'HyperCharge 100W GaN 4-Port Charger', 'Next-generation Gallium Nitride (GaN) technology with 3 USB-C and 1 USB-A ports. Fast charges laptop and phone simultaneously.', 3999.00, 95, 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80', TRUE, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(10, 5, 'Braided Armored Thunderbolt 4 Cable (2m)', 'Certified 40Gbps high-speed data transfer, 100W Power Delivery, 8K video output, reinforced with DuPont Kevlar fiber.', 1999.00, 150, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80', TRUE, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(11, 4, 'Wool Felt & Full-Grain Leather Desk Mat', 'Large 900x400mm waterproof desk blotter protecting workspace surface while providing effortless glide for optical mouse.', 1799.00, 80, 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80', TRUE, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(12, 1, 'StreamCam 4K Studio Webcam', 'Ultra HD 4K sensor at 60FPS, dual stereo microphones with active noise suppression, auto-framing AI, and privacy shutter.', 11999.00, 35, 'https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=800&q=80', TRUE, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
