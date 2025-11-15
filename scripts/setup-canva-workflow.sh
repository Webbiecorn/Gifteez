#!/bin/bash
# Setup Canva Pro workflow - Social media image structure
# Gifteez.nl - November 2025

set -e

echo "🎨 Setting up Canva Pro workflow structure..."
echo ""

# Base directory
BASE_DIR="public/images/social"

# Create main folders
mkdir -p "$BASE_DIR"/{pinterest,instagram,og,templates}

# Pinterest subfolders
mkdir -p "$BASE_DIR/pinterest"/{blog,deals,landings,collections,seasonal}

# Instagram subfolders
mkdir -p "$BASE_DIR/instagram"/{stories,carousel,posts}

# OG images subfolders
mkdir -p "$BASE_DIR/og"/{blog,landing,pages}

echo "✅ Folder structure created!"
echo ""

# Create README files with specs
cat > "$BASE_DIR/README.md" << 'EOF'
# Canva Pro → Gifteez Workflow

## 📁 Folder Structuur

### Pinterest (`/pinterest/`)
- **blog/** - Blog post pins (1000x1500px)
- **deals/** - Deal highlights (1000x1500px)
- **landings/** - Landing page pins (1000x1500px)
- **collections/** - Product collections (1000x1500px)
- **seasonal/** - Seizoensgebonden content (1000x1500px)

### Instagram (`/instagram/`)
- **stories/** - Instagram stories (1080x1920px)
- **carousel/** - Carousel slides (1080x1080px)
- **posts/** - Feed posts (1080x1080px)

### OG Images (`/og/`)
- **blog/** - Blog social sharing (1200x630px)
- **landing/** - Landing page sharing (1200x630px)
- **pages/** - Generic pages (1200x630px)

## 🎨 Naming Conventions

### Pinterest Blog Pins
`blog-{slug}.png`
Voorbeeld: `blog-beste-tech-cadeaus-2025.png`

### Pinterest Deal Pins
`deal-{category}-{month}.png`
Voorbeeld: `deal-tech-november.png`

### OG Images
`{slug}.jpg`
Voorbeeld: `beste-tech-cadeaus-2025.jpg`

## 📐 Canva Template Specs

### Pinterest Pin Template (1000x1500px)
- **Title area**: Top 200px, centered
- **Main image**: Center 800x800px
- **Brand footer**: Bottom 200px (logo + gifteez.nl)
- **Margins**: 60px all sides
- **Font sizes**: Title 72-84px, Body 36-48px

### Instagram Story (1080x1920px)
- **Safe zone**: 1080x1420px (middle section)
- **Top margin**: 250px (profile icon space)
- **Bottom margin**: 250px (swipe up space)

### OG Image (1200x630px)
- **Title area**: Center-left 700x630px
- **Visual area**: Right 500x630px
- **Text size**: 48-64px bold

## 🎨 Brand Guidelines

### Kleuren (Gifteez)
- **Primary Purple**: `#7C3AED` / `rgb(124, 58, 237)`
- **Primary Blue**: `#2563EB` / `rgb(37, 99, 235)`
- **Accent Green**: `#10B981` / `rgb(16, 185, 129)`
- **Background**: `#F9FAFB` / `rgb(249, 250, 251)`
- **Text Dark**: `#1F2937` / `rgb(31, 41, 55)`

### Fonts
- **Headings**: Inter Bold / Poppins Bold
- **Body**: Inter Regular / System Sans

### Logo
Upload logo naar Canva Brand Kit:
- `/public/icons/icon-192.png` (voor kleine gebruik)
- Transparante achtergrond versie maken

## 🚀 Workflow

1. **Design in Canva Pro**
   - Gebruik Brand Kit voor consistency
   - Gebruik templates voor snelheid
   - Check text readability op mobiel

2. **Export Settings**
   - Format: PNG (voor transparancy) of JPG (kleinere filesize)
   - Quality: Highest
   - Size: Exact dimensions (zie specs)

3. **File Naming**
   - Lowercase
   - Kebab-case (dashes, geen spaties)
   - Descriptieve naam die matcht met content

4. **Deploy**
   - Drop files in juiste subfolder
   - Commit & push naar git
   - Vite build pakt automatisch op

## 📊 Image Optimization

Na export kun je optioneel optimaliseren:
```bash
# Run image optimizer (als beschikbaar)
npm run optimize:images

# Of handmatig met tools zoals:
# - TinyPNG.com (online)
# - Squoosh.app (online)
# - ImageOptim (Mac)
```

## 🔗 Automatische Usage

De site gebruikt deze images automatisch:

### Blog Posts
```typescript
// Meta tags in blog post
<meta property="og:image" content={`/images/og/blog/${slug}.jpg`} />
<meta property="pinterest:description" content={excerpt} />
```

### Landing Pages
```typescript
// Social meta
<meta property="og:image" content={`/images/og/landing/${slug}.jpg`} />
```

### Pinterest Rich Pins
Automatisch via RSS feed + Rich Pin metadata
EOF

echo "📝 README created: $BASE_DIR/README.md"
echo ""

# Create Pinterest template guide
cat > "$BASE_DIR/pinterest/TEMPLATES.md" << 'EOF'
# Pinterest Template Guide

## 🎯 Template Priority

### 1. Blog Post Pin (HOOGSTE PRIORITEIT)
**Bestandsnaam**: `blog-{slug}.png`
**Afmetingen**: 1000x1500px (2:3 ratio)
**Gebruik**: Automatisch gelinkt in RSS feed voor Pinterest

**Elementen**:
- 📸 Hero image (product foto of themed visual) - 800x800px center
- 📰 Blog titel - Top 200px, wit op kleur of overlay
- 🏷️ "GIFTEEZ.NL" branding - Bottom footer
- 🎨 Category badge - Top-left corner
- ✨ Trust element - "Zorgvuldig getest" of "Expert gekozen"

**Voorbeeld teksten**:
- "25 Beste Tech Cadeaus 2025 🎁"
- "Duurzame Cadeaus die Impact Maken 🌱"
- "Smart Home Gifts onder €100 💡"

---

### 2. Product Collection Pin
**Bestandsnaam**: `collection-{category}-{maand}.png`
**Afmetingen**: 1000x1500px

**Elementen**:
- 🖼️ Grid van 4-6 producten (2 columns, 2-3 rows)
- 📋 Titel: "Top [Category] Cadeaus"
- 💰 Prijs ranges tonen
- 🏷️ CTA: "Ontdek meer op Gifteez.nl"

---

### 3. Deal Highlight Pin
**Bestandsnaam**: `deal-{merchant}-{maand}.png`
**Afmetingen**: 1000x1500px

**Elementen**:
- 🔥 "DEAL ALERT" badge
- 📦 Product image (groot, center)
- 💸 Oude prijs doorgestreept → Nieuwe prijs
- ⏰ Urgentie: "Beperkte tijd"
- 🛒 CTA button design

---

### 4. Seasonal/Occasion Pin
**Bestandsnaam**: `seasonal-{occasion}.png`
**Voorbeelden**: 
- `seasonal-kerst-2025.png`
- `seasonal-moederdag.png`
- `seasonal-sinterklaas.png`

**Elementen**:
- 🎄 Seasonal theming (colors, icons)
- 📅 Timing: "Kerst 2025 Cadeaugids"
- 🎁 Gift suggestions preview (3-4 items)
- ✨ Mood/lifestyle imagery

---

## 🎨 Design Tips

### Kleuren
- **High contrast** voor Pinterest feed visibility
- **Brand colors** voor herkenbaarheid
- **White space** voor readability

### Typography
- **Bold headlines** (72-84px)
- **Clear subheadings** (36-48px)
- **Max 2-3 fonts** total

### Images
- **High quality** product photos
- **Lifestyle context** waar mogelijk
- **No blurry/pixelated** images

### CTA's
- "Ontdek meer ➜"
- "Shop nu 🛍️"
- "Bekijk gids 📖"
- "Lees verder ✨"

---

## 📱 Mobile Preview
Altijd checken hoe pins er uitzien in:
- Pinterest feed (small thumbnail)
- Expanded view (full size)
- Mobile app vs desktop

Test URL: https://www.pinterest.com/pin-builder/

---

## 🚀 Batch Creation Tips

1. **Master template maken** in Canva
2. **Dupliceren** per blog/category
3. **Swap images** & text content
4. **Export all** in één keer
5. **Rename** volgens convention
6. **Drop** in juiste folder

---

## 📊 Performance Tracking

Monitor welke pins het beste presteren:
- Click-through rate (Pinterest Analytics)
- Saves/Repins
- Traffic naar gifteez.nl (GA4)

Itereer op succesvolle formats!
EOF

echo "📌 Pinterest templates guide created"
echo ""

# Create Instagram guide
cat > "$BASE_DIR/instagram/GUIDE.md" << 'EOF'
# Instagram Content Guide

## 📱 Format Specs

### Stories (1080x1920px)
- **Safe zone**: 1080x1420px (middle)
- **Top margin**: 250px
- **Bottom margin**: 250px
- **Interactieve elementen**: Polls, questions, link stickers

### Carousel (1080x1080px)
- **Slides**: 2-10 per carousel
- **Consistent design**: Alle slides same template
- **Storytelling**: Begin → middle → end/CTA

### Feed Posts (1080x1080px)
- **Single image** of eerste carousel slide
- **High quality**: No compression artifacts
- **Branding**: Subtiel, not overwhelming

---

## 🎯 Content Types

### Gift Guides
- Carousel: 1 product per slide
- Slide 1: Cover met "Gift Guide: [Theme]"
- Slides 2-8: Individual products met specs
- Slide 9: "Meer op Gifteez.nl + Link in Bio"

### Quick Tips
- Story format
- "5 Tips voor het Perfecte Cadeau"
- Swipe through tips
- Final slide: CTA naar site

### Behind the Scenes
- Testing products
- Team favorites
- Process shots

---

## 🎨 Instagram Best Practices

- **Consistency**: Post 3-5x per week
- **Hashtags**: 5-10 relevante (in caption of comment)
- **Engagement**: Reageer binnen 1 uur
- **Stories**: Daily updates, polls, Q&A

Relevante hashtags:
- #cadeautips #cadeauinspiratie #cadeau2025
- #giftsforher #giftsforhim #giftguide
- #techgadgets #sustainablegifts
- #nederland #cadeaushop #sinterklaas #kerst
EOF

echo "📸 Instagram guide created"
echo ""

# Create a placeholder/default image reference file
cat > "$BASE_DIR/templates/DEFAULTS.md" << 'EOF'
# Default Fallback Images

Als er geen custom image bestaat, gebruik deze defaults:

## Pinterest Defaults
- `default-blog.png` - Generic blog pin met Gifteez branding
- `default-deal.png` - Generic deal highlight
- `default-collection.png` - Generic collection overview

## OG Defaults
- `default-og.jpg` - Gifteez logo + tagline (1200x630px)

## Aanmaken
1. Open Canva
2. Gebruik brand colors + logo
3. Generic text: "Vind het perfecte cadeau op Gifteez.nl"
4. Export & plaats in `/templates/` folder
5. Copy naar subfolders als fallback
EOF

echo "📋 Defaults reference created"
echo ""

# Summary
echo ""
echo "🎉 Canva workflow setup complete!"
echo ""
echo "📁 Created structure:"
echo "   $BASE_DIR/"
echo "   ├── pinterest/"
echo "   │   ├── blog/"
echo "   │   ├── deals/"
echo "   │   ├── landings/"
echo "   │   ├── collections/"
echo "   │   └── seasonal/"
echo "   ├── instagram/"
echo "   │   ├── stories/"
echo "   │   ├── carousel/"
echo "   │   └── posts/"
echo "   ├── og/"
echo "   │   ├── blog/"
echo "   │   ├── landing/"
echo "   │   └── pages/"
echo "   └── templates/"
echo ""
echo "📖 Read the guides:"
echo "   → $BASE_DIR/README.md (overview)"
echo "   → $BASE_DIR/pinterest/TEMPLATES.md (Pinterest specs)"
echo "   → $BASE_DIR/instagram/GUIDE.md (Instagram specs)"
echo ""
echo "🎨 Next steps:"
echo "   1. Open Canva Pro"
echo "   2. Setup Brand Kit met Gifteez kleuren & logo"
echo "   3. Maak je eerste Pinterest template (blog pin)"
echo "   4. Export → drop in public/images/social/pinterest/blog/"
echo "   5. Deploy en test!"
echo ""
echo "✨ Happy designing!"
