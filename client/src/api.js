const API_BASE = 'http://localhost:5001/api';

export const api = {
  // Products (with advanced filter parameters)
  async getProducts(params = {}) {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== '' && v !== null)
    );
    const query = new URLSearchParams(cleanParams).toString();
    const res = await fetch(`${API_BASE}/products${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  async getProduct(id) {
    const res = await fetch(`${API_BASE}/products/${id}`);
    if (!res.ok) throw new Error('Product not found');
    return res.json();
  },

  // Auth
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  async register(name, email, password) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  // Orders
  async createOrder(orderPayload) {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Checkout failed');
    return data;
  },

  async getMyOrders(token) {
    const res = await fetch(`${API_BASE}/orders/my-orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  // ----------------- ADMIN PORTAL APIS ----------------- //
  async getAdminStats() {
    const res = await fetch(`${API_BASE}/admin/stats`);
    if (!res.ok) throw new Error('Failed to fetch admin statistics');
    return res.json();
  },

  async getAdminOrders(params = {}) {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== '' && v !== null)
    );
    const query = new URLSearchParams(cleanParams).toString();
    const res = await fetch(`${API_BASE}/admin/orders${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch all orders');
    return res.json();
  },

  async updateOrderStatus(orderId, status) {
    const res = await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update order status');
    return data;
  },

  async deleteAdminOrder(orderId) {
    const res = await fetch(`${API_BASE}/admin/orders/${orderId}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete order');
    return data;
  },

  async getAdminProducts(params = {}) {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== '' && v !== null)
    );
    const query = new URLSearchParams(cleanParams).toString();
    const res = await fetch(`${API_BASE}/admin/products${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch admin inventory');
    return res.json();
  },

  async addProduct(productData) {
    const res = await fetch(`${API_BASE}/admin/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add product');
    return data;
  },

  async updateProduct(id, productData) {
    const res = await fetch(`${API_BASE}/admin/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update product');
    return data;
  },

  async toggleProductFeatured(id) {
    const res = await fetch(`${API_BASE}/admin/products/${id}/toggle-featured`, {
      method: 'PATCH'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to toggle featured status');
    return data;
  },

  async deleteProduct(productId) {
    const res = await fetch(`${API_BASE}/admin/products/${productId}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete product');
    return data;
  },

  async getAdminUsers() {
    const res = await fetch(`${API_BASE}/admin/users`);
    if (!res.ok) throw new Error('Failed to load registered customers');
    return res.json();
  },

  async updateUserRole(userId, role) {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update user role');
    return data;
  },

  async deleteUser(userId) {
    const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete user');
    return data;
  },

  async getAdminCoupons() {
    const res = await fetch(`${API_BASE}/admin/coupons`);
    if (!res.ok) throw new Error('Failed to fetch coupons');
    return res.json();
  },

  async createCoupon(couponData) {
    const res = await fetch(`${API_BASE}/admin/coupons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(couponData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create coupon');
    return data;
  },

  async toggleCoupon(couponId) {
    const res = await fetch(`${API_BASE}/admin/coupons/${couponId}/toggle`, {
      method: 'PATCH'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to toggle coupon');
    return data;
  },

  async deleteCoupon(couponId) {
    const res = await fetch(`${API_BASE}/admin/coupons/${couponId}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete coupon');
    return data;
  },

  async getAdminReviews() {
    const res = await fetch(`${API_BASE}/admin/reviews`);
    if (!res.ok) throw new Error('Failed to fetch reviews');
    return res.json();
  },

  async deleteAdminReview(reviewId) {
    const res = await fetch(`${API_BASE}/admin/reviews/${reviewId}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete review');
    return data;
  },

  // ----------------- WISHLIST & COUPONS ----------------- //
  async getWishlist(token) {
    const res = await fetch(`${API_BASE}/wishlist`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch wishlist');
    return res.json();
  },

  async toggleWishlist(productId, token) {
    const res = await fetch(`${API_BASE}/wishlist/toggle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ productId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update wishlist');
    return data;
  },

  async applyCoupon(code, subtotal) {
    const res = await fetch(`${API_BASE}/coupons/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Invalid coupon code');
    return data;
  },

  // ----------------- REVIEWS & RATINGS ----------------- //
  async getProductReviews(productId) {
    const res = await fetch(`${API_BASE}/products/${productId}/reviews`);
    if (!res.ok) throw new Error('Failed to load reviews');
    return res.json();
  },

  async addReview(productId, reviewData) {
    const res = await fetch(`${API_BASE}/products/${productId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit review');
    return data;
  }
};
