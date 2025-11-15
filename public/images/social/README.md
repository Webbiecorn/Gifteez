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
