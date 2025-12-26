export interface Product {
  id: string;
  name: string;
  nameBn: string; // Bangla Name
  price: number;
  cost: number; // For profit calculation
  category: string;
  stock: number;
  unit: string; // e.g., 'kg', 'pcs', 'L'
  image?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Sale {
  id: string;
  date: string; // ISO string
  items: CartItem[];
  totalAmount: number;
  totalProfit: number;
  paymentMethod: 'cash' | 'digital';
  customerName?: string;
  customerPhone?: string;
  paidAmount: number;
  dueAmount: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
}

export interface User {
  storeName: string;
  username: string;
  pin: string; // Simple PIN or Password for local auth
  address?: string;
  phone?: string;
}

export type Language = 'en' | 'bn';

export interface Translation {
  dashboard: string;
  pos: string;
  inventory: string;
  settings: string;
  expenses: string;
  totalSales: string;
  netProfit: string;
  totalOrders: string;
  totalExpenses: string;
  lowStock: string;
  addToCart: string;
  searchPlaceholder: string;
  checkout: string;
  print: string;
  close: string;
  invoiceTitle: string;
  item: string;
  qty: string;
  price: string;
  total: string;
  thankYou: string;
  stockLevel: string;
  cost: string;
  actions: string;
  addProduct: string;
  addExpense: string;
  save: string;
  cancel: string;
  confirmDelete: string;
  unit: string;
  customerName: string;
  customerPhone: string;
  paidAmount: string;
  dueAmount: string;
  changeAmount: string;
  totalDue: string;
  dueList: string;
  date: string;
  purchasedItems: string;
  noDueFound: string;
  view: string;
  login: string;
  register: string;
  storeName: string;
  username: string;
  pin: string;
  logout: string;
  downloadReport: string;
  description: string;
  amount: string;
  // Profile
  profile: string;
  storeAddress: string;
  storePhone: string;
  updateProfile: string;
  profileUpdated: string;
  download: string;
}