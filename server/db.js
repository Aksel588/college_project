import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'college_db',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function initDB() {
  const dbName = process.env.DB_NAME || 'college_db';

  // Ensure database exists
  const rootConn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306
  });
  await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
  await rootConn.end();

  const conn = await pool.getConnection();
  try {
    // 1. shop_users table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS shop_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('customer', 'admin') DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. shop_products table
    await conn.query(`
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
    `);

    // 3. shop_orders table
    await conn.query(`
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
    `);

    // 4. shop_wishlist table (Phase 2)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS shop_wishlist (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_product (user_id, product_id),
        FOREIGN KEY (user_id) REFERENCES shop_users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES shop_products(id) ON DELETE CASCADE
      );
    `);

    // 5. shop_coupons table (Phase 2)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS shop_coupons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        discount_percent INT NOT NULL,
        min_spend DECIMAL(10, 2) DEFAULT 0.00,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. shop_reviews table (Phase 3)
    await conn.query(`
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
    `);

    // Seed initial coupon codes
    await conn.query(`
      INSERT IGNORE INTO shop_coupons (code, discount_percent, min_spend, active) VALUES
      ('NIKE20', 20, 50.00, 1),
      ('ZARA15', 15, 100.00, 1),
      ('FIRSTDROP', 10, 0.00, 1);
    `);

    // Seed products if shop_products is empty
    const [rows] = await conn.query('SELECT COUNT(*) as count FROM shop_products');
    if (rows[0].count === 0) {
      console.log('Seeding initial curated products into college_db.shop_products...');
      const seedProducts = [
        {
          name: 'AIR ZERO RUNNER 01',
          category: 'Men',
          sub_category: 'Footwear',
          price: 185.00,
          original_price: 220.00,
          tag: 'JUST RELEASED',
          image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80',
          gallery: JSON.stringify([
            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1000&q=80'
          ]),
          description: 'Sculpted lightweight cushioning paired with high-tensile mesh upper. Inspired by competitive marathon racing and architectural minimalism.',
          sizes: JSON.stringify(['US 8', 'US 8.5', 'US 9', 'US 9.5', 'US 10', 'US 11', 'US 12']),
          colors: JSON.stringify(['Obsidian / Crimson', 'Triple Black', 'Pure White']),
          featured: true
        },
        {
          name: 'OVERSIZED TAILORED WOOL COAT',
          category: 'Women',
          sub_category: 'Outerwear',
          price: 249.00,
          original_price: 299.00,
          tag: 'STUDIO EDITION',
          image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1000&q=80',
          gallery: JSON.stringify([
            'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80'
          ]),
          description: 'Refined double-breasted silhouette cut from premium double-faced melton wool. Peak lapels, jetted pockets, and unstructured clean drape.',
          sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL']),
          colors: JSON.stringify(['Camel Raw', 'Charcoal Anthracite', 'Midnight']),
          featured: true
        },
        {
          name: 'TECH FLEECE HEAVYWEIGHT HOODIE',
          category: 'Men',
          sub_category: 'Apparel',
          price: 130.00,
          original_price: 150.00,
          tag: 'BESTSELLER',
          image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80',
          gallery: JSON.stringify([
            'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80'
          ]),
          description: 'Constructed from thermal multi-layer fleece that insulates without excess bulk. Bonded tape zip details and tailored articulated sleeves.',
          sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
          colors: JSON.stringify(['Heather Grey', 'Matte Black', 'Olive Drab']),
          featured: true
        },
        {
          name: 'STRUCTURED COLUMN DRESS',
          category: 'Women',
          sub_category: 'Dresses',
          price: 119.00,
          original_price: null,
          tag: 'NEW COLLECTION',
          image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=80',
          gallery: JSON.stringify([
            'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=80'
          ]),
          description: 'Architectural column maxi dress made in structured crepe weave. Clean square neckline and high back split for effortless statement styling.',
          sizes: JSON.stringify(['XS', 'S', 'M', 'L']),
          colors: JSON.stringify(['Pitch Black', 'Alabaster Ivory']),
          featured: true
        },
        {
          name: 'DUNK LOW RETRO ARCHIVE',
          category: 'Men',
          sub_category: 'Footwear',
          price: 115.00,
          original_price: null,
          tag: 'ICONIC',
          image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=80',
          gallery: JSON.stringify([
            'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=80'
          ]),
          description: 'The basketball icon reimagined with soft full-grain leather, heritage padded collar, and durable retro rubber cupsole.',
          sizes: JSON.stringify(['US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12']),
          colors: JSON.stringify(['Panda Monochrome', 'Vintage Navy', 'Grey Fog']),
          featured: true
        },
        {
          name: 'ASYMMETRIC LINEN BLEND BLAZER',
          category: 'Women',
          sub_category: 'Outerwear',
          price: 179.00,
          original_price: 210.00,
          tag: 'LIMITED RUN',
          image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80',
          gallery: JSON.stringify([
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80'
          ]),
          description: 'Contemporary asymmetric crossover button closure with sharply structured padded shoulders and soft European linen-viscose blend.',
          sizes: JSON.stringify(['XS', 'S', 'M', 'L']),
          colors: JSON.stringify(['Ecru Chalk', 'Dark Espresso']),
          featured: false
        },
        {
          name: 'AERO-DRI PERFORMANCE TIGHTS',
          category: 'Women',
          sub_category: 'Apparel',
          price: 88.00,
          original_price: 105.00,
          tag: 'FITNESS ESSENTIAL',
          image: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=1000&q=80',
          gallery: JSON.stringify([
            'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=1000&q=80'
          ]),
          description: 'Compressive 4-way stretch fabric with moisture-wicking technology and bonded discreet drop-in phone pocket.',
          sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL']),
          colors: JSON.stringify(['Black Matte', 'Smoky Mauve', 'Deep Teal']),
          featured: false
        },
        {
          name: 'MINIMAL LEATHER SLING BAG',
          category: 'Accessories',
          sub_category: 'Bags',
          price: 95.00,
          original_price: null,
          tag: 'ACCENT',
          image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80',
          gallery: JSON.stringify([
            'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80'
          ]),
          description: 'Full-grain calfskin with brushed matte gunmetal hardware. Adjustable webbing strap and padded interior slip pockets.',
          sizes: JSON.stringify(['One Size']),
          colors: JSON.stringify(['Pitch Black', 'Chestnut Saddle']),
          featured: true
        }
      ];

      for (const p of seedProducts) {
        await conn.query(
          `INSERT INTO shop_products (name, category, sub_category, price, original_price, tag, image, gallery, description, sizes, colors, featured)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [p.name, p.category, p.sub_category, p.price, p.original_price, p.tag, p.image, p.gallery, p.description, p.sizes, p.colors, p.featured]
        );
      }
      console.log('Seed products inserted into college_db.');
    }
  } finally {
    conn.release();
  }
}
