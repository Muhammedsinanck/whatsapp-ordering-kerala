import fs from 'fs';
import path from 'path';
import { Store } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'stores.json');

const INITIAL_STORES: Store[] = [
  {
    id: 'store-malabar-taste',
    slug: 'malabar-taste',
    name: 'Malabar Taste Homemade',
    tagline: 'Authentic Malabar Pickles, Coconut Oil Chips & Wayanad Honey',
    description: 'Made with authentic Kozhikode grandma recipes in 100% pure cold-pressed coconut oil. No artificial preservatives or colors. Shipped freshly packed anywhere in Kerala & India.',
    whatsappNumber: '919495123456',
    upiId: 'malabartaste@okaxis',
    upiName: 'Malabar Taste Homemade',
    ownerEmail: 'sinan@gmail.com',
    ownerName: 'Sinan C.K.',
    ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    templateId: 'kerala-heritage',
    logoUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=200&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1200&auto=format&fit=crop&q=80',
    deliverySettings: {
      flatFee: 50,
      freeAboveThreshold: 500,
      deliveryNotes: 'Speed Post / Courier dispatch within 24 hours across Kerala'
    },
    products: [
      {
        id: 'prod-1',
        name: "Grandma's Cut Mango Pickle (Kanni Manga)",
        description: 'Traditional Kozhikode tender green mango pickled in cold-pressed gingelly oil, mustard, and authentic ground spices.',
        price: 180,
        unit: '500 gm',
        imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
        inStock: true,
        category: 'Pickles'
      },
      {
        id: 'prod-2',
        name: 'Malabar King Fish Pickle (Ayakkura Achar)',
        description: 'Fresh sea King Fish chunks slow-fried and pickled in rich garlic-ginger spicy gravy. Customer favorite!',
        price: 340,
        unit: '400 gm',
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
        inStock: true,
        category: 'Pickles'
      },
      {
        id: 'prod-3',
        name: 'Crispy Nendran Banana Chips in Coconut Oil',
        description: 'Thinly sliced A-grade Nendran bananas fried fresh daily in 100% pure coconut oil with sea salt and turmeric.',
        price: 190,
        unit: '500 gm',
        imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
        inStock: true,
        category: 'Snacks'
      },
      {
        id: 'prod-4',
        name: 'Raw Wayanad Wild Forest Honey',
        description: '100% raw, unheated wild honey collected sustainably from the deep forests of Wayanad, Kerala.',
        price: 450,
        unit: '500 gm',
        imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80',
        inStock: true,
        category: 'Honey & Spices'
      },
      {
        id: 'prod-5',
        name: 'Homemade Puli Inji (Ginger Chutney)',
        description: 'Authentic Kerala Onam feast special prepared with fresh organic ginger, jaggery, tamarind, and green chillies.',
        price: 160,
        unit: '350 gm',
        imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
        inStock: true,
        category: 'Pickles'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'store-kochi-cakes',
    slug: 'kochi-cakes',
    name: 'Kochi Cake Studio',
    tagline: 'Handcrafted Artisan Cakes & Brownies in Kakkanad',
    description: 'Freshly baked artisan cakes, brownies, and dessert jars made with premium Belgian chocolate and 100% dairy butter. Same-day delivery across Kochi.',
    whatsappNumber: '919846001122',
    upiId: 'kochycakes@icici',
    upiName: 'Kochi Cake Studio',
    ownerEmail: 'anjali@gmail.com',
    ownerName: 'Anjali Nair',
    ownerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    templateId: 'bakery-fresh',
    logoUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&auto=format&fit=crop&q=80',
    deliverySettings: {
      flatFee: 70,
      freeAboveThreshold: 800,
      deliveryNotes: 'Direct delivery via Dunzo/Porter within Ernakulam/Kochi'
    },
    products: [
      {
        id: 'cake-1',
        name: 'Belgian Double Chocolate Fudge Cake',
        description: 'Decadent 55% Belgian chocolate ganache layered with moist cocoa sponge. Melt-in-mouth texture.',
        price: 850,
        unit: '1 Kg',
        imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80',
        inStock: true,
        category: 'Cakes'
      },
      {
        id: 'cake-2',
        name: 'Signature Lotus Biscoff Cheesecake Jars',
        description: 'Set of two jars filled with creamy baked New York cheesecake and crunchy caramelised Biscoff spread.',
        price: 280,
        unit: 'Pack of 2',
        imageUrl: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&auto=format&fit=crop&q=80',
        inStock: true,
        category: 'Dessert Jars'
      },
      {
        id: 'cake-3',
        name: 'Fresh Tender Coconut (Elaneer) Cake',
        description: 'Our viral Kerala specialty: Soft vanilla sponge infused with fresh tender coconut cream and crushed coconut jelly.',
        price: 790,
        unit: '1 Kg',
        imageUrl: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=600&auto=format&fit=crop&q=80',
        inStock: true,
        category: 'Cakes'
      },
      {
        id: 'cake-4',
        name: 'Fudgy Walnut Brownie Box',
        description: 'Six dense, chewy dark chocolate brownies topped with roasted California walnuts.',
        price: 420,
        unit: 'Box of 6',
        imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
        inStock: true,
        category: 'Brownies'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

function ensureDbFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_STORES, null, 2), 'utf8');
  }
}

export function getAllStores(): Store[] {
  ensureDbFile();
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data) as Store[];
  } catch (error) {
    console.error('Error reading stores DB:', error);
    return INITIAL_STORES;
  }
}

export function getStoreBySlug(slug: string): Store | null {
  const stores = getAllStores();
  const normalized = slug.trim().toLowerCase();
  return stores.find(s => s.slug.toLowerCase() === normalized) || null;
}

export function getStoresByOwner(email: string): Store[] {
  const stores = getAllStores();
  const normalized = email.trim().toLowerCase();
  return stores.filter(s => s.ownerEmail.toLowerCase() === normalized);
}

export function saveStore(store: Store): Store {
  ensureDbFile();
  const stores = getAllStores();
  const index = stores.findIndex(s => s.id === store.id || s.slug.toLowerCase() === store.slug.toLowerCase());

  if (index >= 0) {
    stores[index] = {
      ...store,
      updatedAt: new Date().toISOString()
    };
  } else {
    stores.push({
      ...store,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  fs.writeFileSync(DB_FILE, JSON.stringify(stores, null, 2), 'utf8');
  return store;
}

export function deleteStore(id: string): boolean {
  ensureDbFile();
  const stores = getAllStores();
  const filtered = stores.filter(s => s.id !== id);
  if (filtered.length !== stores.length) {
    fs.writeFileSync(DB_FILE, JSON.stringify(filtered, null, 2), 'utf8');
    return true;
  }
  return false;
}
