import { NextRequest, NextResponse } from 'next/server';
import { getAllStores, saveStore } from '@/lib/db';
import { KNOWN_ADMIN_EMAILS, PRIMARY_ADMIN_EMAIL } from '@/lib/auth';
import { Product } from '@/types';

function checkAdminAuth(request: NextRequest): boolean {
  const sessionCookie = request.cookies.get('kadalink_user_session')?.value;
  if (sessionCookie) {
    try {
      const user = JSON.parse(decodeURIComponent(sessionCookie));
      const email = (user.email || '').toLowerCase().trim();
      if (email === PRIMARY_ADMIN_EMAIL || user.role === 'admin') return true;
      const envAdmin = (process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || '').toLowerCase().trim();
      if (envAdmin && email === envAdmin) return true;
      if (KNOWN_ADMIN_EMAILS.some((adm) => email === adm || email.includes(adm))) return true;
    } catch {}
  }

  return false;
}

export async function POST(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json(
      { error: 'Forbidden: Admin access strictly restricted to ckmuhammedsinan@gmail.com' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { storeId, product } = body as { storeId: string; product: Partial<Product> };

    if (!storeId) {
      return NextResponse.json({ error: 'Target storeId is required' }, { status: 400 });
    }

    if (!product || !product.name || !product.price) {
      return NextResponse.json({ error: 'Product name and price are required' }, { status: 400 });
    }

    const stores = await getAllStores();
    const targetStore = stores.find((s) => s.id === storeId || s.slug === storeId);

    if (!targetStore) {
      return NextResponse.json({ error: 'Target store not found' }, { status: 404 });
    }

    const newProduct: Product = {
      id: product.id || `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: product.name.trim(),
      description: product.description?.trim() || '',
      price: Number(product.price),
      unit: product.unit?.trim() || 'Piece',
      imageUrl: product.imageUrl || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
      inStock: product.inStock !== false,
      category: product.category?.trim() || 'General'
    };

    const updatedStore = {
      ...targetStore,
      products: [newProduct, ...(targetStore.products || [])],
      updatedAt: new Date().toISOString()
    };

    await saveStore(updatedStore);

    return NextResponse.json({
      success: true,
      message: `Product added to ${targetStore.name}`,
      product: newProduct,
      store: updatedStore
    });
  } catch (error) {
    console.error('Admin product add error:', error);
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
  }
}
