import { create } from 'zustand';

export type View =
  | 'home'
  | 'shop'
  | 'product'
  | 'cart'
  | 'checkout'
  | 'login'
  | 'register'
  | 'profile'
  | 'admin'
  | 'admin-products'
  | 'admin-orders'
  | 'admin-markup'
  | 'order-success';

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  cost_price: number;
  markup_percent: number;
  markup_amount: number;
  selling_price: number;
  weight: number;
  stock_quantity: number;
  image_url: string | null;
  is_active: boolean;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  product?: Product;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  weight: number;
}

export interface Order {
  id: string;
  user_id: string;
  subtotal: number;
  discount: number;
  delivery_fee: number;
  total_amount: number;
  status: string;
  delivery_address: string;
  city: string;
  total_weight: number;
  payment_method: string;
  stitch_payment_id: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  user_name?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  role: string;
}

interface StoreState {
  // Navigation
  currentView: View;
  previousView: View | null;
  setView: (view: View) => void;
  goBack: () => void;

  // Auth
  user: User | null;
  setUser: (user: User | null) => void;

  // Products
  products: Product[];
  selectedProduct: Product | null;
  setProducts: (products: Product[]) => void;
  setSelectedProduct: (product: Product | null) => void;

  // Cart
  cartItems: CartItem[];
  cartCount: number;
  setCartItems: (items: CartItem[]) => void;

  // Orders
  orders: Order[];
  setOrders: (orders: Order[]) => void;

  // UI
  searchQuery: string;
  categoryFilter: string;
  sortBy: string;
  setSearchQuery: (q: string) => void;
  setCategoryFilter: (c: string) => void;
  setSortBy: (s: string) => void;

  // Toast
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  clearToast: () => void;

  // Modal
  showPaymentModal: boolean;
  setShowPaymentModal: (show: boolean) => void;

  // Loading
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  // Navigation
  currentView: 'home',
  previousView: null,
  setView: (view) => set({ currentView: view, previousView: get().currentView }),
  goBack: () => {
    const prev = get().previousView;
    if (prev) set({ currentView: prev, previousView: 'home' });
    else set({ currentView: 'home' });
  },

  // Auth
  user: null,
  setUser: (user) => set({ user }),

  // Products
  products: [],
  selectedProduct: null,
  setProducts: (products) => set({ products }),
  setSelectedProduct: (product) => set({ selectedProduct: product }),

  // Cart
  cartItems: [],
  cartCount: 0,
  setCartItems: (items) => set({
    cartItems: items,
    cartCount: items.reduce((sum, i) => sum + i.quantity, 0),
  }),

  // Orders
  orders: [],
  setOrders: (orders) => set({ orders }),

  // UI
  searchQuery: '',
  categoryFilter: 'ALL',
  sortBy: 'name',
  setSearchQuery: (q) => set({ searchQuery: q }),
  setCategoryFilter: (c) => set({ categoryFilter: c }),
  setSortBy: (s) => set({ sortBy: s }),

  // Toast
  toast: null,
  showToast: (message, type = 'success') => {
    set({ toast: { message, type } });
    setTimeout(() => set({ toast: null }), 3000);
  },
  clearToast: () => set({ toast: null }),

  // Modal
  showPaymentModal: false,
  setShowPaymentModal: (show) => set({ showPaymentModal: show }),

  // Loading
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
}));
