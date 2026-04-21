import { NextRequest, NextResponse } from 'next/server';
import { supabase, generateId } from '@/lib/supabase';

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
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: products } = await supabase.from('products').select('*').order('name');
    return NextResponse.json({ products: products || [] });
  } catch (error) {
    console.error('Admin products list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminUser(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, description, category, subcategory, cost_price, markup_percent, markup_amount, selling_price, weight, stock_quantity, image_url } = await request.json();
    if (!name || !category || cost_price == null) return NextResponse.json({ error: 'Name, category, and cost price are required' }, { status: 400 });

    const id = generateId();
    await supabase.from('products').insert({
      id, name, description: description || null, category, subcategory: subcategory || null,
      cost_price, markup_percent: markup_percent || 0, markup_amount: markup_amount || 0,
      selling_price: selling_price || cost_price, weight: weight || 0,
      stock_quantity: stock_quantity || 0, image_url: image_url || null,
    });

    const { data: product } = await supabase.from('products').select('*').eq('id', id).single();
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await getAdminUser(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id, name, description, category, subcategory, cost_price, markup_percent, markup_amount, selling_price, weight, stock_quantity, image_url, is_active } = await request.json();
    if (!id) return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });

    await supabase.from('products').update({
      name, description, category, subcategory,
      cost_price, markup_percent: markup_percent || 0, markup_amount: markup_amount || 0,
      selling_price, weight, stock_quantity, image_url,
      is_active: is_active !== undefined ? is_active : true,
    }).eq('id', id);

    const { data: product } = await supabase.from('products').select('*').eq('id', id).single();
    return NextResponse.json({ product });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await getAdminUser(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });

    await supabase.from('products').delete().eq('id', id);
    return NextResponse.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await getAdminUser(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { markup_percent, markup_amount } = await request.json();

    if (markup_percent != null && markup_percent !== 0) {
      // Add markup_percent to all products' existing markup
      const { data: products } = await supabase.from('products').select('*');
      if (products) {
        for (const p of products) {
          const newPercent = (p.markup_percent || 0) + markup_percent;
          const newSellingPrice = p.cost_price * (1 + newPercent / 100) + (p.markup_amount || 0);
          await supabase.from('products').update({
            markup_percent: newPercent,
            selling_price: newSellingPrice,
          }).eq('id', p.id);
        }
      }
    }

    if (markup_amount != null && markup_amount !== 0) {
      const { data: products } = await supabase.from('products').select('*');
      if (products) {
        for (const p of products) {
          const newAmount = (p.markup_amount || 0) + markup_amount;
          const newSellingPrice = p.cost_price * (1 + (p.markup_percent || 0) / 100) + newAmount;
          await supabase.from('products').update({
            markup_amount: newAmount,
            selling_price: newSellingPrice,
          }).eq('id', p.id);
        }
      }
    }

    const { data: updatedProducts } = await supabase.from('products').select('*').order('name');
    return NextResponse.json({ products: updatedProducts || [] });
  } catch (error) {
    console.error('Bulk markup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
