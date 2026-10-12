import React, { useState } from 'react';
import { ShoppingBag, User, Search, Menu, X, ArrowRight, ShieldCheck, Heart } from 'lucide-react';

export default function Navbar({ 
  cartCount, 
  onOpenCart, 
  currentUser, 
  onOpenAuth, 
  onOpenOrders, 
  onLogout,
  activeCategory,
  onSelectCategory,
  onSearchChange,
  searchQuery,
  wishlistCount,
  onOpenWishlist,
  onOpenAdmin
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);

  const categories = ['All', 'Men', 'Women', 'Footwear', 'Outerwear', 'Accessories'];

  return (
    <header className="site-header">
      {/* Top Banner Nike/Zara style */}
      <div className="top-ticker">
        <span>COMPLIMENTARY EXPRESS SHIPPING ON ORDERS OVER $150 • SPRING / SUMMER 2026 EDITION</span>
      </div>

      <nav className="nav-container">
        {/* Left: Mobile hamburger & Categories */}
        <div className="nav-left">
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div className="category-links desktop-only">
            {categories.map((cat) => (
              <button 
                key={cat}
                className={`category-nav-link ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => onSelectCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Center: Brand Wordmark */}
        <div className="nav-brand" onClick={() => onSelectCategory('All')}>
          <span className="brand-title">AURA / ARCHIVE</span>
          <span className="brand-subtitle">NEW YORK • MADRID</span>
        </div>

        {/* Right: Search, Account, Bag */}
        <div className="nav-right">
          <div className={`search-bar-wrap ${searchOpen ? 'expanded' : ''}`}>
            {searchOpen && (
              <input 
                type="text" 
                placeholder="SEARCH ARCHIVE (E.G. COAT, RUNNER)..." 
                className="search-input"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                autoFocus
              />
            )}
            <button 
              className="icon-action-btn" 
              onClick={() => setSearchOpen(!searchOpen)} 
              title="Search"
            >
              {searchOpen ? <X size={19} /> : <Search size={19} />}
            </button>
          </div>

          {/* Phase 2: Wishlist Button */}
          <button 
            className="icon-action-btn wishlist-nav-btn" 
            onClick={onOpenWishlist} 
            title="Saved Items"
          >
            <Heart size={20} />
            {wishlistCount > 0 && <span className="wishlist-count-badge">{wishlistCount}</span>}
          </button>

          {/* Account */}
          <div className="account-menu-wrap">
            <button 
              className="icon-action-btn user-btn" 
              onClick={() => {
                if (!currentUser) {
                  onOpenAuth();
                } else {
                  setUserDropdown(!userDropdown);
                }
              }}
              title="Account"
            >
              <User size={20} />
              {currentUser && <span className="user-dot"></span>}
            </button>

            {currentUser && userDropdown && (
              <div className="user-popover">
                <div className="user-popover-header">
                  <p className="popover-name">{currentUser.name}</p>
                  <p className="popover-email">{currentUser.email}</p>
                </div>
                <hr className="popover-divider" />
                <button className="popover-action" onClick={() => { onOpenOrders(); setUserDropdown(false); }}>
                  Order History & Receipts
                </button>
                <button className="popover-action" onClick={() => { onOpenWishlist(); setUserDropdown(false); }}>
                  Saved Wishlist ({wishlistCount})
                </button>
                <button className="popover-action" onClick={() => { onOpenAdmin(); setUserDropdown(false); }}>
                  Admin Inventory & Orders
                </button>
                <button className="popover-action text-danger" onClick={() => { onLogout(); setUserDropdown(false); }}>
                  Log Out
                </button>
              </div>
            )}
          </div>

          {/* Phase 1: Store Admin Button */}
          <button 
            className="admin-badge-btn"
            onClick={onOpenAdmin}
            title="Store Admin & Order Fulfillment"
          >
            ADMIN
          </button>

          {/* Shopping Cart Button */}
          <button className="bag-trigger-btn" onClick={onOpenCart} title="Bag">
            <ShoppingBag size={20} />
            <span className="bag-count-badge">{cartCount}</span>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <div className="mobile-categories">
            {categories.map((cat) => (
              <button 
                key={cat}
                className={`mobile-cat-link ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => {
                  onSelectCategory(cat);
                  setMobileMenuOpen(false);
                }}
              >
                {cat}
                <ArrowRight size={16} />
              </button>
            ))}
          </div>
          <div className="mobile-footer">
            {currentUser ? (
              <>
                <p className="mobile-user-greeting">Signed in as <strong>{currentUser.name}</strong></p>
                <button className="outline-btn block-btn" onClick={() => { onOpenOrders(); setMobileMenuOpen(false); }}>
                  My Orders
                </button>
                <button className="text-btn" onClick={() => { onLogout(); setMobileMenuOpen(false); }}>
                  Log Out
                </button>
              </>
            ) : (
              <button className="solid-btn block-btn" onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }}>
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
