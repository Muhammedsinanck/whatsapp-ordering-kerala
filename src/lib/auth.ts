'use client';

import { GoogleUser } from '@/types';

const AUTH_STORAGE_KEY = 'kerala_wa_google_user';

export function getStoredUser(): GoogleUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GoogleUser) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: GoogleUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event('auth-state-changed'));
}

export function clearStoredUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new Event('auth-state-changed'));
}
