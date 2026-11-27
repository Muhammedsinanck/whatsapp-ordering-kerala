import urllib.request
import xml.etree.ElementTree as ET
import os
import re
import json
from urllib.parse import urlparse

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
}

OUTPUT_DIR = os.path.join(os.getcwd(), 'public', 'images', 'jumping-cliff')
os.makedirs(OUTPUT_DIR, exist_ok=True)

def fetch_url(url):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req) as resp:
        return resp.read()

def download_file(url, target_path):
    if os.path.exists(target_path) and os.path.getsize(target_path) > 1000:
        return True
    try:
        data = fetch_url(url)
        with open(target_path, 'wb') as f:
            f.write(data)
        return True
    except Exception as e:
        print(f"Failed to download {url}: {e}")
        return False

def sanitize_filename(name):
    clean = re.sub(r'[^a-zA-Z0-9_-]', '-', name.lower())
    clean = re.sub(r'-+', '-', clean).strip('-')
    return clean

def main():
    print("=== Downloading Jumping Cliff Photos & Catalog ===")
    
    # 1. Fetch Homepage to get Logo & Banners
    home_html = fetch_url("https://jumpingcliff.com/").decode('utf-8', errors='ignore')
    
    brand_assets = []
    
    # Logo
    logo_match = re.search(r'https://jumpingcliff\.com/cdn/shop/files/Brand_Logo[^\s"\'<>]+', home_html)
    if logo_match:
        brand_assets.append(('brand-logo.jpg', logo_match.group(0).split('?')[0]))
    else:
        brand_assets.append(('brand-logo.jpg', 'https://jumpingcliff.com/cdn/shop/files/Brand_Logo.jpg'))
        
    # Hero / Banner Image
    banner_match = re.search(r'https?://jumpingcliff\.com/cdn/shop/files/jumping_cliff_uae[^\s"\'<>]+', home_html)
    if banner_match:
        brand_assets.append(('hero-banner.jpg', banner_match.group(0).split('?')[0]))
    else:
        brand_assets.append(('hero-banner.jpg', 'https://jumpingcliff.com/cdn/shop/files/jumping_cliff_uae.jpg'))

    # Extra homepage lifestyle photos
    lifestyle_matches = re.findall(r'https://jumpingcliff\.com/cdn/shop/files/[a-zA-Z0-9_-]+\.(?:jpg|png|webp)', home_html)
    for idx, img_url in enumerate(list(set(lifestyle_matches))[:12]):
        filename = f"lifestyle-{idx+1}.jpg" if img_url.endswith('.jpg') else f"lifestyle-{idx+1}.png"
        brand_assets.append((filename, img_url))
        
    print(f"Found {len(brand_assets)} brand/homepage assets. Downloading...")
    for filename, url in brand_assets:
        dest = os.path.join(OUTPUT_DIR, filename)
        if download_file(url, dest):
            print(f" ✓ Saved: {filename} ({os.path.getsize(dest)} bytes)")

    # 2. Fetch Product Sitemap
    sitemap_url = "https://jumpingcliff.com/sitemap_products_1.xml?from=10036501545244&to=10986893082908"
    sitemap_xml = fetch_url(sitemap_url)
    root = ET.fromstring(sitemap_xml)
    
    namespaces = {
        'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9',
        'image': 'http://www.google.com/schemas/sitemap-image/1.1'
    }

    products = []
    seen_images = set()

    for url_tag in root.findall('ns:url', namespaces):
        loc_tag = url_tag.find('ns:loc', namespaces)
        img_tag = url_tag.find('image:image', namespaces)
        
        if img_tag is not None:
            img_loc = img_tag.find('image:loc', namespaces)
            img_title = img_tag.find('image:title', namespaces)
            
            if img_loc is not None and img_loc.text:
                full_img_url = img_loc.text
                base_img_url = full_img_url.split('?')[0]
                title = img_title.text if img_title is not None and img_title.text else "Jumping Cliff Bag"
                page_url = loc_tag.text if loc_tag is not None else ""
                handle = page_url.split('/')[-1] if page_url else sanitize_filename(title)
                
                if base_img_url not in seen_images:
                    seen_images.add(base_img_url)
                    products.append({
                        'title': title,
                        'handle': handle,
                        'page_url': page_url,
                        'image_url': full_img_url,
                        'base_image_url': base_img_url
                    })

    print(f"\nFound {len(products)} products in sitemap. Downloading photos...")
    
    catalog_items = []
    for idx, prod in enumerate(products):
        ext = os.path.splitext(urlparse(prod['base_image_url']).path)[1] or '.jpg'
        clean_title = sanitize_filename(prod['title'])
        filename = f"{clean_title}-{idx+1}{ext}"
        dest = os.path.join(OUTPUT_DIR, filename)
        
        if download_file(prod['image_url'], dest):
            file_size = os.path.getsize(dest)
            local_path = f"/images/jumping-cliff/{filename}"
            print(f" ✓ [{idx+1}/{len(products)}] {prod['title']} -> {filename} ({file_size} bytes)")
            
            # Infer category and sensible price in AED / INR
            category = "Tote Bags"
            if "sling" in prod['title'].lower():
                category = "Slings"
            elif "crossbody" in prod['title'].lower():
                category = "Crossbody"
            elif "tote" in prod['title'].lower():
                category = "Totes"
                
            catalog_items.append({
                'id': f"prod-jc-{idx+1}",
                'name': prod['title'],
                'description': f"Premium lightweight {prod['title']} designed for everyday movement. Water-resistant, durable, and stylish.",
                'price': 149, # Sensible default price in AED / INR
                'unit': '1 Unit',
                'imageUrl': local_path,
                'cloudImageUrl': prod['image_url'],
                'category': category,
                'inStock': True
            })

    # Save Catalog JSON for easy import into KadaLink WhatsApp ordering store
    catalog_path = os.path.join(os.getcwd(), 'data', 'jumping-cliff-catalog.json')
    with open(catalog_path, 'w', encoding='utf-8') as f:
        json.dump(catalog_items, f, indent=2)
    print(f"\nSaved catalog metadata with {len(catalog_items)} items to: {catalog_path}")

    # Generate a pre-configured KadaLink Store preset
    jumping_cliff_store = {
        "id": "store-jumping-cliff",
        "slug": "jumping-cliff",
        "name": "Jumping Cliff",
        "tagline": "Lightweight Slings, Totes & Crossbody Bags Designed for Everyday Movement",
        "description": "UAE-born lifestyle brand designed for people on the move. Explore our bestselling lightweight, durable, and water-resistant bags. Direct 1-click WhatsApp ordering.",
        "whatsappNumber": "971501234567",
        "ownerEmail": "ckmuhammedsinan@gmail.com",
        "ownerName": "Jumping Cliff",
        "ownerAvatar": "/images/jumping-cliff/brand-logo.jpg",
        "templateId": "modern-minimal",
        "logoUrl": "/images/jumping-cliff/brand-logo.jpg",
        "bannerUrl": "/images/jumping-cliff/hero-banner.jpg",
        "deliverySettings": {
          "flatFee": 15,
          "freeAboveThreshold": 200,
          "deliveryNotes": "Express dispatch across UAE & GCC within 24-48 hours"
        },
        "products": catalog_items,
        "createdAt": "2026-11-27T10:00:00.000Z",
        "updatedAt": "2026-11-27T10:00:00.000Z"
    }

    store_preset_path = os.path.join(os.getcwd(), 'data', 'jumping-cliff-store.json')
    with open(store_preset_path, 'w', encoding='utf-8') as f:
        json.dump(jumping_cliff_store, f, indent=2)
    print(f"Saved complete KadaLink Store configuration to: {store_preset_path}")
    print("\n=== Done! All photos and metadata are downloaded and ready. ===")

if __name__ == '__main__':
    main()
