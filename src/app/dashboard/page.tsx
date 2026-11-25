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
  Image as ImageIcon,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

// Curated sample Kerala product photo presets for quick 1-click catalog creation
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
  const [activeTab, setActiveTab] = useState<'template' | 'products' | 'settings' | 'share'>('template');
  
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  // Product modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: 0,
    unit: '500 gm',
    imageUrl: PRODUCT_IMAGE_PRESETS[0].url,
    category: 'General',
    inStock: true
  });

  useEffect(() => {
    const currentUser = getStoredUser();
    setUser(currentUser);

    if (!currentUser) {
      setIsAuthModalOpen(true);
      setLoading(false);
      return;
    }

    // Load store for current user
    fetch(`/api/stores?ownerEmail=${encodeURIComponent(currentUser.email)}`)
      .then((res) => res.json())
      .then((stores: Store[]) => {
        if (stores && stores.length > 0) {
          setStore(stores[0]);
        } else {
          // Create initial starter store for new user
          const defaultSlug = currentUser.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-store';
          const newStore: Store = {
            id: `store-${Date.now()}`,
            slug: defaultSlug,
            name: `${currentUser.name}'s Store`,
            tagline: 'Handmade & authentic products from Kerala',
            description: 'Direct WhatsApp ordering with UPI payments. Shipped with love across Kerala.',
            whatsappNumber: '919495000000',
            upiId: `${currentUser.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@okaxis`,
            upiName: currentUser.name,
            ownerEmail: currentUser.email,
            ownerName: currentUser.name,
            ownerAvatar: currentUser.avatar,
            templateId: 'kerala-heritage',
            logoUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=200&auto=format&fit=crop&q=80',
            deliverySettings: {
              flatFee: 50,
              freeAboveThreshold: 500,
              deliveryNotes: 'Speed Post / Courier dispatch within 24-48 hours'
            },
            products: [
              {
                id: 'prod-init-1',
                name: 'Homemade Kerala Pickle',
                description: 'Prepared fresh with grandma recipe and organic ingredients.',
                price: 180,
                unit: '500 gm',
                imageUrl: PRODUCT_IMAGE_PRESETS[0].url,
                inStock: true,
                category: 'Pickles'
              },
              {
                id: 'prod-init-2',
                name: 'Crispy Nendran Banana Chips',
                description: 'Fried in pure coconut oil with fresh turmeric and salt.',
                price: 190,
                unit: '500 gm',
                imageUrl: PRODUCT_IMAGE_PRESETS[2].url,
                inStock: true,
                category: 'Snacks'
              }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setStore(newStore);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load store:', err);
        setLoading(false);
      });
  }, []);

  const handleSaveStore = async (updatedStore?: Store) => {
    const target = updatedStore || store;
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
      setStore(saved);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save store changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleTemplateChange = (templateId: TemplateId) => {
    if (!store) return;
    const updated = { ...store, templateId };
    setStore(updated);
    handleSaveStore(updated);
  };

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      price: 150,
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
    if (!store) return;

    let updatedProducts = [...store.products];

    if (editingProduct) {
      updatedProducts = updatedProducts.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              ...productForm,
              price: Number(productForm.price)
            }
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

    const updatedStore = { ...store, products: updatedProducts };
    setStore(updatedStore);
    handleSaveStore(updatedStore);
    setIsProductModalOpen(false);
  };

  const handleDeleteProduct = (productId: string) => {
    if (!store) return;
    if (!confirm('Are you sure you want to remove this product?')) return;

    const updatedStore = {
      ...store,
      products: store.products.filter((p) => p.id !== productId)
    };
    setStore(updatedStore);
    handleSaveStore(updatedStore);
  };

  const handleToggleStock = (productId: string) => {
    if (!store) return;
    const updatedProducts = store.products.map((p) =>
      p.id === productId ? { ...p, inStock: !p.inStock } : p
    );
    const updatedStore = { ...store, products: updatedProducts };
    setStore(updatedStore);
    handleSaveStore(updatedStore);
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

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center space-y-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <StoreIcon className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Sign in to Manage Store</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Please log in with your Google account to edit your WhatsApp store, manage listings, and change templates.
          </p>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full py-3 px-4 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 flex items-center justify-center gap-2 shadow-sm"
          >
            Sign in with Google
          </button>
        </div>
        <GoogleSignInModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={(u) => setUser(u)}
        />
      </div>
    );
  }

  if (!store) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-sm">
              K
            </div>
            <span className="font-extrabold text-slate-900 text-sm hidden sm:inline">KadaLink Admin</span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="font-bold text-slate-800 text-sm truncate max-w-[160px] sm:max-w-xs">
            {store.name}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {saveSuccess && (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full animate-fadeIn">
              <Check className="w-3.5 h-3.5" /> Changes Saved
            </span>
          )}

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Link</span>
          </button>

          <a
            href={`/store/${store.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
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

      {/* Main Dashboard Layout */}
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 space-y-6">
        {/* Custom Shareable Link Quick Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <h3 className="font-bold text-sm">Your Store is Live & Shareable!</h3>
            </div>
            <p className="text-xs text-emerald-100">
              Customers can order with zero login and pay via UPI directly to your WhatsApp.
            </p>
            <div className="font-mono text-xs bg-black/20 px-3 py-1.5 rounded-lg inline-block text-emerald-100 font-semibold mt-1">
              {typeof window !== 'undefined' ? `${window.location.origin}/store/${store.slug}` : `/store/${store.slug}`}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex-1 sm:flex-initial px-4 py-2 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share / QR Code
            </button>
            <a
              href={`/store/${store.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Customer View
            </a>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center gap-1.5 border-b border-slate-200 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('template')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'template'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Select Template</span>
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
            <span>Product Catalog ({store.products.length})</span>
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
            <span>Store Info & UPI</span>
          </button>
        </div>

        {/* TAB 1: TEMPLATE SELECTION */}
        {activeTab === 'template' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-800">Select Website Template</h3>
                <p className="text-xs text-slate-500">
                  Switch the theme and vibe of your storefront with a single tap. Saves immediately.
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full w-fit">
                Active Theme: {TEMPLATES[store.templateId]?.name || store.templateId}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(Object.keys(TEMPLATES) as TemplateId[]).map((tId) => {
                const t = TEMPLATES[tId];
                const isSelected = store.templateId === tId;

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

                    {/* Preview visual card simulation */}
                    <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 p-3 space-y-2">
                      <div className={`p-2 rounded-lg text-xs font-bold ${t.headerBg}`}>
                        Store Header Preview
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
                <h3 className="text-base font-bold text-slate-800">Your Product Catalog</h3>
                <p className="text-xs text-slate-500">
                  Add products, set prices, update descriptions, and toggle stock.
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

            {store.products.length === 0 ? (
              <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
                <Package className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-700 text-sm">No products listed yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Add your first item (e.g. Cut Mango Pickle, Saree, or Chocolate Cake) to start taking WhatsApp orders!
                </p>
                <button
                  onClick={handleOpenAddProduct}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                >
                  Add First Product
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {store.products.map((product) => (
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
                {saving ? 'Saving...' : 'Save All Changes'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Store Name *</label>
                <input
                  type="text"
                  required
                  value={store.name}
                  onChange={(e) => setStore({ ...store, name: e.target.value })}
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
                    value={store.slug}
                    onChange={(e) =>
                      setStore({
                        ...store,
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
                value={store.tagline}
                onChange={(e) => setStore({ ...store, tagline: e.target.value })}
                placeholder="e.g. Traditional homemade Kozhikode pickles made in coconut oil"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Store Description</label>
              <textarea
                rows={3}
                value={store.description}
                onChange={(e) => setStore({ ...store, description: e.target.value })}
                placeholder="Explain what makes your products special, your ingredients, or dispatch process..."
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
                    placeholder="e.g. 919495123456"
                    value={store.whatsappNumber}
                    onChange={(e) => setStore({ ...store, whatsappNumber: e.target.value })}
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
                    value={store.upiId}
                    onChange={(e) => setStore({ ...store, upiId: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Used to generate live UPI QR codes for Google Pay, PhonePe, and Paytm.
                </p>
              </div>
            </div>

            {/* Delivery Fees */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Flat Delivery Fee (₹)</label>
                <input
                  type="number"
                  value={store.deliverySettings.flatFee}
                  onChange={(e) =>
                    setStore({
                      ...store,
                      deliverySettings: {
                        ...store.deliverySettings,
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
                  value={store.deliverySettings.freeAboveThreshold}
                  onChange={(e) =>
                    setStore({
                      ...store,
                      deliverySettings: {
                        ...store.deliverySettings,
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
                  value={store.deliverySettings.deliveryNotes || ''}
                  onChange={(e) =>
                    setStore({
                      ...store,
                      deliverySettings: {
                        ...store.deliverySettings,
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
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Product Add / Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden">
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
                  Product Image (Select Kerala Sample or Enter URL)
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
      {store && (
        <ShareStoreModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          store={store}
        />
      )}
    </div>
  );
}
