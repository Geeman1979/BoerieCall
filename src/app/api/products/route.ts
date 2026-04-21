import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'name';

    let query = supabase.from('products').select('*').eq('is_active', true);

    if (category && category !== 'ALL') {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (sort === 'price_asc') query = query.order('selling_price', { ascending: true });
    else if (sort === 'price_desc') query = query.order('selling_price', { ascending: false });
    else if (sort === 'newest') query = query.order('created_at', { ascending: false });
    else query = query.order('name', { ascending: true });

    const { data: products, error } = await query;

    if (error) throw error;
    return NextResponse.json({ products: products || [] });
  } catch (error) {
    console.error('Products list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
