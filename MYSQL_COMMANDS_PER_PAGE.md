# MySQL Database Documentation & Command Reference

**Database**: `college_db`  
**Host & Port**: `localhost:3321` (or `3306`)  
**Encoding**: UTF-8 / InnoDB  
**All-in-One SQL Creation Script**: [`database.sql`](file:///Users/aksel/Desktop/college_website_app/database.sql)

This document details all MySQL tables, schemas, and SQL queries executed by the application across all features, including **Phase 1 (Full Admin Panel & Store Management)**, **Phase 2 (Wishlist & Coupons)**, **Phase 3 (Reviews & Fit Ratings)**, and **Phase 4 (Advanced Multi-Dimensional Filtering & Expanded 32-Item Catalog)**.

---

## 1. Complete Database Schema & Tables

### 1. `shop_products`
Stores product catalog information, prices, tags, image URLs, stock quantities, and JSON attributes.
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
  stock_quantity INT DEFAULT 50,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. `shop_users`
Stores registered customer accounts and administrator credentials with encrypted passwords (`bcryptjs`).
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
  status ENUM('paid', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'paid',
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

### 🏠 Page 1: Homepage Catalog & Multi-Dimensional Filters
* **Fetch Products with Category, Subcategory, Price Bracket, Size, Color, Tag, and Discount Filters:**
  ```sql
  SELECT * FROM shop_products 
  WHERE 1=1
    AND (category = 'Men' OR sub_category = 'Men')
    AND sub_category = 'Footwear'
    AND price >= 100 AND price <= 250
    AND sizes LIKE '%"US 10"%'
    AND colors LIKE '%Black%'
    AND tag = 'JUST RELEASED'
    AND (original_price IS NOT NULL AND original_price > price)
    AND (name LIKE '%RUNNER%' OR description LIKE '%RUNNER%' OR tag LIKE '%RUNNER%')
  ORDER BY price ASC;
  ```

---

### 🔍 Page 2: Product Detail, Quick View & Reviews
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

### ❤️ Page 3: Wishlist & Saved Pieces Modal
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

### 💳 Page 4: Checkout, Coupons & Payment
* **Validate Promo Code (e.g. `NIKE20`, `ZARA15`, `ARCHIVE25`):**
  ```sql
  SELECT * FROM shop_coupons WHERE code = 'NIKE20' AND active = 1;
  ```
* **Insert Order Record:**
  ```sql
  INSERT INTO shop_orders (user_id, order_number, customer_name, email, address, city, postal_code, country, total_amount, payment_method, status, items)
  VALUES (1, 'NZ-969162', 'Aksel', 'student@college.edu', 'Calle Serrano, 45', 'Madrid', '28001', 'Spain', 268.92, 'Card', 'paid', '[...]');
  ```

---

### 🛡️ Page 5: Full Store Admin Management Portal

#### A. Executive Metrics & Analytics
* **Total Gross Sales Revenue:**
  ```sql
  SELECT COALESCE(SUM(total_amount), 0) AS total_revenue FROM shop_orders WHERE status != 'cancelled';
  ```
* **Total Orders Count:**
  ```sql
  SELECT COUNT(*) AS total_orders FROM shop_orders;
  ```
* **Orders Breakdown by Fulfillment Status:**
  ```sql
  SELECT status, COUNT(*) as count FROM shop_orders GROUP BY status;
  ```
* **Low Inventory Warning Count:**
  ```sql
  SELECT COUNT(*) AS low_stock FROM shop_products WHERE stock_quantity <= 25;
  ```

#### B. Inventory Management & Products CRUD
* **Fetch Admin Inventory with Search & Category Filters:**
  ```sql
  SELECT * FROM shop_products WHERE category = 'Men' AND name LIKE '%JACKET%' ORDER BY id DESC;
  ```
* **Add New Garment / Drop into MySQL:**
  ```sql
  INSERT INTO shop_products (name, category, sub_category, price, original_price, tag, image, gallery, description, sizes, colors, featured, stock_quantity)
  VALUES ('MONOCHROME BOMBER JACKET', 'Men', 'Outerwear', 160.00, 190.00, 'NEW DROP', 'https://...', '["https://..."]', 'Matte finish water-repellent shell.', '["M", "L", "XL"]', '["Black"]', 1, 50);
  ```
* **Full Update of Existing Product:**
  ```sql
  UPDATE shop_products SET 
    name = 'UPDATED TITLE', category = 'Men', sub_category = 'Footwear', price = 175.00, original_price = 210.00,
    tag = 'BESTSELLER', image = 'https://...', gallery = '["https://..."]', description = '...', sizes = '["US 9"]', colors = '["Black"]',
    featured = 1, stock_quantity = 35
  WHERE id = 1;
  ```
* **Toggle Featured Status:**
  ```sql
  UPDATE shop_products SET featured = NOT featured WHERE id = 1;
  ```
* **Delete Discontinued Product:**
  ```sql
  DELETE FROM shop_products WHERE id = 9;
  ```

#### C. Order Fulfillment & Lifecycle
* **Fetch Filtered Orders:**
  ```sql
  SELECT * FROM shop_orders WHERE status = 'paid' ORDER BY id DESC;
  ```
* **Update Order Status (`paid` ➔ `processing` ➔ `shipped` ➔ `delivered` ➔ `cancelled`):**
  ```sql
  UPDATE shop_orders SET status = 'shipped' WHERE id = 1;
  ```
* **Delete / Cancel Order:**
  ```sql
  DELETE FROM shop_orders WHERE id = 1;
  ```

#### D. Customer Accounts Directory
* **Fetch All Customers with Aggregate Orders & Total Spent:**
  ```sql
  SELECT 
    u.id, u.name, u.email, u.role, u.created_at,
    COUNT(o.id) AS total_orders,
    COALESCE(SUM(o.total_amount), 0) AS total_spent
  FROM shop_users u
  LEFT JOIN shop_orders o ON u.id = o.user_id AND o.status != 'cancelled'
  GROUP BY u.id
  ORDER BY u.id DESC;
  ```
* **Promote Customer to Admin Role:**
  ```sql
  UPDATE shop_users SET role = 'admin' WHERE id = 2;
  ```
* **Delete Customer:**
  ```sql
  DELETE FROM shop_users WHERE id = 2;
  ```

#### E. Promotional Coupons Management
* **List All Coupons:**
  ```sql
  SELECT * FROM shop_coupons ORDER BY id DESC;
  ```
* **Create New Coupon:**
  ```sql
  INSERT INTO shop_coupons (code, discount_percent, min_spend, active) VALUES ('SUMMER30', 30, 250.00, 1);
  ```
* **Toggle Coupon Active Status:**
  ```sql
  UPDATE shop_coupons SET active = NOT active WHERE id = 1;
  ```
* **Delete Coupon:**
  ```sql
  DELETE FROM shop_coupons WHERE id = 1;
  ```

#### F. Reviews Moderation
* **Fetch All Reviews with Product Titles:**
  ```sql
  SELECT r.*, p.name AS product_name, p.image AS product_image
  FROM shop_reviews r
  LEFT JOIN shop_products p ON r.product_id = p.id
  ORDER BY r.id DESC;
  ```
* **Delete Inappropriate Review:**
  ```sql
  DELETE FROM shop_reviews WHERE id = 1;
  ```

---

## 3. How to Initialize the MySQL Database

Whenever you wish to run MySQL, you can import the entire database schema, tables, and 32 seed products with a single command:

```bash
mysql -u root -p < database.sql
```
*(Or specify the port if using a custom port, e.g. `mysql -u root -P 3321 < database.sql`)*

Default seed credentials:
- **Admin**: `admin@aurashop.com` (password: `admin123`)
- **Sample Customer 1**: `alex@example.com` (password: `customer123`)
- **Sample Customer 2**: `elena@example.com` (password: `customer123`)
