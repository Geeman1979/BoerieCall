import { NextRequest, NextResponse } from 'next/server';
import { supabase, generateId } from '@/lib/supabase';

async function getUser(request: NextRequest) {
  const sessionId = request.cookies.get('session_id')?.value;
  if (!sessionId) return null;
  const { data: user } = await supabase.from('users').select('id, role, email, name').eq('id', sessionId).single();
  return user;
}

async function getAdminUser(request: NextRequest) {
  const sessionId = request.cookies.get('session_id')?.value;
  if (!sessionId) return null;
  const { data: user } = await supabase.from('users').select('id, role').eq('id', sessionId).single();
  if (!user || user.role !== 'ADMIN') return null;
  return user;
}

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminUser(request);
    if (admin) {
      const { data: orders } = await supabase
        .from('orders')
        .select('*, user:users(name, email)')
        .order('created_at', { ascending: false });

      const enriched = await Promise.all((orders || []).map(async (order: any) => {
        const { data: items } = await supabase.from('order_items').select('*').eq('order_id', order.id);
        return { ...order, items: items || [], user_name: order.user?.name, user_email: order.user?.email };
      }));

      return NextResponse.json({ orders: enriched });
    }

    const user = await getUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    const enriched = await Promise.all((orders || []).map(async (order: any) => {
      const { data: items } = await supabase.from('order_items').select('*').eq('order_id', order.id);
      return { ...order, items: items || [] };
    }));

    return NextResponse.json({ orders: enriched });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { delivery_address, city } = await request.json();
    if (!delivery_address || !city) return NextResponse.json({ error: 'Delivery address and city are required' }, { status: 400 });

    // Get cart items with product info
    const { data: cartItems } = await supabase
      .from('cart_items')
      .select('*, product:products!inner(name, selling_price, weight, cost_price, stock_quantity, category)')
      .eq('user_id', user.id);

    if (!cartItems || cartItems.length === 0) return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });

    // Check stock
    for (const item of cartItems) {
      if (item.quantity > item.product.stock_quantity) {
        return NextResponse.json({ error: `Not enough stock for ${item.product.name}` }, { status: 400 });
      }
    }

    // Calculate totals
    let subtotal = 0;
    let totalWeight = 0;
    for (const item of cartItems) {
      subtotal += item.product.selling_price * item.quantity;
      totalWeight += item.product.weight * item.quantity;
    }

    // Reseller discount
    let discount = 0;
    const isReseller = user.role === 'RESELLER';
    if (isReseller) discount = subtotal * 0.1;

    // Delivery fee
    let deliveryFee = 150;
    if (isReseller) {
      if (city === 'Johannesburg' && totalWeight > 10) deliveryFee = 0;
      else if (city === 'Pretoria' && totalWeight > 20) deliveryFee = 0;
    }

    const totalAmount = subtotal - discount + deliveryFee;
    const orderId = generateId();
    const stitchPaymentId = 'stch_' + generateId().substring(0, 24);

    // Create order
    await supabase.from('orders').insert({
      id: orderId,
      user_id: user.id,
      subtotal,
      discount,
      delivery_fee: deliveryFee,
      total_amount: totalAmount,
      status: 'PAID',
      delivery_address,
      city,
      total_weight: totalWeight,
      payment_method: 'STITCH',
      stitch_payment_id: stitchPaymentId,
    });

    // Create order items and update stock
    for (const item of cartItems) {
      await supabase.from('order_items').insert({
        id: generateId(),
        order_id: orderId,
        product_id: item.product_id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.selling_price,
        weight: item.product.weight,
      });

      // Update stock
      const { data: product } = await supabase.from('products').select('stock_quantity').eq('id', item.product_id).single();
      if (product) {
        await supabase.from('products').update({
          stock_quantity: product.stock_quantity - item.quantity
        }).eq('id', item.product_id);
      }
    }

    // Clear cart
    await supabase.from('cart_items').delete().eq('user_id', user.id);

    // Fetch completed order
    const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).single();
    const { data: items } = await supabase.from('order_items').select('*').eq('order_id', orderId);

    return NextResponse.json({ order: { ...order, items: items || [] } }, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
