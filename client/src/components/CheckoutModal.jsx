import React, { useState } from 'react';
import { X, CreditCard, Lock, CheckCircle, ShieldCheck, ArrowLeft, Truck } from 'lucide-react';
import { api } from '../api';

export default function CheckoutModal({
  isOpen,
  onClose,
  items,
  currentUser,
  onOrderSuccess
}) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    customerName: currentUser?.name || '',
    email: currentUser?.email || '',
    address: 'Calle Serrano, 45',
    city: 'Madrid',
    postalCode: '28001',
    country: 'Spain',
    cardNumber: '4532 •••• •••• 8892',
    cardExp: '12/28',
    cardCvc: '842',
    paymentMethod: 'Credit / Debit Card'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successOrder, setSuccessOrder] = useState(null);

  // Phase 2: Promo Code state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const subtotal = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const shipping = discountedSubtotal > 150 ? 0 : 15;
  const tax = Number((discountedSubtotal * 0.08).toFixed(2));
  const grandTotal = Number((discountedSubtotal + shipping + tax).toFixed(2));

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    if (!couponInput.trim()) return;

    try {
      const res = await api.applyCoupon(couponInput, subtotal);
      setAppliedCoupon(res);
      setCouponSuccess(res.message);
    } catch (err) {
      setCouponError(err.message || 'Invalid coupon code');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayNow = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        customerName: formData.customerName,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        country: formData.country,
        items,
        totalAmount: grandTotal,
        paymentMethod: formData.paymentMethod,
        userId: currentUser?.id || null
      };

      const result = await api.createOrder(payload);
      setSuccessOrder(result);
      if (onOrderSuccess) onOrderSuccess(result);
    } catch (err) {
      setErrorMessage(err.message || 'Payment simulation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="checkout-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="checkout-header-bar">
          <div className="checkout-title-wrap">
            <Lock size={18} className="lock-icon" />
            <span className="checkout-title-label">SECURE ENCRYPTED CHECKOUT</span>
          </div>
          <button className="modal-close-icon" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        {successOrder ? (
          <div className="checkout-success-view">
            <CheckCircle size={64} className="success-icon" />
            <h2 className="success-title">PAYMENT AUTHORIZED & CONFIRMED</h2>
            <p className="success-subtitle">Order Reference Number: <strong>{successOrder.orderNumber}</strong></p>
            <p className="success-details">
              A confirmation receipt and courier tracking details have been generated in your MySQL database and dispatched to <strong>{formData.email}</strong>.
            </p>

            <div className="success-meta-card">
              <div><span>Total Charged:</span> <strong>${Number(successOrder.totalAmount).toFixed(2)}</strong></div>
              <div><span>Status:</span> <span className="status-badge paid">PAID & RECORDED</span></div>
              <div><span>Delivery:</span> <span>DHL Express Worldwide</span></div>
            </div>

            <button className="solid-btn block-btn" onClick={onClose}>
              RETURN TO STORE
            </button>
          </div>
        ) : (
          <form className="checkout-layout-grid" onSubmit={handlePayNow}>
            {/* Left: Shipping & Billing Form */}
            <div className="checkout-left-col">
              {errorMessage && <div className="error-banner">{errorMessage}</div>}

              <section className="form-section">
                <h3 className="section-head">1. RECIPIENT & SHIPPING ADDRESS</h3>
                <div className="form-row">
                  <div className="input-group">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      name="customerName" 
                      value={formData.customerName} 
                      onChange={handleChange} 
                      required 
                      placeholder="e.g. Aksel Vance"
                    />
                  </div>
                  <div className="input-group">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      required 
                      placeholder="aksel@example.com"
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Street Address</label>
                  <input 
                    type="text" 
                    name="address" 
                    value={formData.address} 
                    onChange={handleChange} 
                    required 
                    placeholder="Calle Serrano, 45"
                  />
                </div>

                <div className="form-row-3">
                  <div className="input-group">
                    <label>City</label>
                    <input 
                      type="text" 
                      name="city" 
                      value={formData.city} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                  <div className="input-group">
                    <label>Postal Code</label>
                    <input 
                      type="text" 
                      name="postalCode" 
                      value={formData.postalCode} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                  <div className="input-group">
                    <label>Country</label>
                    <input 
                      type="text" 
                      name="country" 
                      value={formData.country} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                </div>
              </section>

              <section className="form-section">
                <h3 className="section-head">2. PAYMENT INFORMATION</h3>
                <div className="payment-method-selector">
                  <label className="method-option active">
                    <input type="radio" checked readOnly />
                    <CreditCard size={18} />
                    <span>Credit / Debit Card (Visa, MasterCard, Amex)</span>
                  </label>
                </div>

                <div className="input-group">
                  <label>Card Number</label>
                  <input 
                    type="text" 
                    name="cardNumber" 
                    value={formData.cardNumber} 
                    onChange={handleChange} 
                    required 
                  />
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label>Expiration Date</label>
                    <input 
                      type="text" 
                      name="cardExp" 
                      value={formData.cardExp} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                  <div className="input-group">
                    <label>CVV / CVC</label>
                    <input 
                      type="password" 
                      name="cardCvc" 
                      value={formData.cardCvc} 
                      onChange={handleChange} 
                      maxLength="4"
                      required 
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* Right: Order Summary */}
            <div className="checkout-right-col">
              <h3 className="section-head">ORDER OVERVIEW</h3>
              <div className="order-items-preview">
                {items.map((it, i) => (
                  <div key={i} className="preview-row">
                    <img src={it.image} alt={it.name} className="preview-thumb" />
                    <div className="preview-info">
                      <p className="preview-name">{it.name}</p>
                      <p className="preview-sub">{it.selectedSize} • Qty {it.quantity}</p>
                    </div>
                    <span className="preview-price">${(Number(it.price) * it.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Promo Code Input */}
              <div className="coupon-entry-box">
                <div className="coupon-form-row">
                  <input 
                    type="text" 
                    placeholder="PROMO CODE (E.G. NIKE20, ZARA15)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="coupon-input"
                  />
                  <button type="button" className="solid-btn btn-sm" onClick={handleApplyCoupon}>
                    APPLY
                  </button>
                </div>
                {couponSuccess && <p className="coupon-success-text">{couponSuccess}</p>}
                {couponError && <p className="coupon-error-text">{couponError}</p>}
              </div>

              <div className="breakdown-box">
                <div className="break-row">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="break-row discount-row text-success">
                    <span>Discount ({appliedCoupon.code} -{appliedCoupon.discountPercent}%)</span>
                    <span>-${appliedCoupon.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="break-row">
                  <span>Shipping (Express)</span>
                  <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="break-row">
                  <span>Estimated Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <hr className="breakdown-divider" />
                <div className="break-row total-highlight">
                  <span>Total Due</span>
                  <span>${grandTotal.toFixed(2)} USD</span>
                </div>
              </div>

              <button 
                type="submit" 
                className="solid-btn block-btn pay-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'PROCESSING PAYMENT...' : `CONFIRM & PAY $${grandTotal.toFixed(2)}`}
              </button>

              <div className="security-notice">
                <ShieldCheck size={18} />
                <span>256-Bit SSL Encryption. MySQL Transactional Logging active.</span>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
