import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { pool, initDB } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'secret_shop_key';

app.use(cors());
app.use(express.json());

// Auth Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Authentication token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// ----------------- AUTH ROUTES ----------------- //

// Register
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please provide all required fields' });
  }

  try {
    const [existing] = await pool.query('SELECT id FROM shop_users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO shop_users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'customer']
    );

    const user = { id: result.insertId, name, email, role: 'customer' };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to create account: ' + error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM shop_users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const userData = { id: user.id, name: user.name, email: user.email, role: user.role };
    const token = jwt.sign(userData, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Welcome back',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get Current User Profile
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, email, role, created_at FROM shop_users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Database query failed' });
  }
});

// ----------------- PRODUCTS ROUTES ----------------- //

// Get all products (with optional filter)
app.get('/api/products', async (req, res) => {
  const { category, search, sort } = req.query;
  try {
    let sql = 'SELECT * FROM shop_products WHERE 1=1';
    const params = [];

    if (category && category !== 'All') {
      sql += ' AND (category = ? OR sub_category = ?)';
      params.push(category, category);
    }

    if (search) {
      sql += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (sort === 'price_asc') {
      sql += ' ORDER BY price ASC';
    } else if (sort === 'price_desc') {
      sql += ' ORDER BY price DESC';
    } else {
      sql += ' ORDER BY id DESC';
    }

    const [rows] = await pool.query(sql, params);
    
    // Parse json columns
    const products = rows.map(item => ({
      ...item,
      gallery: typeof item.gallery === 'string' ? JSON.parse(item.gallery || '[]') : item.gallery || [],
      sizes: typeof item.sizes === 'string' ? JSON.parse(item.sizes || '[]') : item.sizes || [],
      colors: typeof item.colors === 'string' ? JSON.parse(item.colors || '[]') : item.colors || []
    }));

    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Could not fetch products' });
  }
});

// Get product by id
app.get('/api/products/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM shop_products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    
    const item = rows[0];
    const product = {
      ...item,
      gallery: typeof item.gallery === 'string' ? JSON.parse(item.gallery || '[]') : item.gallery || [],
      sizes: typeof item.sizes === 'string' ? JSON.parse(item.sizes || '[]') : item.sizes || [],
      colors: typeof item.colors === 'string' ? JSON.parse(item.colors || '[]') : item.colors || []
    };
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ----------------- ORDERS & CHECKOUT ROUTES ----------------- //

// Create Order (Simulate Checkout / Pay)
app.post('/api/orders', async (req, res) => {
  const { customerName, email, address, city, postalCode, country, items, totalAmount, paymentMethod, userId } = req.body;

  if (!customerName || !email || !address || !items || !totalAmount) {
    return res.status(400).json({ error: 'Incomplete order checkout details' });
  }

  try {
    const orderNumber = 'NZ-' + Math.floor(100000 + Math.random() * 900000);
    const [result] = await pool.query(
      `INSERT INTO shop_orders (user_id, order_number, customer_name, email, address, city, postal_code, country, total_amount, payment_method, status, items)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId || null,
        orderNumber,
        customerName,
        email,
        address,
        city || '',
        postalCode || '',
        country || '',
        totalAmount,
        paymentMethod || 'Card',
        'paid',
        JSON.stringify(items)
      ]
    );

    res.status(201).json({
      message: 'Order placed successfully! Payment confirmed.',
      orderId: result.insertId,
      orderNumber,
      totalAmount,
      status: 'paid'
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Order processing failed: ' + error.message });
  }
});

// Get user orders
app.get('/api/orders/my-orders', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM shop_orders WHERE user_id = ? OR email = ? ORDER BY id DESC',
      [req.user.id, req.user.email]
    );

    const orders = rows.map(o => ({
      ...o,
      items: typeof o.items === 'string' ? JSON.parse(o.items || '[]') : o.items || []
    }));

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve orders' });
  }
});

// ----------------- PHASE 1: ADMIN ROUTES ----------------- //

// Admin: Get all orders across the store
app.get('/api/admin/orders', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM shop_orders ORDER BY id DESC');
    const orders = rows.map(o => ({
      ...o,
      items: typeof o.items === 'string' ? JSON.parse(o.items || '[]') : o.items || []
    }));
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admin orders' });
  }
});

// Admin: Update order fulfillment status
app.patch('/api/admin/orders/:id/status', async (req, res) => {
  const { status } = req.body;
  const valid = ['paid', 'processing', 'shipped', 'delivered'];
  if (!valid.includes(status)) {
    return res.status(400).json({ error: 'Invalid order status' });
  }

  try {
    await pool.query('UPDATE shop_orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Order status updated successfully', orderId: req.params.id, status });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Admin: Add new product
app.post('/api/admin/products', async (req, res) => {
  const { name, category, sub_category, price, original_price, tag, image, description, sizes, colors } = req.body;
  if (!name || !category || !price || !image) {
    return res.status(400).json({ error: 'Missing required product fields' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO shop_products (name, category, sub_category, price, original_price, tag, image, gallery, description, sizes, colors, featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        category,
        sub_category || category,
        price,
        original_price || null,
        tag || 'NEW DROP',
        image,
        JSON.stringify([image]),
        description || '',
        JSON.stringify(sizes || ['S', 'M', 'L', 'XL']),
        JSON.stringify(colors || ['Black', 'White']),
        true
      ]
    );

    res.status(201).json({ message: 'Product added successfully', productId: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add product: ' + error.message });
  }
});

// Admin: Delete product
app.delete('/api/admin/products/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM shop_products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deleted from inventory' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// ----------------- PHASE 2: WISHLIST & COUPONS ----------------- //

// Get User Wishlist
app.get('/api/wishlist', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, w.created_at AS added_at 
       FROM shop_wishlist w
       JOIN shop_products p ON w.product_id = p.id
       WHERE w.user_id = ?
       ORDER BY w.id DESC`,
      [req.user.id]
    );

    const products = rows.map(item => ({
      ...item,
      gallery: typeof item.gallery === 'string' ? JSON.parse(item.gallery || '[]') : item.gallery || [],
      sizes: typeof item.sizes === 'string' ? JSON.parse(item.sizes || '[]') : item.sizes || [],
      colors: typeof item.colors === 'string' ? JSON.parse(item.colors || '[]') : item.colors || []
    }));

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// Toggle Add/Remove Wishlist item
app.post('/api/wishlist/toggle', authenticateToken, async (req, res) => {
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ error: 'Product ID required' });

  try {
    const [existing] = await pool.query(
      'SELECT id FROM shop_wishlist WHERE user_id = ? AND product_id = ?',
      [req.user.id, productId]
    );

    if (existing.length > 0) {
      await pool.query('DELETE FROM shop_wishlist WHERE user_id = ? AND product_id = ?', [req.user.id, productId]);
      return res.json({ action: 'removed', productId });
    } else {
      await pool.query('INSERT INTO shop_wishlist (user_id, product_id) VALUES (?, ?)', [req.user.id, productId]);
      return res.json({ action: 'added', productId });
    }
  } catch (error) {
    res.status(500).json({ error: 'Wishlist toggle failed' });
  }
});

// Validate Coupon Code
app.post('/api/coupons/apply', async (req, res) => {
  const { code, subtotal } = req.body;
  if (!code) return res.status(400).json({ error: 'Coupon code required' });

  try {
    const [rows] = await pool.query('SELECT * FROM shop_coupons WHERE code = ? AND active = 1', [code.trim().toUpperCase()]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Invalid or expired promo code' });
    }

    const coupon = rows[0];
    if (subtotal < Number(coupon.min_spend)) {
      return res.status(400).json({
        error: `Minimum order spend of $${Number(coupon.min_spend).toFixed(2)} required for this code`
      });
    }

    const discountAmount = Number(((subtotal * coupon.discount_percent) / 100).toFixed(2));
    res.json({
      code: coupon.code,
      discountPercent: coupon.discount_percent,
      discountAmount,
      message: `${coupon.discount_percent}% Discount Applied!`
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to evaluate promo code' });
  }
});

// ----------------- PHASE 3: REVIEWS & RATINGS ----------------- //

// Get Reviews for Product
app.get('/api/products/:id/reviews', async (req, res) => {
  try {
    const [reviews] = await pool.query(
      'SELECT * FROM shop_reviews WHERE product_id = ? ORDER BY id DESC',
      [req.params.id]
    );

    // Compute average rating
    const total = reviews.length;
    const avg = total > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(1) : null;

    res.json({
      averageRating: avg,
      totalReviews: total,
      reviews
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve reviews' });
  }
});

// Submit a Review
app.post('/api/products/:id/reviews', async (req, res) => {
  const { userName, rating, fitRating, comment, userId } = req.body;
  if (!userName || !rating) {
    return res.status(400).json({ error: 'Name and star rating are required' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO shop_reviews (product_id, user_id, user_name, rating, fit_rating, comment)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.params.id, userId || null, userName, rating, fitRating || 'True to Size', comment || '']
    );

    res.status(201).json({
      message: 'Review posted successfully',
      reviewId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to post review' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Nike/Zara eCommerce API', db: process.env.DB_NAME || 'college_db', timestamp: new Date() });
});

// Start Server & Init Database
initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`>>> Express server running with MySQL [${process.env.DB_NAME || 'college_db'}:${process.env.DB_PORT || 3306}] on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
