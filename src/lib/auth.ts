'use client';

import { GoogleUser } from '@/types';

const AUTH_STORAGE_KEY = 'kerala_wa_google_user';

export const PRIMARY_ADMIN_EMAIL = 'ckmuhammedsinan@gmail.com';

export const KNOWN_ADMIN_EMAILS = [
  'ckmuhammedsinan@gmail.com',
  'sinan@gmail.com',
  'ckmuhammedsinan-7412',
  'sinanck@gmail.com'
];

export function getStoredUser(): GoogleUser | null {
  if (typeof window === 'undefined') return null;
  try {
    // 1. Check cookie FIRST so any freshly authenticated Google session takes immediate precedence
    const cookieMatch = document.cookie.match(/kadalink_user_session=([^;]+)/);
    if (cookieMatch) {
      try {
        const decoded = decodeURIComponent(cookieMatch[1]);
        const user = JSON.parse(decoded) as GoogleUser;
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        return user;
      } catch (e) {
        console.warn('Could not parse session cookie:', e);
      }
    }

    // 2. Check local storage
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      const user = JSON.parse(raw) as GoogleUser;
      // Re-sync cookie if missing
      document.cookie = `kadalink_user_session=${encodeURIComponent(
        JSON.stringify(user)
      )}; Path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
      return user;
    }

    return null;
  } catch (err) {
    console.error('Error reading stored user session:', err);
    return null;
  }
}

export function setStoredUser(user: GoogleUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  document.cookie = `kadalink_user_session=${encodeURIComponent(
    JSON.stringify(user)
  )}; Path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
  window.dispatchEvent(new Event('auth-state-changed'));
}

export function clearStoredUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
  document.cookie = 'kadalink_user_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  window.dispatchEvent(new Event('auth-state-changed'));
}

export function isPlatformAdmin(user: GoogleUser | null): boolean {
  if (!user || !user.email) return false;
  const cleanEmail = user.email.toLowerCase().trim();
  if (cleanEmail === PRIMARY_ADMIN_EMAIL) return true;
  if (user.role === 'admin') return true;
  const envAdmin = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || '').toLowerCase().trim();
  if (envAdmin && cleanEmail === envAdmin) return true;
  return KNOWN_ADMIN_EMAILS.some((adm) => cleanEmail === adm || cleanEmail.includes(adm));
}
