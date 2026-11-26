'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getStoredUser, clearStoredUser } from '@/lib/auth';
import { GoogleUser } from '@/types';
import GoogleSignInModal from './GoogleSignInModal';
import { Store, LogOut, ArrowRight, Sparkles, MessageCircle } from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());

    const handleAuthChange = () => {
      setUser(getStoredUser());
    };

    window.addEventListener('auth-state-changed', handleAuthChange);
    return () => window.removeEventListener('auth-state-changed', handleAuthChange);
  }, []);

  const handleLogout = () => {
    clearStoredUser();
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <MessageCircle className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 text-lg tracking-tight">Kada<span className="text-emerald-600">Link</span></span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full">
                  Kerala
                </span>
              </div>
              <p className="text-[10px] text-slate-500 -mt-1 hidden sm:block">WhatsApp Mini-Shopify</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/#demo-stores" className="hover:text-emerald-600 transition-colors">
              Demo Stores
            </Link>
            <Link href="/#templates" className="hover:text-emerald-600 transition-colors">
              Templates
            </Link>
            <Link href="/#how-it-works" className="hover:text-emerald-600 transition-colors">
              How It Works
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/onboarding"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition-all"
                >
                  <span>+ New Store</span>
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </Link>
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                  />
                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-2 text-slate-700 hover:text-emerald-700 hover:bg-slate-50 text-xs font-bold rounded-xl transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-emerald-600/20 transition-all"
                >
                  <span>Create Your Store</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <GoogleSignInModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
