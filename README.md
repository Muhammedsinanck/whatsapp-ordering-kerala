# KadaLink Kerala: WhatsApp Commerce Prototype 🚀

A lightweight, high-conversion WhatsApp ordering website builder ("Mini Shopify") tailored for micro-businesses, home bakers, pickle makers, and Instagram boutiques across Kerala.

---

## 🌟 Key Features Built in This Prototype

1. **Google Login for Business Owners**:
   - 1-Click Google account authentication (pre-configured with Kerala merchant demo profiles like Sinan C.K., Anjali Nair, or any custom Google email).
   - Allows store owners to return anytime, log in, and manage their store, prices, templates, and links.

2. **Template Selection (1-Click Switch)**:
   - **Malabar Heritage**: Warm terracotta, brass & Kerala spice aesthetics (Pickles, chips, honey).
   - **Boutique Elegance**: Rose gold, champagne & minimalist luxury (Sarees, kurtis, abayas).
   - **Sweet Tooth Studio**: Warm bakery peach & strawberry sweetness (Cakes, brownies, dessert jars).
   - **Kerala Modern**: Clean emerald, high contrast & sleek (General retail, crafts).

3. **Product Catalog & Inventory Management**:
   - Add, edit, delete products with title, price (₹), pack size/unit (500g, 1kg, etc.), and descriptions.
   - Quick 1-click Kerala photo presets or custom image URLs.
   - In-stock / Out-of-stock toggle.

4. **Zero-Login Customer Shopping Experience**:
   - Buyers do **not** need to create accounts or log in.
   - Fast, app-like mobile catalog with search and category filtering.
   - Interactive slide-over cart with free delivery progress bar.

5. **Instant UPI QR Payment & WhatsApp Checkout**:
   - Generates live UPI QR codes for **Google Pay**, **PhonePe**, and **Paytm** with exact order totals.
   - 1-Click **"Place Order on WhatsApp"** button formats a clean order receipt with customer name, phone, full delivery address, items, and total, opening WhatsApp directly with the seller.

6. **Custom Shareable Links & QR Code Generator**:
   - Generates unique bio links: `http://localhost:3000/store/<your-slug>`
   - Instant 1-click "Copy Link" for Instagram Bio.
   - "Share on WhatsApp" button.
   - Printable high-res QR code generator for product packaging boxes.

---

## 🏃 Running the Application

The server is currently running in the background:
- **Local URL**: [http://localhost:3000](http://localhost:3000)
- **Local Network (Mobile Testing)**: `http://192.168.0.102:3000`

To start manually at any time:
```bash
# Development mode (Hot-reload)
npm run dev

# Production mode
npm run build
npm run start
```

---

## 📱 Live Demo Stores Pre-Configured

1. **Malabar Taste Homemade Pickles**:
   - Link: [http://localhost:3000/store/malabar-taste](http://localhost:3000/store/malabar-taste)
   - Products: Cut Mango Pickle, King Fish Pickle, Coconut Oil Banana Chips, Wayanad Honey.
   - Theme: *Malabar Heritage*

2. **Kochi Cake Studio**:
   - Link: [http://localhost:3000/store/kochi-cakes](http://localhost:3000/store/kochi-cakes)
   - Products: Belgian Chocolate Fudge Cake, Lotus Biscoff Cheesecake Jars, Tender Coconut Cake.
   - Theme: *Sweet Tooth Studio*

3. **Merchant Admin Dashboard**:
   - Link: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
   - Sign in using Google Demo Account (Sinan C.K. or Anjali Nair) to edit existing stores or create a new store.
