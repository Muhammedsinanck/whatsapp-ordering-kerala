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
    bgClass: 'bg-[#faf6f0] text-[#2c1810]',
    headerBg: 'bg-[#3e1f13] text-[#fff6ed] border-b-4 border-[#c27803]',
    cardBg: 'bg-[#ffffff] border-[#e8d7c3] shadow-sm hover:shadow-md hover:border-[#c27803]',
    accentColor: '#c27803',
    primaryButtonClass: 'bg-[#c27803] hover:bg-[#a36300] text-white shadow-sm',
    secondaryButtonClass: 'border-[#c27803] text-[#c27803] hover:bg-[#fff7ed]',
    badgeClass: 'bg-[#fef3c7] text-[#92400e] border border-[#fde68a]',
    fontFamily: 'font-serif',
    description: 'Evokes authentic Kerala tradition, homemade goodness, and heritage culinary authenticity.'
  },
  'boutique-elegance': {
    id: 'boutique-elegance',
    name: 'Boutique Elegance',
    tagline: 'Rose gold, champagne & minimalist luxury',
    badge: 'Best for Sarees, Kurtis & Abayas',
    previewBg: 'bg-rose-100',
    bgClass: 'bg-[#fcf9f9] text-[#2d2226]',
    headerBg: 'bg-[#291d24] text-[#fbf0f4] border-b border-[#e5b3c5]',
    cardBg: 'bg-white border-[#f0dee6] shadow-sm hover:shadow-lg hover:border-[#b85d83]',
    accentColor: '#b85d83',
    primaryButtonClass: 'bg-[#b85d83] hover:bg-[#994769] text-white shadow-sm',
    secondaryButtonClass: 'border-[#b85d83] text-[#b85d83] hover:bg-[#fdf2f6]',
    badgeClass: 'bg-[#fce7f3] text-[#9d174d] border border-[#fbcfe8]',
    fontFamily: 'font-sans',
    description: 'Tailored for fashion boutiques, Instagram handlooms, abayas, and bridal/festive collections.'
  },
  'bakery-fresh': {
    id: 'bakery-fresh',
    name: 'Sweet Tooth Studio',
    tagline: 'Warm bakery peach & strawberry sweetness',
    badge: 'Best for Home Bakers & Desserts',
    previewBg: 'bg-pink-100',
    bgClass: 'bg-[#fff9f9] text-[#331e28]',
    headerBg: 'bg-[#4d2539] text-[#fff0f6] border-b-4 border-[#f472b6]',
    cardBg: 'bg-white border-[#fed7e2] shadow-sm hover:shadow-md hover:border-[#f472b6] rounded-2xl',
    accentColor: '#ec4899',
    primaryButtonClass: 'bg-[#ec4899] hover:bg-[#db2777] text-white rounded-full shadow-sm',
    secondaryButtonClass: 'border-[#ec4899] text-[#ec4899] hover:bg-[#fff1f2] rounded-full',
    badgeClass: 'bg-[#ffe4e6] text-[#be123c] rounded-full border border-[#fecdd3]',
    fontFamily: 'font-sans',
    description: 'Charming, friendly, and irresistible look for custom cakes, pastries, brownies, and confectionery.'
  },
  'modern-minimal': {
    id: 'modern-minimal',
    name: 'Kerala Modern',
    tagline: 'Clean emerald, high-contrast & sleek',
    badge: 'Best for General Retail & Quick Commerce',
    previewBg: 'bg-emerald-100',
    bgClass: 'bg-[#f8fafc] text-[#0f172a]',
    headerBg: 'bg-[#0f172a] text-white border-b-2 border-emerald-500',
    cardBg: 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-500 rounded-xl',
    accentColor: '#10b981',
    primaryButtonClass: 'bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm',
    secondaryButtonClass: 'border-emerald-600 text-emerald-700 hover:bg-emerald-50 rounded-lg',
    badgeClass: 'bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md',
    fontFamily: 'font-sans',
    description: 'Clean, fast-loading, contemporary design suitable for any craft, electronics, or multi-item business.'
  }
};
