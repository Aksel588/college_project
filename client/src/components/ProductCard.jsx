import React from 'react';
import { Plus, Eye, Heart } from 'lucide-react';

export default function ProductCard({ product, onQuickView, onAddToCart, isWishlisted, onToggleWishlist }) {
  const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Standard';
  const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0] : 'Black';

  return (
    <article className="product-card group">
      <div className="product-media-wrap" onClick={() => onQuickView(product)}>
        <img 
          src={product.image} 
          alt={product.name} 
          className="product-img"
          loading="lazy"
        />

        {product.tag && (
          <span className="product-tag-pill">{product.tag}</span>
        )}

        <button 
          className={`wishlist-heart-btn ${isWishlisted ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          title={isWishlisted ? 'Saved to Wishlist' : 'Save to Wishlist'}
        >
          <Heart size={16} fill={isWishlisted ? '#ff3e3e' : 'none'} color={isWishlisted ? '#ff3e3e' : '#111'} />
        </button>

        <div className="card-hover-actions">
          <button 
            className="quick-view-btn"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            title="Inspect Details"
          >
            <Eye size={16} />
            <span>DETAILS</span>
          </button>

          <button 
            className="quick-add-btn"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product, defaultSize, defaultColor);
            }}
            title="Add to Shopping Bag"
          >
            <Plus size={16} />
            <span>ADD</span>
          </button>
        </div>
      </div>

      <div className="product-meta">
        <div className="product-meta-header">
          <span className="product-cat-label">{product.category} • {product.sub_category}</span>
          <div className="product-pricing">
            {product.original_price && (
              <span className="original-price">${Number(product.original_price).toFixed(2)}</span>
            )}
            <span className="current-price">${Number(product.price).toFixed(2)}</span>
          </div>
        </div>

        <h3 className="product-title" onClick={() => onQuickView(product)}>
          {product.name}
        </h3>

        {product.colors && product.colors.length > 0 && (
          <p className="product-colors-sub">{product.colors.length} {product.colors.length === 1 ? 'Colour' : 'Colours'} Available</p>
        )}
      </div>
    </article>
  );
}
