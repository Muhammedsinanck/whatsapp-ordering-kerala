'use client';

import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Share2, ExternalLink, MessageCircle } from 'lucide-react';
import { Store } from '@/types';

interface ShareStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: Store;
}

export default function ShareStoreModal({ isOpen, onClose, store }: ShareStoreModalProps) {
  const [copied, setCopied] = useState(false);
  const [fullUrl, setFullUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && store) {
      const origin = window.location.origin;
      const url = `${origin}/store/${store.slug}`;
      setFullUrl(url);
    }
  }, [store]);

  if (!isOpen || !store) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Namaskaram! Check out our WhatsApp catalog *${store.name}*:\n${fullUrl}\n\nBrowse our fresh items & order directly on WhatsApp in 1-click!`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-base">Share Your Store</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Link Box */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Shareable Store Link
            </label>
            <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-2xl border border-slate-200">
              <input
                type="text"
                readOnly
                value={fullUrl}
                className="flex-1 bg-transparent text-xs font-mono text-slate-800 px-2 focus:outline-none truncate"
              />
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl text-xs font-bold shadow-xs hover:bg-slate-50 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Paste this link into your <strong>Instagram Bio</strong>, WhatsApp Status, or send it to customers.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={handleWhatsAppShare}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Share on WhatsApp Status & Chat</span>
            </button>

            <a
              href={`/store/${store.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Preview Live Storefront</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
