'use client';

import React, { useEffect, useState } from 'react';
import {
  Flame, ShoppingCart, User, LogOut, Search, Menu, X, Plus, Minus, Trash2,
  ChevronRight, Package, Truck, Shield, Heart, Award, ArrowLeft, Loader2,
  CheckCircle, AlertCircle, Star, BarChart3, Tag, Edit, Percent,
  DollarSign, ChevronDown, Store, LogIn, CreditCard
} from 'lucide-react';
import { useStore, type Product, type Order, type View } from '@/store/useStore';

// ======================== HELPERS ========================

const CATS = [
  { v: 'ALL', l: 'All Products', e: '🏪' },
  { v: 'COLD_SMOKED', l: 'Cold Smoked', e: '❄️' },
  { v: 'HOT_SMOKED', l: 'Hot Smoked', e: '🔥' },
  { v: 'BILTONG', l: 'Biltong', e: '🥩' },
  { v: 'ACCESSORIES', l: 'Accessories', e: '🎁' },
];

const CITIES = ['Johannesburg', 'Pretoria', 'Cape Town', 'Durban', 'Bloemfontein', 'Port Elizabeth', 'Stellenbosch', 'Other'];

const CAT_BG: Record<string, string> = {
  COLD_SMOKED: 'bg-cyan-50 border-cyan-200',
  HOT_SMOKED: 'bg-red-50 border-red-200',
  BILTONG: 'bg-amber-50 border-amber-200',
  ACCESSORIES: 'bg-emerald-50 border-emerald-200',
};

const STATUS_CLR: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-emerald-100 text-emerald-800',
};

const fmt = (p: number) => `R${p.toFixed(2)}`;
const catLabel = (c: string) => CATS.find(x => x.v === c)?.l || c;
const catEmoji = (c: string) => CATS.find(x => x.v === c)?.e || '📦';
const gs = () => useStore.getState();

// Module-level refs for checkout form data (shared between CheckoutView and PaymentModal)
let _checkoutAddr = '';
let _checkoutCity = 'Johannesburg';

// ======================== TOAST ========================

function Toast() {
  const toast = useStore(s => s.toast);
  const clearToast = useStore(s => s.clearToast);
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

// ======================== NAVBAR ========================

function Navbar() {
  const user = useStore(s => s.user);
  const cartCount = useStore(s => s.cartCount);
  const setView = useStore(s => s.setView);
  const [mob, setMob] = useState(false);
  const [acc, setAcc] = useState(false);

  const logout = async () => {
    await fetch('/api/auth/login', { method: 'DELETE' });
    gs().setUser(null); gs().setCartItems([]); gs().setView('home'); gs().showToast('Logged out');
    setAcc(false); setMob(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => setView('home')} className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-lg text-secondary tracking-tight">BoerieCall</span>
              <span className="hidden lg:inline text-xs text-muted-foreground ml-2">Smoked Meats & Biltong</span>
            </div>
          </button>

          <div className="hidden md:flex items-center gap-1">
            {(['home', 'shop'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary rounded-md hover:bg-amber-50 capitalize transition-colors">{v}</button>
            ))}
            {user?.role === 'ADMIN' && (
              <button onClick={() => setView('admin')} className="px-3 py-2 text-sm font-medium text-primary hover:bg-amber-50 rounded-md flex items-center gap-1"><BarChart3 className="w-4 h-4" /> Admin</button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setView('shop')} className="p-2 text-foreground hover:text-primary rounded-md hover:bg-amber-50"><Search className="w-5 h-5" /></button>
            <button onClick={() => setView('cart')} className="p-2 text-foreground hover:text-primary rounded-md hover:bg-amber-50 relative">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">{cartCount > 99 ? '99+' : cartCount}</span>}
            </button>

            {user ? (
              <div className="relative">
                <button onClick={() => setAcc(!acc)} className="flex items-center gap-2 p-2 hover:text-primary rounded-md hover:bg-amber-50">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white text-xs font-bold">{user.name.charAt(0).toUpperCase()}</div>
                  <span className="hidden sm:inline text-sm font-medium">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3 h-3 hidden sm:block" />
                </button>
                {acc && (<>
                  <div className="fixed inset-0 z-40" onClick={() => setAcc(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-border z-50 py-1 animate-fade-in">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${user.role === 'ADMIN' ? 'bg-red-100 text-red-700' : user.role === 'RESELLER' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>{user.role}</span>
                    </div>
                    <button onClick={() => { setView('profile'); setAcc(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-amber-50 flex items-center gap-2"><User className="w-4 h-4" /> Profile & Orders</button>
                    {user.role === 'ADMIN' && <button onClick={() => { setView('admin'); setAcc(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-amber-50 flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Admin</button>}
                    <hr className="my-1 border-border" />
                    <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><LogOut className="w-4 h-4" /> Sign Out</button>
                  </div>
                </>)}
              </div>
            ) : (
              <button onClick={() => setView('login')} className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white text-sm font-medium rounded-lg hover:from-amber-700 hover:to-amber-800 shadow-sm">Sign In</button>
            )}

            <button onClick={() => setMob(!mob)} className="md:hidden p-2 text-foreground hover:text-primary">{mob ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
          </div>
        </div>

        {mob && (
          <div className="md:hidden py-3 border-t border-border animate-fade-in">
            {(['home', 'shop'] as const).map(v => (
              <button key={v} onClick={() => { setView(v); setMob(false); }} className="block w-full text-left px-3 py-2 text-sm font-medium hover:bg-amber-50 rounded-md capitalize">{v}</button>
            ))}
            {CATS.filter(c => c.v !== 'ALL').map(c => (
              <button key={c.v} onClick={() => { gs().setCategoryFilter(c.v); gs().setView('shop'); setMob(false); }} className="block w-full text-left px-3 py-2 text-sm hover:bg-amber-50 rounded-md pl-8">{c.e} {c.l}</button>
            ))}
            {user?.role === 'ADMIN' && <button onClick={() => { setView('admin'); setMob(false); }} className="block w-full text-left px-3 py-2 text-sm font-medium text-primary hover:bg-amber-50 rounded-md">Admin Dashboard</button>}
          </div>
        )}
      </div>
    </nav>
  );
}

// ======================== FOOTER ========================

function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"><Flame className="w-4 h-4 text-amber-400" /></div>
              <span className="font-bold text-lg">BoerieCall</span>
            </div>
            <p className="text-sm text-amber-200/70">Premium South African smoked meats and biltong. Crafted with passion, delivered with pride.</p>
          </div>
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-3 text-amber-300">Shop</h3>
            <ul className="space-y-2 text-sm">
              {CATS.filter(c => c.v !== 'ALL').map(c => (
                <li key={c.v}><button onClick={() => { gs().setCategoryFilter(c.v); gs().setView('shop'); }} className="text-amber-200/70 hover:text-white transition-colors">{c.l}</button></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-3 text-amber-300">Company</h3>
            <ul className="space-y-2 text-sm text-amber-200/70"><li>About Us</li><li>Contact</li><li>FAQs</li></ul>
          </div>
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-3 text-amber-300">Contact</h3>
            <ul className="space-y-2 text-sm text-amber-200/70">
              <li>Johannesburg, South Africa</li><li>+27 11 234 5678</li><li>hello@boeriecall.co.za</li><li>Mon-Sat: 7am - 6pm</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-amber-200/50">&copy; {new Date().getFullYear()} BoerieCall. All rights reserved.</div>
      </div>
    </footer>
  );
}

// ======================== PRODUCT CARD ========================

function ProductCard({ product }: { product: Product }) {
  const setView = useStore(s => s.setView);
  const setSelectedProduct = useStore(s => s.setSelectedProduct);
  const user = useStore(s => s.user);
  const [adding, setAdding] = useState(false);

  const addToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) { gs().showToast('Please sign in to add to cart', 'info'); gs().setView('login'); return; }
    setAdding(true);
    try {
      const res = await fetch('/api/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_id: product.id, quantity: 1 }) });
      const data = await res.json();
      if (res.ok) { gs().setCartItems(data.cartItems); gs().showToast(`${product.name} added to cart!`); }
      else gs().showToast(data.error || 'Failed', 'error');
    } catch { gs().showToast('Failed to add to cart', 'error'); }
    setAdding(false);
  };

  return (
    <div onClick={() => { setSelectedProduct(product); setView('product'); }} className="bg-white rounded-xl border border-border overflow-hidden card-hover cursor-pointer group">
      <div className={`aspect-[4/3] ${CAT_BG[product.category] || 'bg-gray-50 border-gray-200'} border-b flex items-center justify-center relative`}>
        <span className="text-5xl">{catEmoji(product.category)}</span>
        {product.stock_quantity < 10 && product.stock_quantity > 0 && <span className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Only {product.stock_quantity} left</span>}
        {product.stock_quantity === 0 && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="text-white font-bold">Out of Stock</span></div>}
      </div>
      <div className="p-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{catLabel(product.category)}</span>
        <h3 className="font-bold text-sm mt-1 group-hover:text-primary transition-colors line-clamp-2">{product.name}</h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="font-bold text-lg text-primary">{fmt(product.selling_price)}</span>
            {product.weight > 0 && <span className="text-xs text-muted-foreground ml-1">/ {product.weight}kg</span>}
          </div>
          <button onClick={addToCart} disabled={adding || product.stock_quantity === 0} className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 transition-colors">
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ======================== HOME VIEW ========================

function HomeView() {
  const products = useStore(s => s.products);
  const setView = useStore(s => s.setView);
  const setCategoryFilter = useStore(s => s.setCategoryFilter);

  return (
    <div className="animate-fade-in">
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 lg:py-36">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm mb-6"><Flame className="w-4 h-4 text-amber-300" /> Premium Smoked Meats & Biltong</div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">Authentic South African <br /><span className="text-amber-300">Smoked Goodness</span></h1>
            <p className="text-lg sm:text-xl text-amber-100/80 mb-8 max-w-lg">From our smokehouse to your braai. Handcrafted cold-smoked, hot-smoked meats and the finest biltong in Mzansi.</p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => { setCategoryFilter('ALL'); setView('shop'); }} className="px-6 py-3 bg-white text-secondary font-bold rounded-lg hover:bg-amber-50 shadow-lg">Shop Now &rarr;</button>
              <button onClick={() => { setCategoryFilter('BILTONG'); setView('shop'); }} className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-bold rounded-lg border border-white/20 hover:bg-white/20">Biltong Selection</button>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-secondary">Browse Categories</h2>
        <p className="text-muted-foreground text-center mb-10">From delicate cold smoked salmon to hearty hot smoked brisket</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { c: 'COLD_SMOKED', t: 'Cold Smoked', d: 'Delicate flavours, slowly perfected over hours', g: 'from-cyan-700 to-cyan-900' },
            { c: 'HOT_SMOKED', t: 'Hot Smoked', d: 'Bold, smoky, fall-off-the-bone meats', g: 'from-red-700 to-red-900' },
            { c: 'BILTONG', t: 'Biltong', d: 'Traditional SA dried meat, spiced to perfection', g: 'from-amber-700 to-amber-900' },
            { c: 'ACCESSORIES', t: 'Accessories', d: 'Everything for the ultimate smoking experience', g: 'from-emerald-700 to-emerald-900' },
          ].map(h => (
            <button key={h.c} onClick={() => { setCategoryFilter(h.c); setView('shop'); }} className={`bg-gradient-to-br ${h.g} text-white p-6 rounded-xl text-left hover:scale-[1.02] transition-transform shadow-lg group`}>
              <span className="text-3xl mb-3 block">{catEmoji(h.c)}</span>
              <h3 className="font-bold text-lg mb-1 group-hover:text-amber-200 transition-colors">{h.t}</h3>
              <p className="text-sm text-white/70">{h.d}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-secondary">Featured Products</h2>
            <p className="text-muted-foreground">Our most popular smoked meats and biltong</p>
          </div>
          <button onClick={() => { gs().setCategoryFilter('ALL'); setView('shop'); }} className="text-primary font-medium text-sm hover:underline hidden sm:flex items-center gap-1">View All <ChevronRight className="w-4 h-4" /></button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">{products.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}</div>
        <div className="mt-6 text-center sm:hidden">
          <button onClick={() => { gs().setCategoryFilter('ALL'); setView('shop'); }} className="text-primary font-medium text-sm hover:underline">View All Products &rarr;</button>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <Truck className="w-6 h-6" />, t: 'Fast Delivery', d: 'Same-day delivery in Jhb & Pta' },
            { icon: <Shield className="w-6 h-6" />, t: 'Quality Guaranteed', d: '100% South African premium cuts' },
            { icon: <Heart className="w-6 h-6" />, t: 'Made with Love', d: 'Hand-crafted by artisan smokers' },
            { icon: <Award className="w-6 h-6" />, t: 'Reseller Friendly', d: 'Bulk discounts for resellers' },
          ].map((b, i) => (
            <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-border">
              <div className="text-primary">{b.icon}</div>
              <div><h3 className="font-bold text-sm">{b.t}</h3><p className="text-xs text-muted-foreground">{b.d}</p></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ======================== SHOP VIEW ========================

function ShopView() {
  const products = useStore(s => s.products);
  const searchQuery = useStore(s => s.searchQuery);
  const setSearchQuery = useStore(s => s.setSearchQuery);
  const categoryFilter = useStore(s => s.categoryFilter);
  const setCategoryFilter = useStore(s => s.setCategoryFilter);
  const sortBy = useStore(s => s.sortBy);
  const setSortBy = useStore(s => s.setSortBy);
  const [local, setLocal] = useState(searchQuery);

  useEffect(() => { const t = setTimeout(() => setSearchQuery(local), 300); return () => clearTimeout(t); }, [local, setSearchQuery]);

  const filtered = products.filter(p => {
    if (categoryFilter !== 'ALL' && p.category !== categoryFilter) return false;
    if (searchQuery) { const q = searchQuery.toLowerCase(); return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q); }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'price_asc') return a.selling_price - b.selling_price;
    if (sortBy === 'price_desc') return b.selling_price - a.selling_price;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="mb-8"><h1 className="text-3xl font-bold text-secondary">Shop</h1><p className="text-muted-foreground mt-1">Browse our premium smoked meats and biltong</p></div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search products..." value={local} onChange={e => setLocal(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-lg text-sm" />
        </div>
        <div className="flex gap-3">
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="bg-white border border-border rounded-lg px-3 py-2.5 text-sm">
            {CATS.map(c => <option key={c.v} value={c.v}>{c.e} {c.l}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-white border border-border rounded-lg px-3 py-2.5 text-sm">
            <option value="name">Name A-Z</option><option value="price_asc">Price: Low &rarr; High</option><option value="price_desc">Price: High &rarr; Low</option>
          </select>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {CATS.map(c => (
          <button key={c.v} onClick={() => setCategoryFilter(c.v)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${categoryFilter === c.v ? 'bg-primary text-primary-foreground' : 'bg-white border border-border text-muted-foreground hover:border-primary hover:text-primary'}`}>{c.e} {c.l}</button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground mb-4">{filtered.length} product{filtered.length !== 1 ? 's' : ''} found</p>
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{filtered.map(p => <ProductCard key={p.id} product={p} />)}</div>
      ) : (
        <div className="text-center py-20"><Search className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" /><h3 className="text-lg font-bold">No products found</h3><p className="text-muted-foreground text-sm mt-1">Try adjusting your search or filter</p></div>
      )}
    </div>
  );
}

// ======================== PRODUCT DETAIL ========================

function ProductDetailView() {
  const selectedProduct = useStore(s => s.selectedProduct);
  const setView = useStore(s => s.setView);
  const user = useStore(s => s.user);
  const showToast = useStore(s => s.showToast);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  const p = selectedProduct;

  const add = async () => {
    if (!p) return;
    if (!user) { showToast('Please sign in to add to cart', 'info'); setView('login'); return; }
    setAdding(true);
    try {
      const res = await fetch('/api/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_id: p.id, quantity: qty }) });
      const data = await res.json();
      if (res.ok) { gs().setCartItems(data.cartItems); showToast(`${p.name} (x${qty}) added!`); setView('cart'); }
      else showToast(data.error || 'Failed', 'error');
    } catch { showToast('Failed to add to cart', 'error'); }
    setAdding(false);
  };

  if (!p) return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <button onClick={() => setView('shop')} className="text-primary hover:underline">&larr; Back to Shop</button>
      <p className="mt-4 text-muted-foreground">Product not found.</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <button onClick={() => setView('shop')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6"><ArrowLeft className="w-4 h-4" /> Back to Shop</button>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className={`aspect-square rounded-2xl ${CAT_BG[p.category] || 'bg-gray-50 border-gray-200'} border flex items-center justify-center`}>
          <span className="text-8xl">{catEmoji(p.category)}</span>
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{catLabel(p.category)} &bull; {p.subcategory}</span>
          <h1 className="text-3xl font-bold text-secondary mt-2">{p.name}</h1>
          <p className="text-muted-foreground mt-3 leading-relaxed">{p.description}</p>
          <div className="mt-6 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-primary">{fmt(p.selling_price)}</span>
            {p.weight > 0 && <span className="text-muted-foreground text-sm">per {p.weight}kg</span>}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3"><p className="text-xs text-muted-foreground">Weight</p><p className="font-bold text-sm">{p.weight} kg</p></div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3"><p className="text-xs text-muted-foreground">In Stock</p><p className="font-bold text-sm text-success">{p.stock_quantity} units</p></div>
          </div>
          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center border border-border rounded-lg">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-muted rounded-l-lg"><Minus className="w-4 h-4" /></button>
              <span className="w-12 text-center font-bold">{qty}</span>
              <button onClick={() => setQty(Math.min(p.stock_quantity, qty + 1))} className="w-10 h-10 flex items-center justify-center hover:bg-muted rounded-r-lg"><Plus className="w-4 h-4" /></button>
            </div>
            <button onClick={add} disabled={adding || p.stock_quantity === 0} className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold rounded-lg hover:from-amber-700 hover:to-amber-800 disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
              {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
              Add to Cart &mdash; {fmt(p.selling_price * qty)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ======================== CART VIEW ========================

function CartView() {
  const cartItems = useStore(s => s.cartItems);
  const user = useStore(s => s.user);
  const setView = useStore(s => s.setView);
  const showToast = useStore(s => s.showToast);
  const [updating, setUpdating] = useState<string | null>(null);

  const subtotal = cartItems.reduce((sum, i) => sum + (i.product?.selling_price || 0) * i.quantity, 0);

  const updateQty = async (pid: string, qty: number) => {
    setUpdating(pid);
    try {
      const res = await fetch('/api/cart', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_id: pid, quantity: qty }) });
      const data = await res.json();
      if (res.ok) gs().setCartItems(data.cartItems); else showToast(data.error || 'Failed', 'error');
    } catch { showToast('Failed to update', 'error'); }
    setUpdating(null);
  };

  const remove = async (pid: string) => {
    try {
      await fetch(`/api/cart?product_id=${pid}`, { method: 'DELETE' });
      const res = await fetch('/api/cart');
      if (res.ok) gs().setCartItems((await res.json()).cartItems);
      showToast('Item removed');
    } catch { showToast('Failed to remove', 'error'); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <button onClick={() => setView('shop')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6"><ArrowLeft className="w-4 h-4" /> Continue Shopping</button>
      <h1 className="text-3xl font-bold text-secondary mb-6">Shopping Cart</h1>
      {cartItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-border">
          <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-bold">Your cart is empty</h3>
          <p className="text-muted-foreground text-sm mt-1">Add some delicious smoked meats!</p>
          <button onClick={() => setView('shop')} className="mt-4 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90">Browse Products</button>
        </div>
      ) : (
        <div className="space-y-4">
          {cartItems.map(item => (
            <div key={item.id} className="bg-white rounded-xl border border-border p-4 flex gap-4">
              <div className={`w-20 h-20 rounded-lg ${CAT_BG[item.product?.category || '']} border flex items-center justify-center shrink-0`}><span className="text-2xl">{catEmoji(item.product?.category || '')}</span></div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm truncate">{item.product?.name || 'Unknown'}</h3>
                <p className="text-primary font-bold text-sm mt-0.5">{fmt(item.product?.selling_price || 0)}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center border border-border rounded-lg">
                    <button onClick={() => updateQty(item.product_id, item.quantity - 1)} disabled={!!updating} className="w-7 h-7 flex items-center justify-center hover:bg-muted rounded-l-lg"><Minus className="w-3 h-3" /></button>
                    <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                    <button onClick={() => updateQty(item.product_id, item.quantity + 1)} disabled={!!updating} className="w-7 h-7 flex items-center justify-center hover:bg-muted rounded-r-lg"><Plus className="w-3 h-3" /></button>
                  </div>
                  <span className="text-sm text-muted-foreground">{fmt((item.product?.selling_price || 0) * item.quantity)}</span>
                </div>
              </div>
              <button onClick={() => remove(item.product_id)} className="p-2 text-muted-foreground hover:text-red-500 self-start"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted-foreground">Subtotal ({cartItems.reduce((sum, i) => sum + i.quantity, 0)} items)</span>
              <span className="font-bold text-lg">{fmt(subtotal)}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Delivery fees &amp; discounts calculated at checkout</p>
            <button onClick={() => { if (!user) { showToast('Please sign in', 'info'); setView('login'); return; } setView('checkout'); }} className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold rounded-lg hover:from-amber-700 hover:to-amber-800 transition-all">Proceed to Checkout</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ======================== PAYMENT MODAL (top-level component) ========================

function PaymentModal() {
  const showPaymentModal = useStore(s => s.showPaymentModal);
  if (!showPaymentModal) return null;

  return <PaymentModalInner />;
}

function PaymentModalInner() {
  const cartItems = useStore(s => s.cartItems);
  const setShowPaymentModal = useStore(s => s.setShowPaymentModal);
  const [processing, setProcessing] = useState(false);

  const subtotal = cartItems.reduce((sum, i) => sum + (i.product?.selling_price || 0) * i.quantity, 0);
  const totalWeight = cartItems.reduce((sum, i) => sum + (i.product?.weight || 0) * i.quantity, 0);
  const user = useStore(s => s.user);
  const isReseller = user?.role === 'RESELLER';
  const discount = isReseller ? subtotal * 0.1 : 0;
  let deliveryFee = 150;
  if (isReseller) {
    if (_checkoutCity === 'Johannesburg' && totalWeight > 10) deliveryFee = 0;
    else if (_checkoutCity === 'Pretoria' && totalWeight > 20) deliveryFee = 0;
  }
  const total = subtotal - discount + deliveryFee;

  const confirmPayment = async () => {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 2500));
    try {
      const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ delivery_address: _checkoutAddr, city: _checkoutCity }) });
      const data = await res.json();
      if (res.ok) {
        gs().setCartItems([]); gs().setShowPaymentModal(false); gs().setView('order-success'); gs().showToast('Order placed successfully!');
      } else { gs().showToast(data.error || 'Order failed', 'error'); gs().setShowPaymentModal(false); }
    } catch { gs().showToast('Order failed', 'error'); gs().setShowPaymentModal(false); }
    setProcessing(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-fade-in">
        {processing ? (
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
            <h3 className="text-lg font-bold mt-4">Processing Payment</h3>
            <p className="text-sm text-muted-foreground mt-2">Connecting to Stitch... Please wait.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Confirm Payment</h3>
              <button onClick={() => setShowPaymentModal(false)} className="p-1 hover:bg-muted rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2"><CreditCard className="w-5 h-5 text-primary" /><span className="font-medium">Stitch Payment</span></div>
              <p className="text-2xl font-bold text-primary">{fmt(total)}</p>
              <p className="text-xs text-muted-foreground mt-1">Delivering to {_checkoutAddr}, {_checkoutCity}</p>
              {isReseller && <p className="text-xs text-green-600 mt-1">Reseller discount: -{fmt(discount)} | Delivery: {deliveryFee === 0 ? 'FREE' : fmt(deliveryFee)}</p>}
            </div>
            <button onClick={confirmPayment} className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-colors">Confirm &amp; Pay</button>
          </>
        )}
      </div>
    </div>
  );
}

// ======================== CHECKOUT VIEW ========================

function CheckoutView() {
  const cartItems = useStore(s => s.cartItems);
  const user = useStore(s => s.user);
  const setView = useStore(s => s.setView);
  const showToast = useStore(s => s.showToast);
  const setShowPaymentModal = useStore(s => s.setShowPaymentModal);
  const [address, setAddress] = useState(user?.address || '');
  const [city, setCity] = useState(user?.city || 'Johannesburg');

  // Sync to module-level refs for PaymentModal
  useEffect(() => { _checkoutAddr = address; _checkoutCity = city; }, [address, city]);

  const subtotal = cartItems.reduce((sum, i) => sum + (i.product?.selling_price || 0) * i.quantity, 0);
  const totalWeight = cartItems.reduce((sum, i) => sum + (i.product?.weight || 0) * i.quantity, 0);
  const isReseller = user?.role === 'RESELLER';
  const discount = isReseller ? subtotal * 0.1 : 0;
  let deliveryFee = 150;
  if (isReseller) {
    if (city === 'Johannesburg' && totalWeight > 10) deliveryFee = 0;
    else if (city === 'Pretoria' && totalWeight > 20) deliveryFee = 0;
  }
  const total = subtotal - discount + deliveryFee;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in text-center">
        <h1 className="text-3xl font-bold text-secondary mb-4">Checkout</h1>
        <p className="text-muted-foreground">Your cart is empty.</p>
        <button onClick={() => setView('shop')} className="mt-4 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm">Browse Products</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <button onClick={() => setView('cart')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6"><ArrowLeft className="w-4 h-4" /> Back to Cart</button>
      <h1 className="text-3xl font-bold text-secondary mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="font-bold text-lg mb-4">Delivery Address</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Street Address</label>
                <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Main Street, Unit 4" className="w-full px-3 py-2.5 border border-border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <select value={city} onChange={e => setCity(e.target.value)} className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-white">
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="font-bold text-lg mb-4">Order Summary</h2>
            {cartItems.map(item => (
              <div key={item.id} className="flex justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-2">
                  <span>{catEmoji(item.product?.category || '')}</span>
                  <div><p className="text-sm font-medium">{item.product?.name}</p><p className="text-xs text-muted-foreground">Qty: {item.quantity}</p></div>
                </div>
                <span className="text-sm font-bold">{fmt((item.product?.selling_price || 0) * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-border p-6 sticky top-24">
            <h2 className="font-bold text-lg mb-4">Payment Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{fmt(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Total Weight</span><span>{totalWeight.toFixed(1)} kg</span></div>
              {isReseller && <div className="flex justify-between text-green-600"><span>Reseller Discount (10%)</span><span>-{fmt(discount)}</span></div>}
              <div className="flex justify-between"><span className="text-muted-foreground">Delivery ({city})</span><span>{deliveryFee === 0 ? <span className="text-green-600 font-medium">FREE</span> : fmt(deliveryFee)}</span></div>
              {isReseller && <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 text-xs text-purple-700"><Store className="w-3 h-3 inline mr-1" />Reseller: Free delivery JHB &gt;10kg, PTA &gt;20kg</div>}
              <hr className="border-border" />
              <div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-primary">{fmt(total)}</span></div>
            </div>
            <button onClick={() => { if (!address.trim()) { showToast('Please enter delivery address', 'error'); return; } setShowPaymentModal(true); }} className="w-full mt-4 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold rounded-lg hover:from-amber-700 hover:to-amber-800 transition-all flex items-center justify-center gap-2">
              <CreditCard className="w-5 h-5" /> Pay with Stitch &mdash; {fmt(total)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ======================== LOGIN ========================

function LoginView() {
  const setView = useStore(s => s.setView);
  const showToast = useStore(s => s.showToast);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (res.ok) {
        gs().setUser(data.user); gs().showToast(`Welcome back, ${data.user.name}!`);
        const cartRes = await fetch('/api/cart');
        if (cartRes.ok) gs().setCartItems((await cartRes.json()).cartItems);
        setView('home');
      } else showToast(data.error || 'Login failed', 'error');
    } catch { showToast('Login failed', 'error'); }
    setLoading(false);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center mx-auto mb-3"><Flame className="w-6 h-6 text-white" /></div>
            <h1 className="text-2xl font-bold text-secondary">Welcome Back</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to your BoerieCall account</p>
          </div>
          <form onSubmit={login} className="space-y-4">
            <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" className="w-full px-3 py-2.5 border border-border rounded-lg text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;" className="w-full px-3 py-2.5 border border-border rounded-lg text-sm" /></div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold rounded-lg hover:from-amber-700 hover:to-amber-800 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />} Sign In
            </button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">Don&apos;t have an account? <button onClick={() => setView('register')} className="text-primary font-medium hover:underline">Register</button></p>
        </div>
      </div>
    </div>
  );
}

// ======================== REGISTER ========================

function RegisterView() {
  const setView = useStore(s => s.setView);
  const showToast = useStore(s => s.showToast);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', city: 'Johannesburg', role: 'BUYER' });
  const [loading, setLoading] = useState(false);

  const register = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (res.ok) { gs().setUser(data.user); gs().showToast('Registration successful!'); setView('home'); }
      else showToast(data.error || 'Registration failed', 'error');
    } catch { showToast('Registration failed', 'error'); }
    setLoading(false);
  };

  const upd = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center mx-auto mb-3"><Flame className="w-6 h-6 text-white" /></div>
            <h1 className="text-2xl font-bold text-secondary">Create Account</h1>
            <p className="text-sm text-muted-foreground mt-1">Join BoerieCall today</p>
          </div>
          <form onSubmit={register} className="space-y-4">
            <div><label className="block text-sm font-medium mb-1">Full Name</label><input type="text" value={form.name} onChange={e => upd('name', e.target.value)} required className="w-full px-3 py-2.5 border border-border rounded-lg text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" value={form.email} onChange={e => upd('email', e.target.value)} required className="w-full px-3 py-2.5 border border-border rounded-lg text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Password</label><input type="password" value={form.password} onChange={e => upd('password', e.target.value)} required className="w-full px-3 py-2.5 border border-border rounded-lg text-sm" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-sm font-medium mb-1">Phone</label><input type="tel" value={form.phone} onChange={e => upd('phone', e.target.value)} placeholder="+27..." className="w-full px-3 py-2.5 border border-border rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-medium mb-1">City</label><select value={form.city} onChange={e => upd('city', e.target.value)} className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-white">{CITIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            </div>
            <div><label className="block text-sm font-medium mb-1">Account Type</label>
              <select value={form.role} onChange={e => upd('role', e.target.value)} className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-white">
                <option value="BUYER">Buyer</option>
                <option value="RESELLER">Reseller (10% discount, free delivery perks)</option>
              </select>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold rounded-lg hover:from-amber-700 hover:to-amber-800 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <User className="w-5 h-5" />} Create Account
            </button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">Already have an account? <button onClick={() => setView('login')} className="text-primary font-medium hover:underline">Sign In</button></p>
        </div>
      </div>
    </div>
  );
}

// ======================== PROFILE VIEW ========================

function ProfileView() {
  const user = useStore(s => s.user);
  const orders = useStore(s => s.orders);
  const setView = useStore(s => s.setView);
  const [activeTab, setActiveTab] = useState<'info' | 'orders'>('info');

  useEffect(() => {
    if (user) {
      fetch('/api/orders').then(r => r.json()).then(d => { if (d.orders) gs().setOrders(d.orders); }).catch(() => {});
    }
  }, [user]);

  if (!user) return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-center animate-fade-in">
      <h1 className="text-2xl font-bold mb-4">Please sign in to view your profile</h1>
      <button onClick={() => setView('login')} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium">Sign In</button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <button onClick={() => setView('home')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6"><ArrowLeft className="w-4 h-4" /> Home</button>
      <h1 className="text-3xl font-bold text-secondary mb-6">My Profile</h1>

      <div className="flex gap-2 mb-6">
        {(['info', 'orders'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${activeTab === t ? 'bg-primary text-primary-foreground' : 'bg-white border border-border text-muted-foreground hover:border-primary'}`}>{t === 'info' ? 'Account Info' : 'Order History'}</button>
        ))}
      </div>

      {activeTab === 'info' ? (
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white text-2xl font-bold">{user.name.charAt(0).toUpperCase()}</div>
            <div>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <span className={`inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-full ${user.role === 'ADMIN' ? 'bg-red-100 text-red-700' : user.role === 'RESELLER' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>{user.role}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[{ l: 'Phone', v: user.phone || 'Not set' }, { l: 'City', v: user.city || 'Not set' }, { l: 'Address', v: user.address || 'Not set' }].map(f => (
              <div key={f.l} className="bg-muted rounded-lg p-3"><p className="text-xs text-muted-foreground">{f.l}</p><p className="font-medium text-sm">{f.v}</p></div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-border"><Package className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" /><h3 className="font-bold">No orders yet</h3><p className="text-sm text-muted-foreground mt-1">Start shopping to see your orders here</p></div>
          ) : orders.map(order => (
            <div key={order.id} className="bg-white rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div><span className="text-xs text-muted-foreground">Order #{order.id.slice(0, 8)}</span><span className={`ml-2 text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_CLR[order.status] || ''}`}>{order.status}</span></div>
                <span className="font-bold text-primary">{fmt(order.total_amount)}</span>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Placed: {new Date(order.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                <p>{order.delivery_address}, {order.city}</p>
                {order.items && <p className="mt-1">{order.items.map(i => `${i.product_name} x${i.quantity}`).join(', ')}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ======================== ORDER SUCCESS ========================

function OrderSuccessView() {
  const setView = useStore(s => s.setView);
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"><CheckCircle className="w-10 h-10 text-green-600" /></div>
        <h1 className="text-3xl font-bold text-secondary mb-2">Order Placed!</h1>
        <p className="text-muted-foreground mb-2">Your order has been confirmed and is being processed.</p>
        <p className="text-sm text-muted-foreground mb-8">You&apos;ll receive updates via email. Thank you for choosing BoerieCall!</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => setView('shop')} className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90">Continue Shopping</button>
          <button onClick={() => setView('profile')} className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-muted">View Orders</button>
        </div>
      </div>
    </div>
  );
}

// ======================== ADMIN DASHBOARD ========================

function AdminView() {
  const user = useStore(s => s.user);
  const [tab, setTab] = useState<'products' | 'orders' | 'markup'>('products');

  if (!user || user.role !== 'ADMIN') {
    return <div className="max-w-4xl mx-auto px-4 py-8 text-center animate-fade-in"><h1 className="text-2xl font-bold mb-4">Access Denied</h1><button onClick={() => gs().setView('home')} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg">Go Home</button></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-secondary mb-2">Admin Dashboard</h1>
      <p className="text-muted-foreground mb-6">Manage products, orders, and pricing</p>
      <div className="flex gap-2 mb-6">
        {[
          { k: 'products' as const, l: 'Products', i: <Package className="w-4 h-4" /> },
          { k: 'orders' as const, l: 'Orders', i: <ShoppingCart className="w-4 h-4" /> },
          { k: 'markup' as const, l: 'Markup Calculator', i: <Percent className="w-4 h-4" /> },
        ].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${tab === t.k ? 'bg-primary text-primary-foreground' : 'bg-white border border-border text-muted-foreground hover:border-primary'}`}>{t.i} {t.l}</button>
        ))}
      </div>
      {tab === 'products' && <AdminProducts />}
      {tab === 'orders' && <AdminOrders />}
      {tab === 'markup' && <AdminMarkup />}
    </div>
  );
}

// --- Admin Products ---

function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshProducts = async () => {
    try { const res = await fetch('/api/admin/products'); if (res.ok) setProducts((await res.json()).products); } catch {}
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/admin/products');
        if (res.ok && !cancelled) setProducts((await res.json()).products);
      } catch {}
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
    refreshProducts(); gs().showToast('Product deleted');
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{products.length} products</p>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium flex items-center gap-2"><Plus className="w-4 h-4" /> Add Product</button>
      </div>
      {showForm && <ProductForm editing={editing} onClose={() => { setShowForm(false); setEditing(null); }} onSave={load} />}
      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        {products.map(p => (
          <div key={p.id} className="bg-white rounded-lg border border-border p-4 flex items-center gap-4">
            <span className="text-2xl">{catEmoji(p.category)}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2"><h3 className="font-bold text-sm truncate">{p.name}</h3>{!p.is_active && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">INACTIVE</span>}</div>
              <p className="text-xs text-muted-foreground">{catLabel(p.category)} &bull; Stock: {p.stock_quantity}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-bold text-sm text-primary">{fmt(p.selling_price)}</p>
              <p className="text-xs text-muted-foreground">Cost: {fmt(p.cost_price)} | {p.markup_percent}%</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => { setEditing(p); setShowForm(true); }} className="p-2 hover:bg-amber-50 rounded-lg text-muted-foreground hover:text-primary"><Edit className="w-4 h-4" /></button>
              <button onClick={() => deleteProduct(p.id)} className="p-2 hover:bg-red-50 rounded-lg text-muted-foreground hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductForm({ editing, onClose, onSave }: { editing: Product | null; onClose: () => void; onSave: () => void }) {
  const [f, setF] = useState(editing || { name: '', description: '', category: 'BILTONG', subcategory: '', cost_price: 0, markup_percent: 50, selling_price: 0, weight: 0, stock_quantity: 0, image_url: '', is_active: true });
  const [saving, setSaving] = useState(false);

  const calcPrice = (cost: number, markup: number) => cost * (1 + markup / 100);
  const upd = (k: string, v: unknown) => setF(prev => ({ ...prev, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = { ...f, cost_price: Number(f.cost_price), markup_percent: Number(f.markup_percent), selling_price: Number(f.selling_price) || calcPrice(Number(f.cost_price), Number(f.markup_percent)), weight: Number(f.weight), stock_quantity: Number(f.stock_quantity) };
    try {
      if (editing) await fetch('/api/admin/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing.id, ...body }) });
      else await fetch('/api/admin/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      gs().showToast(editing ? 'Product updated' : 'Product created');
      onClose(); onSave();
    } catch { gs().showToast('Save failed', 'error'); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto animate-fade-in">
        <h2 className="text-lg font-bold mb-4">{editing ? 'Edit Product' : 'New Product'}</h2>
        <form onSubmit={save} className="space-y-3">
          <div><label className="block text-sm font-medium mb-1">Name *</label><input type="text" value={f.name} onChange={e => upd('name', e.target.value)} required className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
          <div><label className="block text-sm font-medium mb-1">Description</label><textarea value={f.description} onChange={e => upd('description', e.target.value)} rows={2} className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium mb-1">Category *</label><select value={f.category} onChange={e => upd('category', e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white">{CATS.filter(c => c.v !== 'ALL').map(c => <option key={c.v} value={c.v}>{c.l}</option>)}</select></div>
            <div><label className="block text-sm font-medium mb-1">Subcategory</label><input type="text" value={f.subcategory} onChange={e => upd('subcategory', e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-sm font-medium mb-1">Cost Price *</label><input type="number" step="0.01" value={f.cost_price} onChange={e => upd('cost_price', e.target.value)} required className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Markup %</label><input type="number" step="0.1" value={f.markup_percent} onChange={e => { upd('markup_percent', e.target.value); upd('selling_price', calcPrice(Number(f.cost_price), Number(e.target.value))); }} className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Sell Price</label><input type="number" step="0.01" value={f.selling_price || calcPrice(Number(f.cost_price), Number(f.markup_percent))} onChange={e => upd('selling_price', e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium mb-1">Weight (kg)</label><input type="number" step="0.1" value={f.weight} onChange={e => upd('weight', e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Stock Qty</label><input type="number" value={f.stock_quantity} onChange={e => upd('stock_quantity', e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Image URL</label><input type="text" value={f.image_url || ''} onChange={e => upd('image_url', e.target.value)} placeholder="https://..." className="w-full px-3 py-2 border border-border rounded-lg text-sm" /></div>
          {editing && <label className="flex items-center gap-2"><input type="checkbox" checked={!!f.is_active} onChange={e => upd('is_active', e.target.checked)} className="rounded" /><span className="text-sm">Active</span></label>}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50">{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
            <button type="button" onClick={onClose} className="px-4 py-2.5 border border-border rounded-lg">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Admin Orders ---

function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders').then(r => r.json()).then(d => { if (d.orders) setOrders(d.orders); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/admin/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    if (res.ok) {
      const data = await res.json();
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: data.order.status } : o));
      gs().showToast('Order status updated');
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;

  return (
    <div className="space-y-3 max-h-[70vh] overflow-y-auto">
      {orders.length === 0 ? <p className="text-center text-muted-foreground py-12">No orders yet</p> :
        orders.map(order => (
          <div key={order.id} className="bg-white rounded-xl border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">#{order.id.slice(0, 8)}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_CLR[order.status] || ''}`}>{order.status}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-primary">{fmt(order.total_amount)}</span>
                <select value={order.status} onChange={e => updateStatus(order.id, e.target.value)} className="text-xs border border-border rounded px-2 py-1 bg-white">
                  {['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map(st => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex flex-wrap gap-4"><span>Customer: {order.user_name || 'N/A'}</span><span>{new Date(order.created_at).toLocaleDateString('en-ZA')}</span><span>Weight: {order.total_weight}kg</span></div>
              <p>{order.delivery_address}, {order.city}</p>
              {order.discount > 0 && <span className="text-green-600">Reseller discount: -{fmt(order.discount)}</span>}
              {order.items && <p className="mt-1 text-foreground">{order.items.map(i => `${i.product_name} x${i.quantity}`).join(', ')}</p>}
            </div>
          </div>
        ))
      }
    </div>
  );
}

// --- Admin Markup Calculator ---

function AdminMarkup() {
  const [costPrice, setCostPrice] = useState(100);
  const [markupPct, setMarkupPct] = useState(50);
  const [markupAmt, setMarkupAmt] = useState(0);
  const [bulkPct, setBulkPct] = useState(0);
  const [bulkAmt, setBulkAmt] = useState(0);
  const [applying, setApplying] = useState(false);

  const sellPrice = costPrice * (1 + markupPct / 100) + markupAmt;
  const profit = sellPrice - costPrice;
  const profitMargin = sellPrice > 0 ? (profit / sellPrice * 100) : 0;

  const applyBulk = async () => {
    if (bulkPct === 0 && bulkAmt === 0) return;
    setApplying(true);
    try {
      await fetch('/api/admin/products', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ markup_percent: bulkPct, markup_amount: bulkAmt }) });
      gs().showToast(`Bulk markup applied: ${bulkPct}% / R${bulkAmt}`);
      setBulkPct(0); setBulkAmt(0);
    } catch { gs().showToast('Failed to apply bulk markup', 'error'); }
    setApplying(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl border border-border p-6">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><DollarSign className="w-5 h-5 text-primary" /> Price Calculator</h2>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Cost Price (R)</label><input type="number" value={costPrice} onChange={e => setCostPrice(Number(e.target.value))} className="w-full px-3 py-2.5 border border-border rounded-lg text-sm" /></div>
          <div><label className="block text-sm font-medium mb-1">Markup Percentage (%)</label><input type="number" value={markupPct} onChange={e => setMarkupPct(Number(e.target.value))} className="w-full px-3 py-2.5 border border-border rounded-lg text-sm" /></div>
          <div><label className="block text-sm font-medium mb-1">Additional Markup Amount (R)</label><input type="number" value={markupAmt} onChange={e => setMarkupAmt(Number(e.target.value))} className="w-full px-3 py-2.5 border border-border rounded-lg text-sm" /></div>
        </div>
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div><p className="text-xs text-muted-foreground">Selling Price</p><p className="text-xl font-bold text-primary">{fmt(sellPrice)}</p></div>
            <div><p className="text-xs text-muted-foreground">Profit</p><p className="text-xl font-bold text-success">{fmt(profit)}</p></div>
            <div><p className="text-xs text-muted-foreground">Margin</p><p className="text-xl font-bold text-secondary">{profitMargin.toFixed(1)}%</p></div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-border p-6">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Tag className="w-5 h-5 text-primary" /> Bulk Markup Adjustment</h2>
        <p className="text-sm text-muted-foreground mb-4">Apply a markup change to ALL products at once. This adds to existing markup values.</p>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Add to Markup % (all products)</label><input type="number" value={bulkPct} onChange={e => setBulkPct(Number(e.target.value))} placeholder="e.g. 5 for +5%" className="w-full px-3 py-2.5 border border-border rounded-lg text-sm" /></div>
          <div><label className="block text-sm font-medium mb-1">Add to Markup Amount (R) (all products)</label><input type="number" value={bulkAmt} onChange={e => setBulkAmt(Number(e.target.value))} placeholder="e.g. 10 for +R10" className="w-full px-3 py-2.5 border border-border rounded-lg text-sm" /></div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700">Warning: This will modify ALL products. Changes are applied additively to existing markups.</div>
          <button onClick={applyBulk} disabled={applying || (bulkPct === 0 && bulkAmt === 0)} className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg disabled:opacity-50 flex items-center justify-center gap-2">
            {applying ? <Loader2 className="w-5 h-5 animate-spin" /> : <Percent className="w-5 h-5" />} Apply Bulk Markup
          </button>
        </div>
      </div>
    </div>
  );
}

// ======================== MAIN APP ========================

export default function App() {
  const currentView = useStore(s => s.currentView);
  const setProducts = useStore(s => s.setProducts);
  const setLoading = useStore(s => s.setLoading);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const pRes = await fetch('/api/products');
        if (pRes.ok) gs().setProducts((await pRes.json()).products);
        const cRes = await fetch('/api/cart');
        if (cRes.ok) gs().setCartItems((await cRes.json()).cartItems);
        const oRes = await fetch('/api/orders');
        if (oRes.ok) { const d = await oRes.json(); if (d.orders) gs().setOrders(d.orders); }
      } catch {}
      setLoading(false);
    };
    init();
  }, [setProducts, setLoading]);

  const viewMap: Record<View, React.ReactNode> = {
    home: <HomeView />,
    shop: <ShopView />,
    product: <ProductDetailView />,
    cart: <CartView />,
    checkout: <CheckoutView />,
    login: <LoginView />,
    register: <RegisterView />,
    profile: <ProfileView />,
    admin: <AdminView />,
    'admin-products': <AdminView />,
    'admin-orders': <AdminView />,
    'admin-markup': <AdminView />,
    'order-success': <OrderSuccessView />,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Toast />
      <Navbar />
      <main className="flex-1">
        {viewMap[currentView]}
        <PaymentModal />
      </main>
      <Footer />
    </div>
  );
}
