'use client';

import React, { useState } from 'react';
import { GoogleUser } from '@/types';
import { setStoredUser } from '@/lib/auth';
import { X, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface GoogleSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: GoogleUser) => void;
}

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

export default function GoogleSignInModal({ isOpen, onClose, onSuccess }: GoogleSignInModalProps) {
  const router = useRouter();
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);

  if (!isOpen) return null;

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
        if (onSuccess) onSuccess(data.user);
        onClose();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
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
            <h3 className="font-semibold text-slate-800 text-lg">Sign in with Google</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Sign in with your Google account to set up and manage your WhatsApp store, customize templates, and update products anytime.
          </p>

          {/* Real Google OAuth Redirect Button */}
          <button
            type="button"
            onClick={() => (window.location.href = '/api/auth/google')}
            className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl font-bold text-xs text-slate-800 shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer"
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
            <span>Continue with Real Google Account</span>
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[10px] text-slate-400 font-semibold uppercase">
              Or 1-click test account
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Quick 1-Click Profile Selection */}
          <div className="space-y-2.5">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              1-Click Demo Accounts (Kerala Merchants)
            </div>
            {PRESET_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                disabled={isSubmitting}
                onClick={() => handleSelectAccount(acc)}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={acc.avatar}
                    alt={acc.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {acc.name}
                    </div>
                    <div className="text-xs text-slate-500">{acc.email}</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-xs text-slate-400 font-medium">Or enter any Google account</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {!showCustomForm ? (
            <button
              onClick={() => setShowCustomForm(true)}
              className="w-full py-2.5 px-4 rounded-xl border border-dashed border-slate-300 text-sm font-medium text-slate-600 hover:border-slate-400 hover:text-slate-800 transition-colors"
            >
              + Use a custom Google email
            </button>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Your Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Priya Varma"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Google Email Address</label>
                <input
                  type="email"
                  placeholder="name@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Authenticating...' : 'Continue to Dashboard'}
              </button>
            </form>
          )}

          <div className="pt-2 text-center text-xs text-slate-400">
            🔒 Secure Google authentication. End customers can shop with zero login.
          </div>
        </div>
      </div>
    </div>
  );
}
