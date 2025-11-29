#!/usr/bin/env python3
"""
Convert CSV with Amazon products to curatedProducts format
"""
import csv
import re
import sys

def extract_asin_from_url(url):
    """Extract ASIN (product ID) from Amazon URL"""
    # Match patterns like /dp/B08GG42WXY or /dp/B08GG42WXY?
    match = re.search(r'/dp/([A-Z0-9]{10})', url)
    if match:
        return match.group(1)
    return None

def get_title_from_asin(asin):
    """Generate a simple title based on ASIN (we'll improve this later)"""
    return f"Leeslampje {asin}"

def parse_price(price_text):
    """Convert '11,95' to 11.95"""
    return float(price_text.replace(',', '.'))

csv_file = '/home/kevin/Gifteez website/gifteez overzicht/producten sheets/Nacht_leeslampjes_gifteez_amazon_products_template - Sheet1.csv'

print("    curatedProducts: [")

with open(csv_file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    products = list(reader)
    
    for i, row in enumerate(products):
        image_url = row['imageUrl'].strip()
        price_text = row['priceText'].strip()
        affiliate_url = row['affiliateUrl'].strip()
        
        # Skip empty rows
        if not image_url or not affiliate_url:
            continue
        
        asin = extract_asin_from_url(affiliate_url)
        if not asin:
            print(f"// Warning: Could not extract ASIN from: {affiliate_url[:50]}...", file=sys.stderr)
            continue
        
        price = parse_price(price_text)
        title = get_title_from_asin(asin)
        
        # Generate reason based on price
        if price < 13:
            reason = f"Budget optie voor €{price_text} - perfect voor kleine cadeaus"
        elif price < 20:
            reason = f"Populaire keuze voor €{price_text} - goede prijs-kwaliteit"
        elif price < 30:
            reason = f"Mid-range voor €{price_text} - uitstekende features"
        else:
            reason = f"Premium leeslamp voor €{price_text} - topkwaliteit"
        
        comma = "," if i < len(products) - 1 else ""
        
        print(f"      {{")
        print(f"        title: '{title}',")
        print(f"        price: {price},")
        print(f"        currency: 'EUR',")
        print(f"        image: '{image_url}',")
        print(f"        affiliateLink: '{affiliate_url}',")
        print(f"        merchant: 'Amazon',")
        print(f"        reason: '{reason}',")
        print(f"      }}{comma}")

print("    ],")
print(f"\n// Total products: {len(products)}")
