'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredUser } from '@/lib/auth';
import { User, Store, TemplateId, Product } from '@/types';
import { TEMPLATES } from '@/lib/templates';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Phone,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  Store as StoreIcon,
  Check,
  Truck
} from 'lucide-react';
import Link from 'next/link';

interface CategoryPreset {
  id: string;
  name: string;
  icon: string;
  defaultTemplate: TemplateId;
  tagline: string;
  products: Product[];
}

const CATEGORY_PRESETS: CategoryPreset[] = [
  {
    id: 'pickles',
    name: 'Pickles, Chips & Spices',
    icon: '🥭',
    defaultTemplate: 'kerala-heritage',
    tagline: 'Authentic homemade Kerala pickles & crispy snacks',
    products: [
      {
        id: 'prod-preset-1',
        name: 'Grandma Cut Mango Pickle (Kanni Manga)',
        description: 'Traditional Kozhikode tender green mango in cold-pressed gingelly oil & spices.',
        price: 180,
        unit: '500 gm',
        imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
        inStock: true,
        category: 'Pickles'
      },
      {
        id: 'prod-preset-2',
        name: 'Crispy Nendran Banana Chips in Coconut Oil',
        description: 'Freshly fried thin banana chips in 100% pure coconut oil with sea salt and turmeric.',
        price: 190,
        unit: '500 gm',
        imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
        inStock: true,
        category: 'Snacks'
      }
    ]
  },
  {
    id: 'bakery',
    name: 'Cakes & Bakery Studio',
    icon: '🎂',
    defaultTemplate: 'bakery-fresh',
    tagline: 'Artisan handcrafted cakes, brownies & dessert jars',
    products: [
      {
        id: 'prod-preset-3',
        name: 'Belgian Double Chocolate Fudge Cake',
        description: 'Rich 55% Belgian chocolate ganache layered with moist cocoa sponge.',
        price: 850,
        unit: '1 Kg',
        imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80',
        inStock: true,
        category: 'Cakes'
      },
      {
        id: 'prod-preset-4',
        name: 'Signature Lotus Biscoff Cheesecake Jars',
        description: 'Set of two jars filled with creamy baked NY cheesecake & crunchy Biscoff.',
        price: 280,
        unit: 'Pack of 2',
        imageUrl: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&auto=format&fit=crop&q=80',
        inStock: true,
        category: 'Desserts'
      }
    ]
  },
  {
    id: 'boutique',
    name: 'Sarees, Kurtis & Boutique',
    icon: '👗',
    defaultTemplate: 'boutique-elegance',
    tagline: 'Exclusive handlooms, ethnic wear & designer collections',
    products: [
      {
        id: 'prod-preset-5',
        name: 'Kerala Traditional Kasavu Cotton Saree',
        description: 'Pure handloom cotton saree with woven golden zari border & matching blouse piece.',
        price: 1250,
        unit: 'Free Size',
        imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
        inStock: true,
        category: 'Sarees'
      },
      {
        id: 'prod-preset-6',
        name: 'Semi-Silk Festive Anarkali Kurti',
        description: 'Intricate thread embroidery on premium semi-silk fabric with soft cotton lining.',
        price: 990,
        unit: 'M, L, XL',
        imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80',
        inStock: true,
        category: 'Ethnic Wear'
      }
    ]
  },
  {
    id: 'honey',
    name: 'Honey & Natural Organics',
    icon: '🍯',
    defaultTemplate: 'kerala-heritage',
    tagline: '100% pure wild honey & organic foods from Western Ghats',
    products: [
      {
        id: 'prod-preset-7',
        name: 'Raw Wayanad Wild Forest Honey',
        description: '100% raw unheated forest honey harvested sustainably from Wayanad.',
        price: 450,
        unit: '500 gm',
        imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80',
        inStock: true,
        category: 'Honey'
      }
    ]
  }
];

export default function OnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Simplified 2-step setup: 1 = Basic Info, 2 = Theme & Launch
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Form Fields
  const [storeName, setStoreName] = useState('');
  const [slug, setSlug] = useState('');
  const [tagline, setTagline] = useState('');
  const [slugStatus, setSlugStatus] = useState<'checking' | 'available' | 'taken' | 'idle'>('idle');
  const [slugError, setSlugError] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [flatFee, setFlatFee] = useState<number>(50);
  const [freeAboveThreshold, setFreeAboveThreshold] = useState<number>(500);
  const [selectedCategory, setSelectedCategory] = useState<string>('pickles');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('kerala-heritage');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Initial user check
  useEffect(() => {
    const currentUser = getStoredUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);

    const firstName = currentUser.name.split(' ')[0] || 'My';
    const initialStoreName = `${firstName}'s Store`;
    setStoreName(initialStoreName);
    const initialSlug = firstName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-store';
    setSlug(initialSlug);
    setWhatsappNumber(currentUser.phone || '918281096614');
    setLoading(false);

    checkSlugAvailability(initialSlug);
  }, []);

  const handleStoreNameChange = (val: string) => {
    setStoreName(val);
    const generated = val
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 30);
    setSlug(generated);
    checkSlugAvailability(generated, val);
  };

  const handleSlugChange = (val: string) => {
    const clean = val
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');
    setSlug(clean);
    checkSlugAvailability(clean);
  };

  const checkSlugAvailability = async (slugToCheck: string, nameToCheck?: string) => {
    if (!slugToCheck || slugToCheck.length < 3) {
      setSlugStatus('idle');
      setSlugError('Handle must be at least 3 characters');
      return;
    }
    setSlugStatus('checking');
    try {
      const nameParam = nameToCheck !== undefined ? nameToCheck : storeName;
      const res = await fetch(
        `/api/stores/check-slug?slug=${encodeURIComponent(slugToCheck)}&name=${encodeURIComponent(nameParam)}`
      );
      const data = await res.json();
      if (data.available) {
        setSlugStatus('available');
        setSlugError('');
      } else {
        setSlugStatus('taken');
        setSlugError(data.reason || data.nameReason || data.slugReason || 'This handle or name is already taken');
      }
    } catch {
      setSlugStatus('idle');
    }
  };

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    const preset = CATEGORY_PRESETS.find((c) => c.id === catId);
    if (preset) {
      setSelectedTemplate(preset.defaultTemplate);
      if (!tagline) {
        setTagline(preset.tagline);
      }
    }
  };

  const handleLaunchStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setErrorMessage('');
    setIsSubmitting(true);

    if (slugStatus === 'taken') {
      setErrorMessage('Please choose a different store URL handle; this one is already taken.');
      setCurrentStep(1);
      setIsSubmitting(false);
      return;
    }

    const preset = CATEGORY_PRESETS.find((c) => c.id === selectedCategory);
    const starterProducts = preset ? preset.products : [];

    const newStore: Store = {
      id: `store-${slug}-${Date.now().toString().slice(-4)}`,
      slug: slug,
      name: storeName.trim(),
      tagline: tagline.trim() || (preset ? preset.tagline : 'Homemade & handcrafted with love from Kerala'),
      description: 'Order directly via WhatsApp. Fast shipping across Kerala.',
      whatsappNumber: whatsappNumber.replace(/[^0-9]/g, '') || '918281096614',
      ownerEmail: user.email.toLowerCase().trim(),
      ownerName: user.name,
      ownerAvatar: user.avatar,
      templateId: selectedTemplate,
      logoUrl: starterProducts[0]?.imageUrl || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=200&auto=format&fit=crop&q=80',
      bannerUrl: starterProducts[0]?.imageUrl || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1200&auto=format&fit=crop&q=80',
      deliverySettings: {
        flatFee: Number(flatFee),
        freeAboveThreshold: Number(freeAboveThreshold),
        deliveryNotes: 'Speed Post / Courier dispatch across Kerala'
      },
      products: starterProducts.map((p, idx) => ({
        ...p,
        id: `prod-${Date.now()}-${idx}`
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const res = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStore)
      });

      if (!res.ok) {
        const errData = await res.json();
        setErrorMessage(errData.error || 'Failed to create store. Slug may already be registered.');
        setIsSubmitting(false);
        return;
      }

      // Store created successfully!
      router.push('/dashboard?created=true');
    } catch (err) {
      console.error('Store creation error:', err);
      setErrorMessage('Network error creating your store. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Setting up your store creator...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 py-3.5 px-4 sm:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white font-bold text-xs shadow-xs">
            KL
          </div>
          <span className="font-extrabold text-slate-900 text-sm">KadaLink Kerala</span>
        </Link>

        {user && (
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full border border-slate-200" />
            <span className="font-semibold hidden sm:inline">{user.name}</span>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="max-w-2xl w-full mx-auto px-4 py-8 sm:py-12">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-3 text-xs font-bold">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
                currentStep === 1
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              <span>1. Store Handle & WhatsApp</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
                currentStep === 2
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              <span>2. Category & Theme</span>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLaunchStore} className="space-y-6">
          {/* STEP 1: STORE NAME, HANDLE & WHATSAPP */}
          {currentStep === 1 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Step 1 of 2
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 pt-1">
                  Name Your Store & Choose Your Permanent Link
                </h2>
                <p className="text-xs text-slate-500">
                  Your store link cannot be taken by anyone else once reserved.
                </p>
              </div>

              <div className="space-y-4">
                {/* Store Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Store / Business Name *
                  </label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => handleStoreNameChange(e.target.value)}
                    placeholder="e.g. Malabar Sweets & Pickles"
                    className="w-full px-4 py-3 text-sm font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900"
                    required
                  />
                </div>

                {/* Slug Handle */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Your Permanent Store Handle *</span>
                    <span className="text-[11px] font-normal text-slate-400">
                      Cannot be taken later
                    </span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-xs font-mono text-slate-400 font-medium select-none">
                      kadalink.in/store/
                    </span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      placeholder="my-shop"
                      className="w-full pl-36 pr-10 py-3 text-sm font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900 font-bold"
                      required
                    />
                    <div className="absolute right-3">
                      {slugStatus === 'checking' && (
                        <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                      )}
                      {slugStatus === 'available' && (
                        <Check className="w-4 h-4 text-emerald-600" />
                      )}
                      {slugStatus === 'taken' && (
                        <AlertCircle className="w-4 h-4 text-rose-500" />
                      )}
                    </div>
                  </div>

                  {/* Slug feedback badge */}
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
                    {slugStatus === 'available' && (
                      <span className="text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Handle is available and will be permanently reserved for you!
                      </span>
                    )}
                    {slugStatus === 'taken' && (
                      <span className="text-rose-600 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {slugError || 'This handle is already taken. Please pick another name.'}
                      </span>
                    )}
                  </div>
                </div>

                {/* WhatsApp Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    WhatsApp Number for Receiving Orders *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="9876543210"
                      className="w-full pl-12 pr-4 py-3 text-sm font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900 font-bold"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Customer orders will be sent directly to this WhatsApp number in 1-click.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end">
                <button
                  type="button"
                  disabled={!storeName.trim() || !slug.trim() || slugStatus === 'taken' || !whatsappNumber.trim()}
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>Continue to Category & Theme</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: CATEGORY, THEME & LAUNCH */}
          {currentStep === 2 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Step 2 of 2
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 pt-1">
                  Select Category & Visual Theme
                </h2>
                <p className="text-xs text-slate-500">
                  We'll pre-load your store with starter products so you can immediately preview and customize it.
                </p>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">What do you sell?</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CATEGORY_PRESETS.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategorySelect(cat.id)}
                        className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <span className="text-2xl p-2 bg-white rounded-xl shadow-xs border border-slate-100">
                          {cat.icon}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-slate-900">{cat.name}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">{cat.tagline}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Theme Selection */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-slate-700">Visual Theme</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(Object.keys(TEMPLATES) as TemplateId[]).map((tid) => {
                    const t = TEMPLATES[tid];
                    const isSelected = selectedTemplate === tid;
                    return (
                      <button
                        key={tid}
                        type="button"
                        onClick={() => setSelectedTemplate(tid)}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className={`w-full h-8 rounded-lg mb-2 ${t.previewBg} border border-black/5 flex items-center justify-center font-bold text-xs`}>
                          Aa
                        </div>
                        <div className="text-xs font-bold text-slate-800">{t.name}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Fee Settings */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Standard Delivery Fee (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={flatFee}
                    onChange={(e) => setFlatFee(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Free Delivery Above (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={freeAboveThreshold}
                    onChange={(e) => setFreeAboveThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Summary Box */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5 text-slate-600">
                <div className="font-bold text-slate-900 flex justify-between">
                  <span>Store Summary:</span>
                  <span className="text-emerald-700 font-mono">kadalink.in/store/{slug}</span>
                </div>
                <div>• Name: <strong>{storeName}</strong></div>
                <div>• WhatsApp Orders to: <strong>+{whatsappNumber}</strong></div>
                <div>• Checkout: 1-Click Direct WhatsApp Ordering</div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isSubmitting ? 'Launching Store...' : '🚀 Launch My WhatsApp Store'}</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </main>

      <footer className="py-4 text-center text-[11px] text-slate-400">
        © 2026 KadaLink Kerala • WhatsApp Direct Commerce Platform
      </footer>
    </div>
  );
}
