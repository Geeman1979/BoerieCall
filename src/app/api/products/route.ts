import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'name';

    let query = 'SELECT * FROM products WHERE is_active = 1';
    const params: any[] = [];

    if (category && category !== 'ALL') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (sort === 'price_asc') query += ' ORDER BY selling_price ASC';
    else if (sort === 'price_desc') query += ' ORDER BY selling_price DESC';
    else if (sort === 'name') query += ' ORDER BY name ASC';
    else if (sort === 'newest') query += ' ORDER BY created_at DESC';
    else query += ' ORDER BY name ASC';

    const products = db.query(query).all(...params) as any[];

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Products list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
