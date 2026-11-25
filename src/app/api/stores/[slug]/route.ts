import { NextRequest, NextResponse } from 'next/server';
import { getStoreBySlug, saveStore, deleteStore } from '@/lib/db';
import { Store } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const store = getStoreBySlug(slug);

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
    const body = await request.json() as Store;
    const existing = getStoreBySlug(slug);

    if (!existing) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const updated = saveStore({
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
  const existing = getStoreBySlug(slug);

  if (!existing) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 });
  }

  const success = deleteStore(existing.id);
  return NextResponse.json({ success });
}
