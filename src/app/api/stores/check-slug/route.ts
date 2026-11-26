import { NextRequest, NextResponse } from 'next/server';
import { getStoreBySlug } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawSlug = searchParams.get('slug') || '';

  const cleanSlug = rawSlug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (!cleanSlug) {
    return NextResponse.json({ available: false, slug: '' });
  }

  const existing = getStoreBySlug(cleanSlug);
  return NextResponse.json({
    available: !existing,
    slug: cleanSlug,
    existingStoreName: existing ? existing.name : undefined
  });
}
