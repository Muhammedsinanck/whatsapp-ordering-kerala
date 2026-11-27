'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getStoredUser, isPlatformAdmin, getAdminMasterKey, setAdminMasterKey, clearAdminMasterKey } from '@/lib/auth';
import { GoogleUser, Store, Product } from '@/types';
import {
  ShieldAlert,
  ShieldCheck,
  Store as StoreIcon,
  Trash2,
  Plus,
  ExternalLink,
  Search,
  Upload,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  LogOut,
  Layers,
  Sparkles,
  ArrowRight,
  Eye,
  Key,
  X,
  Image as ImageIcon
} from 'lucide-react';

interface AdminStats {
  totalStores: number;
  totalProducts: number;
  totalSellers: number;
  totalUsers: number;
  hasBlobStorage: boolean;
}

const PRESET_PRODUCT_IMAGES = [
  { name: 'Pickle', url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80' },
  { name: 'Fish Pickle', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80' },
  { name: 'Banana Chips', url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80' },
  { name: 'Honey', url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80' },
  { name: 'Chocolate Cake', url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80' },
  { name: 'Brownies', url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80' },
  { name: 'Kerala Saree', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80' },
  { name: 'Spices', url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80' }
];

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [masterKeyInput, setMasterKeyInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Data
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Delete Store Modal
  const [deletingStore, setDeletingStore] = useState<Store | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Add Product Modal
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: 150,
    unit: '500 gm',
    category: 'General',
    imageUrl: PRESET_PRODUCT_IMAGES[0].url,
    inStock: true
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [addingProduct, setAddingProduct] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState('');

  const getActiveKey = () => getAdminMasterKey() || 'sinan123';

  // Fetch admin data
  const fetchAdminData = async (keyOverride?: string) => {
    setLoading(true);
    setAuthError('');
    const key = keyOverride || getAdminMasterKey() || '';
    try {
      const res = await fetch('/api/admin/stores', {
        headers: key ? { 'x-admin-key': key } : undefined
      });

      if (!res.ok) {
        if (res.status === 403) {
          setIsAuthorized(false);
          setLoading(false);
          return;
        }
        throw new Error('Failed to load admin data');
      }

      const data = await res.json();
      setStats(data.stats);
      setStores(data.stores);
      setIsAuthorized(true);
      if (key) {
        setAdminMasterKey(key);
      }
    } catch (err: any) {
      console.error(err);
      setAuthError('Connection error or unauthorized access.');
      setIsAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const currentUser = getStoredUser();
    setUser(currentUser);

    const savedKey = getAdminMasterKey();
    if (isPlatformAdmin(currentUser) || savedKey) {
      fetchAdminData(savedKey || undefined);
    } else {
      setIsAuthorized(false);
      setLoading(false);
    }
  }, []);

  const handleKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterKeyInput.trim()) return;
    fetchAdminData(masterKeyInput.trim());
  };

  const handleLogout = () => {
    clearAdminMasterKey();
    setIsAuthorized(false);
  };

  // Delete store handler
  const handleConfirmDelete = async () => {
    if (!deletingStore) return;
    setIsDeleting(true);
    const key = getActiveKey();

    try {
      const res = await fetch(`/api/admin/stores?id=${encodeURIComponent(deletingStore.id)}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': key }
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to delete store');
        return;
      }

      setStores((prev) => prev.filter((s) => s.id !== deletingStore.id));
      if (stats) {
        setStats({
          ...stats,
          totalStores: stats.totalStores - 1,
          totalProducts: stats.totalProducts - (deletingStore.products?.length || 0)
        });
      }
      setActionSuccessMessage(`Successfully deleted store: ${deletingStore.name}`);
      setTimeout(() => setActionSuccessMessage(''), 4000);
      setDeletingStore(null);
    } catch (err) {
      console.error(err);
      alert('Network error deleting store');
    } finally {
      setIsDeleting(false);
    }
  };

  // Image file upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

      if (!res.ok) {
        throw new Error('Image upload failed');
      }

      const data = await res.json();
      setProductForm((prev) => ({ ...prev, imageUrl: data.url }));
    } catch (err) {
      console.error(err);
      alert('Could not upload image file. Please use a preset or direct URL.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Add Product submit handler
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStoreId || !productForm.name || !productForm.price) {
      alert('Please select a target store, and provide product name and price.');
      return;
    }

    setAddingProduct(true);
    const key = getActiveKey();

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': key
        },
        body: JSON.stringify({
          storeId: selectedStoreId,
          product: productForm
        })
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to add product');
        return;
      }

      const data = await res.json();
      // Update local store state
      setStores((prev) =>
        prev.map((s) => (s.id === data.store.id ? data.store : s))
      );
      if (stats) {
        setStats({ ...stats, totalProducts: stats.totalProducts + 1 });
      }

      setActionSuccessMessage(`Product "${productForm.name}" added successfully to store!`);
      setTimeout(() => setActionSuccessMessage(''), 4000);
      setIsAddProductOpen(false);
      // Reset form
      setProductForm({
        name: '',
        description: '',
        price: 150,
        unit: '500 gm',
        category: 'General',
        imageUrl: PRESET_PRODUCT_IMAGES[0].url,
        inStock: true
      });
    } catch (err) {
      console.error(err);
      alert('Network error adding product.');
    } finally {
      setAddingProduct(false);
    }
  };

  const filteredStores = stores.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.slug.toLowerCase().includes(q) ||
      s.ownerEmail.toLowerCase().includes(q) ||
      s.ownerName.toLowerCase().includes(q)
    );
  });

  // -------------------------------------------------------------
  // UNAUTHORIZED / LOGIN SCREEN
  // -------------------------------------------------------------
  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-100">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">KadaLink SuperAdmin</h1>
            <p className="text-xs text-slate-400">
              Restricted portal. Only platform administrators have permission to access store management.
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleKeySubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-emerald-400" />
                <span>Enter Admin Master Key</span>
              </label>
              <input
                type="password"
                value={masterKeyInput}
                onChange={(e) => setMasterKeyInput(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 bg-slate-850 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 font-mono tracking-wider"
                required
              />
              <p className="text-[11px] text-slate-500 mt-1.5">
                Default platform master key: <code className="text-slate-400 font-bold">sinan123</code>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Unlock Admin Portal'}</span>
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800 text-center">
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              ← Return to KadaLink Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // LOADING SCREEN
  // -------------------------------------------------------------
  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-400">Loading KadaLink Master Admin Console...</p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHORIZED ADMIN CONSOLE
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 font-black text-sm">
            KL
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-white text-base tracking-tight">KadaLink</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full">
                SuperAdmin
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Platform Management & Multi-Store Control</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSelectedStoreId(stores[0]?.id || '');
              setIsAddProductOpen(true);
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Product</span>
          </button>

          <Link
            href="/dashboard"
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-all"
          >
            Seller View
          </Link>

          <button
            onClick={handleLogout}
            title="Lock Admin Session"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Success toast */}
        {actionSuccessMessage && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-2xl flex items-center justify-between shadow-lg animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="font-medium">{actionSuccessMessage}</span>
            </div>
            <button onClick={() => setActionSuccessMessage('')} className="text-emerald-400 hover:text-emerald-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Platform Overview Metrics */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Stores</span>
            <div className="text-3xl font-black text-white">{stats?.totalStores || 0}</div>
            <div className="text-[11px] text-emerald-400 font-medium">All registered seller storefronts</div>
          </div>

          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Products</span>
            <div className="text-3xl font-black text-white">{stats?.totalProducts || 0}</div>
            <div className="text-[11px] text-emerald-400 font-medium">Live items across all catalogs</div>
          </div>

          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Unique Sellers</span>
            <div className="text-3xl font-black text-white">{stats?.totalSellers || 0}</div>
            <div className="text-[11px] text-slate-400 font-medium">Active merchant accounts</div>
          </div>

          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Cloud Storage</span>
            <div className="flex items-center gap-2 pt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xl font-bold text-white">Vercel Blob</span>
            </div>
            <div className="text-[11px] text-slate-400">Persistent auto-synchronized storage</div>
          </div>
        </section>

        {/* Stores Table Header & Filter */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Active Customer Stores</h2>
              <p className="text-xs text-slate-400">
                Manage, inspect, delete, or inject products into any seller's store.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by store, slug, owner..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                onClick={() => fetchAdminData()}
                title="Refresh stores"
                className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-300 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-3.5 px-4">Store & Link</th>
                    <th className="py-3.5 px-4">Owner</th>
                    <th className="py-3.5 px-4">WhatsApp</th>
                    <th className="py-3.5 px-4">Products</th>
                    <th className="py-3.5 px-4">Theme</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredStores.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No stores found matching your query.
                      </td>
                    </tr>
                  ) : (
                    filteredStores.map((store) => (
                      <tr key={store.id} className="hover:bg-slate-850/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {store.logoUrl ? (
                              <img
                                src={store.logoUrl}
                                alt={store.name}
                                className="w-10 h-10 rounded-xl object-cover border border-slate-700 flex-shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-slate-400">
                                🏬
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-white text-sm">{store.name}</div>
                              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
                                <span>/store/{store.slug}</span>
                                <Link
                                  href={`/store/${store.slug}`}
                                  target="_blank"
                                  className="text-slate-500 hover:text-emerald-400 transition-colors"
                                  title="Open live storefront"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-200">{store.ownerName}</div>
                          <div className="text-[11px] text-slate-500">{store.ownerEmail}</div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-slate-400">
                          +{store.whatsappNumber}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 bg-slate-800 text-slate-200 rounded-lg font-bold">
                            {store.products?.length || 0} items
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
                            {store.templateId}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedStoreId(store.id);
                                setIsAddProductOpen(true);
                              }}
                              className="px-2.5 py-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer"
                              title="Upload product to this store"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Item</span>
                            </button>

                            <Link
                              href={`/store/${store.slug}`}
                              target="_blank"
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                              title="Preview Store"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>

                            <button
                              onClick={() => setDeletingStore(store)}
                              className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg transition-colors cursor-pointer"
                              title="Delete Store Permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* ------------------------------------------------------------- */}
      {/* DELETE STORE SAFETY MODAL */}
      {/* ------------------------------------------------------------- */}
      {deletingStore && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="max-w-md w-full bg-slate-900 border border-rose-500/30 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Customer Store?</h3>
                <p className="text-xs text-rose-400">This action is permanent and cannot be undone.</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-1.5">
              <div><strong>Store:</strong> {deletingStore.name}</div>
              <div><strong>Link:</strong> <span className="text-emerald-400 font-mono">/store/{deletingStore.slug}</span></div>
              <div><strong>Owner:</strong> {deletingStore.ownerEmail}</div>
              <div><strong>Products:</strong> {deletingStore.products?.length || 0} items will be permanently erased</div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingStore(null)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* DIRECT PRODUCT UPLOAD MODAL */}
      {/* ------------------------------------------------------------- */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Direct Product Upload (Admin)</h3>
                  <p className="text-xs text-slate-400">Add an item to any customer store with instant photo upload</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddProductOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-4">
              {/* Select target store */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Target Store</label>
                <select
                  value={selectedStoreId}
                  onChange={(e) => setSelectedStoreId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                >
                  <option value="">-- Choose a store --</option>
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (/store/{s.slug}) • {s.ownerEmail}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product name & price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Product Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Grandma Fish Pickle"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="180"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Unit & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Unit / Packaging</label>
                  <input
                    type="text"
                    placeholder="e.g. 500 gm, 1 Kg, Piece"
                    value={productForm.unit}
                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Pickles, Cakes, Snacks"
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Short description of taste, ingredients, or specialty..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Image Upload & Presets */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  Product Image (File Upload or Presets)
                </label>

                {/* Upload button */}
                <div className="flex items-center gap-3">
                  <label className="flex-1 border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl p-3 text-center cursor-pointer transition-colors bg-slate-850">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                    <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-300">
                      <Upload className="w-4 h-4 text-emerald-400" />
                      <span>{uploadingImage ? 'Uploading to Vercel Blob...' : 'Choose image file to upload'}</span>
                    </div>
                  </label>

                  {productForm.imageUrl && (
                    <img
                      src={productForm.imageUrl}
                      alt="Preview"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700 flex-shrink-0"
                    />
                  )}
                </div>

                {/* Quick Presets */}
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Or pick a catalog preset:</span>
                  <div className="grid grid-cols-4 gap-2 pt-1.5">
                    {PRESET_PRODUCT_IMAGES.map((img) => (
                      <button
                        key={img.name}
                        type="button"
                        onClick={() => setProductForm({ ...productForm, imageUrl: img.url })}
                        className={`p-1.5 rounded-xl border text-center transition-all ${
                          productForm.imageUrl === img.url
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : 'border-slate-800 bg-slate-800/50 hover:border-slate-700'
                        }`}
                      >
                        <img src={img.url} alt={img.name} className="w-full h-10 object-cover rounded-lg mb-1" />
                        <span className="text-[10px] text-slate-300 truncate block">{img.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* In stock toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="adminInStock"
                  checked={productForm.inStock}
                  onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                  className="rounded text-emerald-500 focus:ring-emerald-500"
                />
                <label htmlFor="adminInStock" className="text-xs text-slate-300 font-medium">
                  Item is In Stock & Available for Order
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingProduct || uploadingImage || !selectedStoreId}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{addingProduct ? 'Adding Item...' : 'Upload & Add to Store'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
