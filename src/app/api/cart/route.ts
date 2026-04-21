import { NextRequest, NextResponse } from 'next/server';
import { supabase, generateId } from '@/lib/supabase';

async function getUser(request: NextRequest) {
  const sessionId = request.cookies.get('session_id')?.value;
  if (!sessionId) return null;
  const { data: user } = await supabase.from('users').select('id, role').eq('id', sessionId).single();
  return user;
}

async function getCartItems(userId: string) {
  const { data: items } = await supabase
    .from('cart_items')
    .select('*, product:products(id, name, selling_price, weight, image_url, category)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return (items || []).map((item: any) => ({
    ...item,
    product: item.product_id ? item.product : null,
  }));
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const cartItems = await getCartItems(user.id);
    return NextResponse.json({ cartItems });
  } catch (error) {
    console.error('Get cart error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { product_id, quantity } = await request.json();
    if (!product_id) return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });

    const { data: product } = await supabase
      .from('products')
      .select('id, stock_quantity')
      .eq('id', product_id)
      .eq('is_active', true)
      .single();

    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', user.id)
      .eq('product_id', product_id)
      .single();

    if (existing) {
      const newQty = existing.quantity + (quantity || 1);
      if (newQty > product.stock_quantity) return NextResponse.json({ error: 'Not enough stock' }, { status: 400 });
      await supabase.from('cart_items').update({ quantity: newQty }).eq('id', existing.id);
    } else {
      const qty = quantity || 1;
      if (qty > product.stock_quantity) return NextResponse.json({ error: 'Not enough stock' }, { status: 400 });
      await supabase.from('cart_items').insert({
        id: generateId(),
        user_id: user.id,
        product_id,
        quantity: qty,
      });
    }

    const cartItems = await getCartItems(user.id);
    return NextResponse.json({ cartItems });
  } catch (error) {
    console.error('Add to cart error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { product_id, quantity } = await request.json();
    if (!product_id || quantity == null) return NextResponse.json({ error: 'Product ID and quantity are required' }, { status: 400 });

    if (quantity <= 0) {
      await supabase.from('cart_items').delete().eq('user_id', user.id).eq('product_id', product_id);
    } else {
      const { data: product } = await supabase.from('products').select('stock_quantity').eq('id', product_id).single();
      if (product && quantity > product.stock_quantity) return NextResponse.json({ error: 'Not enough stock' }, { status: 400 });
      await supabase.from('cart_items').update({ quantity }).eq('user_id', user.id).eq('product_id', product_id);
    }

    const cartItems = await getCartItems(user.id);
    return NextResponse.json({ cartItems });
  } catch (error) {
    console.error('Update cart error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const product_id = searchParams.get('product_id');

    if (product_id) {
      await supabase.from('cart_items').delete().eq('user_id', user.id).eq('product_id', product_id);
    } else {
      await supabase.from('cart_items').delete().eq('user_id', user.id);
    }

    return NextResponse.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
