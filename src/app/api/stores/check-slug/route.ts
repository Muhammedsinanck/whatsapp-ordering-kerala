import { NextRequest, NextResponse } from 'next/server';
import { getStoreBySlug, getAllStores } from '@/lib/db';

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
  const rawName = searchParams.get('name') || '';
  const currentStoreId = searchParams.get('currentStoreId') || '';

  let nameAvailable = true;
  let nameReason: string | undefined = undefined;

  // 1. Check Store Name if provided
  if (rawName.trim()) {
    const trimmedName = rawName.trim();
    if (trimmedName.length < 2) {
      nameAvailable = false;
      nameReason = 'Store name must be at least 2 characters';
    } else {
      const allStores = await getAllStores();
      const existingWithName = allStores.find(
        (s) =>
          s.name.trim().toLowerCase() === trimmedName.toLowerCase() &&
          (!currentStoreId || s.id !== currentStoreId)
      );
      if (existingWithName) {
        nameAvailable = false;
        nameReason = `Store name "${trimmedName}" is already taken by another store`;
      }
    }
  }

  // 2. Check Store Handle/Slug if provided
  let slugAvailable = true;
  let slugReason: string | undefined = undefined;
  let cleanSlug = '';

  if (rawSlug.trim()) {
    cleanSlug = rawSlug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (!cleanSlug) {
      slugAvailable = false;
      slugReason = 'Empty slug';
    } else if (cleanSlug.length < 3) {
      slugAvailable = false;
      slugReason = 'Handle must be at least 3 characters';
    } else if (RESERVED_SLUGS.has(cleanSlug)) {
      slugAvailable = false;
      slugReason = 'This handle is reserved by the system';
    } else {
      const existingWithSlug = await getStoreBySlug(cleanSlug);
      if (existingWithSlug) {
        if (currentStoreId && existingWithSlug.id === currentStoreId) {
          slugAvailable = true;
        } else {
          slugAvailable = false;
          slugReason = `Handle "/store/${cleanSlug}" is already taken by another store`;
        }
      }
    }
  }

  const overallAvailable =
    (rawName ? nameAvailable : true) && (rawSlug ? slugAvailable : true);

  return NextResponse.json({
    available: overallAvailable,
    nameAvailable,
    slugAvailable,
    slug: cleanSlug,
    nameReason,
    slugReason,
    reason: nameReason || slugReason
  });
}
