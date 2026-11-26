export type TemplateId = 'kerala-heritage' | 'boutique-elegance' | 'bakery-fresh' | 'modern-minimal';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string; // e.g. "500g", "1kg", "Piece", "Free Size"
  imageUrl: string;
  inStock: boolean;
  category?: string;
}

export interface StoreDeliverySettings {
  flatFee: number;
  freeAboveThreshold: number;
  deliveryNotes?: string;
}

export interface Store {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  whatsappNumber: string; // e.g. "919876543210"
  upiId: string; // e.g. "merchant@okhdfcbank"
  upiName?: string; // Merchant display name for UPI
  ownerEmail: string;
  ownerName: string;
  ownerAvatar?: string;
  templateId: TemplateId;
  logoUrl?: string;
  bannerUrl?: string;
  deliverySettings: StoreDeliverySettings;
  products: Product[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CustomerOrderDetails {
  customerName: string;
  customerPhone: string;
  address: string;
  pincode: string;
  district: string;
  paymentMethod: 'upi' | 'cod';
  notes?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  password?: string;
  avatar: string;
  createdAt?: string;
}

export type GoogleUser = User;
export type AuthUser = User;
