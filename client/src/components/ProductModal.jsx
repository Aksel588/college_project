import React, { useState, useEffect } from 'react';
import { X, Check, Shield, Truck, RefreshCw, Star, MessageSquare } from 'lucide-react';
import { api } from '../api';

export default function ProductModal({ product, onClose, onAddToCart, currentUser }) {
  if (!product) return null;

  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || 'One Size');
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || 'Default');
  const [activeImage, setActiveImage] = useState(product.image);
  const [addedNotice, setAddedNotice] = useState(false);

  // Phase 3: Reviews State
  const [reviewsData, setReviewsData] = useState({ averageRating: null, totalReviews: 0, reviews: [] });
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewFit, setReviewFit] = useState('True to Size');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewNotice, setReviewNotice] = useState('');

  const images = [product.image, ...(product.gallery || [])].filter(
    (val, idx, arr) => arr.indexOf(val) === idx
  );

  const loadReviews = async () => {
    try {
      const data = await api.getProductReviews(product.id);
      setReviewsData(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [product.id]);

  const handleAdd = () => {
    onAddToCart(product, selectedSize, selectedColor);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await api.addReview(product.id, {
        userName: currentUser?.name || 'Anonymous Collector',
        rating: reviewRating,
        fitRating: reviewFit,
        comment: reviewComment,
        userId: currentUser?.id || null
      });
      setReviewNotice('Thank you! Review recorded in MySQL.');
      setReviewComment('');
      loadReviews();
      setTimeout(() => setReviewNotice(''), 3000);
    } catch (err) {
      setReviewNotice(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="product-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-icon" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="modal-grid">
          {/* Gallery View */}
          <div className="modal-gallery">
            <div className="main-image-viewport">
              <img src={activeImage} alt={product.name} className="modal-main-image" />
            </div>
            {images.length > 1 && (
              <div className="thumbnail-strip">
                {images.map((imgUrl, i) => (
                  <button 
                    key={i} 
                    className={`thumb-btn ${activeImage === imgUrl ? 'active' : ''}`}
                    onClick={() => setActiveImage(imgUrl)}
                  >
                    <img src={imgUrl} alt={`angle ${i}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Selection */}
          <div className="modal-info">
            <div className="modal-tag-row">
              <span className="tag-outline">{product.category}</span>
              {product.tag && <span className="tag-solid">{product.tag}</span>}
            </div>

            <h2 className="modal-product-title">{product.name}</h2>
            
            {/* Reviews summary score */}
            <div className="product-stars-bar">
              <div className="stars-icons">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    size={14} 
                    fill={Number(reviewsData.averageRating || 5) >= star ? '#000' : 'none'} 
                    color="#000" 
                  />
                ))}
              </div>
              <span className="reviews-count-text">
                {reviewsData.averageRating ? `${reviewsData.averageRating} / 5` : '5.0'} ({reviewsData.totalReviews} REVIEWS)
              </span>
            </div>

            <div className="modal-price-box">
              <span className="price-primary">${Number(product.price).toFixed(2)} USD</span>
              {product.original_price && (
                <span className="price-slashed">${Number(product.original_price).toFixed(2)}</span>
              )}
            </div>

            <p className="modal-description">{product.description}</p>

            {/* Color selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="selection-group">
                <label className="selection-label">
                  COLOR: <span className="selected-value">{selectedColor}</span>
                </label>
                <div className="pill-options">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      className={`pill-option ${selectedColor === c ? 'active' : ''}`}
                      onClick={() => setSelectedColor(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="selection-group">
                <div className="selection-header-row">
                  <label className="selection-label">
                    SELECT SIZE: <span className="selected-value">{selectedSize}</span>
                  </label>
                  <span className="size-guide-hint">SIZE & FIT GUIDE</span>
                </div>
                <div className="size-grid">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      className={`size-tile ${selectedSize === s ? 'active' : ''}`}
                      onClick={() => setSelectedSize(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="modal-actions-area">
              <button 
                className={`add-to-bag-button ${addedNotice ? 'success' : ''}`}
                onClick={handleAdd}
              >
                {addedNotice ? (
                  <>
                    <Check size={18} />
                    <span>ADDED TO BAG</span>
                  </>
                ) : (
                  <span>ADD TO BAG • ${Number(product.price).toFixed(2)}</span>
                )}
              </button>
            </div>

            {/* Perks */}
            <div className="perks-list">
              <div className="perk-item">
                <Truck size={17} />
                <div>
                  <strong>Complimentary Express Delivery</strong>
                  <p>Estimated 2-3 business days with tracking</p>
                </div>
              </div>
              <div className="perk-item">
                <RefreshCw size={17} />
                <div>
                  <strong>Hassle-Free 30-Day Returns</strong>
                  <p>Standard return policy on unworn items</p>
                </div>
              </div>
              <div className="perk-item">
                <Shield size={17} />
                <div>
                  <strong>100% Verified Authentic</strong>
                  <p>Certified material specifications and build</p>
                </div>
              </div>
            </div>

            {/* Phase 3: Reviews & Fit Rating Section */}
            <div className="reviews-section-block">
              <h3 className="reviews-block-title">VERIFIED CUSTOMER REVIEWS</h3>
              
              {reviewNotice && <div className="success-banner">{reviewNotice}</div>}

              {/* Submit a quick review */}
              <form className="add-review-mini-form" onSubmit={handleSubmitReview}>
                <div className="form-row">
                  <div>
                    <label className="mini-label">RATING (STARS)</label>
                    <select 
                      value={reviewRating} 
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                      className="mini-select"
                    >
                      <option value="5">★★★★★ (5/5)</option>
                      <option value="4">★★★★☆ (4/5)</option>
                      <option value="3">★★★☆☆ (3/5)</option>
                      <option value="2">★★☆☆☆ (2/5)</option>
                      <option value="1">★☆☆☆☆ (1/5)</option>
                    </select>
                  </div>
                  <div>
                    <label className="mini-label">FIT PROFILE</label>
                    <select 
                      value={reviewFit} 
                      onChange={(e) => setReviewFit(e.target.value)}
                      className="mini-select"
                    >
                      <option value="True to Size">True to Size</option>
                      <option value="Runs Small">Runs Small</option>
                      <option value="Runs Large">Runs Large</option>
                    </select>
                  </div>
                </div>

                <div className="review-input-row">
                  <input 
                    type="text" 
                    placeholder="Write your feedback regarding comfort or material..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    required
                    className="review-text-input"
                  />
                  <button type="submit" className="solid-btn btn-sm" disabled={submittingReview}>
                    POST
                  </button>
                </div>
              </form>

              {/* List of customer reviews */}
              <div className="reviews-stream-list">
                {reviewsData.reviews.map((rev) => (
                  <div key={rev.id} className="review-stream-item">
                    <div className="review-item-header">
                      <strong>{rev.user_name}</strong>
                      <span className="fit-pill">{rev.fit_rating}</span>
                    </div>
                    <div className="review-stars-row">
                      {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                    </div>
                    <p className="review-item-comment">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
