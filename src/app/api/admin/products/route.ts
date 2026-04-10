import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function getAdminUser(request: NextRequest) {
  const sessionId = request.cookies.get('session_id')?.value;
  if (!sessionId) return null;
  const db = getDb();
  const user = db.query('SELECT id, role FROM users WHERE id = ?').get(sessionId) as any;
  if (!user || user.role !== 'ADMIN') return null;
  return user;
}

export async function GET(request: NextRequest) {
  try {
    const admin = getAdminUser(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const products = db.query('SELECT * FROM products ORDER BY name ASC').all() as any[];
    return NextResponse.json({ products });
  } catch (error) {
    console.error('Admin products list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = getAdminUser(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, category, subcategory, cost_price, markup_percent, markup_amount, selling_price, weight, stock_quantity, image_url } = await request.json();

    if (!name || !category || cost_price == null) {
      return NextResponse.json({ error: 'Name, category, and cost price are required' }, { status: 400 });
    }

    const db = getDb();
    const id = generateId();

    db.prepare(`
      INSERT INTO products (id, name, description, category, subcategory, cost_price, markup_percent, markup_amount, selling_price, weight, stock_quantity, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, name, description || null, category, subcategory || null,
      cost_price, markup_percent || 0, markup_amount || 0, selling_price || cost_price,
      weight || 0, stock_quantity || 0, image_url || null
    );

    const product = db.query('SELECT * FROM products WHERE id = ?').get(id);
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = getAdminUser(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, name, description, category, subcategory, cost_price, markup_percent, markup_amount, selling_price, weight, stock_quantity, image_url, is_active } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const db = getDb();

    db.prepare(`
      UPDATE products SET
        name = ?, description = ?, category = ?, subcategory = ?,
        cost_price = ?, markup_percent = ?, markup_amount = ?,
        selling_price = ?, weight = ?, stock_quantity = ?,
        image_url = ?, is_active = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(
      name, description, category, subcategory,
      cost_price, markup_percent || 0, markup_amount || 0, selling_price,
      weight, stock_quantity, image_url, is_active !== undefined ? (is_active ? 1 : 0) : 1,
      id
    );

    const product = db.query('SELECT * FROM products WHERE id = ?').get(id);
    return NextResponse.json({ product });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = getAdminUser(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const db = getDb();
    db.prepare('DELETE FROM products WHERE id = ?').run(id);

    return NextResponse.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = getAdminUser(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { markup_percent, markup_amount } = await request.json();

    const db = getDb();

    if (markup_percent != null && markup_percent !== 0) {
      db.prepare(`
        UPDATE products SET
          markup_percent = markup_percent + ?,
          selling_price = cost_price * (1 + (markup_percent + markup_percent) / 100.0) + markup_amount,
          updated_at = datetime('now')
      `).run(markup_percent);
    }

    if (markup_amount != null && markup_amount !== 0) {
      db.prepare(`
        UPDATE products SET
          markup_amount = markup_amount + ?,
          selling_price = cost_price * (1 + markup_percent / 100.0) + (markup_amount + ?),
          updated_at = datetime('now')
      `).run(markup_amount, markup_amount);
    }

    const products = db.query('SELECT * FROM products ORDER BY name ASC').all();
    return NextResponse.json({ products });
  } catch (error) {
    console.error('Bulk markup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
