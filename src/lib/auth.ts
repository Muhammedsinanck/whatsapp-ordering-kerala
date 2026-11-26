'use client';

import { GoogleUser } from '@/types';

const AUTH_STORAGE_KEY = 'kerala_wa_google_user';

export function getStoredUser(): GoogleUser | null {
  if (typeof window === 'undefined') return null;
  try {
    // 1. Check local storage
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as GoogleUser;
    }

    // 2. Check cookie if redirected from Google OAuth
    const cookieMatch = document.cookie.match(/kadalink_user_session=([^;]+)/);
    if (cookieMatch) {
      const decoded = decodeURIComponent(cookieMatch[1]);
      const user = JSON.parse(decoded) as GoogleUser;
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
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
  // Clear cookie
  document.cookie = 'kadalink_user_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  window.dispatchEvent(new Event('auth-state-changed'));
}
