import Dexie, { Table } from 'dexie';
import { Product, Sale, Expense, User, CartItem } from './types';
import { INITIAL_PRODUCTS } from './constants';

// Define the Sync Queue Item Structure
export interface SyncItem {
  id?: number;
  table: string;
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
}

export class AmarDokanDB extends Dexie {
  products!: Table<Product>;
  sales!: Table<Sale>;
  expenses!: Table<Expense>;
  users!: Table<User>;
  syncQueue!: Table<SyncItem>;

  constructor() {
    super('AmarDokanDB');
    
    // Define Schema
    // Casting this to any to fix TypeScript error where version method is not recognized on AmarDokanDB
    (this as any).version(1).stores({
      products: 'id, name, category, stock', // Primary key and indexes
      sales: 'id, date, customerPhone',
      expenses: 'id, date, category',
      users: 'username', // Simple single user storage for now
      syncQueue: '++id, table, timestamp' // Auto-increment ID
    });

    // Populate initial data if empty
    // Casting this to any to fix TypeScript error where on method is not recognized on AmarDokanDB
    (this as any).on('populate', () => {
      this.products.bulkAdd(INITIAL_PRODUCTS);
    });
  }

  // --- Sync Logic ---

  /**
   * Generic method to perform an action and queue it for sync
   */
  async performAction(table: string, action: 'create' | 'update' | 'delete', data: any, dbAction: () => Promise<any>) {
    // 1. Perform Local DB Action
    const result = await dbAction();

    // 2. Try to Sync Online (Mocking API call)
    if (navigator.onLine) {
        try {
            await this.mockApiCall(table, action, data);
            console.log(`[Online] Synced ${action} on ${table}`);
            return result;
        } catch (e) {
            console.warn("API Call failed, queuing for offline sync.");
        }
    }

    // 3. If Offline or Failed, Add to Sync Queue
    await this.syncQueue.add({
        table,
        action,
        data,
        timestamp: Date.now()
    });
    console.log(`[Offline] Queued ${action} on ${table}`);

    return result;
  }

  async mockApiCall(table: string, action: string, data: any) {
      // Simulate network delay and success
      return new Promise((resolve, reject) => {
          setTimeout(() => {
              // Randomly fail to test queue (optional, currently set to success)
              resolve(true);
          }, 500);
      });
  }

  /**
   * Process the Sync Queue (Call this when app comes online)
   */
  async processSyncQueue() {
      if (!navigator.onLine) return;

      const items = await this.syncQueue.toArray();
      if (items.length === 0) return;

      console.log(`Processing ${items.length} offline items...`);

      for (const item of items) {
          try {
              await this.mockApiCall(item.table, item.action, item.data);
              if (item.id) await this.syncQueue.delete(item.id);
          } catch (e) {
              console.error("Failed to sync item", item);
          }
      }
  }
}

export const db = new AmarDokanDB();

// Auto-retry sync when online
window.addEventListener('online', () => {
    console.log("Back Online! Syncing...");
    db.processSyncQueue();
});