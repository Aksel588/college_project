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
  await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
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
        stock_quantity INT DEFAULT 50,
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
        status ENUM('paid', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'paid',
        items JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES shop_users(id) ON DELETE SET NULL
      );
    `);

    // 4. shop_wishlist table
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

    // 5. shop_coupons table
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

    // 6. shop_reviews table
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

    // Seed default admin user (password: admin123)
    const [existingAdmin] = await conn.query('SELECT id FROM shop_users WHERE email = ?', ['admin@aurashop.com']);
    if (existingAdmin.length === 0) {
      // bcrypt hash for 'admin123'
      const adminHash = '$2a$10$wT8K8U1h3Y2N2V4y4m5O0epqV4K3D7nQ0R7vP8yU8pQ2Y3M4N5O6e';
      await conn.query(
        'INSERT INTO shop_users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Lead Curator (Admin)', 'admin@aurashop.com', adminHash, 'admin']
      );
    }

    // Seed coupons
    await conn.query(`
      INSERT IGNORE INTO shop_coupons (code, discount_percent, min_spend, active) VALUES
      ('NIKE20', 20, 50.00, 1),
      ('ZARA15', 15, 100.00, 1),
      ('FIRSTDROP', 10, 0.00, 1),
      ('ARCHIVE25', 25, 200.00, 1),
      ('SUMMER30', 30, 250.00, 1),
      ('VIP50', 50, 400.00, 1);
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
          featured: true,
          stock_quantity: 45
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
          featured: true,
          stock_quantity: 28
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
          featured: true,
          stock_quantity: 80
        },
        {
          name: 'STRUCTURED COLUMN DRESS',
          category: 'Women',
          sub_category: 'Apparel',
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
          featured: true,
          stock_quantity: 35
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
          featured: true,
          stock_quantity: 60
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
          featured: false,
          stock_quantity: 22
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
          featured: false,
          stock_quantity: 70
        },
        {
          name: 'MINIMAL LEATHER SLING BAG',
          category: 'Accessories',
          sub_category: 'Accessories',
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
          featured: true,
          stock_quantity: 40
        },
        {
          name: 'STORM-FIT WATERPROOF SHELL JACKET',
          category: 'Men',
          sub_category: 'Outerwear',
          price: 210.00,
          original_price: 260.00,
          tag: 'TECHNICAL',
          image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80',
          gallery: JSON.stringify([
            'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80'
          ]),
          description: 'Seam-sealed 3-layer weatherproof nylon shell designed for extreme urban wind and heavy rain. Ergonomic storm hood and magnetic zip storm flap.',
          sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
          colors: JSON.stringify(['Matte Black', 'Graphite Grey', 'Acid Lime']),
          featured: true,
          stock_quantity: 32
        },
        {
          name: 'MONOCHROME CHUNKY SOLE RUNNER',
          category: 'Women',
          sub_category: 'Footwear',
          price: 165.00,
          original_price: 195.00,
          tag: 'TRENDING',
          image: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=1000&q=80',
          gallery: JSON.stringify([
            'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=1000&q=80'
          ]),
          description: 'Exaggerated architectural midsole with cloud-like rebound foam and technical mesh panelling. Finished with tonal reflective accents.',
          sizes: JSON.stringify(['US 6', 'US 7', 'US 8', 'US 9', 'US 10']),
          colors: JSON.stringify(['Triple White', 'Bone Alabaster', 'Onyx Black']),
          featured: true,
          stock_quantity: 55
        },
        {
          name: 'RAW EDGE POPLIN RELAXED SHIRT',
          category: 'Men',
          sub_category: 'Apparel',
          price: 98.00,
          original_price: 120.00,
          tag: 'EDITORIAL',
          image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80',
          gallery: JSON.stringify([
            'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80'
          ]),
          description: 'Crisp 100% organic cotton poplin cut with relaxed dropped shoulders, mother-of-pearl buttons, and a clean box-pleated back yoke.',
          sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
          colors: JSON.stringify(['Optic White', 'Sky Blue Stripe', 'Washed Black']),
          featured: false,
          stock_quantity: 48
        },
        {
          name: 'WIDE-LEG PLEATED TROUSERS',
          category: 'Women',
          sub_category: 'Apparel',
          price: 135.00,
          original_price: 160.00,
          tag: 'BESTSELLER',
          image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80',
          gallery: JSON.stringify([
            'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80'
          ]),
          description: 'High-rise tailored trousers with double front pleats and fluid wide-leg silhouette. Made from wrinkle-resistant virgin wool blend.',
          sizes: JSON.stringify(['XS', 'S', 'M', 'L']),
          colors: JSON.stringify(['Slate Grey', 'Midnight Black', 'Sand Dune']),
          featured: true,
          stock_quantity: 42
        },
        {
          name: 'VAPOR-MAX PRO ATHLETIC TRAINER',
          category: 'Men',
          sub_category: 'Footwear',
          price: 195.00,
          original_price: 240.00,
          tag: 'PERFORMANCE',
          image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1000&q=80',
          gallery: JSON.stringify([
            'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1000&q=80'
          ]),
          description: 'Full-length air-pod sole unit delivering relentless energy return for high-cadence training and road running. Engineered Flyknit upper.',
          sizes: JSON.stringify(['US 8', 'US 9', 'US 10', 'US 11', 'US 12']),
          colors: JSON.stringify(['Volt Neon / Black', 'Triple Black', 'Silver Bullet']),
          featured: true,
          stock_quantity: 38
        },
        {
          name: 'CROPPED HEAVYWEIGHT LEATHER BOMBER',
          category: 'Women',
          sub_category: 'Outerwear',
          price: 320.00,
          original_price: 390.00,
          tag: 'STUDIO EDITION',
          image: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1000&q=80',
          gallery: JSON.stringify([
            'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1000&q=80'
          ]),
          description: 'Supple lambskin leather cut in a sharp boxy cropped proportion with ribbed wool knit trim, heavy two-way silver zipper, and satin lining.',
          sizes: JSON.stringify(['XS', 'S', 'M', 'L']),
          colors: JSON.stringify(['Onyx Gloss', 'Vintage Espresso']),
          featured: true,
          stock_quantity: 18
        },
        {
          name: 'DRI-FIT PRO RUNNING VEST',
          category: 'Men',
          sub_category: 'Apparel',
          price: 65.00,
          original_price: 80.00,
          tag: 'NEW DROP',
          image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80',
          gallery: JSON.stringify([
            'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80'
          ]),
          description: 'Ultralight aerated race singlet with bonded anti-friction seams and 360-degree reflective visibility piping for dawn and dusk sessions.',
          sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
          colors: JSON.stringify(['Hyper Crimson', 'Matte Black', 'Arctic White']),
          featured: false,
          stock_quantity: 65
        },
        {
          name: 'SCULPTED LEATHER TOTE BAG',
          category: 'Accessories',
          sub_category: 'Accessories',
          price: 185.00,
          original_price: 225.00,
          tag: 'TIMELESS',
          image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=80',
          gallery: JSON.stringify([
            'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=80'
          ]),
          description: 'Handcrafted structured tote bag in Italian calfskin leather. Accommodates 15-inch laptops with dedicated padded tech sleeve and magnetic closure.',
          sizes: JSON.stringify(['One Size']),
          colors: JSON.stringify(['Rich Black', 'Cognac Saddle', 'Alabaster']),
          featured: true,
          stock_quantity: 30
        },
        {
          name: 'RETRO COURT CLASSIC SNEAKER',
          category: 'Women',
          sub_category: 'Footwear',
          price: 110.00,
          original_price: null,
          tag: 'ICONIC',
          image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1000&q=80',
          gallery: JSON.stringify([
            'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1000&q=80'
          ]),
          description: 'Heritage tennis court shoe engineered with premium smooth nappa leather, perforated toe-box, and cushioned OrthoLite insole.',
          sizes: JSON.stringify(['US 6', 'US 7', 'US 8', 'US 9', 'US 10']),
          colors: JSON.stringify(['Chalk White / Forest Green', 'Pure White', 'Vintage Gum']),
          featured: false,
          stock_quantity: 50
        },
        {
          name: 'OVERSIZED HEAVY COTTON TEE',
          category: 'Men',
          sub_category: 'Apparel',
          price: 55.00,
          original_price: 70.00,
          tag: 'DAILY ESSENTIAL',
          image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80',
          gallery: JSON.stringify([
            'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80'
          ]),
          description: '300 GSM combed heavyweight jersey with a structured boxy drape, dense 1-inch collar ribbing, and subtle blind-stitched cuffs.',
          sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
          colors: JSON.stringify(['Washed Anthracite', 'Optic White', 'Sage Green', 'Earth Clay']),
          featured: false,
          stock_quantity: 120
        },
        {
          name: 'INSULATED TECHNICAL PUFFER JACKET',
          category: 'Men',
          sub_category: 'Outerwear',
          price: 275.00,
          original_price: 340.00,
          tag: 'WARMTH ARCHIVE',
          image: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1000&q=80',
          gallery: JSON.stringify([
            'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1000&q=80'
          ]),
          description: '700-fill responsible down insulation wrapped in a water-repellent ripstop matte finish. Features hidden interior cargo pockets and fleece-lined hand warmers.',
          sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
          colors: JSON.stringify(['Matte Pitch Black', 'Olive Night', 'Steel Blue']),
          featured: true,
          stock_quantity: 24
        },
        {
          name: 'MINIMALIST KNIT MIDI SLIP DRESS',
          category: 'Women',
          sub_category: 'Apparel',
          price: 145.00,
          original_price: 175.00,
          tag: 'ELEGANT',
          image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=80',
          gallery: JSON.stringify([
            'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=80'
          ]),
          description: 'Fine-gauge rib-knit silk-cotton blend dress with flattering diagonal grain and delicate spaghetti straps. Subtly hugs curves before flaring gently at the hem.',
          sizes: JSON.stringify(['XS', 'S', 'M', 'L']),
          colors: JSON.stringify(['Black Caviar', 'Terracotta Rose', 'Ecru Pearl']),
          featured: false,
          stock_quantity: 36
        },
        {
          name: 'TITANIUM FRAME PILOT SUNGLASSES',
          category: 'Accessories',
          sub_category: 'Accessories',
          price: 160.00,
          original_price: null,
          tag: 'LIMITED RUN',
          image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=80',
          gallery: JSON.stringify([
            'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=80'
          ]),
          description: 'Featherlight Japanese titanium frame with polarized gradient nylon lenses and 100% UVA/UVB protection. Custom engraved core temples.',
          sizes: JSON.stringify(['One Size']),
          colors: JSON.stringify(['Brushed Silver / Slate', 'Matte Black / Smoke', 'Pale Gold / Amber']),
          featured: true,
          stock_quantity: 25
        },
        {
          name: 'ARCHITECTURAL LEATHER CHELSEA BOOT',
          category: 'Men',
          sub_category: 'Footwear',
          price: 230.00,
          original_price: 280.00,
          tag: 'STUDIO EDITION',
          image: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=1000&q=80',
          gallery: JSON.stringify([
            'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=1000&q=80'
          ]),
          description: 'Goodyear-welted pull-on chelsea boots with exaggerated geometric lugged Vibram sole and Italian box-calf upper.',
          sizes: JSON.stringify(['US 8', 'US 9', 'US 10', 'US 11', 'US 12']),
          colors: JSON.stringify(['Pitch Black Polished', 'Dark Mocha Waxed']),
          featured: true,
          stock_quantity: 30
        },
        {
          name: 'RIBBED CASHMERE BEANIE',
          category: 'Accessories',
          sub_category: 'Accessories',
          price: 68.00,
          original_price: null,
          tag: 'WINTER ESSENTIAL',
          image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=1000&q=80',
          gallery: JSON.stringify([
            'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=1000&q=80'
          ]),
          description: '100% Mongolian 2-ply pure cashmere knit with traditional English rib pattern and adjustable turn-up cuff.',
          sizes: JSON.stringify(['One Size']),
          colors: JSON.stringify(['Heather Charcoal', 'Oatmeal Melange', 'Black', 'Forest']),
          featured: false,
          stock_quantity: 75
        },
        {
          name: 'RELAXED CARGO TRACK PANTS',
          category: 'Men',
          sub_category: 'Apparel',
          price: 125.00,
          original_price: 155.00,
          tag: 'UTILITY',
          image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=80',
          gallery: JSON.stringify([
            'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=80'
          ]),
          description: 'Ergonomic articulated cargo trousers featuring 6 waterproof zipper pockets, bungee-adjustable leg openings, and water-shedding stretch cotton ripstop.',
          sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
          colors: JSON.stringify(['Dark Olive', 'Matte Black', 'Coyote Tan']),
          featured: true,
          stock_quantity: 52
        },
        {
          name: 'HIGH-COLLAR SHEARLING AVIATOR COAT',
          category: 'Women',
          sub_category: 'Outerwear',
          price: 450.00,
          original_price: 550.00,
          tag: 'LUXURY DROP',
          image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1000&q=80',
          gallery: JSON.stringify([
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1000&q=80'
          ]),
          description: 'Plush Spanish merino shearling with soft cracked-leather outer finish and dual buckle-fastened high stand collar.',
          sizes: JSON.stringify(['XS', 'S', 'M', 'L']),
          colors: JSON.stringify(['Black / Ivory Fleece', 'Chocolate / Tan Fleece']),
          featured: true,
          stock_quantity: 12
        },
        {
          name: 'RACER SPEED GRAPHIC CAP',
          category: 'Accessories',
          sub_category: 'Accessories',
          price: 42.00,
          original_price: 50.00,
          tag: 'SPORT ACCESSORY',
          image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1000&q=80',
          gallery: JSON.stringify([
            'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1000&q=80'
          ]),
          description: 'Unstructured 5-panel running cap crafted from quick-drying micro-ripstop with breathable side laser perforations and adjustable reflective strap.',
          sizes: JSON.stringify(['One Size']),
          colors: JSON.stringify(['Reflective Silver', 'Stealth Black', 'Neon Citrus']),
          featured: false,
          stock_quantity: 90
        },
        {
          name: 'STRUCTURED WOOL TRENCH COAT',
          category: 'Men',
          sub_category: 'Outerwear',
          price: 340.00,
          original_price: 420.00,
          tag: 'TIMELESS',
          image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80',
          gallery: JSON.stringify([
            'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80'
          ]),
          description: 'Sharp architectural trench engineered from heavyweight bonded twill wool with belted waist, storm flap, and horn buttons.',
          sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
          colors: JSON.stringify(['Midnight Navy', 'Black Carbon', 'Raw Camel']),
          featured: true,
          stock_quantity: 19
        },
        {
          name: 'TRAIL-GRIP WATERPROOF RUNNER',
          category: 'Men',
          sub_category: 'Footwear',
          price: 170.00,
          original_price: 205.00,
          tag: 'OUTDOOR TECH',
          image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1000&q=80',
          gallery: JSON.stringify([
            'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1000&q=80'
          ]),
          description: 'Aggressive multi-directional Vibram Megagrip lug outsole with Gore-Tex breathable waterproof membrane for mountain trails and city streets.',
          sizes: JSON.stringify(['US 8', 'US 9', 'US 10', 'US 11', 'US 12']),
          colors: JSON.stringify(['Gore-Black', 'Canyon Moss', 'Earth Stone']),
          featured: false,
          stock_quantity: 44
        },
        {
          name: 'ASYMMETRICAL DRAPED TOP',
          category: 'Women',
          sub_category: 'Apparel',
          price: 89.00,
          original_price: 110.00,
          tag: 'EDITORIAL',
          image: 'https://images.unsplash.com/photo-1503342394128-c104d54dba01?auto=format&fit=crop&w=1000&q=80',
          gallery: JSON.stringify([
            'https://images.unsplash.com/photo-1503342394128-c104d54dba01?auto=format&fit=crop&w=1000&q=80'
          ]),
          description: 'Modern one-shoulder sculptural top in heavy stretch viscose jersey with side ruched gathering and raw-edge finish.',
          sizes: JSON.stringify(['XS', 'S', 'M', 'L']),
          colors: JSON.stringify(['Pure White', 'Pitch Black', 'Burgundy Wine']),
          featured: false,
          stock_quantity: 39
        },
        {
          name: 'LEATHER TRAVEL WEEKENDER DUFFLE',
          category: 'Accessories',
          sub_category: 'Accessories',
          price: 260.00,
          original_price: 310.00,
          tag: 'TRAVEL ESSENTIAL',
          image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80',
          gallery: JSON.stringify([
            'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80'
          ]),
          description: 'Spacious 45L travel duffle crafted from thick pebble-grain leather with dedicated ventilated shoe compartment and detachable padded shoulder harness.',
          sizes: JSON.stringify(['One Size']),
          colors: JSON.stringify(['Midnight Black', 'Vintage Bourbon']),
          featured: true,
          stock_quantity: 20
        },
        {
          name: 'HIGH-RISE SCULPT COMPRESSION SHORTS',
          category: 'Women',
          sub_category: 'Apparel',
          price: 62.00,
          original_price: 75.00,
          tag: 'FITNESS ESSENTIAL',
          image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=80',
          gallery: JSON.stringify([
            'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=80'
          ]),
          description: 'No-front-seam 8-inch biker shorts in buttery-soft ultra-dense compression fabric with drop-in waistband pockets.',
          sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL']),
          colors: JSON.stringify(['Matte Black', 'Graphite Blue', 'Espresso']),
          featured: false,
          stock_quantity: 68
        },
        {
          name: 'MINIMALIST BI-FOLD CARDHOLDER',
          category: 'Accessories',
          sub_category: 'Accessories',
          price: 48.00,
          original_price: null,
          tag: 'ACCENT',
          image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1000&q=80',
          gallery: JSON.stringify([
            'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1000&q=80'
          ]),
          description: 'Ultra-slim veg-tan bridle leather wallet featuring 6 precision laser-cut card slots and RFID protection barrier.',
          sizes: JSON.stringify(['One Size']),
          colors: JSON.stringify(['Matte Black', 'Natural Raw Tan']),
          featured: false,
          stock_quantity: 85
        }
      ];

      for (const p of seedProducts) {
        await conn.query(
          `INSERT INTO shop_products (name, category, sub_category, price, original_price, tag, image, gallery, description, sizes, colors, featured, stock_quantity)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [p.name, p.category, p.sub_category, p.price, p.original_price, p.tag, p.image, p.gallery, p.description, p.sizes, p.colors, p.featured, p.stock_quantity]
        );
      }
      console.log('Seed products inserted into college_db.');
    }
  } finally {
    conn.release();
  }
}
