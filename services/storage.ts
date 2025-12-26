import { Product, Sale, CartItem, User, Expense } from '../types';
import { INITIAL_PRODUCTS } from '../constants';

const KEYS = {
  PRODUCTS: 'pos_products',
  SALES: 'pos_sales',
  EXPENSES: 'pos_expenses',
  USER: 'pos_user',
  SESSION: 'pos_session'
};

// Simulate Database Operations
export const StorageService = {
  // --- Products ---
  getProducts: (): Product[] => {
    const stored = localStorage.getItem(KEYS.PRODUCTS);
    if (!stored) {
      localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(stored);
  },

  updateProductStock: (cartItems: CartItem[]) => {
    const products = StorageService.getProducts();
    const updatedProducts = products.map(p => {
      const cartItem = cartItems.find(c => c.id === p.id);
      if (cartItem) {
        return { ...p, stock: p.stock - cartItem.quantity };
      }
      return p;
    });
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(updatedProducts));
    return updatedProducts;
  },

  saveProduct: (product: Product) => {
    const products = StorageService.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.push(product);
    }
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
    return products;
  },

  deleteProduct: (id: string) => {
    let products = StorageService.getProducts();
    products = products.filter(p => p.id !== id);
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
    return products;
  },

  // --- Sales ---
  getSales: (): Sale[] => {
    const stored = localStorage.getItem(KEYS.SALES);
    return stored ? JSON.parse(stored) : [];
  },

  addSale: (sale: Sale) => {
    const sales = StorageService.getSales();
    sales.push(sale);
    localStorage.setItem(KEYS.SALES, JSON.stringify(sales));
    
    // Update inventory
    StorageService.updateProductStock(sale.items);
  },

  // --- Expenses ---
  getExpenses: (): Expense[] => {
    const stored = localStorage.getItem(KEYS.EXPENSES);
    return stored ? JSON.parse(stored) : [];
  },

  addExpense: (expense: Expense) => {
    const expenses = StorageService.getExpenses();
    expenses.push(expense);
    localStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
  },

  deleteExpense: (id: string) => {
    let expenses = StorageService.getExpenses();
    expenses = expenses.filter(e => e.id !== id);
    localStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
  },

  // --- Auth ---
  registerUser: (user: User) => {
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
    localStorage.setItem(KEYS.SESSION, 'true');
    return user;
  },

  loginUser: (username: string, pin: string): boolean => {
    const stored = localStorage.getItem(KEYS.USER);
    if (!stored) return false;
    const user: User = JSON.parse(stored);
    if (user.username === username && user.pin === pin) {
      localStorage.setItem(KEYS.SESSION, 'true');
      return true;
    }
    return false;
  },

  updateUser: (user: Partial<User>) => {
    const currentUser = StorageService.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...user };
      localStorage.setItem(KEYS.USER, JSON.stringify(updatedUser));
      return updatedUser;
    }
    return null;
  },

  isLoggedIn: (): boolean => {
    return localStorage.getItem(KEYS.SESSION) === 'true';
  },

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(KEYS.USER);
    return stored ? JSON.parse(stored) : null;
  },

  logout: () => {
    localStorage.removeItem(KEYS.SESSION);
  }
};