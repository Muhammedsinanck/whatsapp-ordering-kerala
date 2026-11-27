'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredUser, clearStoredUser, isPlatformAdmin } from '@/lib/auth';
import { GoogleUser, Store, Product, TemplateId } from '@/types';
import { TEMPLATES } from '@/lib/templates';
import GoogleSignInModal from '@/components/GoogleSignInModal';
import ShareStoreModal from '@/components/ShareStoreModal';
import {
  Store as StoreIcon,
  Palette,
  Package,
  Settings,
  Share2,
  ExternalLink,
  Plus,
  Trash2,
  Edit,
  Check,
  Save,
  LogOut,
  Sparkles,
  Phone,
  Truck,
  CheckCircle2,
  Copy,
  Upload,
  AlertCircle,
  Shield,
  X
} from 'lucide-react';
import Link from 'next/link';

const PRODUCT_IMAGE_PRESETS = [
  {
    name: 'Mango Pickle',
    url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
    category: 'Pickles'
  },
  {
    name: 'Fish Pickle',
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
    category: 'Pickles'
  },
  {
    name: 'Banana Chips',
    url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
    category: 'Snacks'
  },
  {
    name: 'Wild Honey',
    url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80',
    category: 'Honey'
  },
  {
    name: 'Chocolate Cake',
    url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80',
    category: 'Cakes'
  },
  {
    name: 'Artisan Brownies',
    url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
    category: 'Brownies'
  },
  {
    name: 'Cheesecake Jar',
    url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&auto=format&fit=crop&q=80',
    category: 'Desserts'
  },
  {
    name: 'Kerala Saree',
    url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
    category: 'Clothing'
  }
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCreateStoreModalOpen, setIsCreateStoreModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'settings' | 'template'>('products');

  const [userStores, setUserStores] = useState<Store[]>([]);
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [saveError, setSaveError] = useState('');

  // New Store Form State
  const [newStoreForm, setNewStoreForm] = useState({
    name: '',
    slug: '',
    tagline: '',
    whatsappNumber: '918281096614',
    templateId: 'kerala-heritage' as TemplateId,
    flatFee: 50,
    freeAboveThreshold: 500
  });
  const [newStoreSlugStatus, setNewStoreSlugStatus] = useState<'checking' | 'available' | 'taken' | 'idle'>('idle');

  // Product modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: 150,
    unit: '500 gm',
    imageUrl: PRODUCT_IMAGE_PRESETS[0].url,
    category: 'General',
    inStock: true
  });

  // Settings Slug check
  const [settingsSlugStatus, setSettingsSlugStatus] = useState<'checking' | 'available' | 'taken' | 'idle'>('idle');

  // Fetch stores for logged in user
  const loadUserStores = async (email: string) => {
    try {
      const res = await fetch(`/api/stores?ownerEmail=${encodeURIComponent(email)}`);
      const stores: Store[] = await res.json();
      setUserStores(stores);
      if (stores.length > 0) {
        setCurrentStore((prev) => {
          if (prev) {
            const found = stores.find((s) => s.id === prev.id);
            if (found) return found;
          }
          return stores[0];
        });
      } else {
        setCurrentStore(null);
      }
    } catch (err) {
      console.error('Failed to load stores:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const currentUser = getStoredUser();
    setUser(currentUser);

    if (!currentUser) {
      setIsAuthModalOpen(true);
      setLoading(false);
      return;
    }

    loadUserStores(currentUser.email);
  }, []);

  // Save current store changes
  const handleSaveStore = async (updatedStore?: Store) => {
    const target = updatedStore || currentStore;
    if (!target) return;

    setSaving(true);
    setSaveError('');
    try {
      const res = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(target)
      });
      if (!res.ok) {
        const errData = await res.json();
        setSaveError(errData.error || 'Failed to save store');
        alert(errData.error || 'Failed to save store');
        return;
      }
      const saved = await res.json();
      setCurrentStore(saved);
      setUserStores((prev) => prev.map((s) => (s.id === saved.id ? saved : s)));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save store changes.');
    } finally {
      setSaving(false);
    }
  };

  // Check slug uniqueness
  const checkSettingsSlug = async (slugVal: string) => {
    if (!currentStore || !slugVal || slugVal.length < 3) return;
    setSettingsSlugStatus('checking');
    try {
      const res = await fetch(
        `/api/stores/check-slug?slug=${encodeURIComponent(slugVal)}&currentStoreId=${encodeURIComponent(currentStore.id)}`
      );
      const data = await res.json();
      setSettingsSlugStatus(data.available ? 'available' : 'taken');
    } catch {
      setSettingsSlugStatus('idle');
    }
  };

  // Create new store wizard submit
  const handleCreateNewStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    const cleanSlug = newStoreForm.slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const newStore: Store = {
      id: `store-${cleanSlug}-${Date.now().toString().slice(-4)}`,
      slug: cleanSlug,
      name: newStoreForm.name,
      tagline: newStoreForm.tagline || 'Homemade & handcrafted with love from Kerala',
      description: 'Order directly via WhatsApp. Fast shipping across Kerala.',
      whatsappNumber: newStoreForm.whatsappNumber.replace(/[^0-9]/g, '') || '918281096614',
      ownerEmail: user.email.toLowerCase().trim(),
      ownerName: user.name,
      ownerAvatar: user.avatar,
      templateId: newStoreForm.templateId,
      logoUrl: PRODUCT_IMAGE_PRESETS[0].url,
      deliverySettings: {
        flatFee: Number(newStoreForm.flatFee),
        freeAboveThreshold: Number(newStoreForm.freeAboveThreshold),
        deliveryNotes: 'Speed Post / Courier dispatch within 24-48 hours'
      },
      products: [
        {
          id: `prod-${Date.now()}-1`,
          name: `${newStoreForm.name} Special Item 1`,
          description: 'Our bestselling handcrafted specialty prepared fresh on order.',
          price: 250,
          unit: '500 gm',
          imageUrl: PRODUCT_IMAGE_PRESETS[0].url,
          inStock: true,
          category: 'Specialty'
        }
      ],
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
        const err = await res.json();
        alert(err.error || 'Failed to create store. Slug might be taken.');
        return;
      }
      const savedStore = await res.json();
      setUserStores((prev) => [savedStore, ...prev]);
      setCurrentStore(savedStore);
      setIsCreateStoreModalOpen(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to create store:', err);
      alert('Network error creating store.');
    } finally {
      setSaving(false);
    }
  };

  const handleTemplateChange = (templateId: TemplateId) => {
    if (!currentStore) return;
    const updated = { ...currentStore, templateId };
    setCurrentStore(updated);
    handleSaveStore(updated);
  };

  // Image file upload handler
  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setProductForm((prev) => ({ ...prev, imageUrl: data.url }));
    } catch (err) {
      console.error(err);
      alert('Could not upload image. Please choose an image preset or paste an image URL.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      price: 180,
      unit: '500 gm',
      imageUrl: PRODUCT_IMAGE_PRESETS[0].url,
      category: 'General',
      inStock: true
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      description: prod.description,
      price: prod.price,
      unit: prod.unit,
      imageUrl: prod.imageUrl,
      category: prod.category || 'General',
      inStock: prod.inStock
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStore) return;

    let updatedProducts = [...currentStore.products];

    if (editingProduct) {
      updatedProducts = updatedProducts.map((p) =>
        p.id === editingProduct.id
          ? { ...p, ...productForm, price: Number(productForm.price) }
          : p
      );
    } else {
      const newProduct: Product = {
        id: `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        ...productForm,
        price: Number(productForm.price)
      };
      updatedProducts.push(newProduct);
    }

    const updatedStore = { ...currentStore, products: updatedProducts };
    setCurrentStore(updatedStore);
    handleSaveStore(updatedStore);
    setIsProductModalOpen(false);
  };

  const handleDeleteProduct = (productId: string) => {
    if (!currentStore) return;
    if (!confirm('Are you sure you want to remove this product?')) return;

    const updatedStore = {
      ...currentStore,
      products: currentStore.products.filter((p) => p.id !== productId)
    };
    setCurrentStore(updatedStore);
    handleSaveStore(updatedStore);
  };

  const handleToggleStock = (productId: string) => {
    if (!currentStore) return;
    const updatedProducts = currentStore.products.map((p) =>
      p.id === productId ? { ...p, inStock: !p.inStock } : p
    );
    const updatedStore = { ...currentStore, products: updatedProducts };
    setCurrentStore(updatedStore);
    handleSaveStore(updatedStore);
  };

  const handleCopyLink = () => {
    if (!currentStore || typeof window === 'undefined') return;
    const url = `${window.location.origin}/store/${currentStore.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600">Loading your store dashboard...</p>
        </div>
      </div>
    );
  }

  // Not logged in view
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
            <StoreIcon className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Sign in to KadaLink</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Log in with your Google account to create your custom WhatsApp store or edit your existing products, prices, and settings.
          </p>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full py-3.5 px-4 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            Sign in with Google
          </button>
        </div>
        <GoogleSignInModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={(u) => {
            setUser(u);
            loadUserStores(u.email);
          }}
        />
      </div>
    );
  }

  // User logged in but has no stores yet -> Show "Create First Store" Onboarding
  if (!currentStore || userStores.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-slate-900 text-lg">
            <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-sm font-black">
              K
            </span>
            <span>KadaLink Kerala</span>
          </div>

          <div className="flex items-center gap-3">
            {isPlatformAdmin(user) && (
              <Link
                href="/admin"
                className="px-2.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </Link>
            )}
            <div className="flex items-center gap-2">
              <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full border border-slate-200" />
              <span className="text-xs font-semibold text-slate-700 hidden sm:inline">{user.name}</span>
            </div>
            <button
              onClick={() => {
                clearStoredUser();
                router.push('/');
              }}
              className="text-xs text-slate-500 hover:text-rose-600 font-semibold"
            >
              Sign out
            </button>
          </div>
        </header>

        <div className="max-w-2xl w-full mx-auto p-6 my-auto space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Welcome, {user.name.split(' ')[0]}!
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              You haven't launched a WhatsApp store yet. Create your first store in 60 seconds with your reserved custom handle and instant WhatsApp ordering!
            </p>
            <Link
              href="/onboarding"
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 inline-flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create My Store in 2 Steps</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const storeShareableUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/store/${currentStore.slug}`
      : `/store/${currentStore.slug}`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-sm">
              K
            </div>
            <span className="font-extrabold text-slate-900 text-sm hidden sm:inline">KadaLink</span>
          </Link>
          <span className="text-slate-300">/</span>

          {/* Store Switcher Dropdown */}
          <div className="relative group">
            <select
              value={currentStore.id}
              onChange={(e) => {
                const selected = userStores.find((s) => s.id === e.target.value);
                if (selected) setCurrentStore(selected);
              }}
              className="text-xs font-extrabold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 py-1.5 px-3 rounded-xl focus:outline-none cursor-pointer"
            >
              {userStores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.slug})
                </option>
              ))}
            </select>
          </div>

          <Link
            href="/onboarding"
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ New Store</span>
          </Link>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2.5">
          {saveSuccess && (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full animate-fadeIn">
              <Check className="w-3.5 h-3.5" /> Saved Live!
            </span>
          )}

          {isPlatformAdmin(user) && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-bold transition-all"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Console</span>
            </Link>
          )}

          <a
            href={`/store/${currentStore.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
          >
            <span>Live Store</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="pl-2 border-l border-slate-200 flex items-center gap-2">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-7 h-7 rounded-full object-cover border border-slate-200"
            />
            <button
              onClick={() => {
                clearStoredUser();
                router.push('/');
              }}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 space-y-6">
        {/* CUSTOM SHAREABLE LINK HERO CARD */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 text-white rounded-3xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-emerald-400/20 text-emerald-200 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-400/30">
                Permanent Store Link
              </span>
              <span className="text-xs text-emerald-200">Reserved for You</span>
            </div>
            <h2 className="text-xl font-black text-white">{currentStore.name}</h2>

            <div className="flex items-center gap-2 pt-1 max-w-xl">
              <div className="flex-1 bg-black/30 border border-white/20 rounded-xl px-3 py-2 text-xs font-mono text-emerald-100 truncate">
                {storeShareableUrl}
              </div>
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2 bg-white text-slate-900 hover:bg-emerald-50 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex-1 md:flex-initial px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Store Link</span>
            </button>
            <a
              href={`/store/${currentStore.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-initial px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 transition-all flex items-center justify-center gap-1.5"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View Storefront</span>
            </a>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'products'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Products & Catalog ({currentStore.products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Store Link, WhatsApp & Delivery</span>
          </button>

          <button
            onClick={() => setActiveTab('template')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'template'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Theme Template ({TEMPLATES[currentStore.templateId]?.name || 'Template'})</span>
          </button>
        </div>

        {/* TAB 1: PRODUCTS CATALOG */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800">Products for {currentStore.name}</h3>
                <p className="text-xs text-slate-500">
                  Add items with real photo uploads, toggle in-stock status, or adjust prices.
                </p>
              </div>
              <button
                onClick={handleOpenAddProduct}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Upload New Product</span>
              </button>
            </div>

            {currentStore.products.length === 0 ? (
              <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
                <Package className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-700 text-sm">No products listed yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Add your first item to start receiving orders on WhatsApp.
                </p>
                <button
                  onClick={handleOpenAddProduct}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Upload First Product
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentStore.products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-black/60 text-white">
                          {product.unit}
                        </span>
                        <button
                          onClick={() => handleToggleStock(product.id)}
                          className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold shadow-sm transition-all ${
                            product.inStock ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                          }`}
                        >
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </button>
                      </div>

                      <div className="p-4 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {product.category || 'General'}
                          </span>
                          <span className="font-extrabold text-slate-900 text-sm">₹{product.price}</span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm leading-snug">{product.name}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                      <button
                        onClick={() => handleToggleStock(product.id)}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                      >
                        {product.inStock ? 'Mark Sold Out' : 'Mark In Stock'}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditProduct(product)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: STORE SETTINGS */}
        {activeTab === 'settings' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveStore();
            }}
            className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800">Store Link & Ordering Settings</h3>
                <p className="text-xs text-slate-500">
                  Update your store identity, WhatsApp checkout phone, and delivery rates.
                </p>
              </div>
              <button
                type="submit"
                disabled={saving || settingsSlugStatus === 'taken'}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Store Name *</label>
                <input
                  type="text"
                  required
                  value={currentStore.name}
                  onChange={(e) => setCurrentStore({ ...currentStore, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Store Link Handle *</span>
                  {settingsSlugStatus === 'available' && (
                    <span className="text-[11px] text-emerald-600 font-bold">✓ Handle Available</span>
                  )}
                  {settingsSlugStatus === 'taken' && (
                    <span className="text-[11px] text-rose-600 font-bold">✗ Handle Already Taken</span>
                  )}
                </label>
                <div className="flex items-center">
                  <span className="text-xs text-slate-400 bg-slate-100 px-3 py-2.5 border border-r-0 border-slate-300 rounded-l-xl font-mono">
                    /store/
                  </span>
                  <input
                    type="text"
                    required
                    value={currentStore.slug}
                    onChange={(e) => {
                      const newSlug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-');
                      setCurrentStore({ ...currentStore, slug: newSlug });
                      checkSettingsSlug(newSlug);
                    }}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-r-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tagline</label>
              <input
                type="text"
                value={currentStore.tagline}
                onChange={(e) => setCurrentStore({ ...currentStore, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Store Description</label>
              <textarea
                rows={3}
                value={currentStore.description}
                onChange={(e) => setCurrentStore({ ...currentStore, description: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
              />
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                WhatsApp Ordering Number *
              </label>
              <div className="relative max-w-sm">
                <Phone className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="918281096614"
                  value={currentStore.whatsappNumber}
                  onChange={(e) =>
                    setCurrentStore({
                      ...currentStore,
                      whatsappNumber: e.target.value.replace(/[^0-9]/g, '')
                    })
                  }
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono font-bold"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Include country code 91 without spaces or + sign.</p>
            </div>

            {/* Delivery Fees */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Flat Delivery Fee (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={currentStore.deliverySettings.flatFee}
                  onChange={(e) =>
                    setCurrentStore({
                      ...currentStore,
                      deliverySettings: {
                        ...currentStore.deliverySettings,
                        flatFee: Number(e.target.value)
                      }
                    })
                  }
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
                  value={currentStore.deliverySettings.freeAboveThreshold}
                  onChange={(e) =>
                    setCurrentStore({
                      ...currentStore,
                      deliverySettings: {
                        ...currentStore.deliverySettings,
                        freeAboveThreshold: Number(e.target.value)
                      }
                    })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Courier / Dispatch Notes</label>
                <input
                  type="text"
                  value={currentStore.deliverySettings.deliveryNotes || ''}
                  onChange={(e) =>
                    setCurrentStore({
                      ...currentStore,
                      deliverySettings: {
                        ...currentStore.deliverySettings,
                        deliveryNotes: e.target.value
                      }
                    })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving || settingsSlugStatus === 'taken'}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: THEME TEMPLATE */}
        {activeTab === 'template' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-800">Choose Website Theme</h3>
                <p className="text-xs text-slate-500">
                  Switch the visual aesthetic of your storefront. Changes save immediately.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full w-fit">
                Active: {TEMPLATES[currentStore.templateId]?.name || currentStore.templateId}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(Object.keys(TEMPLATES) as TemplateId[]).map((tId) => {
                const t = TEMPLATES[tId];
                const isSelected = currentStore.templateId === tId;

                return (
                  <div
                    key={tId}
                    onClick={() => handleTemplateChange(tId)}
                    className={`cursor-pointer rounded-2xl border-2 p-5 transition-all text-left relative bg-white flex flex-col justify-between space-y-4 ${
                      isSelected
                        ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-md'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${t.badgeClass}`}>
                          {t.badge}
                        </span>
                        {isSelected && (
                          <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-slate-900 text-base">{t.name}</h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{t.tagline}</p>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">{t.description}</p>
                    </div>

                    <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 p-3 space-y-2">
                      <div className={`p-2 rounded-lg text-xs font-bold ${t.headerBg}`}>
                        Header Preview
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg ${t.previewBg} flex-shrink-0`} />
                        <div className="flex-1 space-y-1">
                          <div className="h-2 w-16 bg-slate-200 rounded" />
                          <div className="h-2 w-10 bg-slate-200 rounded" />
                        </div>
                        <button className={`text-[10px] px-2.5 py-1 rounded font-bold ${t.primaryButtonClass}`}>
                          Order
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Product Add / Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">
                {editingProduct ? 'Edit Product' : 'Upload New Product'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cut Mango Pickle or Belgian Brownie Box"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Unit / Packaging *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 500 gm, 1 Kg, Piece"
                    value={productForm.unit}
                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  placeholder="e.g. Pickles, Cakes, Snacks"
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Ingredients, taste, or packaging details..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Real Image File Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Product Photo (Upload File or Pick Preset)
                </label>

                <div className="flex items-center gap-3">
                  <label className="flex-1 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-3 text-center cursor-pointer transition-colors bg-slate-50">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProductImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-700">
                      <Upload className="w-4 h-4 text-emerald-600" />
                      <span>{uploadingImage ? 'Uploading photo...' : 'Choose photo from device'}</span>
                    </div>
                  </label>

                  {productForm.imageUrl && (
                    <img
                      src={productForm.imageUrl}
                      alt="Preview"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                    />
                  )}
                </div>

                {/* Preset image buttons */}
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Or select a catalog preset:
                  </span>
                  <div className="grid grid-cols-4 gap-2 pt-1.5">
                    {PRODUCT_IMAGE_PRESETS.map((preset) => (
                      <button
                        type="button"
                        key={preset.name}
                        onClick={() => setProductForm({ ...productForm, imageUrl: preset.url })}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                          productForm.imageUrl === preset.url
                            ? 'border-emerald-600 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                        <span className="absolute inset-x-0 bottom-0 bg-black/70 text-[9px] text-white py-0.5 truncate px-1 text-center">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="instock-check"
                  checked={productForm.inStock}
                  onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <label htmlFor="instock-check" className="text-xs font-semibold text-slate-700">
                  Product is currently In Stock & Available for Order
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                >
                  {editingProduct ? 'Save Product' : 'Add to Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Store Modal */}
      {currentStore && (
        <ShareStoreModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          store={currentStore}
        />
      )}
    </div>
  );
}
