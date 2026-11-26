'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setStoredUser } from '@/lib/auth';
import {
  Store,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  MessageCircle,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

const QUICK_SIGNUP_PRESETS = [
  {
    name: 'Fathima Raheem',
    email: 'fathima.boutique@gmail.com',
    phone: '919876543210',
    businessType: 'Designer Sarees & Boutique'
  },
  {
    name: 'Anjali Nair',
    email: 'anjali@gmail.com',
    phone: '919846012345',
    businessType: 'Home Bakery & Cakes'
  },
  {
    name: 'Sinan C.K.',
    email: 'sinan@gmail.com',
    phone: '918281096614',
    businessType: 'Pickles & Spices'
  }
];

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to create account');
        setIsSubmitting(false);
        return;
      }

      // Successful registration!
      setStoredUser(data.user);
      // Direct immediately to store creation onboarding wizard!
      router.push('/onboarding');
    } catch (err) {
      console.error('Registration failed:', err);
      setErrorMessage('Network error during registration. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleQuickPreset = (preset: typeof QUICK_SIGNUP_PRESETS[0]) => {
    setName(preset.name);
    setEmail(preset.email);
    setPhone(preset.phone);
    setPassword('password123');
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

      {/* Main Form */}
      <main className="max-w-md w-full mx-auto p-4 my-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <Store className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Create Your Seller Account
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
              Sign up in 30 seconds to launch your custom WhatsApp store with UPI QR payments.
            </p>
          </div>

          {/* Google Sign-in Option */}
          <button
            type="button"
            onClick={() => (window.location.href = '/api/auth/google')}
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
            <span>Sign up with Google (1-Click)</span>
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[11px] text-slate-400 font-medium">
              Or create account with email
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Quick preset autofill for rapid testing */}
          <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              1-Click Fast Autofill (For Testing)
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {QUICK_SIGNUP_PRESETS.map((p) => (
                <button
                  key={p.email}
                  type="button"
                  onClick={() => handleQuickPreset(p)}
                  className="text-[11px] bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 font-semibold px-2.5 py-1 rounded-lg text-slate-700 transition-colors shadow-2xs"
                >
                  {p.name.split(' ')[0]} ({p.businessType.split(' ')[0]})
                </button>
              ))}
            </div>
          </div>

          {/* Error alert */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Your Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. Fathima Raheem"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  placeholder="fathima@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                WhatsApp Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  placeholder="919876543210 (with country code)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Customers will send orders directly to this WhatsApp number.</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Create Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>{isSubmitting ? 'Creating Your Account...' : 'Continue to Create Store'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Switch to login */}
          <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
            Already have an account?{' '}
            <Link href="/login" className="text-emerald-600 font-bold hover:underline">
              Sign in here
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-slate-400">
        © 2026 KadaLink Kerala • WhatsApp Commerce Platform
      </footer>
    </div>
  );
}
