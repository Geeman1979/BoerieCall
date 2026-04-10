import { Database } from 'bun:sqlite';

const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './db/boeriecall.db';

let _db: Database | null = null;

export function getDb(): Database {
  if (!_db) {
    _db = new Database(dbPath, { create: true });
    _db.exec('PRAGMA journal_mode = WAL');
    _db.exec('PRAGMA foreign_keys = ON');
    initTables(_db);
  }
  return _db;
}

function initTables(db: Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      city TEXT DEFAULT 'Other',
      role TEXT DEFAULT 'BUYER',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      subcategory TEXT,
      cost_price REAL NOT NULL,
      markup_percent REAL DEFAULT 0,
      markup_amount REAL DEFAULT 0,
      selling_price REAL NOT NULL,
      weight REAL DEFAULT 0,
      stock_quantity INTEGER DEFAULT 0,
      image_url TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      subtotal REAL NOT NULL,
      discount REAL DEFAULT 0,
      delivery_fee REAL DEFAULT 0,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'PENDING',
      delivery_address TEXT,
      city TEXT,
      total_weight REAL DEFAULT 0,
      payment_method TEXT DEFAULT 'STITCH',
      stitch_payment_id TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT,
      product_name TEXT,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      weight REAL DEFAULT 0,
      FOREIGN KEY (order_id) REFERENCES orders(id)
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, product_id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
}
