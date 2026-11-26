'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getStoredUser, setStoredUser, clearStoredUser } from '@/lib/auth';
import { GoogleUser } from '@/types';
import {
  Store,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  MessageCircle,
  Lock,
  Mail,
  AlertCircle,
  LogOut,
  Info
} from 'lucide-react';
import Link from 'next/link';

const PRESET_ACCOUNTS = [
  {
    email: 'sinan@gmail.com',
    name: 'Sinan C.K.',
    password: 'password123',
    business: 'Malabar Taste Pickles'
  },
  {
    email: 'anjali@gmail.com',
    name: 'Anjali Nair',
    password: 'password123',
    business: 'Kochi Cake Studio'
  },
  {
    email: 'fathima.boutique@gmail.com',
    name: 'Fathima Raheem',
    password: 'password123',
    business: 'Fathima Designer Sarees'
  }
];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentUser, setCurrentUser] = useState<GoogleUser | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showOAuthHelp, setShowOAuthHelp] = useState(false);

  useEffect(() => {
    setCurrentUser(getStoredUser());

    if (searchParams?.get('oauth_missing') === 'true') {
      setShowOAuthHelp(true);
    }
    const err = searchParams?.get('error');
    if (err) {
      setErrorMessage(`Google Sign-In notice: ${err}`);
    }
  }, [searchParams]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Login failed. Please check credentials.');
        setIsSubmitting(false);
        return;
      }

      setStoredUser(data.user);
      setCurrentUser(data.user);

      // Check if user has stores, if not go to onboarding, else dashboard
      const storesRes = await fetch(`/api/stores?ownerEmail=${encodeURIComponent(data.user.email)}`);
      const stores = await storesRes.json();

      if (stores && stores.length > 0) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMessage('Network error during login.');
      setIsSubmitting(false);
    }
  };

  const handleGoogleOAuthRedirect = () => {
    window.location.href = '/api/auth/google';
  };

  const handleQuickLogin = (preset: typeof PRESET_ACCOUNTS[0]) => {
    setEmail(preset.email);
    setPassword(preset.password);
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
            <div className="font-extrabold text-slate-900 text-base">
              KadaLink <span className="text-emerald-600">Merchant Portal</span>
            </div>
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
                  Signed In
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

                <Link
                  href="/onboarding"
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <span>+ Create Another WhatsApp Store</span>
                </Link>

                <button
                  onClick={() => {
                    clearStoredUser();
                    setCurrentUser(null);
                  }}
                  className="w-full py-2.5 text-xs text-slate-500 hover:text-rose-600 font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out Account</span>
                </button>
              </div>
            </div>
          ) : (
            /* Login Form */
            <div className="space-y-5">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                  <Store className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Business Owner Login
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                  Sign in to manage your WhatsApp store, products, prices, templates, and QR payments.
                </p>
              </div>

              {/* Real Google OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleOAuthRedirect}
                className="w-full py-3 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-3 cursor-pointer"
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
                <span>Continue with Google</span>
              </button>

              {/* OAuth Setup Info banner if keys not yet added */}
              {showOAuthHelp && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5 text-amber-800">
                    <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Google OAuth Keys Required</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-700">
                    To enable 1-click Google OAuth on your live deployment, add <code>GOOGLE_CLIENT_ID</code> and <code>GOOGLE_CLIENT_SECRET</code> to your Vercel Environment Variables.
                  </p>
                  <p className="text-[10px] text-amber-600">
                    Meanwhile, you can sign in below with email/password or the 1-click demo accounts!
                  </p>
                </div>
              )}

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-[11px] text-slate-400 font-medium">
                  Or login with email
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* 1-Click Fast Fill for Demo Merchants */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Quick Autofill (Demo Accounts)
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {PRESET_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => handleQuickLogin(acc)}
                      className="text-[11px] bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 font-semibold px-2.5 py-1 rounded-lg text-slate-700 transition-colors shadow-2xs"
                    >
                      {acc.name.split(' ')[0]} ({acc.business.split(' ')[0]})
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handlePasswordLogin} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      placeholder="yourname@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{isSubmitting ? 'Signing in...' : 'Sign In to Dashboard'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Link to Signup */}
              <div className="pt-3 text-center text-xs text-slate-500 border-t border-slate-100 space-y-1">
                <div>Don't have an account yet?</div>
                <Link
                  href="/signup"
                  className="inline-block py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold transition-colors"
                >
                  Create an account in 30 seconds →
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-slate-400">
        © 2026 KadaLink Kerala • WhatsApp Store Builder
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
