import { NextRequest, NextResponse } from 'next/server';
import { getStoreBySlug } from '@/lib/db';

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
  'assets',
  'public',
  'home',
  'terms',
  'privacy',
  'help',
  'about'
]);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawSlug = searchParams.get('slug') || '';
  const currentStoreId = searchParams.get('currentStoreId') || '';

  const cleanSlug = rawSlug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (!cleanSlug) {
    return NextResponse.json({ available: false, slug: '', reason: 'Empty slug' });
  }

  if (cleanSlug.length < 3) {
    return NextResponse.json({
      available: false,
      slug: cleanSlug,
      reason: 'Handle must be at least 3 characters'
    });
  }

  if (RESERVED_SLUGS.has(cleanSlug)) {
    return NextResponse.json({
      available: false,
      slug: cleanSlug,
      reason: 'This handle is reserved by the system'
    });
  }

  const existing = await getStoreBySlug(cleanSlug);
  
  // If slug is owned by current store being edited, it is available for that store
  if (existing && currentStoreId && existing.id === currentStoreId) {
    return NextResponse.json({
      available: true,
      slug: cleanSlug,
      isCurrentStore: true
    });
  }

  return NextResponse.json({
    available: !existing,
    slug: cleanSlug,
    existingStoreName: existing ? existing.name : undefined,
    reason: existing ? 'Already taken by another store' : undefined
  });
}
