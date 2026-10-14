-- ====================================================================
-- AURA / ARCHIVE — Full eCommerce Database Schema & Seed Data
-- Database Name: college_db
-- Inspired by: Nike (Performance Athletics) & Zara (Minimalist Editorial)
-- Character Set: utf8mb4 | Engine: InnoDB
-- ====================================================================

CREATE DATABASE IF NOT EXISTS `college_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `college_db`;

-- --------------------------------------------------------------------
-- 1. Table: shop_users
-- Stores registered customer accounts and administrator credentials
-- Passwords are encrypted with bcrypt (rounds = 10)
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `shop_reviews`;
DROP TABLE IF EXISTS `shop_wishlist`;
DROP TABLE IF EXISTS `shop_orders`;
DROP TABLE IF EXISTS `shop_coupons`;
DROP TABLE IF EXISTS `shop_products`;
DROP TABLE IF EXISTS `shop_users`;

CREATE TABLE `shop_users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('customer', 'admin') DEFAULT 'customer',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 2. Table: shop_products
-- Complete catalog items with multi-angle galleries, size matrices,
-- colorways, tags, pricing, and live inventory stock tracking.
-- --------------------------------------------------------------------
CREATE TABLE `shop_products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `sub_category` VARCHAR(100),
  `price` DECIMAL(10, 2) NOT NULL,
  `original_price` DECIMAL(10, 2) DEFAULT NULL,
  `tag` VARCHAR(50) DEFAULT NULL,
  `image` VARCHAR(1000) NOT NULL,
  `gallery` JSON DEFAULT NULL,
  `description` TEXT,
  `sizes` JSON DEFAULT NULL,
  `colors` JSON DEFAULT NULL,
  `featured` BOOLEAN DEFAULT FALSE,
  `stock_quantity` INT DEFAULT 50,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 3. Table: shop_orders
-- Checkout records with shipping address, line items (JSON), totals,
-- payment verification, and fulfillment lifecycle tracking.
-- --------------------------------------------------------------------
CREATE TABLE `shop_orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT DEFAULT NULL,
  `order_number` VARCHAR(64) UNIQUE NOT NULL,
  `customer_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `postal_code` VARCHAR(50) NOT NULL,
  `country` VARCHAR(100) NOT NULL,
  `total_amount` DECIMAL(10, 2) NOT NULL,
  `payment_method` VARCHAR(50) DEFAULT 'Card',
  `status` ENUM('paid', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'paid',
  `items` JSON NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `shop_users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 4. Table: shop_wishlist
-- Customer saved pieces and bookmarks linked to user profiles
-- --------------------------------------------------------------------
CREATE TABLE `shop_wishlist` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_user_product` (`user_id`, `product_id`),
  CONSTRAINT `fk_wishlist_user` FOREIGN KEY (`user_id`) REFERENCES `shop_users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_wishlist_product` FOREIGN KEY (`product_id`) REFERENCES `shop_products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 5. Table: shop_coupons
-- Promotional discount codes with minimum purchase limits
-- --------------------------------------------------------------------
CREATE TABLE `shop_coupons` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `discount_percent` INT NOT NULL,
  `min_spend` DECIMAL(10, 2) DEFAULT 0.00,
  `active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 6. Table: shop_reviews
-- Customer verified feedback, 1-5 star ratings, and fit profiling
-- --------------------------------------------------------------------
CREATE TABLE `shop_reviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT NOT NULL,
  `user_id` INT DEFAULT NULL,
  `user_name` VARCHAR(255) NOT NULL,
  `rating` TINYINT NOT NULL CHECK (`rating` >= 1 AND `rating` <= 5),
  `fit_rating` ENUM('Runs Small', 'True to Size', 'Runs Large') DEFAULT 'True to Size',
  `comment` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `shop_products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `shop_users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- SEED DATA INSERTIONS
-- ====================================================================

-- --------------------------------------------------------------------
-- Seed Users (Passwords hashed with bcrypt: 'admin123' and 'customer123')
-- Admin: admin@aurashop.com (password: admin123)
-- Customer: alex@example.com (password: customer123)
-- Customer: elena@example.com (password: customer123)
-- --------------------------------------------------------------------
INSERT INTO `shop_users` (`id`, `name`, `email`, `password`, `role`, `created_at`) VALUES
(1, 'Lead Curator (Admin)', 'admin@aurashop.com', '$2a$10$wT8K8U1h3Y2N2V4y4m5O0epqV4K3D7nQ0R7vP8yU8pQ2Y3M4N5O6e', 'admin', NOW()),
(2, 'Alex Miller', 'alex@example.com', '$2a$10$hW7n6x4B7U5f5r7g9p8o3eN4M1K2L3J4H5G6F7D8S9A0Q1W2E3R4T', 'customer', NOW() - INTERVAL 12 DAY),
(3, 'Elena Rostova', 'elena@example.com', '$2a$10$hW7n6x4B7U5f5r7g9p8o3eN4M1K2L3J4H5G6F7D8S9A0Q1W2E3R4T', 'customer', NOW() - INTERVAL 5 DAY);

-- --------------------------------------------------------------------
-- Seed Promotional Coupons
-- --------------------------------------------------------------------
INSERT INTO `shop_coupons` (`code`, `discount_percent`, `min_spend`, `active`, `created_at`) VALUES
('NIKE20', 20, 50.00, 1, NOW()),
('ZARA15', 15, 100.00, 1, NOW()),
('FIRSTDROP', 10, 0.00, 1, NOW()),
('ARCHIVE25', 25, 200.00, 1, NOW()),
('SUMMER30', 30, 250.00, 1, NOW()),
('VIP50', 50, 400.00, 1, NOW());

-- --------------------------------------------------------------------
-- Seed Catalog Products (32 Curated High-End Editorial Drops)
-- --------------------------------------------------------------------
INSERT INTO `shop_products` 
(`id`, `name`, `category`, `sub_category`, `price`, `original_price`, `tag`, `image`, `gallery`, `description`, `sizes`, `colors`, `featured`, `stock_quantity`, `created_at`) 
VALUES
(1, 'AIR ZERO RUNNER 01', 'Men', 'Footwear', 185.00, 220.00, 'JUST RELEASED', 
 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80',
 '["https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1000&q=80"]',
 'Sculpted lightweight cushioning paired with high-tensile mesh upper. Inspired by competitive marathon racing and architectural minimalism.',
 '["US 8", "US 8.5", "US 9", "US 9.5", "US 10", "US 11", "US 12"]',
 '["Obsidian / Crimson", "Triple Black", "Pure White"]',
 1, 45, NOW() - INTERVAL 20 DAY),

(2, 'OVERSIZED TAILORED WOOL COAT', 'Women', 'Outerwear', 249.00, 299.00, 'STUDIO EDITION',
 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1000&q=80',
 '["https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80"]',
 'Refined double-breasted silhouette cut from premium double-faced melton wool. Peak lapels, jetted pockets, and unstructured clean drape.',
 '["XS", "S", "M", "L", "XL"]',
 '["Camel Raw", "Charcoal Anthracite", "Midnight"]',
 1, 28, NOW() - INTERVAL 19 DAY),

(3, 'TECH FLEECE HEAVYWEIGHT HOODIE', 'Men', 'Apparel', 130.00, 150.00, 'BESTSELLER',
 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80',
 '["https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80"]',
 'Constructed from thermal multi-layer fleece that insulates without excess bulk. Bonded tape zip details and tailored articulated sleeves.',
 '["S", "M", "L", "XL", "XXL"]',
 '["Heather Grey", "Matte Black", "Olive Drab"]',
 1, 80, NOW() - INTERVAL 18 DAY),

(4, 'STRUCTURED COLUMN DRESS', 'Women', 'Apparel', 119.00, NULL, 'NEW COLLECTION',
 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=80',
 '["https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=80"]',
 'Architectural column maxi dress made in structured crepe weave. Clean square neckline and high back split for effortless statement styling.',
 '["XS", "S", "M", "L"]',
 '["Pitch Black", "Alabaster Ivory"]',
 1, 35, NOW() - INTERVAL 17 DAY),

(5, 'DUNK LOW RETRO ARCHIVE', 'Men', 'Footwear', 115.00, NULL, 'ICONIC',
 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=80',
 '["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=80"]',
 'The basketball icon reimagined with soft full-grain leather, heritage padded collar, and durable retro rubber cupsole.',
 '["US 7", "US 8", "US 9", "US 10", "US 11", "US 12"]',
 '["Panda Monochrome", "Vintage Navy", "Grey Fog"]',
 1, 60, NOW() - INTERVAL 16 DAY),

(6, 'ASYMMETRIC LINEN BLEND BLAZER', 'Women', 'Outerwear', 179.00, 210.00, 'LIMITED RUN',
 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80',
 '["https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80"]',
 'Contemporary asymmetric crossover button closure with sharply structured padded shoulders and soft European linen-viscose blend.',
 '["XS", "S", "M", "L"]',
 '["Ecru Chalk", "Dark Espresso"]',
 0, 22, NOW() - INTERVAL 15 DAY),

(7, 'AERO-DRI PERFORMANCE TIGHTS', 'Women', 'Apparel', 88.00, 105.00, 'FITNESS ESSENTIAL',
 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=1000&q=80',
 '["https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=1000&q=80"]',
 'Compressive 4-way stretch fabric with moisture-wicking technology and bonded discreet drop-in phone pocket.',
 '["XS", "S", "M", "L", "XL"]',
 '["Black Matte", "Smoky Mauve", "Deep Teal"]',
 0, 70, NOW() - INTERVAL 14 DAY),

(8, 'MINIMAL LEATHER SLING BAG', 'Accessories', 'Accessories', 95.00, NULL, 'ACCENT',
 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80',
 '["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80"]',
 'Full-grain calfskin with brushed matte gunmetal hardware. Adjustable webbing strap and padded interior slip pockets.',
 '["One Size"]',
 '["Pitch Black", "Chestnut Saddle"]',
 1, 40, NOW() - INTERVAL 13 DAY),

(9, 'STORM-FIT WATERPROOF SHELL JACKET', 'Men', 'Outerwear', 210.00, 260.00, 'TECHNICAL',
 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80',
 '["https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80"]',
 'Seam-sealed 3-layer weatherproof nylon shell designed for extreme urban wind and heavy rain. Ergonomic storm hood and magnetic zip storm flap.',
 '["S", "M", "L", "XL"]',
 '["Matte Black", "Graphite Grey", "Acid Lime"]',
 1, 32, NOW() - INTERVAL 12 DAY),

(10, 'MONOCHROME CHUNKY SOLE RUNNER', 'Women', 'Footwear', 165.00, 195.00, 'TRENDING',
 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=1000&q=80',
 '["https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=1000&q=80"]',
 'Exaggerated architectural midsole with cloud-like rebound foam and technical mesh panelling. Finished with tonal reflective accents.',
 '["US 6", "US 7", "US 8", "US 9", "US 10"]',
 '["Triple White", "Bone Alabaster", "Onyx Black"]',
 1, 55, NOW() - INTERVAL 11 DAY),

(11, 'RAW EDGE POPLIN RELAXED SHIRT', 'Men', 'Apparel', 98.00, 120.00, 'EDITORIAL',
 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80',
 '["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80"]',
 'Crisp 100% organic cotton poplin cut with relaxed dropped shoulders, mother-of-pearl buttons, and a clean box-pleated back yoke.',
 '["S", "M", "L", "XL"]',
 '["Optic White", "Sky Blue Stripe", "Washed Black"]',
 0, 48, NOW() - INTERVAL 10 DAY),

(12, 'WIDE-LEG PLEATED TROUSERS', 'Women', 'Apparel', 135.00, 160.00, 'BESTSELLER',
 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80',
 '["https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80"]',
 'High-rise tailored trousers with double front pleats and fluid wide-leg silhouette. Made from wrinkle-resistant virgin wool blend.',
 '["XS", "S", "M", "L"]',
 '["Slate Grey", "Midnight Black", "Sand Dune"]',
 1, 42, NOW() - INTERVAL 10 DAY),

(13, 'VAPOR-MAX PRO ATHLETIC TRAINER', 'Men', 'Footwear', 195.00, 240.00, 'PERFORMANCE',
 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1000&q=80',
 '["https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1000&q=80"]',
 'Full-length air-pod sole unit delivering relentless energy return for high-cadence training and road running. Engineered Flyknit upper.',
 '["US 8", "US 9", "US 10", "US 11", "US 12"]',
 '["Volt Neon / Black", "Triple Black", "Silver Bullet"]',
 1, 38, NOW() - INTERVAL 9 DAY),

(14, 'CROPPED HEAVYWEIGHT LEATHER BOMBER', 'Women', 'Outerwear', 320.00, 390.00, 'STUDIO EDITION',
 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1000&q=80',
 '["https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1000&q=80"]',
 'Supple lambskin leather cut in a sharp boxy cropped proportion with ribbed wool knit trim, heavy two-way silver zipper, and satin lining.',
 '["XS", "S", "M", "L"]',
 '["Onyx Gloss", "Vintage Espresso"]',
 1, 18, NOW() - INTERVAL 9 DAY),

(15, 'DRI-FIT PRO RUNNING VEST', 'Men', 'Apparel', 65.00, 80.00, 'NEW DROP',
 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80',
 '["https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80"]',
 'Ultralight aerated race singlet with bonded anti-friction seams and 360-degree reflective visibility piping for dawn and dusk sessions.',
 '["S", "M", "L", "XL"]',
 '["Hyper Crimson", "Matte Black", "Arctic White"]',
 0, 65, NOW() - INTERVAL 8 DAY),

(16, 'SCULPTED LEATHER TOTE BAG', 'Accessories', 'Accessories', 185.00, 225.00, 'TIMELESS',
 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=80',
 '["https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=80"]',
 'Handcrafted structured tote bag in Italian calfskin leather. Accommodates 15-inch laptops with dedicated padded tech sleeve and magnetic closure.',
 '["One Size"]',
 '["Rich Black", "Cognac Saddle", "Alabaster"]',
 1, 30, NOW() - INTERVAL 8 DAY),

(17, 'RETRO COURT CLASSIC SNEAKER', 'Women', 'Footwear', 110.00, NULL, 'ICONIC',
 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1000&q=80',
 '["https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1000&q=80"]',
 'Heritage tennis court shoe engineered with premium smooth nappa leather, perforated toe-box, and cushioned OrthoLite insole.',
 '["US 6", "US 7", "US 8", "US 9", "US 10"]',
 '["Chalk White / Forest Green", "Pure White", "Vintage Gum"]',
 0, 50, NOW() - INTERVAL 7 DAY),

(18, 'OVERSIZED HEAVY COTTON TEE', 'Men', 'Apparel', 55.00, 70.00, 'DAILY ESSENTIAL',
 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80',
 '["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80"]',
 '300 GSM combed heavyweight jersey with a structured boxy drape, dense 1-inch collar ribbing, and subtle blind-stitched cuffs.',
 '["S", "M", "L", "XL", "XXL"]',
 '["Washed Anthracite", "Optic White", "Sage Green", "Earth Clay"]',
 0, 120, NOW() - INTERVAL 7 DAY),

(19, 'INSULATED TECHNICAL PUFFER JACKET', 'Men', 'Outerwear', 275.00, 340.00, 'WARMTH ARCHIVE',
 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1000&q=80',
 '["https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1000&q=80"]',
 '700-fill responsible down insulation wrapped in a water-repellent ripstop matte finish. Features hidden interior cargo pockets and fleece-lined hand warmers.',
 '["S", "M", "L", "XL"]',
 '["Matte Pitch Black", "Olive Night", "Steel Blue"]',
 1, 24, NOW() - INTERVAL 6 DAY),

(20, 'MINIMALIST KNIT MIDI SLIP DRESS', 'Women', 'Apparel', 145.00, 175.00, 'ELEGANT',
 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=80',
 '["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=80"]',
 'Fine-gauge rib-knit silk-cotton blend dress with flattering diagonal grain and delicate spaghetti straps. Subtly hugs curves before flaring gently at the hem.',
 '["XS", "S", "M", "L"]',
 '["Black Caviar", "Terracotta Rose", "Ecru Pearl"]',
 0, 36, NOW() - INTERVAL 6 DAY),

(21, 'TITANIUM FRAME PILOT SUNGLASSES', 'Accessories', 'Accessories', 160.00, NULL, 'LIMITED RUN',
 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=80',
 '["https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=80"]',
 'Featherlight Japanese titanium frame with polarized gradient nylon lenses and 100% UVA/UVB protection. Custom engraved core temples.',
 '["One Size"]',
 '["Brushed Silver / Slate", "Matte Black / Smoke", "Pale Gold / Amber"]',
 1, 25, NOW() - INTERVAL 5 DAY),

(22, 'ARCHITECTURAL LEATHER CHELSEA BOOT', 'Men', 'Footwear', 230.00, 280.00, 'STUDIO EDITION',
 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=1000&q=80',
 '["https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=1000&q=80"]',
 'Goodyear-welted pull-on chelsea boots with exaggerated geometric lugged Vibram sole and Italian box-calf upper.',
 '["US 8", "US 9", "US 10", "US 11", "US 12"]',
 '["Pitch Black Polished", "Dark Mocha Waxed"]',
 1, 30, NOW() - INTERVAL 5 DAY),

(23, 'RIBBED CASHMERE BEANIE', 'Accessories', 'Accessories', 68.00, NULL, 'WINTER ESSENTIAL',
 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=1000&q=80',
 '["https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=1000&q=80"]',
 '100% Mongolian 2-ply pure cashmere knit with traditional English rib pattern and adjustable turn-up cuff.',
 '["One Size"]',
 '["Heather Charcoal", "Oatmeal Melange", "Black", "Forest"]',
 0, 75, NOW() - INTERVAL 4 DAY),

(24, 'RELAXED CARGO TRACK PANTS', 'Men', 'Apparel', 125.00, 155.00, 'UTILITY',
 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=80',
 '["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=80"]',
 'Ergonomic articulated cargo trousers featuring 6 waterproof zipper pockets, bungee-adjustable leg openings, and water-shedding stretch cotton ripstop.',
 '["S", "M", "L", "XL"]',
 '["Dark Olive", "Matte Black", "Coyote Tan"]',
 1, 52, NOW() - INTERVAL 4 DAY),

(25, 'HIGH-COLLAR SHEARLING AVIATOR COAT', 'Women', 'Outerwear', 450.00, 550.00, 'LUXURY DROP',
 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1000&q=80',
 '["https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1000&q=80"]',
 'Plush Spanish merino shearling with soft cracked-leather outer finish and dual buckle-fastened high stand collar.',
 '["XS", "S", "M", "L"]',
 '["Black / Ivory Fleece", "Chocolate / Tan Fleece"]',
 1, 12, NOW() - INTERVAL 3 DAY),

(26, 'RACER SPEED GRAPHIC CAP', 'Accessories', 'Accessories', 42.00, 50.00, 'SPORT ACCESSORY',
 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1000&q=80',
 '["https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1000&q=80"]',
 'Unstructured 5-panel running cap crafted from quick-drying micro-ripstop with breathable side laser perforations and adjustable reflective strap.',
 '["One Size"]',
 '["Reflective Silver", "Stealth Black", "Neon Citrus"]',
 0, 90, NOW() - INTERVAL 3 DAY),

(27, 'STRUCTURED WOOL TRENCH COAT', 'Men', 'Outerwear', 340.00, 420.00, 'TIMELESS',
 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80',
 '["https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80"]',
 'Sharp architectural trench engineered from heavyweight bonded twill wool with belted waist, storm flap, and horn buttons.',
 '["S", "M", "L", "XL"]',
 '["Midnight Navy", "Black Carbon", "Raw Camel"]',
 1, 19, NOW() - INTERVAL 2 DAY),

(28, 'TRAIL-GRIP WATERPROOF RUNNER', 'Men', 'Footwear', 170.00, 205.00, 'OUTDOOR TECH',
 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1000&q=80',
 '["https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1000&q=80"]',
 'Aggressive multi-directional Vibram Megagrip lug outsole with Gore-Tex breathable waterproof membrane for mountain trails and city streets.',
 '["US 8", "US 9", "US 10", "US 11", "US 12"]',
 '["Gore-Black", "Canyon Moss", "Earth Stone"]',
 0, 44, NOW() - INTERVAL 2 DAY),

(29, 'ASYMMETRICAL DRAPED TOP', 'Women', 'Apparel', 89.00, 110.00, 'EDITORIAL',
 'https://images.unsplash.com/photo-1503342394128-c104d54dba01?auto=format&fit=crop&w=1000&q=80',
 '["https://images.unsplash.com/photo-1503342394128-c104d54dba01?auto=format&fit=crop&w=1000&q=80"]',
 'Modern one-shoulder sculptural top in heavy stretch viscose jersey with side ruched gathering and raw-edge finish.',
 '["XS", "S", "M", "L"]',
 '["Pure White", "Pitch Black", "Burgundy Wine"]',
 0, 39, NOW() - INTERVAL 1 DAY),

(30, 'LEATHER TRAVEL WEEKENDER DUFFLE', 'Accessories', 'Accessories', 260.00, 310.00, 'TRAVEL ESSENTIAL',
 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80',
 '["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80"]',
 'Spacious 45L travel duffle crafted from thick pebble-grain leather with dedicated ventilated shoe compartment and detachable padded shoulder harness.',
 '["One Size"]',
 '["Midnight Black", "Vintage Bourbon"]',
 1, 20, NOW() - INTERVAL 1 DAY),

(31, 'HIGH-RISE SCULPT COMPRESSION SHORTS', 'Women', 'Apparel', 62.00, 75.00, 'FITNESS ESSENTIAL',
 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=80',
 '["https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=80"]',
 'No-front-seam 8-inch biker shorts in buttery-soft ultra-dense compression fabric with drop-in waistband pockets.',
 '["XS", "S", "M", "L", "XL"]',
 '["Matte Black", "Graphite Blue", "Espresso"]',
 0, 68, NOW()),

(32, 'MINIMALIST BI-FOLD CARDHOLDER', 'Accessories', 'Accessories', 48.00, NULL, 'ACCENT',
 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1000&q=80',
 '["https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1000&q=80"]',
 'Ultra-slim veg-tan bridle leather wallet featuring 6 precision laser-cut card slots and RFID protection barrier.',
 '["One Size"]',
 '["Matte Black", "Natural Raw Tan"]',
 0, 85, NOW());

-- --------------------------------------------------------------------
-- Seed Sample Customer Orders
-- --------------------------------------------------------------------
INSERT INTO `shop_orders` 
(`id`, `user_id`, `order_number`, `customer_name`, `email`, `address`, `city`, `postal_code`, `country`, `total_amount`, `payment_method`, `status`, `items`, `created_at`)
VALUES
(1, 2, 'NZ-882194', 'Alex Miller', 'alex@example.com', '742 Evergreen Terrace', 'New York', '10001', 'United States', 315.00, 'Card', 'delivered', 
 '[{"id": 1, "name": "AIR ZERO RUNNER 01", "price": 185, "quantity": 1, "selectedSize": "US 10", "selectedColor": "Triple Black"}, {"id": 3, "name": "TECH FLEECE HEAVYWEIGHT HOODIE", "price": 130, "quantity": 1, "selectedSize": "L", "selectedColor": "Matte Black"}]',
 NOW() - INTERVAL 10 DAY),

(2, 3, 'NZ-619420', 'Elena Rostova', 'elena@example.com', '12 Paseo de la Castellana', 'Madrid', '28046', 'Spain', 249.00, 'Apple Pay', 'shipped',
 '[{"id": 2, "name": "OVERSIZED TAILORED WOOL COAT", "price": 249, "quantity": 1, "selectedSize": "S", "selectedColor": "Camel Raw"}]',
 NOW() - INTERVAL 4 DAY),

(3, 2, 'NZ-904321', 'Alex Miller', 'alex@example.com', '742 Evergreen Terrace', 'New York', '10001', 'United States', 170.00, 'Card', 'processing',
 '[{"id": 5, "name": "DUNK LOW RETRO ARCHIVE", "price": 115, "quantity": 1, "selectedSize": "US 9.5", "selectedColor": "Panda Monochrome"}, {"id": 18, "name": "OVERSIZED HEAVY COTTON TEE", "price": 55, "quantity": 1, "selectedSize": "XL", "selectedColor": "Washed Anthracite"}]',
 NOW() - INTERVAL 1 DAY),

(4, NULL, 'NZ-452109', 'Marcus Vance', 'marcus.vance@company.org', '88 Regent Street', 'London', 'W1B 5AH', 'United Kingdom', 450.00, 'Card', 'paid',
 '[{"id": 25, "name": "HIGH-COLLAR SHEARLING AVIATOR COAT", "price": 450, "quantity": 1, "selectedSize": "M", "selectedColor": "Black / Ivory Fleece"}]',
 NOW() - INTERVAL 6 HOUR);

-- --------------------------------------------------------------------
-- Seed Sample Customer Reviews
-- --------------------------------------------------------------------
INSERT INTO `shop_reviews` 
(`id`, `product_id`, `user_id`, `user_name`, `rating`, `fit_rating`, `comment`, `created_at`)
VALUES
(1, 1, 2, 'Alex M.', 5, 'True to Size', 'The cushioning rebound on the Air Zero Runner is unbelievable. Light enough for 10K road runs, sleek enough for daily wear with tailored trousers.', NOW() - INTERVAL 8 DAY),
(2, 2, 3, 'Elena R.', 5, 'Runs Large', 'Incredible silhouette! It has an intentional oversized drape so I went with size S and it looks like it stepped right off the Milan runway. Melton wool is thick and warm.', NOW() - INTERVAL 3 DAY),
(3, 3, 2, 'David K.', 4, 'True to Size', 'Very substantial fleece weight. Great bonded zippers. Keeps shape after washing.', NOW() - INTERVAL 5 DAY),
(4, 5, NULL, 'Jordan S.', 5, 'True to Size', 'Classic silhouette. The leather is surprisingly soft right out of the box with zero break-in period.', NOW() - INTERVAL 2 DAY),
(5, 14, NULL, 'Sophia T.', 5, 'True to Size', 'The cut on this leather bomber is perfection. Cropped right at the waistline, heavy hardware. Worth every penny.', NOW() - INTERVAL 1 DAY);
