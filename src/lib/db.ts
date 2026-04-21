import initSqlJs, { type Database as SqlJsDatabase } from 'sql.js';
import path from 'path';
import fs from 'fs';

const dbPath = process.env.DATABASE_URL?.replace('file:', '') || path.join(process.cwd(), 'db', 'boeriecall.db');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _db: any = null;
let _initialized = false;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function initDb(): Promise<any> {
  if (_db) return _db;
  const SQL = await initSqlJs();
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    _db = new SQL.Database(fileBuffer);
  } else {
    _db = new SQL.Database();
  }
  _db.run('PRAGMA journal_mode = MEMORY');
  _db.run('PRAGMA foreign_keys = ON');
  return _db;
}

function initTables(db: any) {
  db.run(`
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

/* Wrapper that mimics better-sqlite3 API */

interface Statement {
  run(...params: unknown[]): void;
  get(...params: unknown[]): Record<string, unknown> | undefined;
  all(...params: unknown[]): Record<string, unknown>[];
}

export interface BoerieDb {
  prepare(sql: string): Statement;
  exec(sql: string): void;
  pragma(cmd: string): void;
  save(): void;
}

export async function getDb(): Promise<BoerieDb> {
  const raw = await initDb();

  if (!_initialized) {
    initTables(raw);
    _initialized = true;
  }

  function prepare(sql: string): Statement {
    return {
      run(...params: unknown[]) {
        raw.run(sql, params as (string | number | null | Uint8Array)[]);
      },
      get(...params: unknown[]): Record<string, unknown> | undefined {
        try {
          const stmt = raw.prepare(sql);
          stmt.bind(params as (string | number | null | Uint8Array)[]);
          let result: Record<string, unknown> | undefined;
          if (stmt.step()) {
            result = stmt.getAsObject();
          }
          stmt.free();
          return result;
        } catch (e) {
          console.error('SQL get error:', sql, e);
          throw e;
        }
      },
      all(...params: unknown[]): Record<string, unknown>[] {
        try {
          const results: Record<string, unknown>[] = [];
          const stmt = raw.prepare(sql);
          stmt.bind(params as (string | number | null | Uint8Array)[]);
          while (stmt.step()) {
            results.push(stmt.getAsObject());
          }
          stmt.free();
          return results;
        } catch (e) {
          console.error('SQL all error:', sql, e);
          throw e;
        }
      },
    };
  }

  return {
    prepare,
    exec(sql: string) {
      raw.run(sql);
    },
    pragma(_cmd?: string) {
      // no-op for sql.js
    },
    save() {
      const data = raw.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(dbPath, buffer);
    },
  };
}
