import { NextRequest, NextResponse } from 'next/server';
import { supabase, generateId } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone, role, city } = await request.json();
    if (!name || !email || !password) return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });

    const { data: existing } = await supabase.from('users').select('id').eq('email', email).single();
    if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 409 });

    const id = generateId();
    await supabase.from('users').insert({
      id,
      name,
      email,
      password,
      phone: phone || null,
      city: city || 'Other',
      role: role || 'BUYER',
    });

    const { data: user } = await supabase
      .from('users')
      .select('id, name, email, phone, address, city, role')
      .eq('id', id)
      .single();

    const response = NextResponse.json({ user, message: 'Registration successful' });
    response.cookies.set('session_id', id, { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 });
    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
