import React, { useEffect, useState } from 'react';
import { 
  X, 
  Package, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  TrendingUp, 
  AlertCircle, 
  ShoppingBag, 
  Users, 
  Percent, 
  Star, 
  Search, 
  Edit3, 
  Eye, 
  BarChart3, 
  ShieldAlert, 
  Check, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { api } from '../api';

export default function AdminModal({ isOpen, onClose, onProductCreated }) {
  if (!isOpen) return null;

  // Active Tab: 'overview' | 'products' | 'new_product' | 'orders' | 'users' | 'coupons' | 'reviews'
  const [activeTab, setActiveTab] = useState('overview');

  // Loading & Alerts
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Data States
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Filters inside Admin
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');
  const [productSearch, setProductSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  // Selected Order for Full View Modal
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState(null);

  // Form Data for New Product
  const [formData, setFormData] = useState({
    name: '',
    category: 'Men',
    sub_category: 'Footwear',
    price: '',
    original_price: '',
    tag: 'STUDIO EXCLUSIVE',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1000&q=80',
    description: '',
    sizes: 'US 8, US 9, US 10, US 11',
    colors: 'Triple Black, Matte White',
    stock_quantity: 50,
    featured: true
  });

  // Form Data for New Coupon
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discount_percent: 15,
    min_spend: 100,
    active: true
  });

  const showSuccess = (msg) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(''), 4000);
  };

  // Loaders
  const loadStats = async () => {
    try {
      const data = await api.getAdminStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminOrders({ status: orderStatusFilter, search: orderSearch });
      setOrders(data);
    } catch (err) {
      showError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminProducts({ category: productCategoryFilter, search: productSearch });
      setProducts(data);
    } catch (err) {
      showError(err.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminUsers();
      setUsers(data);
    } catch (err) {
      showError(err.message || 'Failed to load user directory');
    } finally {
      setLoading(false);
    }
  };

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminCoupons();
      setCoupons(data);
    } catch (err) {
      showError(err.message || 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminReviews();
      setReviews(data);
    } catch (err) {
      showError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  // Load based on active tab
  useEffect(() => {
    loadStats();
    if (activeTab === 'overview') {
      loadOrders();
    } else if (activeTab === 'orders') {
      loadOrders();
    } else if (activeTab === 'products') {
      loadProducts();
    } else if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'coupons') {
      loadCoupons();
    } else if (activeTab === 'reviews') {
      loadReviews();
    }
  }, [activeTab]);

  // Order Operations
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      showSuccess(`Order #${orderId} status updated to "${newStatus.toUpperCase()}"`);
      loadOrders();
      loadStats();
    } catch (err) {
      showError(err.message || 'Status update failed');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(`Are you sure you want to delete order #${orderId}?`)) return;
    try {
      await api.deleteAdminOrder(orderId);
      showSuccess(`Order #${orderId} permanently removed`);
      loadOrders();
      loadStats();
    } catch (err) {
      showError(err.message || 'Order deletion failed');
    }
  };

  // Product Operations
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        sub_category: formData.sub_category,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        tag: formData.tag,
        image: formData.image,
        description: formData.description,
        sizes: formData.sizes.split(',').map(s => s.trim()),
        colors: formData.colors.split(',').map(c => c.trim()),
        stock_quantity: parseInt(formData.stock_quantity || 50),
        featured: formData.featured
      };

      await api.addProduct(payload);
      showSuccess(`Product "${payload.name}" published to MySQL!`);
      setFormData({
        name: '',
        category: 'Men',
        sub_category: 'Footwear',
        price: '',
        original_price: '',
        tag: 'STUDIO EXCLUSIVE',
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1000&q=80',
        description: '',
        sizes: 'US 8, US 9, US 10, US 11',
        colors: 'Triple Black, Matte White',
        stock_quantity: 50,
        featured: true
      });
      if (onProductCreated) onProductCreated();
      loadStats();
      setActiveTab('products');
    } catch (err) {
      showError(err.message || 'Failed to publish product');
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const payload = {
        name: editingProduct.name,
        category: editingProduct.category,
        sub_category: editingProduct.sub_category,
        price: parseFloat(editingProduct.price),
        original_price: editingProduct.original_price ? parseFloat(editingProduct.original_price) : null,
        tag: editingProduct.tag,
        image: editingProduct.image,
        description: editingProduct.description,
        sizes: Array.isArray(editingProduct.sizes) 
          ? editingProduct.sizes 
          : String(editingProduct.sizes).split(',').map(s => s.trim()),
        colors: Array.isArray(editingProduct.colors) 
          ? editingProduct.colors 
          : String(editingProduct.colors).split(',').map(c => c.trim()),
        stock_quantity: parseInt(editingProduct.stock_quantity || 50),
        featured: editingProduct.featured
      };

      await api.updateProduct(editingProduct.id, payload);
      showSuccess(`Product #${editingProduct.id} updated successfully!`);
      setEditingProduct(null);
      loadProducts();
      if (onProductCreated) onProductCreated();
    } catch (err) {
      showError(err.message || 'Failed to update product');
    }
  };

  const handleToggleFeatured = async (productId) => {
    try {
      await api.toggleProductFeatured(productId);
      showSuccess('Featured status updated');
      loadProducts();
      if (onProductCreated) onProductCreated();
    } catch (err) {
      showError(err.message || 'Failed to toggle featured status');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Delete this product permanently from MySQL?')) return;
    try {
      await api.deleteProduct(productId);
      showSuccess('Product removed from catalog');
      loadProducts();
      loadStats();
      if (onProductCreated) onProductCreated();
    } catch (err) {
      showError(err.message || 'Failed to delete product');
    }
  };

  // User Operations
  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'customer' : 'admin';
    try {
      await api.updateUserRole(userId, newRole);
      showSuccess(`User role changed to ${newRole}`);
      loadUsers();
    } catch (err) {
      showError(err.message || 'Failed to change role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user account?')) return;
    try {
      await api.deleteUser(userId);
      showSuccess('User account removed');
      loadUsers();
      loadStats();
    } catch (err) {
      showError(err.message || 'Failed to delete user');
    }
  };

  // Coupon Operations
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      await api.createCoupon(newCoupon);
      showSuccess(`Coupon "${newCoupon.code}" activated!`);
      setNewCoupon({ code: '', discount_percent: 15, min_spend: 100, active: true });
      loadCoupons();
    } catch (err) {
      showError(err.message || 'Failed to create coupon');
    }
  };

  const handleToggleCoupon = async (couponId) => {
    try {
      await api.toggleCoupon(couponId);
      showSuccess('Coupon status updated');
      loadCoupons();
    } catch (err) {
      showError(err.message || 'Failed to toggle coupon');
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    try {
      await api.deleteCoupon(couponId);
      showSuccess('Coupon removed');
      loadCoupons();
    } catch (err) {
      showError(err.message || 'Failed to delete coupon');
    }
  };

  // Review Operations
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this customer review?')) return;
    try {
      await api.deleteAdminReview(reviewId);
      showSuccess('Review deleted from database');
      loadReviews();
    } catch (err) {
      showError(err.message || 'Failed to delete review');
    }
  };

  // Filtered Users
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="admin-modal-content admin-modal-wide" onClick={(e) => e.stopPropagation()}>
        
        {/* Top Header */}
        <div className="admin-header">
          <div>
            <div className="admin-caps-badge">MYSQL ENTERPRISE FULFILLMENT & INVENTORY BACKEND</div>
            <h2 className="admin-title">STORE MANAGER & CURATION PORTAL</h2>
          </div>
          <button className="modal-close-icon" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Global Action Notifications */}
        {actionSuccess && <div className="success-banner">{actionSuccess}</div>}
        {error && <div className="error-banner">{error}</div>}

        {/* Main Tab Navigation */}
        <div className="admin-tab-nav full-nav">
          <button 
            className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <BarChart3 size={15} /> Overview & Metrics
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Package size={15} /> Products Catalog ({stats?.totalProducts || products.length})
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'new_product' ? 'active' : ''}`}
            onClick={() => setActiveTab('new_product')}
          >
            <Plus size={15} /> Add New Drop
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingBag size={15} /> Orders & Fulfillment ({stats?.totalOrders || orders.length})
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={15} /> Customers ({stats?.totalUsers || users.length})
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'coupons' ? 'active' : ''}`}
            onClick={() => setActiveTab('coupons')}
          >
            <Percent size={15} /> Coupons
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <Star size={15} /> Reviews Moderation
          </button>
        </div>

        {/* TAB 1: OVERVIEW & ANALYTICS METRICS */}
        {activeTab === 'overview' && (
          <div className="admin-tab-body">
            {/* Quick Metrics KPI Cards */}
            <div className="admin-stats-grid kpi-5">
              <div className="stat-card">
                <span className="stat-label">TOTAL STORE REVENUE</span>
                <strong className="stat-num">${Number(stats?.totalRevenue || 0).toFixed(2)}</strong>
                <small className="stat-sub">Confirmed gross sales</small>
              </div>
              <div className="stat-card">
                <span className="stat-label">TOTAL ORDERS</span>
                <strong className="stat-num">{stats?.totalOrders || 0}</strong>
                <small className="stat-sub">Across all statuses</small>
              </div>
              <div className="stat-card">
                <span className="stat-label">AVG ORDER VALUE</span>
                <strong className="stat-num">${Number(stats?.averageOrderValue || 0).toFixed(2)}</strong>
                <small className="stat-sub">Per checkout</small>
              </div>
              <div className="stat-card">
                <span className="stat-label">ACTIVE CATALOG ITEMS</span>
                <strong className="stat-num">{stats?.totalProducts || 0}</strong>
                <small className="stat-sub">In MySQL database</small>
              </div>
              <div className="stat-card">
                <span className="stat-label">REGISTERED CUSTOMERS</span>
                <strong className="stat-num">{stats?.totalUsers || 0}</strong>
                <small className="stat-sub">Verified accounts</small>
              </div>
            </div>

            {/* Status Breakdown Section */}
            <div className="admin-overview-columns">
              <div className="overview-card">
                <h3 className="overview-card-title">ORDER STATUS DISTRIBUTION</h3>
                <div className="status-bars-wrap">
                  {Object.entries(stats?.statusBreakdown || {}).map(([st, cnt]) => (
                    <div key={st} className="status-metric-row">
                      <span className={`status-pill ${st}`}>{st.toUpperCase()}</span>
                      <div className="status-bar-bg">
                        <div 
                          className={`status-bar-fill ${st}`} 
                          style={{ width: `${Math.min(100, ((cnt / (stats?.totalOrders || 1)) * 100))}%` }}
                        />
                      </div>
                      <span className="status-count-val">{cnt} orders</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overview-card">
                <h3 className="overview-card-title">QUICK OPERATIONAL ACTIONS</h3>
                <div className="quick-action-list">
                  <button className="quick-action-btn" onClick={() => setActiveTab('new_product')}>
                    <Plus size={16} /> Add a New Seasonal Drop
                  </button>
                  <button className="quick-action-btn" onClick={() => { setActiveTab('orders'); setOrderStatusFilter('paid'); }}>
                    <AlertCircle size={16} /> View Orders Awaiting Shipment ({stats?.statusBreakdown?.paid || 0})
                  </button>
                  <button className="quick-action-btn" onClick={() => setActiveTab('coupons')}>
                    <Percent size={16} /> Create Holiday Promo Discount Code
                  </button>
                  <button className="quick-action-btn" onClick={() => setActiveTab('reviews')}>
                    <Star size={16} /> Review Customer Feedback & Sizing Fit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS CATALOG MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="admin-tab-body">
            <div className="admin-subtoolbar">
              <div className="subtoolbar-left">
                <div className="admin-search-wrap">
                  <Search size={15} />
                  <input 
                    type="text"
                    placeholder="Search title, tag, or desc..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadProducts()}
                  />
                </div>
                <select 
                  className="admin-select"
                  value={productCategoryFilter}
                  onChange={(e) => { setProductCategoryFilter(e.target.value); setTimeout(loadProducts, 50); }}
                >
                  <option value="All">All Categories</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Footwear">Footwear</option>
                  <option value="Outerwear">Outerwear</option>
                  <option value="Accessories">Accessories</option>
                </select>
                <button className="admin-refresh-btn" onClick={loadProducts} title="Refresh">
                  <RefreshCw size={15} />
                </button>
              </div>
              <button className="solid-btn btn-sm" onClick={() => setActiveTab('new_product')}>
                + ADD DROP
              </button>
            </div>

            {loading ? (
              <p className="admin-loading">Loading inventory from MySQL...</p>
            ) : products.length === 0 ? (
              <p className="admin-empty">No products matched your search in database.</p>
            ) : (
              <div className="admin-orders-table-wrap">
                <table className="admin-orders-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Title & Details</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Badge</th>
                      <th>Stock</th>
                      <th>Featured</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <img src={p.image} alt={p.name} className="table-thumb" />
                        </td>
                        <td>
                          <strong>{p.name}</strong>
                          <div className="text-muted small">
                            Sub: {p.sub_category} | Sizes: {Array.isArray(p.sizes) ? p.sizes.join(', ') : p.sizes}
                          </div>
                        </td>
                        <td><span className="cat-pill">{p.category}</span></td>
                        <td>
                          <strong>${Number(p.price).toFixed(2)}</strong>
                          {p.original_price && (
                            <small className="table-original-price">
                              ${Number(p.original_price).toFixed(2)}
                            </small>
                          )}
                        </td>
                        <td>
                          {p.tag ? <span className="table-badge">{p.tag}</span> : <span className="text-muted">—</span>}
                        </td>
                        <td>
                          <span className={`stock-indicator ${Number(p.stock_quantity) <= 20 ? 'low' : 'good'}`}>
                            {p.stock_quantity ?? 50} units
                          </span>
                        </td>
                        <td>
                          <button 
                            className={`featured-star-btn ${p.featured ? 'active' : ''}`}
                            onClick={() => handleToggleFeatured(p.id)}
                            title="Toggle Featured Drop"
                          >
                            <Star size={16} fill={p.featured ? '#f59e0b' : 'none'} color={p.featured ? '#f59e0b' : '#999'} />
                          </button>
                        </td>
                        <td>
                          <div className="table-actions-cell">
                            <button 
                              className="table-action-icon edit" 
                              onClick={() => setEditingProduct(p)} 
                              title="Edit Product"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button 
                              className="table-action-icon delete" 
                              onClick={() => handleDeleteProduct(p.id)} 
                              title="Delete Product"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ADD NEW PRODUCT FORM */}
        {activeTab === 'new_product' && (
          <form className="admin-form" onSubmit={handleCreateProduct}>
            <div className="form-legend">
              <Sparkles size={16} /> ARCHIVE DROP METRICS & MULTI-ANGLE ASSETS
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Product Title *</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required 
                  placeholder="e.g. TECHNICAL WIND-BLOC SHELL"
                />
              </div>
              <div className="input-group">
                <label>Category *</label>
                <select 
                  value={formData.category} 
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Footwear">Footwear</option>
                  <option value="Outerwear">Outerwear</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>
            </div>

            <div className="form-row-3">
              <div className="input-group">
                <label>Sub-Category</label>
                <input 
                  type="text" 
                  value={formData.sub_category} 
                  onChange={(e) => setFormData({...formData, sub_category: e.target.value})}
                  placeholder="e.g. Footwear / Outerwear"
                />
              </div>
              <div className="input-group">
                <label>Selling Price ($) *</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={formData.price} 
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  required 
                  placeholder="145.00"
                />
              </div>
              <div className="input-group">
                <label>Original / MSRP ($)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={formData.original_price} 
                  onChange={(e) => setFormData({...formData, original_price: e.target.value})}
                  placeholder="180.00"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Badge / Editorial Tag</label>
                <input 
                  type="text" 
                  value={formData.tag} 
                  onChange={(e) => setFormData({...formData, tag: e.target.value})}
                  placeholder="JUST RELEASED / STUDIO EDITION / BESTSELLER"
                />
              </div>
              <div className="input-group">
                <label>Inventory Units in Stock</label>
                <input 
                  type="number" 
                  value={formData.stock_quantity} 
                  onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
                  placeholder="50"
                />
              </div>
            </div>

            <div className="input-group">
              <label>Hero Image URL *</label>
              <input 
                type="url" 
                value={formData.image} 
                onChange={(e) => setFormData({...formData, image: e.target.value})}
                required 
              />
            </div>

            <div className="input-group">
              <label>Editorial Description</label>
              <textarea 
                rows="3" 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Fabric composition, silhouette description, technical performance specs..."
              />
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Sizes (Comma-separated)</label>
                <input 
                  type="text" 
                  value={formData.sizes} 
                  onChange={(e) => setFormData({...formData, sizes: e.target.value})}
                />
              </div>
              <div className="input-group">
                <label>Colors (Comma-separated)</label>
                <input 
                  type="text" 
                  value={formData.colors} 
                  onChange={(e) => setFormData({...formData, colors: e.target.value})}
                />
              </div>
            </div>

            <div className="form-checkbox-row">
              <label className="checkbox-label">
                <input 
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                />
                Mark as "Featured Drop" on Storefront
              </label>
            </div>

            <button type="submit" className="solid-btn block-btn">
              PUBLISH TO MYSQL DATABASE
            </button>
          </form>
        )}

        {/* TAB 4: ORDERS & FULFILLMENT MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="admin-tab-body">
            <div className="admin-subtoolbar">
              <div className="subtoolbar-left">
                <div className="admin-search-wrap">
                  <Search size={15} />
                  <input 
                    type="text"
                    placeholder="Search by NZ-#, customer, email..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadOrders()}
                  />
                </div>
                <div className="status-filter-pills">
                  {['all', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
                    <button
                      key={st}
                      className={`status-filter-btn ${orderStatusFilter === st ? 'active' : ''}`}
                      onClick={() => { setOrderStatusFilter(st); setTimeout(loadOrders, 50); }}
                    >
                      {st.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <button className="admin-refresh-btn" onClick={loadOrders} title="Refresh">
                <RefreshCw size={15} />
              </button>
            </div>

            {loading ? (
              <p className="admin-loading">Loading live orders...</p>
            ) : orders.length === 0 ? (
              <p className="admin-empty">No orders found matching the filter criteria.</p>
            ) : (
              <div className="admin-orders-table-wrap">
                <table className="admin-orders-table">
                  <thead>
                    <tr>
                      <th>Ref Number</th>
                      <th>Customer & Address</th>
                      <th>Items Ordered</th>
                      <th>Total</th>
                      <th>Status Switcher</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td>
                          <strong>{o.order_number}</strong>
                          <div className="text-muted small">{new Date(o.created_at).toLocaleDateString()}</div>
                        </td>
                        <td>
                          <div><strong>{o.customer_name}</strong></div>
                          <small className="text-muted">{o.email}</small>
                          <div className="text-muted small">{o.city}, {o.country}</div>
                        </td>
                        <td>
                          {o.items && o.items.map((it, i) => (
                            <span key={i} className="table-item-chip">
                              {it.name} <small>({it.selectedSize || 'Standard'} / {it.selectedColor || 'Default'}) x{it.quantity}</small>
                            </span>
                          ))}
                        </td>
                        <td><strong>${Number(o.total_amount).toFixed(2)}</strong></td>
                        <td>
                          <select 
                            className={`status-dropdown ${o.status}`}
                            value={o.status}
                            onChange={(e) => handleStatusChange(o.id, e.target.value)}
                          >
                            <option value="paid">PAID</option>
                            <option value="processing">PROCESSING</option>
                            <option value="shipped">SHIPPED</option>
                            <option value="delivered">DELIVERED</option>
                            <option value="cancelled">CANCELLED</option>
                          </select>
                        </td>
                        <td>
                          <div className="table-actions-cell">
                            <button 
                              className="table-action-icon view"
                              onClick={() => setSelectedOrder(o)}
                              title="View Full Receipt"
                            >
                              <Eye size={15} />
                            </button>
                            <button 
                              className="table-action-icon delete"
                              onClick={() => handleDeleteOrder(o.id)}
                              title="Delete Order Record"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: REGISTERED CUSTOMERS */}
        {activeTab === 'users' && (
          <div className="admin-tab-body">
            <div className="admin-subtoolbar">
              <div className="admin-search-wrap">
                <Search size={15} />
                <input 
                  type="text"
                  placeholder="Filter customers by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
              <button className="admin-refresh-btn" onClick={loadUsers} title="Refresh">
                <RefreshCw size={15} />
              </button>
            </div>

            <div className="admin-orders-table-wrap">
              <table className="admin-orders-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Orders Placed</th>
                    <th>Total Spend</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td>#{u.id}</td>
                      <td><strong>{u.name}</strong></td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`role-pill ${u.role}`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td><strong>{u.total_orders || 0}</strong></td>
                      <td><strong>${Number(u.total_spent || 0).toFixed(2)}</strong></td>
                      <td>{new Date(u.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className="table-actions-cell">
                          <button 
                            className="role-toggle-btn"
                            onClick={() => handleRoleToggle(u.id, u.role)}
                            title="Toggle Admin / Customer Role"
                          >
                            {u.role === 'admin' ? 'Demote' : 'Promote Admin'}
                          </button>
                          <button 
                            className="table-action-icon delete"
                            onClick={() => handleDeleteUser(u.id)}
                            title="Delete User"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: PROMO COUPONS */}
        {activeTab === 'coupons' && (
          <div className="admin-tab-body">
            {/* Create Coupon Form */}
            <form className="coupon-create-form" onSubmit={handleCreateCoupon}>
              <h4 className="form-subheading">CREATE NEW PROMOTIONAL CODE</h4>
              <div className="coupon-inputs-grid">
                <div className="input-group">
                  <label>Promo Code (Uppercase)</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. VIP40"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                  />
                </div>
                <div className="input-group">
                  <label>Discount Percentage (%)</label>
                  <input 
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={newCoupon.discount_percent}
                    onChange={(e) => setNewCoupon({...newCoupon, discount_percent: e.target.value})}
                  />
                </div>
                <div className="input-group">
                  <label>Min Spend Requirement ($)</label>
                  <input 
                    type="number"
                    min="0"
                    value={newCoupon.min_spend}
                    onChange={(e) => setNewCoupon({...newCoupon, min_spend: e.target.value})}
                  />
                </div>
                <div className="input-group action-align">
                  <button type="submit" className="solid-btn">
                    + ACTIVATE CODE
                  </button>
                </div>
              </div>
            </form>

            <h4 className="form-subheading">CURRENT ACTIVE COUPONS</h4>
            <div className="admin-orders-table-wrap">
              <table className="admin-orders-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Discount</th>
                    <th>Min Spend</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr key={c.id}>
                      <td><strong className="coupon-code-pill">{c.code}</strong></td>
                      <td><strong>{c.discount_percent}% OFF</strong></td>
                      <td>${Number(c.min_spend).toFixed(2)}</td>
                      <td>
                        <button 
                          className={`toggle-status-btn ${c.active ? 'active' : 'inactive'}`}
                          onClick={() => handleToggleCoupon(c.id)}
                        >
                          {c.active ? 'ACTIVE' : 'DISABLED'}
                        </button>
                      </td>
                      <td>{new Date(c.created_at).toLocaleDateString()}</td>
                      <td>
                        <button 
                          className="table-action-icon delete"
                          onClick={() => handleDeleteCoupon(c.id)}
                          title="Delete Coupon"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: REVIEWS MODERATION */}
        {activeTab === 'reviews' && (
          <div className="admin-tab-body">
            <div className="admin-subtoolbar">
              <h4 className="form-subheading">CUSTOMER FEEDBACK & VERIFIED RATINGS</h4>
              <button className="admin-refresh-btn" onClick={loadReviews} title="Refresh">
                <RefreshCw size={15} />
              </button>
            </div>

            {reviews.length === 0 ? (
              <p className="admin-empty">No reviews in the system.</p>
            ) : (
              <div className="admin-orders-table-wrap">
                <table className="admin-orders-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Customer</th>
                      <th>Rating</th>
                      <th>Fit Profile</th>
                      <th>Comment</th>
                      <th>Date</th>
                      <th>Moderate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <strong>{r.product_name || `Product #${r.product_id}`}</strong>
                        </td>
                        <td>{r.user_name}</td>
                        <td>
                          <span className="star-rating-display">
                            {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                          </span>
                        </td>
                        <td>
                          <span className="fit-pill">{r.fit_rating}</span>
                        </td>
                        <td>
                          <div className="review-comment-cell">{r.comment || 'No written text'}</div>
                        </td>
                        <td>{new Date(r.created_at).toLocaleDateString()}</td>
                        <td>
                          <button 
                            className="table-action-icon delete"
                            onClick={() => handleDeleteReview(r.id)}
                            title="Delete Inappropriate Review"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* MODAL: EDIT PRODUCT DRAWER */}
        {editingProduct && (
          <div className="sub-modal-backdrop" onClick={() => setEditingProduct(null)}>
            <div className="sub-modal-box" onClick={(e) => e.stopPropagation()}>
              <div className="sub-modal-header">
                <h3>EDIT ARCHIVE DROP #{editingProduct.id}</h3>
                <button className="modal-close-icon" onClick={() => setEditingProduct(null)}>
                  <X size={20} />
                </button>
              </div>

              <form className="admin-form" onSubmit={handleUpdateProduct}>
                <div className="form-row">
                  <div className="input-group">
                    <label>Product Title</label>
                    <input 
                      type="text" 
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="input-group">
                    <label>Category</label>
                    <select 
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                    >
                      <option value="Men">Men</option>
                      <option value="Women">Women</option>
                      <option value="Footwear">Footwear</option>
                      <option value="Outerwear">Outerwear</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>
                </div>

                <div className="form-row-3">
                  <div className="input-group">
                    <label>Sub-Category</label>
                    <input 
                      type="text" 
                      value={editingProduct.sub_category || ''}
                      onChange={(e) => setEditingProduct({...editingProduct, sub_category: e.target.value})}
                    />
                  </div>
                  <div className="input-group">
                    <label>Price ($)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="input-group">
                    <label>Original Price ($)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={editingProduct.original_price || ''}
                      onChange={(e) => setEditingProduct({...editingProduct, original_price: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label>Badge / Tag</label>
                    <input 
                      type="text" 
                      value={editingProduct.tag || ''}
                      onChange={(e) => setEditingProduct({...editingProduct, tag: e.target.value})}
                    />
                  </div>
                  <div className="input-group">
                    <label>Units in Stock</label>
                    <input 
                      type="number" 
                      value={editingProduct.stock_quantity ?? 50}
                      onChange={(e) => setEditingProduct({...editingProduct, stock_quantity: e.target.value})}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Image URL</label>
                  <input 
                    type="url" 
                    value={editingProduct.image}
                    onChange={(e) => setEditingProduct({...editingProduct, image: e.target.value})}
                    required 
                  />
                </div>

                <div className="input-group">
                  <label>Description</label>
                  <textarea 
                    rows="3"
                    value={editingProduct.description || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                  />
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label>Sizes (Comma-separated)</label>
                    <input 
                      type="text" 
                      value={Array.isArray(editingProduct.sizes) ? editingProduct.sizes.join(', ') : editingProduct.sizes}
                      onChange={(e) => setEditingProduct({...editingProduct, sizes: e.target.value})}
                    />
                  </div>
                  <div className="input-group">
                    <label>Colors (Comma-separated)</label>
                    <input 
                      type="text" 
                      value={Array.isArray(editingProduct.colors) ? editingProduct.colors.join(', ') : editingProduct.colors}
                      onChange={(e) => setEditingProduct({...editingProduct, colors: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-checkbox-row">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox"
                      checked={editingProduct.featured}
                      onChange={(e) => setEditingProduct({...editingProduct, featured: e.target.checked})}
                    />
                    Featured Drop
                  </label>
                </div>

                <div className="modal-buttons-row">
                  <button type="button" className="outline-btn" onClick={() => setEditingProduct(null)}>
                    CANCEL
                  </button>
                  <button type="submit" className="solid-btn">
                    SAVE CHANGES TO MYSQL
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: VIEW ORDER DETAILS */}
        {selectedOrder && (
          <div className="sub-modal-backdrop" onClick={() => setSelectedOrder(null)}>
            <div className="sub-modal-box" onClick={(e) => e.stopPropagation()}>
              <div className="sub-modal-header">
                <h3>ORDER RECEIPT: {selectedOrder.order_number}</h3>
                <button className="modal-close-icon" onClick={() => setSelectedOrder(null)}>
                  <X size={20} />
                </button>
              </div>

              <div className="receipt-details">
                <div className="receipt-meta-grid">
                  <div>
                    <span className="meta-label">CUSTOMER</span>
                    <strong>{selectedOrder.customer_name}</strong>
                    <div>{selectedOrder.email}</div>
                  </div>
                  <div>
                    <span className="meta-label">DELIVERY DESTINATION</span>
                    <div>{selectedOrder.address}</div>
                    <div>{selectedOrder.city}, {selectedOrder.postal_code}</div>
                    <div>{selectedOrder.country}</div>
                  </div>
                  <div>
                    <span className="meta-label">STATUS & PAYMENT</span>
                    <span className={`status-pill ${selectedOrder.status}`}>{selectedOrder.status.toUpperCase()}</span>
                    <div>Method: {selectedOrder.payment_method || 'Card'}</div>
                  </div>
                </div>

                <h4 className="receipt-items-title">ORDER LINE ITEMS</h4>
                <div className="receipt-items-list">
                  {selectedOrder.items && selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="receipt-item-row">
                      <div>
                        <strong>{it.name}</strong>
                        <div className="text-muted small">
                          Size: {it.selectedSize || 'Standard'} | Color: {it.selectedColor || 'Default'}
                        </div>
                      </div>
                      <div className="receipt-price-qty">
                        <span>Qty: {it.quantity}</span>
                        <strong>${(Number(it.price) * it.quantity).toFixed(2)}</strong>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="receipt-total-row">
                  <span>TOTAL PAID</span>
                  <strong className="receipt-grand-total">${Number(selectedOrder.total_amount).toFixed(2)}</strong>
                </div>

                <div className="receipt-actions">
                  <select 
                    className={`status-dropdown ${selectedOrder.status}`}
                    value={selectedOrder.status}
                    onChange={(e) => {
                      handleStatusChange(selectedOrder.id, e.target.value);
                      setSelectedOrder({...selectedOrder, status: e.target.value});
                    }}
                  >
                    <option value="paid">PAID</option>
                    <option value="processing">PROCESSING</option>
                    <option value="shipped">SHIPPED</option>
                    <option value="delivered">DELIVERED</option>
                    <option value="cancelled">CANCELLED</option>
                  </select>
                  <button className="outline-btn btn-sm" onClick={() => setSelectedOrder(null)}>
                    CLOSE RECEIPT
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
