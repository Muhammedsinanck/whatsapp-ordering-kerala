import fs from 'fs';
import path from 'path';
import { Store, User } from '@/types';
import { put, list } from '@vercel/blob';

const BUNDLED_DATA_DIR = path.join(process.cwd(), 'data');
const isVercel = Boolean(process.env.VERCEL);
const DATA_DIR = isVercel ? path.join('/tmp', 'kadalink-data') : BUNDLED_DATA_DIR;
const DB_FILE = path.join(DATA_DIR, 'stores.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

const BLOB_STORES_PATH = 'kadalink-data/stores.json';
const BLOB_USERS_PATH = 'kadalink-data/users.json';

const INITIAL_USERS: User[] = [
  {
    id: 'usr-ckmuhammedsinan',
    email: 'ckmuhammedsinan@gmail.com',
    name: 'Muhammed Sinan C.K.',
    phone: '918281096614',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-sinan',
    email: 'sinan@gmail.com',
    name: 'Sinan C.K.',
    phone: '918281096614',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-anjali',
    email: 'anjali@gmail.com',
    name: 'Anjali Nair',
    phone: '919846012345',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-fathima',
    email: 'fathima.boutique@gmail.com',
    name: 'Fathima Raheem',
    phone: '919876543210',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString()
  }
];

const INITIAL_STORES: Store[] = [
  {
    id: 'store-malabar-taste',
    slug: 'malabar-taste',
    name: 'Malabar Taste Homemade',
    tagline: 'Authentic Malabar Pickles, Coconut Oil Chips & Wayanad Honey',
    description: 'Made with authentic Kozhikode grandma recipes in 100% pure cold-pressed coconut oil. No artificial preservatives or colors. Shipped freshly packed anywhere in Kerala & India.',
    whatsappNumber: '918281096614',
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
    createdAt: '2026-11-25T10:00:00.000Z',
    updatedAt: '2026-11-25T10:00:00.000Z',
  },
  {
    id: 'store-kochi-cakes',
    slug: 'kochi-cakes',
    name: 'Kochi Cake Studio',
    tagline: 'Handcrafted Artisan Cakes & Brownies in Kakkanad',
    description: 'Freshly baked artisan cakes, brownies, and dessert jars made with premium Belgian chocolate and 100% dairy butter. Same-day delivery across Kochi.',
    whatsappNumber: '918281096614',
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
    createdAt: '2026-11-25T10:00:00.000Z',
    updatedAt: '2026-11-25T10:00:00.000Z',
  }
];

// In-memory cache for fast response times
let memoryStores: Store[] | null = null;
let memoryUsers: User[] | null = null;
let lastStoresSync = 0;
let lastUsersSync = 0;
const CACHE_TTL_MS = 3000; // 3 seconds TTL before re-checking cloud

function hasBlobToken(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function ensureLocalDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (err) {
      console.warn('Could not create DATA_DIR:', err);
    }
  }
}

function readLocalStores(): Store[] {
  ensureLocalDir();
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data) as Store[];
    }
    const bundledStoresFile = path.join(BUNDLED_DATA_DIR, 'stores.json');
    if (fs.existsSync(bundledStoresFile)) {
      const bundled = fs.readFileSync(bundledStoresFile, 'utf8');
      fs.writeFileSync(DB_FILE, bundled, 'utf8');
      return JSON.parse(bundled) as Store[];
    }
  } catch (err) {
    console.error('Error reading local stores:', err);
  }
  return INITIAL_STORES;
}

function writeLocalStores(stores: Store[]): void {
  ensureLocalDir();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(stores, null, 2), 'utf8');
  } catch (err) {
    console.warn('Could not write local DB_FILE:', err);
  }
}

function readLocalUsers(): User[] {
  ensureLocalDir();
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(data) as User[];
    }
    const bundledUsersFile = path.join(BUNDLED_DATA_DIR, 'users.json');
    if (fs.existsSync(bundledUsersFile)) {
      const bundled = fs.readFileSync(bundledUsersFile, 'utf8');
      fs.writeFileSync(USERS_FILE, bundled, 'utf8');
      return JSON.parse(bundled) as User[];
    }
  } catch (err) {
    console.error('Error reading local users:', err);
  }
  return INITIAL_USERS;
}

function writeLocalUsers(users: User[]): void {
  ensureLocalDir();
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (err) {
    console.warn('Could not write local USERS_FILE:', err);
  }
}

// -------------------------------------------------------------
// STORES PERSISTENCE API
// -------------------------------------------------------------

export async function getAllStores(): Promise<Store[]> {
  const now = Date.now();
  if (memoryStores && now - lastStoresSync < CACHE_TTL_MS) {
    return memoryStores;
  }

  if (hasBlobToken()) {
    try {
      const { blobs } = await list({ prefix: BLOB_STORES_PATH });
      const storeBlob = blobs.find((b) => b.pathname === BLOB_STORES_PATH);
      if (storeBlob) {
        const res = await fetch(storeBlob.url, { cache: 'no-store' });
        if (res.ok) {
          const cloudStores = (await res.json()) as Store[];
          if (Array.isArray(cloudStores) && cloudStores.length > 0) {
            memoryStores = cloudStores;
            lastStoresSync = now;
            writeLocalStores(cloudStores);
            return cloudStores;
          }
        }
      }
      // Seed Blob storage if not present
      const initial = readLocalStores();
      await put(BLOB_STORES_PATH, JSON.stringify(initial, null, 2), {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      memoryStores = initial;
      lastStoresSync = now;
      return initial;
    } catch (err) {
      console.warn('Vercel Blob read error for stores, using local:', err);
    }
  }

  const local = readLocalStores();
  memoryStores = local;
  lastStoresSync = now;
  return local;
}

export async function getStoreBySlug(slug: string): Promise<Store | null> {
  const stores = await getAllStores();
  const normalized = slug.trim().toLowerCase();
  return stores.find((s) => s.slug.toLowerCase() === normalized) || null;
}

export async function getStoresByOwner(email: string): Promise<Store[]> {
  const stores = await getAllStores();
  const normalized = email.trim().toLowerCase();
  return stores.filter((s) => s.ownerEmail.toLowerCase() === normalized);
}

export async function saveStore(store: Store): Promise<Store> {
  const stores = await getAllStores();
  const index = stores.findIndex(
    (s) => s.id === store.id || s.slug.toLowerCase() === store.slug.toLowerCase()
  );

  let updatedStores: Store[];
  let savedStore: Store;

  if (index >= 0) {
    savedStore = {
      ...store,
      updatedAt: new Date().toISOString(),
    };
    updatedStores = [...stores];
    updatedStores[index] = savedStore;
  } else {
    savedStore = {
      ...store,
      createdAt: store.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    updatedStores = [savedStore, ...stores];
  }

  // Update memory
  memoryStores = updatedStores;
  lastStoresSync = Date.now();

  // Update local file
  writeLocalStores(updatedStores);

  // Update Vercel Blob
  if (hasBlobToken()) {
    try {
      await put(BLOB_STORES_PATH, JSON.stringify(updatedStores, null, 2), {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
      });
    } catch (err) {
      console.error('Failed to sync store to Vercel Blob:', err);
    }
  }

  return savedStore;
}

export async function deleteStore(id: string): Promise<boolean> {
  const stores = await getAllStores();
  const filtered = stores.filter((s) => s.id !== id);

  if (filtered.length === stores.length) {
    return false;
  }

  // Update memory
  memoryStores = filtered;
  lastStoresSync = Date.now();

  // Update local file
  writeLocalStores(filtered);

  // Update Vercel Blob
  if (hasBlobToken()) {
    try {
      await put(BLOB_STORES_PATH, JSON.stringify(filtered, null, 2), {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
      });
    } catch (err) {
      console.error('Failed to sync deleted store to Vercel Blob:', err);
    }
  }

  return true;
}

// -------------------------------------------------------------
// USERS PERSISTENCE API
// -------------------------------------------------------------

export async function getAllUsers(): Promise<User[]> {
  const now = Date.now();
  if (memoryUsers && now - lastUsersSync < CACHE_TTL_MS) {
    return memoryUsers;
  }

  if (hasBlobToken()) {
    try {
      const { blobs } = await list({ prefix: BLOB_USERS_PATH });
      const userBlob = blobs.find((b) => b.pathname === BLOB_USERS_PATH);
      if (userBlob) {
        const res = await fetch(userBlob.url, { cache: 'no-store' });
        if (res.ok) {
          const cloudUsers = (await res.json()) as User[];
          if (Array.isArray(cloudUsers) && cloudUsers.length > 0) {
            memoryUsers = cloudUsers;
            lastUsersSync = now;
            writeLocalUsers(cloudUsers);
            return cloudUsers;
          }
        }
      }
      // Seed Blob storage if not present
      const initial = readLocalUsers();
      await put(BLOB_USERS_PATH, JSON.stringify(initial, null, 2), {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      memoryUsers = initial;
      lastUsersSync = now;
      return initial;
    } catch (err) {
      console.warn('Vercel Blob read error for users, using local:', err);
    }
  }

  const local = readLocalUsers();
  memoryUsers = local;
  lastUsersSync = now;
  return local;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const users = await getAllUsers();
  const normalized = email.trim().toLowerCase();
  const user = users.find((u) => u.email.toLowerCase() === normalized) || null;
  if (user && (normalized === 'ckmuhammedsinan@gmail.com' || normalized === 'sinan@gmail.com')) {
    user.role = 'admin';
  }
  return user;
}

export async function getUserById(id: string): Promise<User | null> {
  const users = await getAllUsers();
  return users.find((u) => u.id === id) || null;
}

export async function saveUser(user: User): Promise<User> {
  const cleanEmail = user.email.toLowerCase().trim();
  if (cleanEmail === 'ckmuhammedsinan@gmail.com' || cleanEmail === 'sinan@gmail.com') {
    user.role = 'admin';
  }
  const users = await getAllUsers();
  const index = users.findIndex(
    (u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase()
  );

  let updatedUsers: User[];
  if (index >= 0) {
    updatedUsers = [...users];
    updatedUsers[index] = { ...users[index], ...user };
  } else {
    updatedUsers = [...users, user];
  }

  // Update memory
  memoryUsers = updatedUsers;
  lastUsersSync = Date.now();

  // Update local file
  writeLocalUsers(updatedUsers);

  // Update Vercel Blob
  if (hasBlobToken()) {
    try {
      await put(BLOB_USERS_PATH, JSON.stringify(updatedUsers, null, 2), {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
      });
    } catch (err) {
      console.error('Failed to sync user to Vercel Blob:', err);
    }
  }

  return user;
}

export async function deleteUser(id: string): Promise<boolean> {
  const users = await getAllUsers();
  const filtered = users.filter((u) => u.id !== id);

  if (filtered.length === users.length) {
    return false;
  }

  memoryUsers = filtered;
  lastUsersSync = Date.now();

  writeLocalUsers(filtered);

  if (hasBlobToken()) {
    try {
      await put(BLOB_USERS_PATH, JSON.stringify(filtered, null, 2), {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
      });
    } catch (err) {
      console.error('Failed to sync deleted user to Vercel Blob:', err);
    }
  }

  return true;
}
