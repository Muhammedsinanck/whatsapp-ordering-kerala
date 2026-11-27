import { NextRequest, NextResponse } from 'next/server';
import { getAllStores, getStoresByOwner, saveStore, getStoreBySlug } from '@/lib/db';
import { Store } from '@/types';

const RESERVED_SLUGS = new Set([
  'admin',
  'api',
  'login',
  'signup',
  'dashboard',
  'onboarding',
  'setup',
  'store',
  'stores',
  'static',
  'assets'
]);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ownerEmail = searchParams.get('ownerEmail');

  if (ownerEmail) {
    const userStores = await getStoresByOwner(ownerEmail);
    return NextResponse.json(userStores);
  }

  const stores = await getAllStores();
  return NextResponse.json(stores);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Store;

    if (!body.name || !body.slug || !body.whatsappNumber) {
      return NextResponse.json(
        { error: 'Store name, slug handle, and WhatsApp number are required' },
        { status: 400 }
      );
    }

    // Clean and normalize slug
    const cleanSlug = body.slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (cleanSlug.length < 3) {
      return NextResponse.json(
        { error: 'Store link must be at least 3 characters long' },
        { status: 400 }
      );
    }

    if (RESERVED_SLUGS.has(cleanSlug)) {
      return NextResponse.json(
        { error: `The link handle "/store/${cleanSlug}" is reserved by the platform. Please pick a different handle.` },
        { status: 400 }
      );
    }

    // Check if store name is already taken by someone else
    const allStores = await getAllStores();
    const cleanName = body.name.trim();
    const existingNameStore = allStores.find(
      (s) => s.name.trim().toLowerCase() === cleanName.toLowerCase() && s.id !== body.id
    );
    if (existingNameStore) {
      return NextResponse.json(
        {
          error: `The store name "${cleanName}" is already taken by another store. Please choose a unique store name.`
        },
        { status: 409 }
      );
    }

    // Check if slug is permanently taken by someone else
    const existing = await getStoreBySlug(cleanSlug);
    if (existing && existing.id !== body.id) {
      return NextResponse.json(
        {
          error: `The store link "kadalink.in/store/${cleanSlug}" is already permanently registered by another seller. Please pick another unique handle.`
        },
        { status: 409 }
      );
    }

    const cleanOwnerEmail = (body.ownerEmail || 'anonymous@kadalink.in').toLowerCase().trim();

    const storeToSave: Store = {
      ...body,
      slug: cleanSlug,
      ownerEmail: cleanOwnerEmail,
      id: body.id || `store-${cleanSlug}-${Date.now().toString().slice(-4)}`,
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      products: body.products || []
    };

    const saved = await saveStore(storeToSave);
    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error('Failed to save store:', error);
    return NextResponse.json({ error: 'Failed to save store. Please try again.' }, { status: 500 });
  }
}
