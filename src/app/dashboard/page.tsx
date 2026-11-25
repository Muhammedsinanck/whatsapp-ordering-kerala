'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredUser, clearStoredUser } from '@/lib/auth';
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
  QrCode,
  LogOut,
  Sparkles,
  Phone,
  CreditCard,
  Truck,
  ChevronDown,
  CheckCircle2,
  Copy,
  Layers,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

// Curated sample Kerala product photo presets
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
  const [activeTab, setActiveTab] = useState<'template' | 'products' | 'settings'>('template');
  
  const [userStores, setUserStores] = useState<Store[]>([]);
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // New Store Form State
  const [newStoreForm, setNewStoreForm] = useState({
    name: '',
    slug: '',
    tagline: '',
    whatsappNumber: '918281096614',
    upiId: '',
    templateId: 'kerala-heritage' as TemplateId,
    flatFee: 50,
    freeAboveThreshold: 500
  });

  // Product modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: 150,
    unit: '500 gm',
    imageUrl: PRODUCT_IMAGE_PRESETS[0].url,
    category: 'General',
    inStock: true
  });

  // Fetch stores for logged in user
  const loadUserStores = async (email: string) => {
    try {
      const res = await fetch(`/api/stores?ownerEmail=${encodeURIComponent(email)}`);
      const stores: Store[] = await res.json();
      setUserStores(stores);
      if (stores.length > 0) {
        // Keep current selected store if exists, otherwise first store
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
    try {
      const res = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(target)
      });
      if (!res.ok) {
        const errData = await res.json();
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
      description: 'Order directly via WhatsApp with instant UPI payment. Fast dispatch across Kerala.',
      whatsappNumber: newStoreForm.whatsappNumber,
      upiId: newStoreForm.upiId || `${cleanSlug}@okaxis`,
      upiName: newStoreForm.name,
      ownerEmail: user.email,
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
        },
        {
          id: `prod-${Date.now()}-2`,
          name: `${newStoreForm.name} Special Item 2`,
          description: 'Authentic Kerala traditional recipe made with premium natural ingredients.',
          price: 180,
          unit: 'Pack of 1',
          imageUrl: PRODUCT_IMAGE_PRESETS[2].url,
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
        id: `prod-${Date.now()}`,
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
            Log in with your Google account to create your custom WhatsApp store or edit your existing products, prices, and templates anytime.
          </p>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full py-3.5 px-4 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 flex items-center justify-center gap-2 shadow-sm transition-all"
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
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-slate-900 text-lg">
            <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-sm font-black">
              K
            </span>
            <span>KadaLink Kerala</span>
          </div>

          <div className="flex items-center gap-3">
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

        {/* Create Store Prompt */}
        <div className="max-w-2xl w-full mx-auto p-6 my-auto space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Welcome, {user.name.split(' ')[0]}!
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              You haven't created a WhatsApp store website yet. Let's create your first store in 60 seconds with your custom link, template, and UPI receiver!
            </p>
            <button
              onClick={() => {
                setNewStoreForm({
                  name: `${user.name.split(' ')[0]}'s Store`,
                  slug: `${user.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-store`,
                  tagline: 'Handmade & authentic products from Kerala',
                  whatsappNumber: '918281096614',
                  upiId: `${user.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@okaxis`,
                  templateId: 'kerala-heritage',
                  flatFee: 50,
                  freeAboveThreshold: 500
                });
                setIsCreateStoreModalOpen(true);
              }}
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 inline-flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              Create My Store Now
            </button>
          </div>
        </div>

        {/* Create Store Modal */}
        {renderCreateStoreModal()}
      </div>
    );
  }

  // Active Store URL
  const storeShareableUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/store/${currentStore.slug}`
    : `/store/${currentStore.slug}`;

  function renderCreateStoreModal() {
    if (!isCreateStoreModalOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-xl w-full overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2">
              <StoreIcon className="w-5 h-5 text-emerald-600" />
              <h3 className="font-extrabold text-slate-800 text-base">Create New WhatsApp Store</h3>
            </div>
            <button
              onClick={() => setIsCreateStoreModalOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleCreateNewStore} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Store / Business Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Malabar Pickles, Kochi Sweet Studio, Nila Silks"
                value={newStoreForm.name}
                onChange={(e) => {
                  const name = e.target.value;
                  const autoSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
                  setNewStoreForm({ ...newStoreForm, name, slug: autoSlug });
                }}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Custom Shareable Link Slug *
              </label>
              <div className="flex items-center">
                <span className="text-xs text-slate-400 bg-slate-100 px-3 py-2.5 border border-r-0 border-slate-300 rounded-l-xl font-mono">
                  /store/
                </span>
                <input
                  type="text"
                  required
                  placeholder="my-shop-name"
                  value={newStoreForm.slug}
                  onChange={(e) =>
                    setNewStoreForm({
                      ...newStoreForm,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
                    })
                  }
                  className="w-full px-3 py-2.5 text-xs border border-slate-300 rounded-r-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono font-semibold text-slate-800"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">This will be your shareable Instagram bio link.</p>
            </div>

            {/* Template Selector in Wizard */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Choose Website Theme Template *
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {(Object.keys(TEMPLATES) as TemplateId[]).map((tId) => {
                  const t = TEMPLATES[tId];
                  const isSelected = newStoreForm.templateId === tId;
                  return (
                    <button
                      type="button"
                      key={tId}
                      onClick={() => setNewStoreForm({ ...newStoreForm, templateId: tId })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${t.badgeClass}`}>
                        {t.badge.split('for ')[1] || t.name}
                      </span>
                      <h4 className="font-bold text-xs text-slate-800 mt-1">{t.name}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{t.tagline}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  WhatsApp Number (Orders Recipient) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="918281096614"
                  value={newStoreForm.whatsappNumber}
                  onChange={(e) => setNewStoreForm({ ...newStoreForm, whatsappNumber: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                />
                <span className="text-[9px] text-slate-400">Include country code 91</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Merchant UPI ID (GPay / PhonePe) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="shop@okaxis"
                  value={newStoreForm.upiId}
                  onChange={(e) => setNewStoreForm({ ...newStoreForm, upiId: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                />
                <span className="text-[9px] text-slate-400">For instant customer QR payments</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreateStoreModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                {saving ? 'Creating Store...' : 'Launch Store & Get Link'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

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

          <button
            onClick={() => {
              setNewStoreForm({
                name: '',
                slug: '',
                tagline: '',
                whatsappNumber: currentStore.whatsappNumber || '918281096614',
                upiId: '',
                templateId: 'kerala-heritage',
                flatFee: 50,
                freeAboveThreshold: 500
              });
              setIsCreateStoreModalOpen(true);
            }}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Store</span>
          </button>
        </div>

        {/* Right header actions */}
        <div className="flex items-center gap-2.5">
          {saveSuccess && (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full animate-fadeIn">
              <Check className="w-3.5 h-3.5" /> Saved Live!
            </span>
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
                Your Shareable Store Link
              </span>
              <span className="text-xs text-emerald-200">Live 24/7 for Customers</span>
            </div>
            <h2 className="text-xl font-black text-white">{currentStore.name}</h2>
            
            {/* The Link with Copy Button */}
            <div className="flex items-center gap-2 pt-1 max-w-xl">
              <div className="flex-1 bg-black/30 border border-white/20 rounded-xl px-3 py-2 text-xs font-mono text-emerald-100 truncate">
                {storeShareableUrl}
              </div>
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2 bg-white text-slate-900 hover:bg-emerald-50 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 flex-shrink-0"
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
              className="flex-1 md:flex-initial px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-4 h-4" />
              <span>Share & QR Code</span>
            </button>
            <a
              href={`/store/${currentStore.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-initial px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 transition-all flex items-center justify-center gap-1.5"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Preview Customer View</span>
            </a>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('template')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'template'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Select Template ({TEMPLATES[currentStore.templateId]?.name || 'Template'})</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'products'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Manage Products ({currentStore.products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Store Details, WhatsApp & UPI</span>
          </button>
        </div>

        {/* TAB 1: TEMPLATE SELECTION */}
        {activeTab === 'template' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-800">Select Website Template</h3>
                <p className="text-xs text-slate-500">
                  Switch the theme and styling of your storefront with a single tap. Saves immediately.
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
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
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
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS CATALOG */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800">Products for {currentStore.name}</h3>
                <p className="text-xs text-slate-500">
                  Update descriptions, change prices, toggle stock, or add new items.
                </p>
              </div>
              <button
                onClick={handleOpenAddProduct}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                Add New Product
              </button>
            </div>

            {currentStore.products.length === 0 ? (
              <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
                <Package className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-700 text-sm">No products listed yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Add items to your catalog so customers can order them on WhatsApp.
                </p>
                <button
                  onClick={handleOpenAddProduct}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                >
                  Add Product
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentStore.products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
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
                            product.inStock
                              ? 'bg-emerald-600 text-white'
                              : 'bg-rose-600 text-white'
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
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                      >
                        {product.inStock ? 'Mark Sold Out' : 'Mark In Stock'}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditProduct(product)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-200 transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-200 transition-colors"
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

        {/* TAB 3: STORE INFO & UPI SETTINGS */}
        {activeTab === 'settings' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveStore();
            }}
            className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800">Store Profile & Payment Settings</h3>
                <p className="text-xs text-slate-500">
                  Update your store identity, WhatsApp checkout number, and UPI payment receiver.
                </p>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Store Name *</label>
                <input
                  type="text"
                  required
                  value={currentStore.name}
                  onChange={(e) => setCurrentStore({ ...currentStore, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Custom Shareable Link Slug *
                </label>
                <div className="flex items-center">
                  <span className="text-xs text-slate-400 bg-slate-100 px-3 py-2 border border-r-0 border-slate-300 rounded-l-xl">
                    /store/
                  </span>
                  <input
                    type="text"
                    required
                    value={currentStore.slug}
                    onChange={(e) =>
                      setCurrentStore({
                        ...currentStore,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
                      })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-r-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Store Tagline</label>
              <input
                type="text"
                value={currentStore.tagline}
                onChange={(e) => setCurrentStore({ ...currentStore, tagline: e.target.value })}
                placeholder="e.g. Traditional homemade Kozhikode pickles made in pure coconut oil"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Store Description</label>
              <textarea
                rows={3}
                value={currentStore.description}
                onChange={(e) => setCurrentStore({ ...currentStore, description: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  WhatsApp Number (Orders Received Here) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. 918281096614"
                    value={currentStore.whatsappNumber}
                    onChange={(e) => setCurrentStore({ ...currentStore, whatsappNumber: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Include country code 91 without spaces or + sign.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Merchant UPI ID (For QR Code Payments) *
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-blue-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. yourshop@okaxis or 9847000000@paytm"
                    value={currentStore.upiId}
                    onChange={(e) => setCurrentStore({ ...currentStore, upiId: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Generates live UPI QR codes for Google Pay, PhonePe, and Paytm.
                </p>
              </div>
            </div>

            {/* Delivery Fees */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Flat Delivery Fee (₹)</label>
                <input
                  type="number"
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Free Delivery on Orders Above (₹)
                </label>
                <input
                  type="number"
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Courier / Dispatch Notes</label>
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
                  placeholder="e.g. Speed Post dispatch in 24 hours"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Saving...' : 'Save All Settings'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Product Add / Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cut Mango Pickle or Belgian Brownie Box"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unit / Size *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 500 gm, 1 Kg, Free Size"
                    value={productForm.unit}
                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Key ingredients, taste, details..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Quick Image Preset Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product Image (Select Kerala Preset or Enter URL)
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {PRODUCT_IMAGE_PRESETS.map((preset) => (
                    <button
                      type="button"
                      key={preset.name}
                      onClick={() => setProductForm({ ...productForm, imageUrl: preset.url })}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        productForm.imageUrl === preset.url
                          ? 'border-emerald-600 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                      <span className="absolute inset-x-0 bottom-0 bg-black/70 text-[9px] text-white py-0.5 truncate px-1 text-center">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
                <input
                  type="url"
                  placeholder="Or paste any image URL..."
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono text-slate-600"
                />
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
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

      {/* Create Store Modal */}
      {renderCreateStoreModal()}
    </div>
  );
}
