import { NextRequest, NextResponse } from 'next/server';
import { getAllStores, getStoresByOwner, saveStore, getStoreBySlug } from '@/lib/db';
import { Store } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ownerEmail = searchParams.get('ownerEmail');

  if (ownerEmail) {
    const userStores = getStoresByOwner(ownerEmail);
    return NextResponse.json(userStores);
  }

  const stores = getAllStores();
  return NextResponse.json(stores);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Store;

    if (!body.name || !body.slug || !body.whatsappNumber) {
      return NextResponse.json(
        { error: 'Store name, slug, and WhatsApp number are required' },
        { status: 400 }
      );
    }

    // Clean slug
    const cleanSlug = body.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    
    // Check if slug is taken by someone else
    const existing = getStoreBySlug(cleanSlug);
    if (existing && existing.id !== body.id) {
      return NextResponse.json(
        { error: 'This store link is already taken! Please choose another link slug.' },
        { status: 409 }
      );
    }

    const storeToSave: Store = {
      ...body,
      slug: cleanSlug,
      id: body.id || `store-${cleanSlug}-${Date.now().toString().slice(-4)}`,
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      products: body.products || []
    };

    const saved = saveStore(storeToSave);
    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error('Failed to save store:', error);
    return NextResponse.json({ error: 'Failed to save store' }, { status: 500 });
  }
}
