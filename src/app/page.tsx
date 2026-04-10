'use client';

import { useEffect } from 'react';
import {
  Flame, ShoppingCart, User, LogOut, LogIn, Search, Menu, X, Plus, Minus, Trash2,
  ChevronRight, Package, Heart, Star, Truck, Shield, Award, Tag,
  CreditCard, ArrowLeft, Edit, Eye, CheckCircle, Loader2, AlertCircle,
  Percent, DollarSign, BarChart3, ToggleLeft, ToggleRight
} from 'lucide-react';
import { useStore, type Product, type Order } from '@/store/useStore';

/* ===================== HELPERS ===================== */

const CATEGORIES = [
  { value: 'ALL', label: 'All Products', icon: '🏪' },
  { value: 'COLD_SMOKED', label: 'Cold Smoked', icon: '❄️' },
  { value: 'HOT_SMOKED', label: 'Hot Smoked', icon: '🔥' },
  { value: 'BILTONG', label: 'Biltong', icon: '🥩' },
  { value: 'ACCESSORIES', label: 'Accessories', icon: '🎁' },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-emerald-100 text-emerald-800',
};

const CITIES = ['Johannesburg', 'Pretoria', 'Cape Town', 'Durban', 'Bloemfontein', 'Port Elizabeth', 'Stellenbosch', 'Other'];

const CATEGORY_BG: Record<string, string> = {
  COLD_SMOKED: 'bg-cyan-50 border-cyan-200',
  HOT_SMOKED: 'bg-red-50 border-red-200',
  BILTONG: 'bg-amber-50 border-amber-200',
  ACCESSORIES: 'bg-emerald-50 border-emerald-200',
};

function formatPrice(price: number): string {
  return `R${price.toFixed(2)}`;
}

function getCategoryLabel(cat: string): string {
  return CATEGORIES.find(c => c.value === cat)?.label || cat;
}

/* ===================== TOAST ===================== */

function Toast() {
  const { toast, clearToast } = useStore();
  if (!toast) return null;
  const bg = toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-primary';
  return (
    <div className={`fixed top-4 right-4 z-[100] ${bg} text-white px-4 py-3 rounded-lg shadow-lg animate-slide-in flex items-center gap-2 max-w-sm`}>
      {toast.type === 'success' && <CheckCircle className="w-4 h-4 shrink-0" />}
      {toast.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}
      {toast.type === 'info' && <Star className="w-4 h-4 shrink-0" />}
      <span className="text-sm">{toast.message}</span>
      <button onClick={clearToast} className="ml-2 hover:opacity-70"><X className="w-4 h-4" /></button>
    </div>
  );
}

/* ===================== NAVBAR ===================== */

function Navbar() {
  const { user, setView, cartCount } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [accountOpen, setAccountOpen] = React.useState(false);

  const handleLogout = async () => {
    await fetch('/api/auth/login', { method: 'DELETE' });
    useStore.getState().setUser(null);
    useStore.getState().setCartItems([]);
    useStore.getState().setView('home');
    useStore.getState().showToast('Logged out successfully');
    setAccountOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => setView('home')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-lg text-secondary tracking-tight">BoerieCall</span>
              <span className="hidden lg:inline text-xs text-muted-foreground ml-2">Smoked Meats & Biltong</span>
            </div>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <button onClick={() => setView('home')} className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary rounded-md hover:bg-amber-50 transition-colors">
              Home
            </button>
            <button onClick={() => setView('shop')} className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary rounded-md hover:bg-amber-50 transition-colors">
              Shop
            </button>
            {user?.role === 'ADMIN' && (
              <button onClick={() => setView('admin')} className="px-3 py-2 text-sm font-medium text-primary hover:text-primary rounded-md hover:bg-amber-50 transition-colors flex items-center gap-1">
                <BarChart3 className="w-4 h-4" />
                Admin
              </button>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('shop')}
              className="p-2 text-foreground hover:text-primary rounded-md hover:bg-amber-50 transition-colors"
              title="Search Products"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={() => setView('cart')}
              className="p-2 text-foreground hover:text-primary rounded-md hover:bg-amber-50 transition-colors relative"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setAccountOpen(!accountOpen)}
                  className="flex items-center gap-2 p-2 text-foreground hover:text-primary rounded-md hover:bg-amber-50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium">{user.name.split(' ')[0]}</span>
                </button>
                {accountOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setAccountOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-border z-50 py-1 animate-fade-in">
                      <div className="px-4 py-2 border-b border-border">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${user.role === 'ADMIN' ? 'bg-red-100 text-red-700' : user.role === 'RESELLER' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                          {user.role}
                        </span>
                      </div>
                      <button onClick={() => { setView('profile'); setAccountOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-amber-50 flex items-center gap-2">
                        <User className="w-4 h-4" /> My Profile
                      </button>
                      {user.role === 'ADMIN' && (
                        <button onClick={() => { setView('admin'); setAccountOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-amber-50 flex items-center gap-2">
                          <BarChart3 className="w-4 h-4" /> Admin Dashboard
                        </button>
                      )}
                      <button onClick={() => { setView('profile'); setAccountOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-amber-50 flex items-center gap-2">
                        <Package className="w-4 h-4" /> My Orders
                      </button>
                      <hr className="my-1 border-border" />
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => setView('login')}
                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white text-sm font-medium rounded-lg hover:from-amber-700 hover:to-amber-800 transition-all shadow-sm"
              >
                Sign In
              </button>
            )}

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-foreground hover:text-primary">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-border animate-fade-in">
            <button onClick={() => { setView('home'); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-sm font-medium hover:bg-amber-50 rounded-md">
              Home
            </button>
            <button onClick={() => { setView('shop'); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-sm font-medium hover:bg-amber-50 rounded-md">
              Shop All
            </button>
            {CATEGORIES.filter(c => c.value !== 'ALL').map(cat => (
              <button
                key={cat.value}
                onClick={() => {
                  useStore.getState().setCategoryFilter(cat.value);
                  useStore.getState().setView('shop');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-sm hover:bg-amber-50 rounded-md pl-8"
              >
                {cat.icon} {cat.label}
              </button>
            ))}
            {user?.role === 'ADMIN' && (
              <button onClick={() => { setView('admin'); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-sm font-medium text-primary hover:bg-amber-50 rounded-md">
                Admin Dashboard
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

/* ===================== FOOTER ===================== */

function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Flame className="w-4 h-4 text-amber-400" />
              </div>
              <span className="font-bold text-lg">BoerieCall</span>
            </div>
            <p className="text-sm text-amber-200/70 leading-relaxed">
              Premium South African smoked meats and biltong. Crafted with passion, delivered with pride.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-3 text-amber-300">Shop</h3>
            <ul className="space-y-2 text-sm">
              {CATEGORIES.filter(c => c.value !== 'ALL').map(cat => (
                <li key={cat.value}>
                  <button onClick={() => {
                    useStore.getState().setCategoryFilter(cat.value);
                    useStore.getState().setView('shop');
                  }} className="text-amber-200/70 hover:text-white transition-colors">
                    {cat.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-3 text-amber-300">Company</h3>
            <ul className="space-y-2 text-sm text-amber-200/70">
              <li>About Us</li>
              <li>Contact</li>
              <li>Careers</li>
              <li>FAQs</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-3 text-amber-300">Contact</h3>
            <ul className="space-y-2 text-sm text-amber-200/70">
              <li>📍 Johannesburg, South Africa</li>
              <li>📞 +27 11 234 5678</li>
              <li>✉️ hello@boeriecall.co.za</li>
              <li>🕐 Mon-Sat: 7am - 6pm</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-amber-200/50">
          © {new Date().getFullYear()} BoerieCall. All rights reserved. Smoke responsibly. 🇿🇦
        </div>
      </div>
    </footer>
  );
}

/* ===================== HERO ===================== */

function HeroSection() {
  const { setView, setCategoryFilter } = useStore();

  return (
    <section className="hero-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 lg:py-36">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm mb-6">
            <Flame className="w-4 h-4 text-amber-300" />
            <span>Premium Smoked Meats & Biltong</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
            Authentic South African <br />
            <span className="text-amber-300">Smoked Goodness</span>
          </h1>
          <p className="text-lg sm:text-xl text-amber-100/80 mb-8 max-w-lg leading-relaxed">
            From our smokehouse to your braai. Handcrafted cold-smoked, hot-smoked meats and the finest biltong in Mzansi.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => { setCategoryFilter('ALL'); setView('shop'); }}
              className="px-6 py-3 bg-white text-secondary font-bold rounded-lg hover:bg-amber-50 transition-colors shadow-lg"
            >
              Shop Now →
            </button>
            <button
              onClick={() => { setCategoryFilter('BILTONG'); setView('shop'); }}
              className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-bold rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
            >
              🥩 Biltong Selection
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ===================== CATEGORY HIGHLIGHTS ===================== */

function CategoryHighlights() {
  const { setView, setCategoryFilter } = useStore();

  const highlights = [
    { category: 'COLD_SMOKED', title: 'Cold Smoked', desc: 'Delicate flavours, slowly perfected over hours of gentle smoke', gradient: 'from-cyan-700 to-cyan-900', emoji: '❄️' },
    { category: 'HOT_SMOKED', title: 'Hot Smoked', desc: 'Bold, smoky, fall-off-the-bone meats straight from the braai', gradient: 'from-red-700 to-red-900', emoji: '🔥' },
    { category: 'BILTONG', title: 'Biltong', desc: 'Traditional South African dried meat, spiced to perfection', gradient: 'from-amber-700 to-amber-900', emoji: '🥩' },
    { category: 'ACCESSORIES', title: 'Accessories', desc: 'Everything you need for the ultimate smoking experience', gradient: 'from-emerald-700 to-emerald-900', emoji: '🎁' },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-secondary">Browse Categories</h2>
      <p className="text-muted-foreground text-center mb-10">From delicate cold smoked salmon to hearty hot smoked brisket</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {highlights.map(h => (
          <button
            key={h.category}
            onClick={() => { setCategoryFilter(h.category); setView('shop'); }}
            className={`bg-gradient-to-br ${h.gradient} text-white p-6 rounded-xl text-left hover:scale-[1.02] transition-transform shadow-lg group`}
          >
            <span className="text-3xl mb-3 block">{h.emoji}</span>
            <h3 className="font-bold text-lg mb-1 group-hover:text-amber-200 transition-colors">{h.title}</h3>
            <p className="text-sm text-white/70">{h.desc}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ===================== FEATURED PRODUCTS ===================== */

function FeaturedProducts() {
  const { products, setView } = useStore();
  const featured = products.slice(0, 4);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-secondary">Featured Products</h2>
          <p className="text-muted-foreground">Our most popular smoked meats and biltong</p>
        </div>
        <button onClick={() => { useStore.getState().setCategoryFilter('ALL'); setView('shop'); }} className="text-primary font-medium text-sm hover:underline hidden sm:flex items-center gap-1">
          View All <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {featured.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <div className="mt-6 text-center sm:hidden">
        <button onClick={() => { useStore.getState().setCategoryFilter('ALL'); setView('shop'); }} className="text-primary font-medium text-sm hover:underline">
          View All Products →
        </button>
      </div>
    </section>
  );
}

/* ===================== PRODUCT CARD ===================== */

function ProductCard({ product }: { product: Product }) {
  const { setView, setSelectedProduct, user } = useStore();
  const [adding, setAdding] = React.useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      useStore.getState().showToast('Please sign in to add items to cart', 'info');
      useStore.getState().setView('login');
      return;
    }
    setAdding(true);
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: product.id, quantity: 1 }),
      });
      const data = await res.json();
      if (res.ok) {
        useStore.getState().setCartItems(data.cartItems);
        useStore.getState().showToast(`${product.name} added to cart!`);
      } else {
        useStore.getState().showToast(data.error || 'Failed to add to cart', 'error');
      }
    } catch {
      useStore.getState().showToast('Failed to add to cart', 'error');
    }
    setAdding(false);
  };

  const catBg = CATEGORY_BG[product.category] || 'bg-gray-50 border-gray-200';

  return (
    <button
      onClick={() => { setSelectedProduct(product); setView('product'); }}
      className="bg-white rounded-xl border border-border overflow-hidden card-hover text-left group"
    >
      <div className={`aspect-[4/3] ${catBg} border-b flex items-center justify-center relative`}>
        <span className="text-5xl">
          {product.category === 'COLD_SMOKED' ? '❄️' : product.category === 'HOT_SMOKED' ? '🔥' : product.category === 'BILTONG' ? '🥩' : '🎁'}
        </span>
        {product.stock_quantity < 10 && product.stock_quantity > 0 && (
          <span className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
            Only {product.stock_quantity} left
          </span>
        )}
        {product.stock_quantity === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{getCategoryLabel(product.category)}</span>
        <h3 className="font-bold text-sm mt-1 text-foreground group-hover:text-primary transition-colors line-clamp-2">{product.name}</h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="font-bold text-lg text-primary">{formatPrice(product.selling_price)}</span>
            {product.weight > 0 && <span className="text-xs text-muted-foreground ml-1">/ {product.weight}kg</span>}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={adding || product.stock_quantity === 0}
            className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </button>
  );
}

/* ===================== HOME VIEW ===================== */

function HomeView() {
  return (
    <div className="animate-fade-in">
      <HeroSection />
      <CategoryHighlights />
      <FeaturedProducts />

      {/* Trust badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <Truck className="w-6 h-6" />, title: 'Fast Delivery', desc: 'Same-day delivery in Jhb & Pta' },
            { icon: <Shield className="w-6 h-6" />, title: 'Quality Guaranteed', desc: '100% South African, premium cuts' },
            { icon: <Heart className="w-6 h-6" />, title: 'Made with Love', desc: 'Hand-crafted by artisan smokers' },
            { icon: <Award className="w-6 h-6" />, title: 'Reseller Friendly', desc: 'Bulk discounts for resellers' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-border">
              <div className="text-primary">{item.icon}</div>
              <div>
                <h3 className="font-bold text-sm">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ===================== SHOP VIEW ===================== */

function ShopView() {
  const { products, searchQuery, setSearchQuery, categoryFilter, setCategoryFilter, sortBy, setSortBy } = useStore();
  const [localSearch, setLocalSearch] = React.useState(searchQuery);

  React.useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(localSearch), 300);
    return () => clearTimeout(timer);
  }, [localSearch, setSearchQuery]);

  const filtered = products.filter(p => {
    if (categoryFilter !== 'ALL' && p.category !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'price_asc') return a.selling_price - b.selling_price;
    if (sortBy === 'price_desc') return b.selling_price - a.selling_price;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary">Shop</h1>
        <p className="text-muted-foreground mt-1">Browse our selection of premium smoked meats and biltong</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-lg text-sm"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white border border-border rounded-lg px-3 py-2.5 text-sm"
          >
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-border rounded-lg px-3 py-2.5 text-sm"
          >
            <option value="name">Name A-Z</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
          </select>
        </div>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => setCategoryFilter(cat.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              categoryFilter === cat.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-white border border-border text-muted-foreground hover:border-primary hover:text-primary'
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground mb-4">{filtered.length} product{filtered.length !== 1 ? 's' : ''} found</p>

      {/* Products grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-bold text-foreground mb-1">No products found</h3>
          <p className="text-muted-foreground text-sm">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}

/* ===================== PRODUCT DETAIL VIEW ===================== */

function ProductDetailView() {
  const { selectedProduct, setView, user, showToast } = useStore();
  const [qty, setQty] = React.useState(1);
  const [adding, setAdding] = React.useState(false);

  if (!selectedProduct) {
    return <EmptyState title="Product not found" onBack={() => setView('shop')} />;
  }

  const handleAddToCart = async () => {
    if (!user) {
      showToast('Please sign in to add items to cart', 'info');
      setView('login');
      return;
    }
    setAdding(true);
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: selectedProduct.id, quantity: qty }),
      });
      const data = await res.json();
      if (res.ok) {
        useStore.getState().setCartItems(data.cartItems);
        showToast(`${selectedProduct.name} (x${qty}) added to cart!`);
        setView('cart');
      } else {
        showToast(data.error || 'Failed to add to cart', 'error');
      }
    } catch {
      showToast('Failed to add to cart', 'error');
    }
    setAdding(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <button onClick={() => setView('shop')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Shop
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product image */}
        <div className={`aspect-square rounded-2xl ${CATEGORY_BG[selectedProduct.category]} border flex items-center justify-center`}>
          <span className="text-8xl">
            {selectedProduct.category === 'COLD_SMOKED' ? '❄️' : selectedProduct.category === 'HOT_SMOKED' ? '🔥' : selectedProduct.category === 'BILTONG' ? '🥩' : '🎁'}
          </span>
        </div>

        {/* Product info */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{getCategoryLabel(selectedProduct.category)} • {selectedProduct.subcategory}</span>
          <h1 className="text-3xl font-bold text-secondary mt-2">{selectedProduct.name}</h1>
          <p className="text-muted-foreground mt-3 leading-relaxed">{selectedProduct.description}</p>

          <div className="mt-6 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-primary">{formatPrice(selectedProduct.selling_price)}</span>
            {selectedProduct.weight > 0 && (
              <span className="text-muted-foreground text-sm">per {selectedProduct.weight}kg</span>
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Weight</p>
              <p className="font-bold text-sm">{selectedProduct.weight} kg</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">In Stock</p>
              <p className="font-bold text-sm text-success">{selectedProduct.stock_quantity} units</p>
            </div>
          </div>

          {/* Quantity + Add to cart */}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center border border-border rounded-lg">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-muted rounded-l-lg">
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-bold">{qty}</span>
              <button onClick={() => setQty(Math.min(selectedProduct.stock_quantity, qty + 1))} className="w-10 h-10 flex items-center justify-center hover:bg-muted rounded-r-lg">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={adding || selectedProduct.stock_quantity === 0}
              className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold rounded-lg hover:from-amber-700 hover:to-amber-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
              Add to Cart — {formatPrice(selectedProduct.selling_price * qty)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== CART VIEW ===================== */

function CartView() {
  const { cartItems, user, setView, showToast } = useStore();
  const [updating, setUpdating] = React.useState<string | null>(null);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product?.selling_price || 0) * item.quantity, 0);

  const handleUpdateQty = async (productId: string, quantity: number) => {
    setUpdating(productId);
    try {
      const res = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, quantity }),
      });
      const data = await res.json();
      if (res.ok) useStore.getState().setCartItems(data.cartItems);
      else showToast(data.error || 'Failed to update cart', 'error');
    } catch {
      showToast('Failed to update cart', 'error');
    }
    setUpdating(null);
  };

  const handleRemove = async (productId: string) => {
    try {
      await fetch(`/api/cart?product_id=${productId}`, { method: 'DELETE' });
      await fetchCart();
      showToast('Item removed from cart');
    } catch {
      showToast('Failed to remove item', 'error');
    }
  };

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart');
      if (res.ok) {
        const data = await res.json();
        useStore.getState().setCartItems(data.cartItems);
      }
    } catch { /* ignore */ }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <button onClick={() => setView('shop')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Continue Shopping
      </button>

      <h1 className="text-3xl font-bold text-secondary mb-6">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-border">
          <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-bold">Your cart is empty</h3>
          <p className="text-muted-foreground text-sm mt-1">Add some delicious smoked meats to get started!</p>
          <button onClick={() => setView('shop')} className="mt-4 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90">
            Browse Products
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {cartItems.map(item => (
            <div key={item.id} className="bg-white rounded-xl border border-border p-4 flex gap-4">
              <div className={`w-20 h-20 rounded-lg ${CATEGORY_BG[item.product?.category || '']} border flex items-center justify-center shrink-0`}>
                <span className="text-2xl">
                  {item.product?.category === 'COLD_SMOKED' ? '❄️' : item.product?.category === 'HOT_SMOKED' ? '🔥' : item.product?.category === 'BILTONG' ? '🥩' : '🎁'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm truncate">{item.product?.name || 'Unknown Product'}</h3>
                <p className="text-primary font-bold text-sm mt-0.5">{formatPrice(item.product?.selling_price || 0)}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center border border-border rounded-lg">
                    <button onClick={() => handleUpdateQty(item.product_id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center hover:bg-muted rounded-l-lg text-xs" disabled={!!updating}>
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                    <button onClick={() => handleUpdateQty(item.product_id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center hover:bg-muted rounded-r-lg text-xs" disabled={!!updating}>
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-sm text-muted-foreground">{formatPrice((item.product?.selling_price || 0) * item.quantity)}</span>
                </div>
              </div>
              <button onClick={() => handleRemove(item.product_id)} className="p-2 text-muted-foreground hover:text-red-500 transition-colors self-start">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Summary */}
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted-foreground">Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
              <span className="font-bold text-lg">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Delivery fees & discounts calculated at checkout</p>
            <button
              onClick={() => {
                if (!user) { showToast('Please sign in to checkout', 'info'); setView('login'); return; }
                setView('checkout');
              }}
              className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold rounded-lg hover:from-amber-700 hover:to-amber-800 transition-all"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===================== CHECKOUT VIEW ===================== */

function CheckoutView() {
  const { user, cartItems, setView, showToast, setShowPaymentModal, setLoading } = useStore();
  const [address, setAddress] = React.useState(user?.address || '');
  const [city, setCity] = React.useState(user?.city || 'Johannesburg');
  const [processing, setProcessing] = React.useState(false);
  const [, setOrderId] = React.useState<string | null>(null);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product?.selling_price || 0) * item.quantity, 0);
  const totalWeight = cartItems.reduce((sum, item) => sum + (item.product?.weight || 0) * item.quantity, 0);
  const isReseller = user?.role === 'RESELLER';
  const discount = isReseller ? subtotal * 0.1 : 0;
  let deliveryFee = 150;
  if (isReseller) {
    if (city === 'Johannesburg' && totalWeight > 10) deliveryFee = 0;
    else if (city === 'Pretoria' && totalWeight > 20) deliveryFee = 0;
  }
  const total = subtotal - discount + deliveryFee;

  const handleCheckout = async () => {
    if (!address.trim()) {
      showToast('Please enter a delivery address', 'error');
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePaymentConfirm = async () => {
    setProcessing(true);
    setLoading(true);
    // Simulate Stitch payment
    await new Promise(resolve => setTimeout(resolve, 2500));

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delivery_address: address, city }),
      });
      const data = await res.json();
      if (res.ok) {
        setOrderId(data.order.id);
        useStore.getState().setCartItems([]);
        useStore.getState().setShowPaymentModal(false);
        useStore.getState().setView('order-success');
        showToast('Order placed successfully!');
      } else {
        showToast(data.error || 'Failed to place order', 'error');
      }
    } catch {
      showToast('Failed to place order', 'error');
    }
    setProcessing(false);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <button onClick={() => setView('cart')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Cart
      </button>

      <h1 className="text-3xl font-bold text-secondary mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery info */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Truck className="w-5 h-5 text-primary" /> Delivery Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Delivery Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your full delivery address..."
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white">
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Order items */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Package className="w-5 h-5 text-primary" /> Order Items</h2>
            <div className="space-y-3">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center gap-3 text-sm">
                  <div className={`w-10 h-10 rounded-lg ${CATEGORY_BG[item.product?.category || '']} border flex items-center justify-center shrink-0`}>
                    <span className="text-lg">{item.product?.category === 'COLD_SMOKED' ? '❄️' : item.product?.category === 'HOT_SMOKED' ? '🔥' : item.product?.category === 'BILTONG' ? '🥩' : '🎁'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.product?.name}</p>
                    <p className="text-muted-foreground text-xs">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-bold shrink-0">{formatPrice((item.product?.selling_price || 0) * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-xl border border-border p-6 h-fit sticky top-20">
          <h2 className="font-bold text-lg mb-4">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {isReseller && (
              <div className="flex justify-between text-success">
                <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> Reseller Discount (10%)</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery ({city})</span>
              <span>{deliveryFee === 0 ? <span className="text-success font-medium">FREE</span> : formatPrice(deliveryFee)}</span>
            </div>
            {isReseller && (city === 'Johannesburg' || city === 'Pretoria') && (
              <p className="text-xs text-muted-foreground">
                Free delivery for {city} orders over {city === 'Johannesburg' ? '10kg' : '20kg'} (current: {totalWeight.toFixed(1)}kg)
              </p>
            )}
            <hr className="border-border" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-primary">{formatPrice(total)}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cartItems.length === 0}
            className="w-full mt-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-lg hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <CreditCard className="w-5 h-5" /> Pay with Stitch — {formatPrice(total)}
          </button>

          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-3 h-3" />
            <span>Secure payment powered by Stitch</span>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        total={total}
        processing={processing}
        onConfirm={handlePaymentConfirm}
      />
    </div>
  );
}

/* ===================== PAYMENT MODAL ===================== */

function PaymentModal({ total, processing, onConfirm }: { total: number; processing: boolean; onConfirm: () => void }) {
  const showPaymentModal = useStore(s => s.showPaymentModal);
  const setShowPaymentModal = useStore(s => s.setShowPaymentModal);

  if (!showPaymentModal) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !processing && setShowPaymentModal(false)} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-white" />
          </div>

          {processing ? (
            <>
              <h2 className="text-xl font-bold text-secondary">Processing Payment</h2>
              <p className="text-muted-foreground text-sm mt-2">Connecting to Stitch...</p>
              <div className="my-8 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                <p className="text-muted-foreground">Amount:</p>
                <p className="font-bold text-lg text-primary">{formatPrice(total)}</p>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-secondary">Confirm Payment</h2>
              <p className="text-muted-foreground text-sm mt-2">You will be redirected to Stitch to complete payment</p>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 my-4">
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold text-primary">{formatPrice(total)}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg text-sm font-bold hover:from-green-700 hover:to-green-800 transition-all"
                >
                  Confirm & Pay
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ===================== ORDER SUCCESS VIEW ===================== */

function OrderSuccessView() {
  const { setView } = useStore();
  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16 text-center animate-fade-in">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-success" />
      </div>
      <h1 className="text-3xl font-bold text-secondary mb-2">Order Placed!</h1>
      <p className="text-muted-foreground mb-8">Your order has been confirmed and is being prepared. You&apos;ll receive updates via email.</p>
      <div className="flex gap-3 justify-center">
        <button onClick={() => setView('profile')} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90">
          View Orders
        </button>
        <button onClick={() => setView('shop')} className="px-6 py-2.5 border border-border rounded-lg font-medium text-sm hover:bg-muted">
          Continue Shopping
        </button>
      </div>
    </div>
  );
}

/* ===================== LOGIN VIEW ===================== */

function LoginView() {
  const { setView, setUser, showToast } = useStore();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        showToast(`Welcome back, ${data.user.name}!`);
        setView('home');
      } else {
        showToast(data.error || 'Login failed', 'error');
      }
    } catch {
      showToast('Login failed', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16 animate-fade-in">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center mx-auto mb-4">
          <Flame className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-secondary">Welcome Back</h1>
        <p className="text-muted-foreground text-sm mt-1">Sign in to your BoerieCall account</p>
      </div>

      <form onSubmit={handleLogin} className="bg-white rounded-xl border border-border p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2.5 border border-border rounded-lg text-sm" placeholder="you@example.com" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-3 py-2.5 border border-border rounded-lg text-sm" placeholder="Enter your password" />
        </div>
        <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold rounded-lg hover:from-amber-700 hover:to-amber-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Sign In
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-4">
        Don&apos;t have an account?{' '}
        <button onClick={() => setView('register')} className="text-primary font-medium hover:underline">Create one</button>
      </p>
    </div>
  );
}

/* ===================== REGISTER VIEW ===================== */

function RegisterView() {
  const { setView, setUser, showToast } = useStore();
  const [form, setForm] = React.useState({ name: '', email: '', password: '', phone: '', city: 'Johannesburg', role: 'BUYER' });
  const [loading, setLoading] = React.useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        showToast(`Welcome to BoerieCall, ${data.user.name}!`);
        setView('home');
      } else {
        showToast(data.error || 'Registration failed', 'error');
      }
    } catch {
      showToast('Registration failed', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16 animate-fade-in">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center mx-auto mb-4">
          <Flame className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-secondary">Create Account</h1>
        <p className="text-muted-foreground text-sm mt-1">Join BoerieCall and start ordering</p>
      </div>

      <form onSubmit={handleRegister} className="bg-white rounded-xl border border-border p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-3 py-2.5 border border-border rounded-lg text-sm" placeholder="John Doe" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="w-full px-3 py-2.5 border border-border rounded-lg text-sm" placeholder="you@example.com" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} className="w-full px-3 py-2.5 border border-border rounded-lg text-sm" placeholder="Min 6 characters" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2.5 border border-border rounded-lg text-sm" placeholder="+27..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-white">
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Account Type</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, role: 'BUYER' })}
              className={`p-3 rounded-lg border-2 text-left text-sm transition-colors ${form.role === 'BUYER' ? 'border-primary bg-amber-50' : 'border-border hover:border-primary/30'}`}
            >
              <span className="font-bold block">Buyer</span>
              <span className="text-xs text-muted-foreground">Personal use</span>
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, role: 'RESELLER' })}
              className={`p-3 rounded-lg border-2 text-left text-sm transition-colors ${form.role === 'RESELLER' ? 'border-purple-600 bg-purple-50' : 'border-border hover:border-purple-300'}`}
            >
              <span className="font-bold block flex items-center gap-1">Reseller <Tag className="w-3 h-3" /></span>
              <span className="text-xs text-muted-foreground">10% off + free delivery</span>
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold rounded-lg hover:from-amber-700 hover:to-amber-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Create Account
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-4">
        Already have an account?{' '}
        <button onClick={() => setView('login')} className="text-primary font-medium hover:underline">Sign in</button>
      </p>
    </div>
  );
}

/* ===================== PROFILE VIEW ===================== */

function ProfileView() {
  const { user, orders, setView } = useStore();
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          useStore.getState().setOrders(data.orders);
        }
      } catch { /* ignore */ }
      setLoading(false);
    }
    if (user) load();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center animate-fade-in">
        <LogIn className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
        <h2 className="text-xl font-bold">Please sign in</h2>
        <button onClick={() => setView('login')} className="mt-4 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm">
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-secondary mb-6">My Account</h1>

      {/* User info */}
      <div className="bg-white rounded-xl border border-border p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white text-xl font-bold shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-bold text-lg">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <span className={`inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-full ${user.role === 'ADMIN' ? 'bg-red-100 text-red-700' : user.role === 'RESELLER' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
              {user.role}
            </span>
          </div>
        </div>

        {user.role === 'RESELLER' && (
          <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-bold text-sm text-purple-800 flex items-center gap-1"><Tag className="w-4 h-4" /> Reseller Benefits</h3>
            <ul className="mt-2 space-y-1 text-sm text-purple-700">
              <li>✓ 10% discount on all products</li>
              <li>✓ Free delivery in Johannesburg (orders over 10kg)</li>
              <li>✓ Free delivery in Pretoria (orders over 20kg)</li>
            </ul>
          </div>
        )}
      </div>

      {/* Orders */}
      <div className="bg-white rounded-xl border border-border p-6">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Package className="w-5 h-5 text-primary" /> Order History</h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-muted-foreground text-sm">No orders yet</p>
            <button onClick={() => setView('shop')} className="mt-3 text-primary text-sm font-medium hover:underline">
              Start Shopping →
            </button>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {orders.map(order => (
              <OrderCard key={order.id} order={order} isAdmin={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ===================== ORDER CARD ===================== */

function OrderCard({ order, isAdmin }: { order: Order; isAdmin: boolean }) {
  const [showDetails, setShowDetails] = React.useState(false);

  if (showDetails) {
    return (
      <div className="border border-border rounded-lg p-4 animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setShowDetails(false)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="w-3 h-3" /> Back to orders
          </button>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
            {order.status}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          <div><span className="text-muted-foreground">Order ID:</span><p className="font-mono font-medium text-xs">{order.id.substring(0, 16)}...</p></div>
          <div><span className="text-muted-foreground">Date:</span><p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p></div>
          <div><span className="text-muted-foreground">Address:</span><p className="font-medium">{order.delivery_address}</p></div>
          <div><span className="text-muted-foreground">City:</span><p className="font-medium">{order.city}</p></div>
          <div><span className="text-muted-foreground">Weight:</span><p className="font-medium">{order.total_weight.toFixed(1)} kg</p></div>
          <div><span className="text-muted-foreground">Payment:</span><p className="font-medium">{order.payment_method}</p></div>
          {order.stitch_payment_id && <div className="col-span-2"><span className="text-muted-foreground">Stitch ID:</span><p className="font-mono text-xs">{order.stitch_payment_id}</p></div>}
        </div>

        <h3 className="font-bold text-sm mb-2">Items</h3>
        <div className="space-y-2">
          {(order.items || []).map(item => (
            <div key={item.id} className="flex justify-between items-center text-sm bg-muted rounded-lg p-2">
              <div>
                <p className="font-medium">{item.product_name}</p>
                <p className="text-xs text-muted-foreground">Qty: {item.quantity} • {item.weight}kg each</p>
              </div>
              <span className="font-bold">{formatPrice(item.unit_price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-1 text-sm border-t pt-3">
          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
          {order.discount > 0 && <div className="flex justify-between text-success"><span>Reseller Discount</span><span>-{formatPrice(order.discount)}</span></div>}
          <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{order.delivery_fee === 0 ? 'FREE' : formatPrice(order.delivery_fee)}</span></div>
          <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Total</span><span className="text-primary">{formatPrice(order.total_amount)}</span></div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()} • {order.items?.length || 0} items</p>
          <p className="font-medium text-sm mt-0.5">
            {isAdmin && order.user_name ? `${order.user_name} — ` : ''}R{order.total_amount.toFixed(2)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
            {order.status}
          </span>
          <button onClick={() => setShowDetails(true)} className="p-1 text-muted-foreground hover:text-primary">
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>
      {isAdmin && (
        <div className="mt-2 flex items-center gap-2">
          <select
            value={order.status}
            onChange={async (e) => {
              try {
                const res = await fetch(`/api/admin/orders/${order.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ status: e.target.value }),
                });
                if (res.ok) {
                  const data = await res.json();
                  const updated = useStore.getState().orders.map(o => o.id === order.id ? { ...o, status: data.order.status } : o);
                  useStore.getState().setOrders(updated);
                  useStore.getState().showToast('Order status updated');
                }
              } catch { /* ignore */ }
            }}
            className="text-xs border border-border rounded px-2 py-1 bg-white"
          >
            {['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

/* ===================== ADMIN DASHBOARD ===================== */

function AdminView() {
  const { user, setView } = useStore();
  const [tab, setTab] = React.useState<'overview' | 'products' | 'orders' | 'markup'>('overview');

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center animate-fade-in">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground text-sm mt-1">You need admin privileges to view this page</p>
        <button onClick={() => setView('home')} className="mt-4 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm">Go Home</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-secondary">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage products, orders, and pricing</p>
      </div>

      {/* Admin tabs */}
      <div className="flex gap-1 bg-white rounded-lg border border-border p-1 mb-6 overflow-x-auto">
        {[
          { key: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
          { key: 'products', label: 'Products', icon: <Package className="w-4 h-4" /> },
          { key: 'orders', label: 'Orders', icon: <ShoppingCart className="w-4 h-4" /> },
          { key: 'markup', label: 'Markup', icon: <Tag className="w-4 h-4" /> },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              tab === t.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <AdminOverview />}
      {tab === 'products' && <AdminProducts />}
      {tab === 'orders' && <AdminOrders />}
      {tab === 'markup' && <AdminMarkup />}
    </div>
  );
}

/* ===================== ADMIN OVERVIEW ===================== */

function AdminOverview() {
  const { products, orders } = useStore();

  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.is_active).length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: totalProducts, sub: `${activeProducts} active`, color: 'text-blue-600' },
          { label: 'Total Orders', value: totalOrders, sub: `${pendingOrders} pending`, color: 'text-amber-600' },
          { label: 'Total Revenue', value: formatPrice(totalRevenue), sub: 'All time', color: 'text-green-600' },
          { label: 'Avg Order Value', value: formatPrice(totalOrders > 0 ? totalRevenue / totalOrders : 0), sub: 'Per order', color: 'text-purple-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-border p-5">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl border border-border p-6">
        <h2 className="font-bold text-lg mb-4">Recent Orders</h2>
        {orders.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">No orders yet</p>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {orders.slice(0, 10).map(order => (
              <OrderCard key={order.id} order={order} isAdmin={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ===================== ADMIN PRODUCTS ===================== */

function AdminProducts() {
  const { products, setProducts, showToast } = useStore();
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [formData, setFormData] = React.useState({
    id: '', name: '', description: '', category: 'COLD_SMOKED', subcategory: '',
    cost_price: 0, markup_percent: 0, markup_amount: 0, selling_price: 0,
    weight: 0, stock_quantity: 0, image_url: '', is_active: true,
  });

  const calcSellingPrice = (cost: number, pct: number, amt: number) => cost * (1 + pct / 100) + amt;

  const resetForm = () => {
    setFormData({ id: '', name: '', description: '', category: 'COLD_SMOKED', subcategory: '', cost_price: 0, markup_percent: 0, markup_amount: 0, selling_price: 0, weight: 0, stock_quantity: 0, image_url: '', is_active: true });
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleEdit = (product: Product) => {
    setFormData({ ...product });
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      const sp = calcSellingPrice(formData.cost_price, formData.markup_percent, formData.markup_amount);
      const body = { ...formData, selling_price: sp };

      let res;
      if (editingProduct) {
        res = await fetch('/api/admin/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      } else {
        res = await fetch('/api/admin/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      }

      if (res.ok) {
        const data = await res.json();
        if (editingProduct) {
          setProducts(products.map(p => p.id === data.product.id ? data.product : p));
          showToast('Product updated!');
        } else {
          setProducts([...products, data.product]);
          showToast('Product created!');
        }
        resetForm();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to save product', 'error');
      }
    } catch {
      showToast('Failed to save product', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(products.filter(p => p.id !== id));
        showToast('Product deleted');
      }
    } catch {
      showToast('Failed to delete product', 'error');
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...product, is_active: !product.is_active }),
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(products.map(p => p.id === product.id ? data.product : p));
      }
    } catch { /* ignore */ }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{products.length} products</p>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 flex items-center gap-1">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Product form modal */}
      {showForm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={resetForm} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">{editingProduct ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={resetForm} className="p-1 hover:bg-muted rounded"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1">Name</label>
                <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm" placeholder="Product name" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={2} className="w-full px-3 py-2 border border-border rounded-lg text-sm resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Category</label>
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white">
                    {CATEGORIES.filter(c => c.value !== 'ALL').map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Subcategory</label>
                  <input value={formData.subcategory} onChange={e => setFormData({ ...formData, subcategory: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm" />
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <h3 className="text-xs font-bold text-amber-800 mb-2 flex items-center gap-1"><DollarSign className="w-3 h-3" /> Pricing & Markup</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Cost Price (R)</label>
                    <input type="number" value={formData.cost_price || ''} onChange={e => {
                      const cost = parseFloat(e.target.value) || 0;
                      const sp = calcSellingPrice(cost, formData.markup_percent, formData.markup_amount);
                      setFormData({ ...formData, cost_price: cost, selling_price: parseFloat(sp.toFixed(2)) });
                    }} className="w-full px-2 py-1.5 border border-amber-300 rounded text-sm bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Markup %</label>
                    <input type="number" value={formData.markup_percent || ''} onChange={e => {
                      const pct = parseFloat(e.target.value) || 0;
                      const sp = calcSellingPrice(formData.cost_price, pct, formData.markup_amount);
                      setFormData({ ...formData, markup_percent: pct, selling_price: parseFloat(sp.toFixed(2)) });
                    }} className="w-full px-2 py-1.5 border border-amber-300 rounded text-sm bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Markup (R)</label>
                    <input type="number" value={formData.markup_amount || ''} onChange={e => {
                      const amt = parseFloat(e.target.value) || 0;
                      const sp = calcSellingPrice(formData.cost_price, formData.markup_percent, amt);
                      setFormData({ ...formData, markup_amount: amt, selling_price: parseFloat(sp.toFixed(2)) });
                    }} className="w-full px-2 py-1.5 border border-amber-300 rounded text-sm bg-white" />
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white rounded p-1.5 text-center">
                    <span className="text-muted-foreground">Selling Price</span>
                    <p className="font-bold text-primary text-sm">{formatPrice(formData.selling_price)}</p>
                  </div>
                  <div className="bg-white rounded p-1.5 text-center">
                    <span className="text-muted-foreground">Profit Margin</span>
                    <p className="font-bold text-success text-sm">
                      {formData.cost_price > 0 ? `${(((formData.selling_price - formData.cost_price) / formData.cost_price) * 100).toFixed(1)}%` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Weight (kg)</label>
                  <input type="number" step="0.1" value={formData.weight || ''} onChange={e => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Stock Quantity</label>
                  <input type="number" value={formData.stock_quantity || ''} onChange={e => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border border-border rounded-lg text-sm" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={resetForm} className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:opacity-90">
                {editingProduct ? 'Update' : 'Create'} Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Product</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Cost</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Markup</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Price</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Stock</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border max-h-[60vh] overflow-y-auto">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{p.category === 'COLD_SMOKED' ? '❄️' : p.category === 'HOT_SMOKED' ? '🔥' : p.category === 'BILTONG' ? '🥩' : '🎁'}</span>
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.weight}kg</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">{getCategoryLabel(p.category)}</td>
                  <td className="px-4 py-3 text-right">{formatPrice(p.cost_price)}</td>
                  <td className="px-4 py-3 text-right text-xs">{p.markup_percent}% + R{p.markup_amount}</td>
                  <td className="px-4 py-3 text-right font-bold text-primary">{formatPrice(p.selling_price)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={p.stock_quantity < 10 ? 'text-red-500 font-medium' : ''}>{p.stock_quantity}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => handleToggleActive(p)} title={p.is_active ? 'Deactivate' : 'Activate'}>
                      {p.is_active ? <ToggleRight className="w-6 h-6 text-green-500" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleEdit(p)} className="p-1.5 hover:bg-muted rounded" title="Edit"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-red-50 text-muted-foreground hover:text-red-500 rounded" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ===================== ADMIN ORDERS ===================== */

function AdminOrders() {
  const { orders, setOrders } = useStore();
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState('ALL');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders);
        }
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, [setOrders]);

  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {['ALL', 'PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === s ? 'bg-primary text-primary-foreground' : 'bg-white border border-border text-muted-foreground hover:border-primary'
            }`}
          >
            {s} {s !== 'ALL' && `(${orders.filter(o => o.status === s).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-12 text-center">
          <ShoppingCart className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-muted-foreground">No orders found</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[70vh] overflow-y-auto">
          {filtered.map(order => (
            <OrderCard key={order.id} order={order} isAdmin={true} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ===================== ADMIN MARKUP ===================== */

function AdminMarkup() {
  const { products, setProducts, showToast } = useStore();
  const [pctChange, setPctChange] = React.useState(0);
  const [amtChange, setAmtChange] = React.useState(0);
  const [applying, setApplying] = React.useState(false);

  const applyBulkMarkup = async () => {
    if (pctChange === 0 && amtChange === 0) {
      showToast('Enter a markup change to apply', 'error');
      return;
    }
    if (!confirm(`Apply bulk markup: ${pctChange}% and R${amtChange} to ALL ${products.length} products?`)) return;

    setApplying(true);
    try {
      if (pctChange !== 0) {
        const res = await fetch('/api/admin/products', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ markup_percent: pctChange }),
        });
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products);
          showToast(`Applied ${pctChange > 0 ? '+' : ''}${pctChange}% markup to all products`);
        }
      }
      if (amtChange !== 0) {
        const res = await fetch('/api/admin/products', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ markup_amount: amtChange }),
        });
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products);
          showToast(`Applied R${amtChange > 0 ? '+' : ''}${amtChange} markup to all products`);
        }
      }
    } catch {
      showToast('Failed to apply bulk markup', 'error');
    }
    setApplying(false);
    setPctChange(0);
    setAmtChange(0);
  };

  const totalCost = products.reduce((s, p) => s + p.cost_price, 0);
  const totalRevenue = products.reduce((s, p) => s + p.selling_price, 0);
  const avgMargin = products.length > 0
    ? (products.reduce((s, p) => s + ((p.selling_price - p.cost_price) / p.cost_price) * 100, 0) / products.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Bulk markup */}
      <div className="bg-white rounded-xl border border-border p-6">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Percent className="w-5 h-5 text-primary" /> Bulk Markup Adjustment</h2>
        <p className="text-sm text-muted-foreground mb-4">Apply a markup change to ALL products at once. Use positive values to increase, negative to decrease.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Percentage Change (%)</label>
            <input
              type="number"
              value={pctChange || ''}
              onChange={(e) => setPctChange(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              placeholder="e.g. 5 for +5%"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fixed Amount Change (R)</label>
            <input
              type="number"
              value={amtChange || ''}
              onChange={(e) => setAmtChange(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              placeholder="e.g. 10 for +R10"
            />
          </div>
        </div>

        <button
          onClick={applyBulkMarkup}
          disabled={applying || (pctChange === 0 && amtChange === 0)}
          className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
        >
          {applying && <Loader2 className="w-4 h-4 animate-spin" />}
          Apply to All Products
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-border p-5 text-center">
          <p className="text-sm text-muted-foreground">Total Cost Value</p>
          <p className="text-xl font-bold text-amber-600">{formatPrice(totalCost)}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-5 text-center">
          <p className="text-sm text-muted-foreground">Total Retail Value</p>
          <p className="text-xl font-bold text-green-600">{formatPrice(totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-5 text-center">
          <p className="text-sm text-muted-foreground">Average Margin</p>
          <p className="text-xl font-bold text-primary">{avgMargin.toFixed(1)}%</p>
        </div>
      </div>

      {/* Markup overview table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-4 py-3 bg-muted/50">
          <h3 className="font-bold text-sm">Product Markup Overview</h3>
        </div>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 sticky top-0">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground text-xs">Product</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground text-xs">Cost</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground text-xs">Markup %</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground text-xs">Markup R</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground text-xs">Selling</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground text-xs">Profit</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground text-xs">Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map(p => {
                const profit = p.selling_price - p.cost_price;
                const margin = p.cost_price > 0 ? ((profit / p.cost_price) * 100).toFixed(1) : '0';
                return (
                  <tr key={p.id} className="hover:bg-muted/30">
                    <td className="px-4 py-2 font-medium">{p.name}</td>
                    <td className="px-4 py-2 text-right">{formatPrice(p.cost_price)}</td>
                    <td className="px-4 py-2 text-right">{p.markup_percent}%</td>
                    <td className="px-4 py-2 text-right">{formatPrice(p.markup_amount)}</td>
                    <td className="px-4 py-2 text-right font-bold text-primary">{formatPrice(p.selling_price)}</td>
                    <td className="px-4 py-2 text-right text-green-600">{formatPrice(profit)}</td>
                    <td className="px-4 py-2 text-right font-medium">{margin}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ===================== EMPTY STATE ===================== */

function EmptyState({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center animate-fade-in">
      <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
      <h2 className="text-lg font-bold">{title}</h2>
      <button onClick={onBack} className="mt-4 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm">
        Go Back
      </button>
    </div>
  );
}

/* ===================== MAIN APP ===================== */

export default function Home() {
  const { currentView, setProducts, setCartItems, isLoading, setLoading } = useStore();

  // Initial data load
  useEffect(() => {
    async function init() {
      setLoading(true);

      // Load products
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products);
        }
      } catch { /* ignore */ }

      // Check session
      try {
        const res = await fetch('/api/cart');
        if (res.ok) {
          const data = await res.json();
          // If cart loads, user is logged in (API returns 401 if not)
          setCartItems(data.cartItems || []);
        }
      } catch { /* ignore */ }

      // Try to get user info
      try {
        await fetch('/api/orders');
      } catch { /* ignore */ }

      setLoading(false);
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
            <Flame className="w-8 h-8 text-white" />
          </div>
          <p className="text-muted-foreground text-sm">Loading BoerieCall...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        {currentView === 'home' && <HomeView />}
        {currentView === 'shop' && <ShopView />}
        {currentView === 'product' && <ProductDetailView />}
        {currentView === 'cart' && <CartView />}
        {currentView === 'checkout' && <CheckoutView />}
        {currentView === 'login' && <LoginView />}
        {currentView === 'register' && <RegisterView />}
        {currentView === 'profile' && <ProfileView />}
        {currentView === 'order-success' && <OrderSuccessView />}
        {(currentView === 'admin' || currentView === 'admin-products' || currentView === 'admin-orders' || currentView === 'admin-markup') && <AdminView />}
      </main>
      <Footer />
      <Toast />
    </div>
  );
}
