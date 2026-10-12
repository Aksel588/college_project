import React, { useEffect, useState } from 'react';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { api } from '../api';

export default function WishlistModal({ isOpen, onClose, token, onAddToCart }) {
  if (!isOpen) return null;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const data = await api.getWishlist(token);
      setItems(data);
    } catch (err) {
      setError(err.message || 'Failed to load saved items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadWishlist();
  }, [token]);

  const handleRemove = async (productId) => {
    try {
      await api.toggleWishlist(productId, token);
      setItems(prev => prev.filter(it => it.id !== productId));
    } catch (err) {
      setError('Could not remove item');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="wishlist-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="wishlist-header">
          <div className="wishlist-title-wrap">
            <Heart size={20} className="text-danger" fill="#ff3e3e" />
            <h2 className="wishlist-title">MY SAVED PIECES ({items.length})</h2>
          </div>
          <button className="modal-close-icon" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        {loading ? (
          <p className="admin-loading">Syncing wishlist from MySQL...</p>
        ) : error ? (
          <div className="error-banner">{error}</div>
        ) : items.length === 0 ? (
          <div className="empty-cart-state" style={{ padding: '3rem 0' }}>
            <Heart size={44} strokeWidth={1.2} />
            <p className="empty-title">YOUR WISHLIST IS EMPTY</p>
            <p className="empty-desc">Click the heart icon on any drop to save your favorite silhouettes.</p>
          </div>
        ) : (
          <div className="wishlist-grid">
            {items.map((product) => (
              <div key={product.id} className="wishlist-card">
                <img src={product.image} alt={product.name} className="wishlist-thumb" />
                <div className="wishlist-meta">
                  <h4 className="wishlist-item-name">{product.name}</h4>
                  <p className="wishlist-item-price">${Number(product.price).toFixed(2)}</p>
                  
                  <div className="wishlist-actions">
                    <button 
                      className="solid-btn btn-sm"
                      onClick={() => {
                        const defaultSize = product.sizes?.[0] || 'Standard';
                        const defaultColor = product.colors?.[0] || 'Default';
                        onAddToCart(product, defaultSize, defaultColor);
                      }}
                    >
                      <ShoppingBag size={14} /> MOVE TO BAG
                    </button>
                    <button 
                      className="icon-action-btn"
                      onClick={() => handleRemove(product.id)}
                      title="Remove from saved"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
