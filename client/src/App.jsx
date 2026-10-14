import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import AuthModal from './components/AuthModal';
import OrdersModal from './components/OrdersModal';
import AdminModal from './components/AdminModal';
import WishlistModal from './components/WishlistModal';
import FilterBar from './components/FilterBar';
import Footer from './components/Footer';
import { api } from './api';
import { SlidersHorizontal, ArrowUpDown, Sparkles } from 'lucide-react';
import './App.css';

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Multi-dimensional Filters State
  const [filters, setFilters] = useState({
    sub_category: 'All',
    minPrice: '',
    maxPrice: '',
    size: 'All',
    color: 'All',
    tag: 'All',
    onSale: false
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      sub_category: 'All',
      minPrice: '',
      maxPrice: '',
      size: 'All',
      color: 'All',
      tag: 'All',
      onSale: false
    });
    setSearchQuery('');
    setActiveCategory('All');
  };

  // Cart State (Persisted in localStorage)
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // User Auth State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('auth_token') || '');

  // Wishlist State (Array of product IDs)
  const [wishlistIds, setWishlistIds] = useState([]);

  // Modals & Drawers
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Save Cart to LocalStorage
  useEffect(() => {
    localStorage.setItem('cart_items', JSON.stringify(cartItems));
  }, [cartItems]);

  // Fetch Products with complete filter matrix
  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = {
        category: activeCategory !== 'All' ? activeCategory : undefined,
        sub_category: filters.sub_category !== 'All' ? filters.sub_category : undefined,
        search: searchQuery.trim() || undefined,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        size: filters.size !== 'All' ? filters.size : undefined,
        color: filters.color !== 'All' ? filters.color : undefined,
        tag: filters.tag !== 'All' ? filters.tag : undefined,
        onSale: filters.onSale ? true : undefined,
        sort: sortBy
      };

      const data = await api.getProducts(params);
      setProducts(data);
    } catch (err) {
      console.error('Fetch products failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 200);
    return () => clearTimeout(timer);
  }, [activeCategory, searchQuery, sortBy, filters]);

  // Load Wishlist if user authenticated
  useEffect(() => {
    async function fetchUserWishlist() {
      if (authToken) {
        try {
          const list = await api.getWishlist(authToken);
          setWishlistIds(list.map(it => it.id));
        } catch (e) {
          console.error(e);
        }
      } else {
        setWishlistIds([]);
      }
    }
    fetchUserWishlist();
  }, [authToken]);

  // Cart Operations
  const handleAddToCart = (product, selectedSize, selectedColor) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(
        item => item.id === product.id && item.selectedSize === selectedSize && item.selectedColor === selectedColor
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += 1;
        return next;
      } else {
        return [
          ...prev,
          {
            ...product,
            selectedSize,
            selectedColor,
            quantity: 1
          }
        ];
      }
    });

    showToast(`Added ${product.name} to bag`);
  };

  const handleUpdateQty = (id, size, color, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(id, size, color);
      return;
    }
    setCartItems(prev =>
      prev.map(item => {
        if (item.id === id && item.selectedSize === size && item.selectedColor === color) {
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (id, size, color) => {
    setCartItems(prev =>
      prev.filter(
        item => !(item.id === id && item.selectedSize === size && item.selectedColor === color)
      )
    );
  };

  // Wishlist Toggle
  const handleToggleWishlist = async (productId) => {
    if (!authToken) {
      setIsAuthOpen(true);
      showToast('Sign in to save items to your wishlist');
      return;
    }

    try {
      const res = await api.toggleWishlist(productId, authToken);
      if (res.action === 'added') {
        setWishlistIds(prev => [...prev, productId]);
        showToast('Saved to wishlist');
      } else {
        setWishlistIds(prev => prev.filter(id => id !== productId));
        showToast('Removed from wishlist');
      }
    } catch (err) {
      showToast('Could not update wishlist');
    }
  };

  // Auth Operations
  const handleAuthSuccess = (user, token) => {
    setCurrentUser(user);
    setAuthToken(token);
    showToast(`Welcome back, ${user.name}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    setCurrentUser(null);
    setAuthToken('');
    setWishlistIds([]);
    showToast('Logged out successfully');
  };

  // Order completed
  const handleOrderSuccess = (order) => {
    setCartItems([]);
    showToast(`Order #${order.orderNumber} placed & confirmed in MySQL!`);
  };

  const totalCartCount = cartItems.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <div className="storefront-app">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-banner">
          <Sparkles size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onLogout={handleLogout}
        activeCategory={activeCategory}
        onSelectCategory={(cat) => setActiveCategory(cat)}
        searchQuery={searchQuery}
        onSearchChange={(q) => setSearchQuery(q)}
        wishlistCount={wishlistIds.length}
        onOpenWishlist={() => {
          if (!authToken) setIsAuthOpen(true);
          else setIsWishlistOpen(true);
        }}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Hero Banner */}
      <Hero 
        onExploreClick={() => {
          const el = document.getElementById('collection-catalog');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }} 
      />

      {/* Editorial Filter & Toolbar */}
      <main className="catalog-container" id="collection-catalog">
        <div className="catalog-toolbar">
          <div className="toolbar-left">
            <h2 className="catalog-heading">
              {activeCategory === 'All' ? 'ALL ARCHIVE DROPS' : `${activeCategory.toUpperCase()} COLLECTION`}
            </h2>
            <span className="catalog-item-count">({products.length} PIECES)</span>
          </div>

          <div className="toolbar-right">
            <div className="sort-selector-wrap">
              <ArrowUpDown size={15} />
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="newest">Featured & Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="discount_desc">Biggest Discount</option>
                <option value="name_asc">Alphabetical (A - Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Full Filter System */}
        <FilterBar 
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          totalResults={products.length}
        />

        {/* Product Grid */}
        {loading ? (
          <div className="catalog-loading">
            <div className="loader-ring"></div>
            <p>SYNCING LIVE INVENTORY FROM MYSQL...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="catalog-empty">
            <p className="empty-title">NO ITEMS MATCHED YOUR ACTIVE FILTERS</p>
            <p className="empty-desc">Try resetting your filter parameters or searching for another keyword.</p>
            <button 
              className="solid-btn"
              onClick={handleResetFilters}
            >
              RESET ALL FILTERS
            </button>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isWishlisted={wishlistIds.includes(product.id)}
                onToggleWishlist={handleToggleWishlist}
                onQuickView={(p) => setQuickViewProduct(p)}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals & Drawers */}
      <ProductModal
        product={quickViewProduct}
        currentUser={currentUser}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onProceedCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        currentUser={currentUser}
        onOrderSuccess={handleOrderSuccess}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <OrdersModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        token={authToken}
      />

      {/* Store Admin Portal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onProductCreated={loadProducts}
      />

      {/* Wishlist */}
      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        token={authToken}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
