'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredUser, setStoredUser, clearStoredUser } from '@/lib/auth';
import { GoogleUser } from '@/types';
import {
  Store,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  MessageCircle,
  QrCode,
  Layers,
  LogOut
} from 'lucide-react';
import Link from 'next/link';

const PRESET_ACCOUNTS: GoogleUser[] = [
  {
    id: 'google-sinan',
    email: 'sinan@gmail.com',
    name: 'Sinan C.K.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'google-anjali',
    email: 'anjali@gmail.com',
    name: 'Anjali Nair',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'google-fathima',
    email: 'fathima.boutique@gmail.com',
    name: 'Fathima Raheem',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  }
];

export default function LoginPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<GoogleUser | null>(null);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);

  useEffect(() => {
    setCurrentUser(getStoredUser());
  }, []);

  const handleSelectAccount = async (account: { email: string; name: string; avatar?: string }) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(account)
      });
      const data = await res.json();
      if (data.user) {
        setStoredUser(data.user);
        setCurrentUser(data.user);
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Google Sign-in failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) return;
    handleSelectAccount({
      email: customEmail,
      name: customName || customEmail.split('@')[0]
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm font-black text-sm">
            K
          </div>
          <div>
            <div className="font-extrabold text-slate-900 text-base">KadaLink <span className="text-emerald-600">Merchant Portal</span></div>
            <div className="text-[10px] text-slate-400 -mt-0.5">Kerala WhatsApp Commerce Setup</div>
          </div>
        </Link>
        <Link href="/" className="text-xs font-semibold text-slate-600 hover:text-emerald-600">
          ← Back to Main Page
        </Link>
      </header>

      {/* Main Card */}
      <main className="max-w-md w-full mx-auto p-4 my-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
          {currentUser ? (
            /* Already Logged In State */
            <div className="text-center space-y-5">
              <div className="relative inline-block">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-emerald-100 shadow-md"
                />
                <span className="absolute bottom-0 right-0 p-1 bg-emerald-600 text-white rounded-full">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Signed In with Google
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-2">{currentUser.name}</h2>
                <p className="text-xs text-slate-500 font-mono">{currentUser.email}</p>
              </div>

              <div className="space-y-2 pt-2">
                <Link
                  href="/dashboard"
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Store className="w-4 h-4" />
                  <span>Go to My Store Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  onClick={() => {
                    clearStoredUser();
                    setCurrentUser(null);
                  }}
                  className="w-full py-2.5 text-xs text-slate-500 hover:text-rose-600 font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Switch / Sign out Google Account</span>
                </button>
              </div>
            </div>
          ) : (
            /* Google Sign In Flow */
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                  <Store className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Business Owner Login
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                  Sign in with your Google account to create your custom website, pick a template, and manage your WhatsApp store.
                </p>
              </div>

              {/* 1-Click Demo Accounts */}
              <div className="space-y-2.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Quick Sign-In (Demo Kerala Merchants)
                </div>

                {PRESET_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    disabled={isSubmitting}
                    onClick={() => handleSelectAccount(acc)}
                    className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={acc.avatar}
                        alt={acc.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                          {acc.name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">{acc.email}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>

              {/* Custom Google Email Form */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-[11px] text-slate-400 font-medium">
                  Or enter your own Google account
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {!showCustomInput ? (
                <button
                  onClick={() => setShowCustomInput(true)}
                  className="w-full py-3 px-4 rounded-xl border border-dashed border-slate-300 text-xs font-bold text-slate-700 hover:border-emerald-500 hover:text-emerald-700 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Sign in with my Gmail / Google ID</span>
                </button>
              ) : (
                <form onSubmit={handleCustomSubmit} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Your Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Priya Varma"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Google Email Address</label>
                    <input
                      type="email"
                      placeholder="yourname@gmail.com"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? 'Authenticating...' : 'Continue & Setup Store'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Perks list */}
          <div className="pt-4 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>Free 2-minute store setup with custom link</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>Direct WhatsApp orders with instant UPI QR payments</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>Zero customer login required (Higher checkout rate)</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-slate-400">
        © 2026 KadaLink Kerala • WhatsApp Store Builder
      </footer>
    </div>
  );
}
