import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone, role, city } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    const db = getDb();

    const existing = db.query('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const id = generateId();
    db.prepare(`
      INSERT INTO users (id, name, email, password, phone, city, role)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, email, password, phone || null, city || 'Other', role || 'BUYER');

    const user = db.query('SELECT id, name, email, phone, address, city, role FROM users WHERE id = ?').get(id);

    const response = NextResponse.json({ user, message: 'Registration successful' });
    response.cookies.set('session_id', id, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
