import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

function getAdminUser(request: NextRequest) {
  const sessionId = request.cookies.get('session_id')?.value;
  if (!sessionId) return null;
  const db = getDb();
  const user = db.query('SELECT id, role FROM users WHERE id = ?').get(sessionId) as any;
  if (!user || user.role !== 'ADMIN') return null;
  return user;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = getAdminUser(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await request.json();

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const validStatuses = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const db = getDb();
    db.prepare(`
      UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?
    `).run(status, id);

    const order = db.query('SELECT * FROM orders WHERE id = ?').get(id);
    return NextResponse.json({ order });
  } catch (error) {
    console.error('Update order status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
