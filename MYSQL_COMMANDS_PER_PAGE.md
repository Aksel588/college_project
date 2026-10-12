# MySQL Database Documentation & Command Reference

**Database**: `college_db`  
**Host & Port**: `localhost:3321` (MySQL 9.x / 26.x macOS arm64)  
**Encoding**: UTF-8 / InnoDB  

This document details all MySQL tables, schemas, and SQL queries executed by the application across all features, including **Phase 1 (Admin & Inventory)**, **Phase 2 (Wishlist & Coupons)**, and **Phase 3 (Reviews & Fit Ratings)**.

---

## 1. Complete Database Schema & Tables

### 1. `shop_products`
Stores product catalog information, prices, tags, image URLs, and JSON attributes.
```sql
CREATE TABLE IF NOT EXISTS shop_products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  sub_category VARCHAR(100),
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  tag VARCHAR(50),
  image VARCHAR(1000) NOT NULL,
  gallery JSON,
  description TEXT,
  sizes JSON,
  colors JSON,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. `shop_users`
Stores registered customer accounts with encrypted passwords (`bcryptjs`).
```sql
CREATE TABLE IF NOT EXISTS shop_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('customer', 'admin') DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. `shop_orders`
Stores completed orders, customer delivery details, line items (JSON), and payment confirmations.
```sql
CREATE TABLE IF NOT EXISTS shop_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  order_number VARCHAR(64) UNIQUE,
  customer_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  postal_code VARCHAR(50) NOT NULL,
  country VARCHAR(100) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'Card',
  status ENUM('paid', 'processing', 'shipped', 'delivered') DEFAULT 'paid',
  items JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES shop_users(id) ON DELETE SET NULL
);
```

### 4. `shop_wishlist` (Phase 2)
Stores user saved items linked to customer accounts.
```sql
CREATE TABLE IF NOT EXISTS shop_wishlist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_product (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES shop_users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES shop_products(id) ON DELETE CASCADE
);
```

### 5. `shop_coupons` (Phase 2)
Stores promotional discount codes and eligibility criteria.
```sql
CREATE TABLE IF NOT EXISTS shop_coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  discount_percent INT NOT NULL,
  min_spend DECIMAL(10, 2) DEFAULT 0.00,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6. `shop_reviews` (Phase 3)
Stores customer ratings, fit evaluations (*Runs Small*, *True to Size*, *Runs Large*), and comments.
```sql
CREATE TABLE IF NOT EXISTS shop_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  user_id INT,
  user_name VARCHAR(255) NOT NULL,
  rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  fit_rating ENUM('Runs Small', 'True to Size', 'Runs Large') DEFAULT 'True to Size',
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES shop_products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES shop_users(id) ON DELETE SET NULL
);
```

---

## 2. MySQL Commands Used Per Page & Action

### 🏠 Page 1: Homepage & Catalog Browsing
* **Fetch Products with Search / Category / Sort:**
  ```sql
  SELECT * FROM shop_products 
  WHERE (category = 'Men' OR sub_category = 'Men') 
  AND (name LIKE '%RUNNER%' OR description LIKE '%RUNNER%') 
  ORDER BY price ASC;
  ```

---

### 🔍 Page 2: Product Detail, Quick View & Reviews (Phase 3)
* **Fetch Single Product:**
  ```sql
  SELECT * FROM shop_products WHERE id = 1;
  ```
* **Fetch Product Reviews with Star Rating & Fit Profile:**
  ```sql
  SELECT * FROM shop_reviews WHERE product_id = 1 ORDER BY id DESC;
  ```
* **Submit New Review to MySQL:**
  ```sql
  INSERT INTO shop_reviews (product_id, user_id, user_name, rating, fit_rating, comment)
  VALUES (1, 1, 'Alex M.', 5, 'True to Size', 'Super lightweight and high cushioning.');
  ```

---

### ❤️ Page 3: Wishlist & Saved Pieces Modal (Phase 2)
* **Fetch User's Wishlist Items (JOIN with Products):**
  ```sql
  SELECT p.*, w.created_at AS added_at 
  FROM shop_wishlist w
  JOIN shop_products p ON w.product_id = p.id
  WHERE w.user_id = 1
  ORDER BY w.id DESC;
  ```
* **Toggle / Save Item to Wishlist:**
  ```sql
  INSERT INTO shop_wishlist (user_id, product_id) VALUES (1, 2);
  ```
* **Remove Item from Wishlist:**
  ```sql
  DELETE FROM shop_wishlist WHERE user_id = 1 AND product_id = 2;
  ```

---

### 💳 Page 4: Checkout, Coupons & Payment (Phase 2)
* **Validate Promo Code (e.g. `NIKE20`, `ZARA15`):**
  ```sql
  SELECT * FROM shop_coupons WHERE code = 'NIKE20' AND active = 1;
  ```
* **Insert Order Record:**
  ```sql
  INSERT INTO shop_orders (user_id, order_number, customer_name, email, address, city, postal_code, country, total_amount, payment_method, status, items)
  VALUES (1, 'NZ-969162', 'Aksel', 'student@college.edu', 'Calle Serrano, 45', 'Madrid', '28001', 'Spain', 268.92, 'Card', 'paid', '[...]');
  ```

---

### 🛡️ Page 5: Store Admin Management Portal (Phase 1)
* **Inspect All Store Orders for Fulfillment:**
  ```sql
  SELECT * FROM shop_orders ORDER BY id DESC;
  ```
* **Update Order Status (`paid` ➔ `processing` ➔ `shipped` ➔ `delivered`):**
  ```sql
  UPDATE shop_orders SET status = 'shipped' WHERE id = 1;
  ```
* **Add New Garment / Drop Directly into MySQL Inventory:**
  ```sql
  INSERT INTO shop_products (name, category, sub_category, price, original_price, tag, image, gallery, description, sizes, colors, featured)
  VALUES ('MONOCHROME BOMBER JACKET', 'Men', 'Outerwear', 160.00, 190.00, 'NEW DROP', 'https://...', '["https://..."]', 'Matte finish water-repellent shell.', '["M", "L", "XL"]', '["Black"]', 1);
  ```
* **Delete Discontinued Product:**
  ```sql
  DELETE FROM shop_products WHERE id = 9;
  ```

---

### 👤 Page 6: User Authentication & Order History
* **Check Email & Register User:**
  ```sql
  INSERT INTO shop_users (name, email, password, role) VALUES ('Aksel', 'student@college.edu', '$2a$10$...', 'customer');
  ```
* **Fetch Customer Order History:**
  ```sql
  SELECT * FROM shop_orders WHERE user_id = 1 OR email = 'student@college.edu' ORDER BY id DESC;
  ```
