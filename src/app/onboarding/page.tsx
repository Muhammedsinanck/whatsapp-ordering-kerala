'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredUser, clearStoredUser } from '@/lib/auth';
import { User, Store, TemplateId, Product } from '@/types';
import { TEMPLATES } from '@/lib/templates';
import {
  Store as StoreIcon,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Phone,
  CreditCard,
  Palette,
  Layers,
  ShoppingBag,
  Truck,
  AlertCircle,
  Check,
  ExternalLink,
  LogOut
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
    tagline: '100% pure wild honey, spices & organic foods from Western Ghats',
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

  // Wizard Step: 1 = Basic Info, 2 = WhatsApp & UPI, 3 = Template & Category
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form Fields
  const [storeName, setStoreName] = useState('');
  const [slug, setSlug] = useState('');
  const [tagline, setTagline] = useState('');
  const [slugStatus, setSlugStatus] = useState<'checking' | 'available' | 'taken' | 'idle'>('idle');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [upiId, setUpiId] = useState('');
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

    // Sensible defaults from user profile
    const firstName = currentUser.name.split(' ')[0] || 'My';
    const initialStoreName = `${firstName}'s Store`;
    setStoreName(initialStoreName);
    const initialSlug = firstName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-store';
    setSlug(initialSlug);
    setWhatsappNumber(currentUser.phone || '918281096614');
    setUpiId(`${firstName.toLowerCase().replace(/[^a-z0-9]/g, '')}@okaxis`);
    setLoading(false);

    // Initial slug check
    checkSlugAvailability(initialSlug);
  }, []);

  // Slug auto-generation when storeName changes (if user hasn't manually edited slug)
  const handleStoreNameChange = (val: string) => {
    setStoreName(val);
    const generated = val
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 30);
    setSlug(generated);
    checkSlugAvailability(generated);
  };

  const handleSlugChange = (val: string) => {
    const clean = val
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');
    setSlug(clean);
    checkSlugAvailability(clean);
  };

  const checkSlugAvailability = async (slugToCheck: string) => {
    if (!slugToCheck || slugToCheck.length < 3) {
      setSlugStatus('idle');
      return;
    }
    setSlugStatus('checking');
    try {
      const res = await fetch(`/api/stores/check-slug?slug=${encodeURIComponent(slugToCheck)}`);
      const data = await res.json();
      setSlugStatus(data.available ? 'available' : 'taken');
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
      name: storeName,
      tagline: tagline || (preset ? preset.tagline : 'Homemade & handcrafted with love from Kerala'),
      description: 'Order directly via WhatsApp with instant UPI QR payment. Handcrafted fresh in Kerala.',
      whatsappNumber: whatsappNumber.replace(/[^0-9]/g, '') || '918281096614',
      upiId: upiId || `${slug}@okaxis`,
      upiName: storeName,
      ownerEmail: user.email,
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

      // Store created successfully! Redirect to dashboard with celebration parameter
      router.push('/dashboard?created=true');
    } catch (err) {
      console.error('Store creation error:', err);
      setErrorMessage('Network error while creating your store.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600">Loading store builder wizard...</p>
        </div>
      </div>
    );
  }

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
              KadaLink <span className="text-emerald-600">Store Setup</span>
            </div>
            <div className="text-[10px] text-slate-400 -mt-0.5">3-Minute Store Onboarding</div>
          </div>
        </Link>

        {user && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full border border-slate-200" />
              <span className="text-xs font-semibold text-slate-700 hidden sm:inline">{user.name}</span>
            </div>
            <button
              onClick={() => {
                clearStoredUser();
                router.push('/login');
              }}
              className="text-xs text-slate-400 hover:text-rose-600 font-semibold"
            >
              Sign out
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-3xl w-full mx-auto p-4 sm:p-6 my-4">
        {/* Step Progress Bar */}
        <div className="mb-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`flex items-center gap-2 ${currentStep === 1 ? 'text-emerald-600 font-black' : currentStep > 1 ? 'text-slate-900' : 'text-slate-400'}`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${currentStep >= 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200'}`}>
                1
              </span>
              <span>1. Store Basics</span>
            </button>

            <div className="w-8 sm:w-16 h-0.5 bg-slate-200" />

            <button
              type="button"
              onClick={() => {
                if (storeName && slug) setCurrentStep(2);
              }}
              className={`flex items-center gap-2 ${currentStep === 2 ? 'text-emerald-600 font-black' : currentStep > 2 ? 'text-slate-900' : 'text-slate-400'}`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${currentStep >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200'}`}>
                2
              </span>
              <span>2. WhatsApp & UPI</span>
            </button>

            <div className="w-8 sm:w-16 h-0.5 bg-slate-200" />

            <button
              type="button"
              onClick={() => {
                if (storeName && slug && whatsappNumber) setCurrentStep(3);
              }}
              className={`flex items-center gap-2 ${currentStep === 3 ? 'text-emerald-600 font-black' : 'text-slate-400'}`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${currentStep === 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200'}`}>
                3
              </span>
              <span>3. Template & Launch</span>
            </button>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLaunchStore} className="space-y-6">
          {/* STEP 1: STORE BASICS */}
          {currentStep === 1 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Step 1 of 3
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 pt-1">
                  Name Your WhatsApp Store & Bio Link
                </h2>
                <p className="text-xs text-slate-500">
                  Choose your shop brand name and custom website address.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Store / Brand Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kozhikode Halwa Corner, Malabar Taste, Anjali Bakes"
                    value={storeName}
                    onChange={(e) => handleStoreNameChange(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Custom Store Bio Link Handle (URL) <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center rounded-xl border border-slate-300 focus-within:ring-2 focus-within:ring-emerald-500 overflow-hidden bg-slate-50">
                    <span className="px-3 text-xs text-slate-400 font-mono select-none">
                      kadalink.in/store/
                    </span>
                    <input
                      type="text"
                      placeholder="my-store-name"
                      value={slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      className="w-full py-2.5 pr-3 bg-white text-xs font-bold font-mono text-emerald-700 focus:outline-none"
                      required
                    />
                  </div>

                  {/* Slug availability indicator */}
                  <div className="mt-1.5 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">This will be your shareable Instagram Bio link.</span>
                    {slugStatus === 'checking' && (
                      <span className="text-slate-400 flex items-center gap-1">Checking link...</span>
                    )}
                    {slugStatus === 'available' && (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Link available!
                      </span>
                    )}
                    {slugStatus === 'taken' && (
                      <span className="text-rose-600 font-bold flex items-center gap-1">
                        ✕ Handle already taken! Try another
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Short Tagline / Catchphrase
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 100% Homemade Pickles & Pure Coconut Oil Chips"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full px-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-700"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  disabled={!storeName.trim() || !slug.trim() || slugStatus === 'taken'}
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>Continue to WhatsApp & UPI</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: WHATSAPP & UPI DETAILS */}
          {currentStep === 2 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Step 2 of 3
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 pt-1">
                  Connect WhatsApp Orders & Instant UPI Payment
                </h2>
                <p className="text-xs text-slate-500">
                  Where should customers send order messages, and where should payments go?
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    WhatsApp Order Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
                    <input
                      type="tel"
                      placeholder="918281096614 (include 91 for India)"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900 font-bold"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    When a customer taps "Place Order on WhatsApp", the formatted order invoice will open directly in this WhatsApp chat.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Merchant UPI ID (GPay / PhonePe / Paytm / BHIM) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="e.g. malabartaste@okaxis or 9846012345@paytm"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900 font-bold"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Our system dynamically embeds this UPI ID into customer QR codes during checkout. Money goes 100% directly to your bank account with zero middleman fee.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">
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
                  type="button"
                  disabled={!whatsappNumber.trim() || !upiId.trim()}
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>Continue to Template & Launch</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: TEMPLATE & CATEGORY */}
          {currentStep === 3 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Step 3 of 3
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 pt-1">
                  Choose Business Category & Aesthetic Theme
                </h2>
                <p className="text-xs text-slate-500">
                  We'll automatically set up your starter catalog and aesthetic styling (you can change this anytime).
                </p>
              </div>

              {/* Business Categories */}
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
                        className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
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

              {/* Template selection */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-slate-700">Visual Theme Template</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(Object.keys(TEMPLATES) as TemplateId[]).map((tid) => {
                    const t = TEMPLATES[tid];
                    const isSelected = selectedTemplate === tid;
                    return (
                      <button
                        key={tid}
                        type="button"
                        onClick={() => setSelectedTemplate(tid)}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className={`w-full h-8 rounded-lg mb-2 ${t.previewBg} border border-black/5 flex items-center justify-center font-bold text-xs`}>
                          Aa
                        </div>
                        <div className="text-xs font-bold text-slate-800">{t.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5 truncate">{t.badge}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Launch Summary Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="font-bold text-slate-800 flex items-center justify-between">
                  <span>Store Preview Summary:</span>
                  <span className="text-emerald-700 font-mono text-[11px]">kadalink.in/store/{slug}</span>
                </div>
                <div className="text-slate-600 space-y-1 text-[11px]">
                  <div>• <strong>Business:</strong> {storeName} ({TEMPLATES[selectedTemplate].name})</div>
                  <div>• <strong>WhatsApp:</strong> +{whatsappNumber}</div>
                  <div>• <strong>UPI Receiver:</strong> {upiId}</div>
                  <div>• <strong>Includes:</strong> 2 starter products preloaded & ready to customize</div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
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

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-slate-400">
        © 2026 KadaLink Kerala • WhatsApp Commerce Platform
      </footer>
    </div>
  );
}
