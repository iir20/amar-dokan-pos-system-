import { Product, Sale, CartItem, User, Expense } from '../types';
import { db } from '../db';

// This service now acts as an abstraction layer over Dexie DB
// Note: All return types are now Promises due to IndexedDB being async

export const StorageService = {
  // --- Products ---
  getProducts: async (): Promise<Product[]> => {
    return await db.products.toArray();
  },

  updateProductStock: async (cartItems: CartItem[]) => {
    // Casting db to any to fix TypeScript error where transaction method is not recognized on AmarDokanDB
    return await (db as any).transaction('rw', db.products, async () => {
        for (const item of cartItems) {
            const product = await db.products.get(item.id);
            if (product) {
                const newStock = product.stock - item.quantity;
                await db.products.update(item.id, { stock: newStock });
            }
        }
    });
  },

  saveProduct: async (product: Product) => {
    // Check if exists
    const exists = await db.products.get(product.id);
    const action = exists ? 'update' : 'create';
    
    return db.performAction('products', action, product, async () => {
        return await db.products.put(product);
    });
  },

  deleteProduct: async (id: string) => {
    return db.performAction('products', 'delete', { id }, async () => {
        return await db.products.delete(id);
    });
  },

  // --- Sales ---
  getSales: async (): Promise<Sale[]> => {
    return await db.sales.orderBy('date').reverse().toArray();
  },

  addSale: async (sale: Sale) => {
    return db.performAction('sales', 'create', sale, async () => {
        await db.sales.add(sale);
        await StorageService.updateProductStock(sale.items);
    });
  },

  // --- Expenses ---
  getExpenses: async (): Promise<Expense[]> => {
    return await db.expenses.toArray();
  },

  addExpense: async (expense: Expense) => {
    return db.performAction('expenses', 'create', expense, async () => {
        return await db.expenses.add(expense);
    });
  },

  deleteExpense: async (id: string) => {
    return db.performAction('expenses', 'delete', { id }, async () => {
        return await db.expenses.delete(id);
    });
  },

  // --- Auth ---
  // Using LocalStorage for Session token only, DB for User Data
  
  registerUser: async (user: User) => {
    await db.users.put(user);
    localStorage.setItem('pos_session_user', user.username);
    return user;
  },

  loginUser: async (username: string, pin: string): Promise<boolean> => {
    const user = await db.users.get(username);
    if (user && user.pin === pin) {
      localStorage.setItem('pos_session_user', username);
      return true;
    }
    return false;
  },

  updateUser: async (user: Partial<User>) => {
    const currentUser = await StorageService.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...user };
      await db.users.put(updatedUser);
      return updatedUser;
    }
    return null;
  },

  isLoggedIn: (): boolean => {
    return !!localStorage.getItem('pos_session_user');
  },

  getCurrentUser: async (): Promise<User | null> => {
    const username = localStorage.getItem('pos_session_user');
    if (!username) return null;
    const user = await db.users.get(username);
    return user || null;
  },

  logout: () => {
    localStorage.removeItem('pos_session_user');
  }
};