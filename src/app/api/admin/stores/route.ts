import { NextRequest, NextResponse } from 'next/server';
import { getAllStores, deleteStore, getAllUsers } from '@/lib/db';
import { KNOWN_ADMIN_EMAILS, PRIMARY_ADMIN_EMAIL } from '@/lib/auth';

function checkAdminAuth(request: NextRequest): boolean {
  const sessionCookie = request.cookies.get('kadalink_user_session')?.value;
  if (sessionCookie) {
    try {
      const user = JSON.parse(decodeURIComponent(sessionCookie));
      const email = (user.email || '').toLowerCase().trim();
      if (email === PRIMARY_ADMIN_EMAIL || user.role === 'admin') return true;
      const envAdmin = (process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || '').toLowerCase().trim();
      if (envAdmin && email === envAdmin) return true;
      if (KNOWN_ADMIN_EMAILS.some((adm) => email === adm || email.includes(adm))) {
        return true;
      }
    } catch {
      // ignore json parse errors
    }
  }

  return false;
}

export async function GET(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json(
      { error: 'Forbidden: Admin access strictly restricted to ckmuhammedsinan@gmail.com' },
      { status: 403 }
    );
  }

  const stores = await getAllStores();
  const users = await getAllUsers();

  const totalProducts = stores.reduce((sum, s) => sum + (s.products?.length || 0), 0);
  const uniqueOwners = new Set(stores.map((s) => s.ownerEmail.toLowerCase())).size;

  return NextResponse.json({
    stats: {
      totalStores: stores.length,
      totalProducts,
      totalSellers: uniqueOwners,
      totalUsers: users.length,
      hasBlobStorage: Boolean(process.env.BLOB_READ_WRITE_TOKEN)
    },
    stores,
    users: users.map(({ password: _, ...safe }) => safe)
  });
}

export async function DELETE(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json(
      { error: 'Forbidden: Admin access strictly restricted to ckmuhammedsinan@gmail.com' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get('id');

  if (!storeId) {
    return NextResponse.json({ error: 'Store ID is required' }, { status: 400 });
  }

  const success = await deleteStore(storeId);
  if (!success) {
    return NextResponse.json({ error: 'Store not found or could not be deleted' }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: 'Store successfully removed by admin' });
}
