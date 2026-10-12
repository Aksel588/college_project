import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQty,
  onRemoveItem,
  onProceedCheckout
}) {
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const shipping = subtotal > 150 || subtotal === 0 ? 0 : 15;
  const total = subtotal + shipping;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <aside className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-title-box">
            <h2 className="drawer-title">YOUR BAG</h2>
            <span className="drawer-count">({items.reduce((acc, i) => acc + i.quantity, 0)} ITEMS)</span>
          </div>
          <button className="drawer-close-btn" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        {/* Free Shipping Meter */}
        <div className="shipping-meter-wrap">
          {subtotal >= 150 ? (
            <p className="shipping-text free-unlocked">✨ You have unlocked complimentary express shipping!</p>
          ) : (
            <p className="shipping-text">
              Add <strong>${(150 - subtotal).toFixed(2)}</strong> more to unlock complimentary shipping.
            </p>
          )}
          <div className="meter-bar">
            <div 
              className="meter-fill" 
              style={{ width: `${Math.min(100, (subtotal / 150) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Items List */}
        <div className="drawer-body">
          {items.length === 0 ? (
            <div className="empty-cart-state">
              <ShoppingBag size={48} strokeWidth={1.2} />
              <p className="empty-title">YOUR SHOPPING BAG IS EMPTY</p>
              <p className="empty-desc">Explore our latest drops and additions to build your wardrobe.</p>
              <button className="solid-btn" onClick={onClose}>CONTINUE BROWSING</button>
            </div>
          ) : (
            <div className="cart-items-list">
              {items.map((item, idx) => (
                <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}-${idx}`} className="cart-item">
                  <img src={item.image} alt={item.name} className="cart-item-thumb" />
                  
                  <div className="cart-item-details">
                    <div className="cart-item-header">
                      <h4 className="cart-item-name">{item.name}</h4>
                      <button 
                        className="item-remove-icon" 
                        onClick={() => onRemoveItem(item.id, item.selectedSize, item.selectedColor)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <p className="cart-item-specs">
                      {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                      {item.selectedColor && <span> • {item.selectedColor}</span>}
                    </p>

                    <div className="cart-item-footer">
                      <div className="qty-controls">
                        <button 
                          className="qty-btn"
                          onClick={() => onUpdateQty(item.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="qty-value">{item.quantity}</span>
                        <button 
                          className="qty-btn"
                          onClick={() => onUpdateQty(item.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <span className="cart-item-price">
                        ${(Number(item.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer / Summary */}
        {items.length > 0 && (
          <div className="drawer-footer">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Estimated Shipping</span>
              <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="summary-row total-row">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <button 
              className="checkout-proceed-btn"
              onClick={() => {
                onClose();
                onProceedCheckout();
              }}
            >
              <span>CHECKOUT & PAY</span>
              <ArrowRight size={18} />
            </button>
            <p className="checkout-guarantee">Taxes, customs and duties calculated at next step</p>
          </div>
        )}
      </aside>
    </div>
  );
}
