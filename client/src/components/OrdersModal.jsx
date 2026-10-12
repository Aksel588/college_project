import React, { useEffect, useState } from 'react';
import { X, Package, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { api } from '../api';

export default function OrdersModal({ isOpen, onClose, token }) {
  if (!isOpen) return null;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        const data = await api.getMyOrders(token);
        setOrders(data);
      } catch (err) {
        setError(err.message || 'Unable to retrieve your order receipts');
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      loadOrders();
    }
  }, [token]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="orders-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="orders-header">
          <div>
            <h2 className="orders-title">MY ORDERS & RECEIPTS</h2>
            <p className="orders-sub">Track real-time status recorded in your MySQL database</p>
          </div>
          <button className="modal-close-icon" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        <div className="orders-body">
          {loading ? (
            <div className="orders-empty-state">
              <Clock size={36} className="spin-icon" />
              <p>Fetching purchase history...</p>
            </div>
          ) : error ? (
            <div className="error-banner">{error}</div>
          ) : orders.length === 0 ? (
            <div className="orders-empty-state">
              <Package size={44} strokeWidth={1.3} />
              <p className="empty-title">NO ORDERS FOUND</p>
              <p className="empty-desc">You have not completed any purchases yet.</p>
            </div>
          ) : (
            <div className="orders-cards-list">
              {orders.map((order) => (
                <div key={order.id} className="order-history-card">
                  <div className="order-card-top">
                    <div>
                      <span className="order-num-label">Order Ref:</span>
                      <strong className="order-num-val">{order.order_number}</strong>
                    </div>
                    <div className="order-date-tag">
                      {new Date(order.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <span className="order-status-badge">
                      <CheckCircle2 size={13} /> {order.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="order-items-thumbnails">
                    {order.items && order.items.map((item, idx) => (
                      <div key={idx} className="order-item-inline">
                        <img src={item.image} alt={item.name} className="order-thumb" />
                        <div className="order-thumb-details">
                          <p className="thumb-name">{item.name}</p>
                          <p className="thumb-spec">Qty: {item.quantity} • ${item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="order-card-bottom">
                    <div className="shipping-to">
                      <span>Delivered To:</span> {order.address}, {order.city} ({order.country})
                    </div>
                    <div className="order-total-display">
                      <span>Total: </span>
                      <strong>${Number(order.total_amount).toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
