import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function getUser(request: NextRequest) {
  const sessionId = request.cookies.get('session_id')?.value;
  if (!sessionId) return null;
  const db = getDb();
  const user = db.query('SELECT id, role, email, name FROM users WHERE id = ?').get(sessionId) as any;
  return user;
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
    const db = getDb();

    const admin = getAdminUser(request);
    if (admin) {
      const orders = db.query(`
        SELECT o.*, u.name as user_name, u.email as user_email
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
      `).all() as any[];

      const enriched = orders.map(order => {
        const items = db.query('SELECT * FROM order_items WHERE order_id = ?').all(order.id) as any[];
        return { ...order, items };
      });

      return NextResponse.json({ orders: enriched });
    }

    const user = getUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = db.query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(user.id) as any[];

    const enriched = orders.map(order => {
      const items = db.query('SELECT * FROM order_items WHERE order_id = ?').all(order.id) as any[];
      return { ...order, items };
    });

    return NextResponse.json({ orders: enriched });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { delivery_address, city } = await request.json();

    if (!delivery_address || !city) {
      return NextResponse.json({ error: 'Delivery address and city are required' }, { status: 400 });
    }

    const db = getDb();

    // Get cart items
    const cartItems = db.query(`
      SELECT ci.*, p.name, p.selling_price, p.weight, p.cost_price, p.stock_quantity, p.category
      FROM cart_items ci
      LEFT JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ? AND ci.product_id IS NOT NULL
    `).all(user.id) as any[];

    if (cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Check stock
    for (const item of cartItems) {
      if (item.quantity > item.stock_quantity) {
        return NextResponse.json({ error: `Not enough stock for ${item.name}` }, { status: 400 });
      }
    }

    // Calculate subtotal
    let subtotal = 0;
    let totalWeight = 0;
    for (const item of cartItems) {
      subtotal += item.selling_price * item.quantity;
      totalWeight += item.weight * item.quantity;
    }

    // Apply reseller discount
    let discount = 0;
    const isReseller = user.role === 'RESELLER';
    if (isReseller) {
      discount = subtotal * 0.1; // 10% discount
    }

    // Calculate delivery fee
    let deliveryFee = 150;
    if (isReseller) {
      if (city === 'Johannesburg' && totalWeight > 10) {
        deliveryFee = 0;
      } else if (city === 'Pretoria' && totalWeight > 20) {
        deliveryFee = 0;
      }
    }

    const totalAmount = subtotal - discount + deliveryFee;

    // Generate order
    const orderId = generateId();
    const stitchPaymentId = 'stch_' + generateId().substring(0, 24);

    db.prepare(`
      INSERT INTO orders (id, user_id, subtotal, discount, delivery_fee, total_amount, status, delivery_address, city, total_weight, payment_method, stitch_payment_id)
      VALUES (?, ?, ?, ?, ?, ?, 'PAID', ?, ?, ?, 'STITCH', ?)
    `).run(orderId, user.id, subtotal, discount, deliveryFee, totalAmount, delivery_address, city, totalWeight, stitchPaymentId);

    // Create order items and update stock
    const insertItem = db.prepare(`
      INSERT INTO order_items (id, order_id, product_id, product_name, quantity, unit_price, weight)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const updateStock = db.prepare('UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?');

    const createOrderItems = db.transaction(() => {
      for (const item of cartItems) {
        const itemId = generateId();
        insertItem.run(itemId, orderId, item.product_id, item.name, item.quantity, item.selling_price, item.weight);
        updateStock.run(item.quantity, item.product_id);
      }
    });

    createOrderItems();

    // Clear cart
    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(user.id);

    const order = db.query('SELECT * FROM orders WHERE id = ?').get(orderId) as any;
    const items = db.query('SELECT * FROM order_items WHERE order_id = ?').all(orderId) as any[];

    return NextResponse.json({ order: { ...order, items } }, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
