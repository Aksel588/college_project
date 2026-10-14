import React, { useState } from 'react';
import { SlidersHorizontal, X, RotateCcw, Check, ChevronDown, ChevronUp, Tag, DollarSign, Layers } from 'lucide-react';

export default function FilterBar({
  filters,
  onFilterChange,
  onResetFilters,
  totalResults
}) {
  const [isOpen, setIsOpen] = useState(false);

  const subCategories = ['All', 'Footwear', 'Outerwear', 'Apparel', 'Accessories'];
  const sizes = ['All', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12', 'One Size'];
  const colors = [
    { name: 'All', hex: 'transparent' },
    { name: 'Black', hex: '#111111' },
    { name: 'White', hex: '#ffffff' },
    { name: 'Grey', hex: '#888888' },
    { name: 'Camel', hex: '#c19a6b' },
    { name: 'Obsidian', hex: '#1a233a' },
    { name: 'Olive', hex: '#556b2f' },
    { name: 'Crimson', hex: '#990000' },
    { name: 'Espresso', hex: '#3d2b1f' }
  ];
  const tags = ['All', 'JUST RELEASED', 'STUDIO EDITION', 'BESTSELLER', 'ICONIC', 'LIMITED RUN', 'TECHNICAL', 'TIMELESS'];

  const pricePresets = [
    { label: 'All', min: '', max: '' },
    { label: 'Under $100', min: '', max: '100' },
    { label: '$100 – $180', min: '100', max: '180' },
    { label: '$180 – $250', min: '180', max: '250' },
    { label: '$250+', min: '250', max: '' }
  ];

  // Count active filters (excluding default values)
  const activeCount = [
    filters.sub_category && filters.sub_category !== 'All',
    filters.minPrice || filters.maxPrice,
    filters.size && filters.size !== 'All',
    filters.color && filters.color !== 'All',
    filters.tag && filters.tag !== 'All',
    filters.onSale
  ].filter(Boolean).length;

  return (
    <div className="filter-system-wrapper">
      {/* Top Filter Trigger & Quick Pills Bar */}
      <div className="filter-action-strip">
        <button 
          className={`filter-toggle-btn ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <SlidersHorizontal size={16} />
          <span>ADVANCED FILTERS</span>
          {activeCount > 0 && <span className="filter-active-badge">{activeCount}</span>}
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {/* Quick Tag Pills */}
        <div className="quick-tags-scroll">
          <button 
            className={`quick-pill ${filters.onSale ? 'active-sale' : ''}`}
            onClick={() => onFilterChange('onSale', !filters.onSale)}
          >
            🔥 SALE & ARCHIVE DISCOUNTS
          </button>
          {['BESTSELLER', 'JUST RELEASED', 'STUDIO EDITION', 'ICONIC'].map((t) => (
            <button
              key={t}
              className={`quick-pill ${filters.tag === t ? 'active' : ''}`}
              onClick={() => onFilterChange('tag', filters.tag === t ? 'All' : t)}
            >
              {t}
            </button>
          ))}
        </div>

        {activeCount > 0 && (
          <button className="clear-all-text-btn" onClick={onResetFilters}>
            <RotateCcw size={13} />
            RESET ALL
          </button>
        )}
      </div>

      {/* Expandable Comprehensive Filter Tray */}
      {isOpen && (
        <div className="filter-drawer-panel">
          <div className="filter-drawer-grid">
            
            {/* 1. Subcategory */}
            <div className="filter-group">
              <label className="filter-group-title">
                <Layers size={14} /> SUB-CATEGORY
              </label>
              <div className="filter-chips-wrap">
                {subCategories.map((sub) => (
                  <button
                    key={sub}
                    className={`filter-chip ${(filters.sub_category || 'All') === sub ? 'selected' : ''}`}
                    onClick={() => onFilterChange('sub_category', sub)}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Price Range */}
            <div className="filter-group">
              <label className="filter-group-title">
                <DollarSign size={14} /> PRICE BRACKET
              </label>
              <div className="filter-chips-wrap">
                {pricePresets.map((p, idx) => {
                  const isMatch = (filters.minPrice || '') === p.min && (filters.maxPrice || '') === p.max;
                  return (
                    <button
                      key={idx}
                      className={`filter-chip ${isMatch ? 'selected' : ''}`}
                      onClick={() => {
                        onFilterChange('minPrice', p.min);
                        onFilterChange('maxPrice', p.max);
                      }}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
              <div className="price-inputs-row">
                <input 
                  type="number"
                  placeholder="Min $"
                  className="filter-num-input"
                  value={filters.minPrice || ''}
                  onChange={(e) => onFilterChange('minPrice', e.target.value)}
                />
                <span className="price-dash">—</span>
                <input 
                  type="number"
                  placeholder="Max $"
                  className="filter-num-input"
                  value={filters.maxPrice || ''}
                  onChange={(e) => onFilterChange('maxPrice', e.target.value)}
                />
              </div>
            </div>

            {/* 3. Sizes */}
            <div className="filter-group">
              <label className="filter-group-title">SIZE MATRIX</label>
              <div className="filter-chips-wrap sizes-wrap">
                {sizes.map((s) => (
                  <button
                    key={s}
                    className={`filter-chip size-chip ${(filters.size || 'All') === s ? 'selected' : ''}`}
                    onClick={() => onFilterChange('size', s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Colors */}
            <div className="filter-group">
              <label className="filter-group-title">COLOR PALETTE</label>
              <div className="color-swatches-grid">
                {colors.map((c) => (
                  <button
                    key={c.name}
                    className={`color-swatch-item ${(filters.color || 'All') === c.name ? 'selected' : ''}`}
                    onClick={() => onFilterChange('color', c.name)}
                    title={c.name}
                  >
                    {c.hex !== 'transparent' ? (
                      <span 
                        className="color-dot" 
                        style={{ backgroundColor: c.hex, border: c.name === 'White' ? '1px solid #ddd' : 'none' }}
                      />
                    ) : (
                      <span className="color-all-icon">ALL</span>
                    )}
                    <span className="color-name">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Editorial Tags / Collections */}
            <div className="filter-group">
              <label className="filter-group-title">
                <Tag size={14} /> EDITORIAL TAG
              </label>
              <div className="filter-chips-wrap">
                {tags.map((t) => (
                  <button
                    key={t}
                    className={`filter-chip ${(filters.tag || 'All') === t ? 'selected' : ''}`}
                    onClick={() => onFilterChange('tag', t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Bottom Bar inside drawer */}
          <div className="filter-drawer-footer">
            <span className="results-count-text">
              SHOWING <strong>{totalResults}</strong> MATCHING ARCHIVE PIECES
            </span>
            <div className="footer-actions">
              {activeCount > 0 && (
                <button className="outline-btn btn-sm" onClick={onResetFilters}>
                  CLEAR FILTERS
                </button>
              )}
              <button className="solid-btn btn-sm" onClick={() => setIsOpen(false)}>
                APPLY & VIEW RESULTS ({totalResults})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filter Badges Strip */}
      {activeCount > 0 && (
        <div className="active-filters-bar">
          <span className="active-filters-label">ACTIVE FILTERS:</span>
          {filters.sub_category && filters.sub_category !== 'All' && (
            <span className="active-badge">
              Sub: {filters.sub_category}
              <button onClick={() => onFilterChange('sub_category', 'All')}><X size={12} /></button>
            </span>
          )}
          {(filters.minPrice || filters.maxPrice) && (
            <span className="active-badge">
              Price: ${filters.minPrice || '0'} – ${filters.maxPrice || '∞'}
              <button onClick={() => { onFilterChange('minPrice', ''); onFilterChange('maxPrice', ''); }}><X size={12} /></button>
            </span>
          )}
          {filters.size && filters.size !== 'All' && (
            <span className="active-badge">
              Size: {filters.size}
              <button onClick={() => onFilterChange('size', 'All')}><X size={12} /></button>
            </span>
          )}
          {filters.color && filters.color !== 'All' && (
            <span className="active-badge">
              Color: {filters.color}
              <button onClick={() => onFilterChange('color', 'All')}><X size={12} /></button>
            </span>
          )}
          {filters.tag && filters.tag !== 'All' && (
            <span className="active-badge">
              Tag: {filters.tag}
              <button onClick={() => onFilterChange('tag', 'All')}><X size={12} /></button>
            </span>
          )}
          {filters.onSale && (
            <span className="active-badge sale-badge">
              On Sale Only
              <button onClick={() => onFilterChange('onSale', false)}><X size={12} /></button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
