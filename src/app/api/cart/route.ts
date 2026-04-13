import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

async function getUser(request: NextRequest) {
  const sessionId = request.cookies.get('session_id')?.value;
  if (!sessionId) return null;
  const db = await getDb();
  const user = db.prepare('SELECT id, role FROM users WHERE id = ?').get(sessionId) as any;
  return user;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const items = db.prepare(`
      SELECT ci.*, p.name as product_name, p.selling_price, p.weight as product_weight, p.image_url, p.category
      FROM cart_items ci
      LEFT JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
      ORDER BY ci.created_at DESC
    `).all(user.id) as any[];

    const enriched = items.map(item => ({
      ...item,
      product: item.product_id ? {
        id: item.product_id,
        name: item.product_name,
        selling_price: item.selling_price,
        weight: item.product_weight,
        image_url: item.image_url,
        category: item.category,
      } : null,
    }));

    return NextResponse.json({ cartItems: enriched });
  } catch (error) {
    console.error('Get cart error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { product_id, quantity } = await request.json();

    if (!product_id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const db = await getDb();

    const product = db.prepare('SELECT id, stock_quantity FROM products WHERE id = ? AND is_active = 1').get(product_id) as any;
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const existing = db.prepare('SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?').get(user.id, product_id) as any;

    if (existing) {
      const newQty = existing.quantity + (quantity || 1);
      if (newQty > product.stock_quantity) {
        return NextResponse.json({ error: 'Not enough stock' }, { status: 400 });
      }
      db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(newQty, existing.id);
    } else {
      const qty = quantity || 1;
      if (qty > product.stock_quantity) {
        return NextResponse.json({ error: 'Not enough stock' }, { status: 400 });
      }
      const id = Math.random().toString(36).substring(2) + Date.now().toString(36);
      db.prepare('INSERT INTO cart_items (id, user_id, product_id, quantity) VALUES (?, ?, ?, ?)').run(id, user.id, product_id, qty);
    }
    db.save();

    const items = db.prepare('SELECT ci.*, p.name as product_name, p.selling_price, p.weight as product_weight, p.image_url, p.category FROM cart_items ci LEFT JOIN products p ON ci.product_id = p.id WHERE ci.user_id = ?').all(user.id) as any[];

    const enriched = items.map(item => ({
      ...item,
      product: item.product_id ? {
        id: item.product_id,
        name: item.product_name,
        selling_price: item.selling_price,
        weight: item.product_weight,
        image_url: item.image_url,
        category: item.category,
      } : null,
    }));

    return NextResponse.json({ cartItems: enriched });
  } catch (error) {
    console.error('Add to cart error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { product_id, quantity } = await request.json();

    if (!product_id || quantity == null) {
      return NextResponse.json({ error: 'Product ID and quantity are required' }, { status: 400 });
    }

    const db = await getDb();

    if (quantity <= 0) {
      db.prepare('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?').run(user.id, product_id);
    } else {
      const product = db.prepare('SELECT stock_quantity FROM products WHERE id = ?').get(product_id) as any;
      if (product && quantity > product.stock_quantity) {
        return NextResponse.json({ error: 'Not enough stock' }, { status: 400 });
      }
      db.prepare('UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?').run(quantity, user.id, product_id);
    }
    db.save();

    const items = db.prepare('SELECT ci.*, p.name as product_name, p.selling_price, p.weight as product_weight, p.image_url, p.category FROM cart_items ci LEFT JOIN products p ON ci.product_id = p.id WHERE ci.user_id = ?').all(user.id) as any[];

    const enriched = items.map(item => ({
      ...item,
      product: item.product_id ? {
        id: item.product_id,
        name: item.product_name,
        selling_price: item.selling_price,
        weight: item.product_weight,
        image_url: item.image_url,
        category: item.category,
      } : null,
    }));

    return NextResponse.json({ cartItems: enriched });
  } catch (error) {
    console.error('Update cart error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const product_id = searchParams.get('product_id');

    const db = await getDb();

    if (product_id) {
      db.prepare('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?').run(user.id, product_id);
    } else {
      db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(user.id);
    }
    db.save();

    return NextResponse.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
