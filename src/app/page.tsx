'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import GoogleSignInModal from '@/components/GoogleSignInModal';
import { TEMPLATES } from '@/lib/templates';
import {
  Sparkles,
  ArrowRight,
  MessageCircle,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  ExternalLink,
  Store,
  Layers,
  ShoppingBag,
  Truck,
  Heart
} from 'lucide-react';

export default function HomePage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-slate-200 bg-white">
        {/* Subtle background decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-50/80 to-transparent pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold animate-fadeIn">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Built for Kerala Instagram Sellers, Home Bakers & Pickles</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Turn Your WhatsApp & Instagram Into An{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500">
              Instant Ordering Store
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed">
            Stop replying to 50 <em>"Price please DM"</em> messages a day. Give your customers a clean, 
            lightning-fast link with <strong>custom templates</strong>, <strong>UPI QR payment</strong>, and <strong>1-click WhatsApp checkout</strong>. Zero coding required.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 group"
            >
              <Store className="w-4 h-4" />
              <span>Create Your Store in 3 Minutes</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-2xl font-bold text-sm transition-all text-center shadow-xs"
            >
              Existing Seller Login
            </Link>

            <a
              href="#demo-stores"
              className="w-full sm:w-auto px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-semibold text-sm transition-all text-center"
            >
              Live Demos ↓
            </a>
          </div>

          {/* Trust points */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Zero customer login needed
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> UPI (GPay/PhonePe) QR ready
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Custom shareable link for bio
            </span>
          </div>
        </div>
      </section>

      {/* LIVE DEMO STORES SECTION */}
      <section id="demo-stores" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Try It Yourself
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Explore 2 Live Kerala Demo Stores
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Click into these live stores to see how customers browse, add to cart, and checkout with UPI QR on WhatsApp!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Demo 1: Malabar Taste Pickles */}
          <div className="bg-white rounded-3xl border border-amber-200 p-6 shadow-sm hover:shadow-lg transition-all space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                  Theme: Malabar Heritage
                </span>
                <span className="text-xs text-slate-400 font-mono">/store/malabar-taste</span>
              </div>

              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=120&auto=format&fit=crop&q=80"
                  alt="Malabar Taste"
                  className="w-14 h-14 rounded-2xl object-cover border border-amber-200 shadow-sm"
                />
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">Malabar Taste Homemade</h3>
                  <p className="text-xs text-slate-500">Pickles, Coconut Oil Chips & Wild Honey</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Featuring authentic Kozhikode Grandma cut mango pickle, king fish pickle, fresh Nendran banana chips, and raw Wayanad forest honey.
              </p>

              {/* Sample Product Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium">
                  🥭 Cut Mango (₹180)
                </span>
                <span className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium">
                  🐟 King Fish Pickle (₹340)
                </span>
                <span className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium">
                  🍌 Banana Chips (₹190)
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
              <Link
                href="/store/malabar-taste"
                className="flex-1 py-3 px-4 bg-[#c27803] hover:bg-[#a36300] text-white rounded-xl text-xs font-bold text-center shadow-sm transition-all flex items-center justify-center gap-1.5"
              >
                <span>Open Live Storefront</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
              >
                Manage Store
              </button>
            </div>
          </div>

          {/* Demo 2: Kochi Cake Studio */}
          <div className="bg-white rounded-3xl border border-pink-200 p-6 shadow-sm hover:shadow-lg transition-all space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-pink-100 text-pink-900 border border-pink-200">
                  Theme: Sweet Tooth Studio
                </span>
                <span className="text-xs text-slate-400 font-mono">/store/kochi-cakes</span>
              </div>

              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=120&auto=format&fit=crop&q=80"
                  alt="Kochi Cake Studio"
                  className="w-14 h-14 rounded-2xl object-cover border border-pink-200 shadow-sm"
                />
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">Kochi Cake Studio</h3>
                  <p className="text-xs text-slate-500">Handcrafted Artisan Cakes & Brownies</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Featuring Belgian chocolate fudge cake, signature Biscoff cheesecake jars, tender coconut (elaneer) cake, and fudgy walnut brownies.
              </p>

              {/* Sample Product Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium">
                  🎂 Chocolate Fudge (₹850)
                </span>
                <span className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium">
                  🍮 Biscoff Jar (₹280)
                </span>
                <span className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium">
                  🥥 Elaneer Cake (₹790)
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
              <Link
                href="/store/kochi-cakes"
                className="flex-1 py-3 px-4 bg-[#ec4899] hover:bg-[#db2777] text-white rounded-xl text-xs font-bold text-center shadow-sm transition-all flex items-center justify-center gap-1.5"
              >
                <span>Open Live Storefront</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
              >
                Manage Store
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* TEMPLATES PREVIEW */}
      <section id="templates" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-8 border-t border-slate-200">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            One-Click Theme Selection
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            4 Tailored Templates for Kerala Sellers
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Switch between warm food heritage, luxury boutique fashion, modern baker, or minimalist with a single tap in your dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.values(TEMPLATES).map((tmpl) => (
            <div
              key={tmpl.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${tmpl.badgeClass}`}>
                  {tmpl.badge}
                </span>
                <h3 className="font-bold text-slate-800 text-base mt-2">{tmpl.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{tmpl.tagline}</p>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{tmpl.description}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className={`py-1.5 px-2.5 rounded text-[11px] font-bold text-center ${tmpl.primaryButtonClass}`}>
                  Button Preview
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-10 border-t border-slate-200">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Dead Simple Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            How Kerala Merchants Launch in 2 Minutes
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 font-extrabold text-lg rounded-2xl flex items-center justify-center mx-auto">
              1
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Sign in with Google</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              No developer needed. Sign in with Google, pick your store name and choose your favorite template.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 font-extrabold text-lg rounded-2xl flex items-center justify-center mx-auto">
              2
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Add Items & Your UPI ID</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Snap photos of your pickles, sarees, or cakes. Put your GPay / PhonePe UPI ID and WhatsApp number.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 font-extrabold text-lg rounded-2xl flex items-center justify-center mx-auto">
              3
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Share Bio Link & Receive Orders</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Put your custom link in your Instagram bio. Customers add to cart, scan UPI, and send pre-filled orders on WhatsApp!
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-16 px-4 bg-emerald-800 text-white text-center space-y-6">
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          Ready to launch your WhatsApp store today?
        </h2>
        <p className="text-xs sm:text-sm text-emerald-100 max-w-lg mx-auto">
          Start for free, test with your actual products, and experience frictionless WhatsApp commerce.
        </p>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="px-8 py-3.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl font-bold text-sm shadow-xl transition-all"
        >
          Sign in with Google to Start
        </button>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto py-8 bg-slate-900 text-slate-400 text-center text-xs space-y-2 border-t border-slate-800">
        <div>
          © 2026 KadaLink Kerala • Mini-Shopify for WhatsApp Commerce
        </div>
        <div className="text-[11px] text-slate-500">
          Built for small businesses, home bakers & boutique owners across Kerala.
        </div>
      </footer>

      <GoogleSignInModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
