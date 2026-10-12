import React, { useEffect, useState } from 'react';
import { X, Package, Plus, Trash2, CheckCircle2, TrendingUp, AlertCircle, ShoppingBag } from 'lucide-react';
import { api } from '../api';

export default function AdminModal({ isOpen, onClose, onProductCreated }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'new_product'
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // New Product Form
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
    colors: 'Triple Black, Matte White'
  });

  const loadAdminOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminOrders();
      setOrders(data);
    } catch (err) {
      setError(err.message || 'Failed to load store orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      setActionSuccess(`Order #${orderId} status changed to ${newStatus}`);
      setTimeout(() => setActionSuccess(''), 2500);
      loadAdminOrders();
    } catch (err) {
      setError(err.message || 'Status update failed');
    }
  };

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
        colors: formData.colors.split(',').map(c => c.trim())
      };

      await api.addProduct(payload);
      setActionSuccess(`Product "${payload.name}" published to MySQL!`);
      setTimeout(() => setActionSuccess(''), 2500);
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
        colors: 'Triple Black, Matte White'
      });
      if (onProductCreated) onProductCreated();
    } catch (err) {
      setError(err.message || 'Failed to publish product');
    }
  };

  const totalSales = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="admin-header">
          <div>
            <div className="admin-caps-badge">MYSQL FULFILLMENT & INVENTORY BACKEND</div>
            <h2 className="admin-title">STORE MANAGER PORTAL</h2>
          </div>
          <button className="modal-close-icon" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="admin-stats-grid">
          <div className="stat-card">
            <span className="stat-label">TOTAL STORE REVENUE</span>
            <strong className="stat-num">${totalSales.toFixed(2)}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">RECORDED ORDERS</span>
            <strong className="stat-num">{orders.length}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">ACTIVE DATABASE</span>
            <strong className="stat-num text-success">college_db : 3321</strong>
          </div>
        </div>

        {actionSuccess && <div className="success-banner">{actionSuccess}</div>}
        {error && <div className="error-banner">{error}</div>}

        {/* Tab Controls */}
        <div className="admin-tab-nav">
          <button 
            className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Manage Customer Orders ({orders.length})
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'new_product' ? 'active' : ''}`}
            onClick={() => setActiveTab('new_product')}
          >
            + Add New Drop to MySQL
          </button>
        </div>

        {/* Tab 1: Orders */}
        {activeTab === 'orders' && (
          <div className="admin-tab-body">
            {loading ? (
              <p className="admin-loading">Loading live orders...</p>
            ) : orders.length === 0 ? (
              <p className="admin-empty">No orders found in database.</p>
            ) : (
              <div className="admin-orders-table-wrap">
                <table className="admin-orders-table">
                  <thead>
                    <tr>
                      <th>Ref Number</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status Switcher</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td><strong>{o.order_number}</strong></td>
                        <td>
                          <div>{o.customer_name}</div>
                          <small className="text-muted">{o.email}</small>
                        </td>
                        <td>
                          {o.items && o.items.map((it, i) => (
                            <span key={i} className="table-item-chip">
                              {it.name} (x{it.quantity})
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
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Add New Drop Form */}
        {activeTab === 'new_product' && (
          <form className="admin-form" onSubmit={handleCreateProduct}>
            <div className="form-row">
              <div className="input-group">
                <label>Product Title</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required 
                  placeholder="e.g. MONOCHROME BOMBER JACKET"
                />
              </div>
              <div className="input-group">
                <label>Category</label>
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
                <label>Price (USD)</label>
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
                <label>Original Price (Optional)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={formData.original_price} 
                  onChange={(e) => setFormData({...formData, original_price: e.target.value})}
                  placeholder="180.00"
                />
              </div>
              <div className="input-group">
                <label>Badge / Tag</label>
                <input 
                  type="text" 
                  value={formData.tag} 
                  onChange={(e) => setFormData({...formData, tag: e.target.value})}
                  placeholder="NEW DROP"
                />
              </div>
            </div>

            <div className="input-group">
              <label>Image URL</label>
              <input 
                type="url" 
                value={formData.image} 
                onChange={(e) => setFormData({...formData, image: e.target.value})}
                required 
              />
            </div>

            <div className="input-group">
              <label>Description</label>
              <textarea 
                rows="2" 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Editorial garment specs, material density, and cut details..."
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

            <button type="submit" className="solid-btn block-btn">
              PUBLISH TO MYSQL DATABASE
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
