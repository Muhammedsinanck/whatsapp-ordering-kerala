'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Store, Product, CartItem } from '@/types';
import { TEMPLATES } from '@/lib/templates';
import CartDrawer from '@/components/CartDrawer';
import {
  ShoppingBag,
  MessageCircle,
  Truck,
  CheckCircle,
  Plus,
  Minus,
  Sparkles,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

export default function StorefrontPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();

  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    if (!slug) return;

    fetch(`/api/stores/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Store not found');
        return res.json();
      })
      .then((data: Store) => {
        setStore(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('This store could not be found or has not been published yet.');
        setLoading(false);
      });
  }, [slug]);

  // Cart operations
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.product.id !== productId));
    } else {
      setCart((prev) =>
        prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
      );
    }
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-600">Loading store...</p>
        </div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center space-y-4">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-slate-800">Store Not Found</h2>
          <p className="text-sm text-slate-600">{error || 'Please check the store link.'}</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800"
          >
            Go to KadaLink Home
          </Link>
        </div>
      </div>
    );
  }

  const template = TEMPLATES[store.templateId] || TEMPLATES['kerala-heritage'];

  // Categories
  const categories = ['All', ...Array.from(new Set(store.products.map((p) => p.category).filter(Boolean)))];

  const filteredProducts = store.products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={`min-h-screen flex flex-col ${template.bgClass}`}>
      {/* Top Banner: Kerala Delivery */}
      <div className="bg-emerald-700 text-emerald-50 px-4 py-2 text-xs text-center font-medium flex items-center justify-center gap-2">
        <Truck className="w-3.5 h-3.5" />
        <span>
          Flat ₹{store.deliverySettings.flatFee} delivery across Kerala | Free delivery above ₹
          {store.deliverySettings.freeAboveThreshold}
        </span>
      </div>

      {/* Store Header */}
      <header className={`${template.headerBg} py-8 px-4 sm:px-6 lg:px-8 transition-colors`}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          {store.logoUrl ? (
            <img
              src={store.logoUrl}
              alt={store.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover shadow-lg border-2 border-white/20 flex-shrink-0"
            />
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white/10 flex items-center justify-center text-3xl font-bold border border-white/20">
              {store.name.charAt(0)}
            </div>
          )}

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{store.name}</h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Kerala Seller
                </span>
              </div>

              {/* Prominent Header Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-slate-900 rounded-xl text-xs font-extrabold shadow-md hover:bg-slate-100 transition-all"
              >
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span>View Cart ({totalCartCount})</span>
                {totalCartCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black">
                    ₹{cartSubtotal}
                  </span>
                )}
              </button>
            </div>

            <p className="text-sm font-medium opacity-90">{store.tagline}</p>
            <p className="text-xs opacity-75 max-w-2xl leading-relaxed">{store.description}</p>

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <a
                href={`https://wa.me/${store.whatsappNumber}?text=${encodeURIComponent(
                  `Namaskaram ${store.name}! I am browsing your store and had a quick question.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                Chat on WhatsApp
              </a>

              {store.deliverySettings.deliveryNotes && (
                <span className="text-xs opacity-80 flex items-center gap-1">
                  📦 {store.deliverySettings.deliveryNotes}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Catalog */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Category Chips */}
          {categories.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat as string}
                  onClick={() => setSelectedCategory(cat as string)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? template.primaryButtonClass
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white/60 rounded-2xl border border-slate-200 space-y-2">
            <p className="text-sm font-semibold text-slate-700">No products found</p>
            <p className="text-xs text-slate-500">Try adjusting your search or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.map((product) => {
              const inCart = cart.find((item) => item.product.id === product.id);

              return (
                <div
                  key={product.id}
                  className={`flex flex-col rounded-2xl overflow-hidden border transition-all duration-200 ${template.cardBg}`}
                >
                  {/* Product Image */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      loading="lazy"
                    />
                    {product.unit && (
                      <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-black/70 text-white backdrop-blur-sm">
                        {product.unit}
                      </span>
                    )}
                    {!product.inStock && (
                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-600 text-white">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400">Price</span>
                        <div className="text-lg font-extrabold text-slate-900">₹{product.price}</div>
                      </div>

                      {product.inStock ? (
                        inCart ? (
                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 border border-slate-200">
                              <button
                                onClick={() => handleUpdateQuantity(product.id, inCart.quantity - 1)}
                                className="w-6 h-6 flex items-center justify-center rounded-lg bg-white text-slate-700 hover:bg-slate-200 shadow-sm"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold w-4 text-center">{inCart.quantity}</span>
                              <button
                                onClick={() => handleUpdateQuantity(product.id, inCart.quantity + 1)}
                                className="w-6 h-6 flex items-center justify-center rounded-lg bg-white text-slate-700 hover:bg-slate-200 shadow-sm"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <button
                              onClick={() => setIsCartOpen(true)}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                            >
                              Checkout
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddToCart(product)}
                            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 ${template.primaryButtonClass}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add to Cart
                          </button>
                        )
                      ) : (
                        <button
                          disabled
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-400 cursor-not-allowed"
                        >
                          Sold Out
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Bottom Cart Bar */}
      {totalCartCount > 0 && (
        <div className="sticky bottom-4 z-40 max-w-lg w-full mx-auto px-4">
          <div className="bg-slate-950 text-white p-3.5 rounded-2xl shadow-2xl flex items-center justify-between border border-slate-800 animate-slideUp">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-300 font-medium">
                  {totalCartCount} {totalCartCount === 1 ? 'item' : 'items'} in cart
                </div>
                <div className="text-sm font-extrabold text-white">₹{cartSubtotal}</div>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <span>View Cart & Checkout</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Store Footer */}
      <footer className="mt-auto py-8 border-t border-slate-200/60 text-center text-xs text-slate-500 space-y-2 bg-white/40">
        <div>
          Powered by{' '}
          <Link href="/" className="font-bold text-slate-800 hover:text-emerald-600">
            KadaLink Kerala
          </Link>{' '}
          • Zero Login Customer WhatsApp Orders
        </div>
        <div className="text-[11px] text-slate-400">
          Want a store like this for your homemade food or boutique?{' '}
          <Link href="/" className="underline text-emerald-600 font-semibold">
            Create your store in 2 minutes
          </Link>
        </div>
      </footer>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        store={store}
        onUpdateQuantity={handleUpdateQuantity}
        onClearCart={handleClearCart}
      />
    </div>
  );
}
