import { TemplateId } from '@/types';

export interface TemplateConfig {
  id: TemplateId;
  name: string;
  tagline: string;
  badge: string;
  previewBg: string;
  bgClass: string;
  headerBg: string;
  cardBg: string;
  accentColor: string;
  primaryButtonClass: string;
  secondaryButtonClass: string;
  badgeClass: string;
  fontFamily: string;
  description: string;
}

export const TEMPLATES: Record<TemplateId, TemplateConfig> = {
  'kerala-heritage': {
    id: 'kerala-heritage',
    name: 'Malabar Heritage',
    tagline: 'Warm terracotta, brass & Kerala spices',
    badge: 'Best for Pickles, Chips & Spices',
    previewBg: 'bg-amber-100',
    bgClass: 'bg-[#faf6f0] text-stone-900',
    headerBg: 'bg-stone-900 text-amber-50 border-b-4 border-amber-600',
    cardBg: 'bg-white border-amber-200 shadow-sm hover:shadow-md hover:border-amber-400',
    accentColor: '#d97706',
    primaryButtonClass: 'bg-amber-600 hover:bg-amber-700 text-white font-extrabold shadow-md shadow-amber-600/20 active:scale-95',
    secondaryButtonClass: 'border-amber-600 text-amber-700 hover:bg-amber-50',
    badgeClass: 'bg-amber-100 text-amber-900 border border-amber-300 font-bold',
    fontFamily: 'font-serif',
    description: 'Evokes authentic Kerala tradition, homemade goodness, and heritage culinary authenticity.'
  },
  'boutique-elegance': {
    id: 'boutique-elegance',
    name: 'Boutique Elegance',
    tagline: 'Rose gold, champagne & minimalist luxury',
    badge: 'Best for Sarees, Kurtis & Abayas',
    previewBg: 'bg-rose-100',
    bgClass: 'bg-[#fcf9f9] text-stone-900',
    headerBg: 'bg-stone-950 text-rose-50 border-b-2 border-rose-400',
    cardBg: 'bg-white border-rose-100 shadow-sm hover:shadow-lg hover:border-rose-300',
    accentColor: '#be185d',
    primaryButtonClass: 'bg-rose-700 hover:bg-rose-800 text-white font-extrabold shadow-md shadow-rose-700/20 active:scale-95',
    secondaryButtonClass: 'border-rose-700 text-rose-800 hover:bg-rose-50',
    badgeClass: 'bg-rose-100 text-rose-900 border border-rose-200 font-bold',
    fontFamily: 'font-sans',
    description: 'Tailored for fashion boutiques, Instagram handlooms, abayas, and bridal/festive collections.'
  },
  'bakery-fresh': {
    id: 'bakery-fresh',
    name: 'Sweet Tooth Studio',
    tagline: 'Warm bakery peach & strawberry sweetness',
    badge: 'Best for Home Bakers & Desserts',
    previewBg: 'bg-pink-100',
    bgClass: 'bg-[#fff9f9] text-stone-900',
    headerBg: 'bg-stone-900 text-pink-50 border-b-4 border-pink-500',
    cardBg: 'bg-white border-pink-100 shadow-sm hover:shadow-md hover:border-pink-300 rounded-2xl',
    accentColor: '#db2777',
    primaryButtonClass: 'bg-pink-600 hover:bg-pink-700 text-white font-extrabold rounded-full shadow-md shadow-pink-600/20 active:scale-95',
    secondaryButtonClass: 'border-pink-600 text-pink-700 hover:bg-pink-50 rounded-full',
    badgeClass: 'bg-pink-100 text-pink-900 rounded-full border border-pink-200 font-bold',
    fontFamily: 'font-sans',
    description: 'Charming, friendly, and irresistible look for custom cakes, pastries, brownies, and confectionery.'
  },
  'modern-minimal': {
    id: 'modern-minimal',
    name: 'Kerala Modern',
    tagline: 'Clean emerald, high-contrast & sleek',
    badge: 'Best for General Retail & Quick Commerce',
    previewBg: 'bg-emerald-100',
    bgClass: 'bg-slate-50 text-slate-900',
    headerBg: 'bg-slate-950 text-white border-b-2 border-emerald-500',
    cardBg: 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-500 rounded-xl',
    accentColor: '#059669',
    primaryButtonClass: 'bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md shadow-emerald-600/20 active:scale-95',
    secondaryButtonClass: 'border-emerald-600 text-emerald-700 hover:bg-emerald-50 rounded-xl',
    badgeClass: 'bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-md font-bold',
    fontFamily: 'font-sans',
    description: 'Clean, fast-loading, contemporary design suitable for any craft, electronics, or multi-item business.'
  }
};
