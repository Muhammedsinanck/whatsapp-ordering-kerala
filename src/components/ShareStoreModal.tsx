'use client';

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Check, Share2, Download, ExternalLink } from 'lucide-react';
import { Store } from '@/types';

interface ShareStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: Store;
}

export default function ShareStoreModal({ isOpen, onClose, store }: ShareStoreModalProps) {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [fullUrl, setFullUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && store) {
      const origin = window.location.origin;
      const url = `${origin}/store/${store.slug}`;
      setFullUrl(url);

      QRCode.toDataURL(url, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((dataUri) => {
          setQrDataUrl(dataUri);
        })
        .catch((err) => console.error('Failed to generate QR:', err));
    }
  }, [store]);

  if (!isOpen || !store) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `${store.slug}-qr-code.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Namaskaram! Check out our new WhatsApp store *${store.name}*:\n${fullUrl}\n\nBrowse products, order in 1-click, and pay via UPI directly on WhatsApp!`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-slate-800 text-lg">Your Custom Shareable Link</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Link Box */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Shareable Store Link
            </label>
            <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-xl border border-slate-200">
              <input
                type="text"
                readOnly
                value={fullUrl}
                className="flex-1 bg-transparent text-sm font-mono text-slate-800 px-2 focus:outline-none truncate"
              />
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg text-xs font-semibold shadow-sm hover:bg-slate-50 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              Paste this link directly into your <strong>Instagram Bio</strong>, WhatsApp Status, or Facebook page.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl font-medium text-sm shadow-sm transition-all"
            >
              <Share2 className="w-4 h-4" />
              Share on WhatsApp
            </button>
            <a
              href={`/store/${store.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-medium text-sm shadow-sm transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              Open Live Store
            </a>
          </div>

          {/* QR Code Section */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-6">
            <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm flex-shrink-0">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="Store QR Code" className="w-36 h-36 rounded-lg" />
              ) : (
                <div className="w-36 h-36 bg-slate-100 animate-pulse rounded-lg" />
              )}
            </div>
            <div className="space-y-2 text-center sm:text-left">
              <h4 className="font-semibold text-slate-800 text-sm">Printable Store QR Code</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Download and stick this QR code on your product packaging, courier boxes, or delivery bags so customers can reorder easily.
              </p>
              <button
                onClick={handleDownloadQr}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download High-Res PNG
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
