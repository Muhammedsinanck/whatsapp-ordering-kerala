'use client';

import { GoogleUser } from '@/types';

const AUTH_STORAGE_KEY = 'kerala_wa_google_user';
const ADMIN_KEY_STORAGE = 'kadalink_admin_master_key';

export const KNOWN_ADMIN_EMAILS = [
  'sinan@gmail.com',
  'ckmuhammedsinan@gmail.com',
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
  // Sync to cookie as well
  document.cookie = `kadalink_user_session=${encodeURIComponent(
    JSON.stringify(user)
  )}; Path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
  window.dispatchEvent(new Event('auth-state-changed'));
}

export function clearStoredUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(ADMIN_KEY_STORAGE);
  // Clear cookie
  document.cookie = 'kadalink_user_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  window.dispatchEvent(new Event('auth-state-changed'));
}

export function isPlatformAdmin(user: GoogleUser | null): boolean {
  if (!user || !user.email) return false;
  if (user.role === 'admin') return true;
  const cleanEmail = user.email.toLowerCase().trim();
  const envAdmin = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || '').toLowerCase().trim();
  if (envAdmin && cleanEmail === envAdmin) return true;
  return KNOWN_ADMIN_EMAILS.some((adm) => cleanEmail.includes(adm) || adm.includes(cleanEmail));
}

export function getAdminMasterKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ADMIN_KEY_STORAGE);
}

export function setAdminMasterKey(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_KEY_STORAGE, key.trim());
}

export function clearAdminMasterKey(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ADMIN_KEY_STORAGE);
}
