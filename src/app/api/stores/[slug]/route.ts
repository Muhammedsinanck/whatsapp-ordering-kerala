import { NextRequest, NextResponse } from 'next/server';
import { getStoreBySlug, getAllStores, saveStore, deleteStore } from '@/lib/db';
import { Store } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);

  if (!store) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 });
  }

  return NextResponse.json(store);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = (await request.json()) as Store;
    const existing = await getStoreBySlug(slug);

    if (!existing) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // If name is changing, verify the new name is not taken by another store
    if (body.name && body.name.trim().toLowerCase() !== existing.name.trim().toLowerCase()) {
      const allStores = await getAllStores();
      const existingNameStore = allStores.find(
        (s) => s.name.trim().toLowerCase() === body.name.trim().toLowerCase() && s.id !== existing.id
      );
      if (existingNameStore) {
        return NextResponse.json(
          { error: `The store name "${body.name.trim()}" is already taken by another store. Please pick a unique name.` },
          { status: 409 }
        );
      }
    }

    // If slug is changing, verify the new slug is not taken
    if (body.slug && body.slug.toLowerCase().trim() !== existing.slug.toLowerCase()) {
      const newSlugClean = body.slug
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      const slugCheck = await getStoreBySlug(newSlugClean);
      if (slugCheck && slugCheck.id !== existing.id) {
        return NextResponse.json(
          { error: `The store handle "/store/${newSlugClean}" is already taken.` },
          { status: 409 }
        );
      }
    }

    const updated = await saveStore({
      ...existing,
      ...body,
      id: existing.id,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating store:', error);
    return NextResponse.json({ error: 'Failed to update store' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const existing = await getStoreBySlug(slug);

  if (!existing) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 });
  }

  const success = await deleteStore(existing.id);
  return NextResponse.json({ success });
}
