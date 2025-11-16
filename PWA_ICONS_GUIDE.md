# PWA Icons Generation Guide

## Overzicht

Voor de Gifteez PWA moeten 12 verschillende icon varianten gegenereerd worden. Deze guide beschrijft welke icons nodig zijn en hoe je ze kunt maken.

## Benodigde Icons

### 1. Standard App Icons (10 stuks)

Deze icons worden gebruikt op verschillende devices en platforms:

| Size    | Filename                    | Purpose                   |
| ------- | --------------------------- | ------------------------- |
| 72x72   | `icon-72x72.png`            | Android legacy            |
| 96x96   | `icon-96x96.png`            | Android legacy            |
| 128x128 | `icon-128x128.png`          | Chrome Web Store          |
| 144x144 | `icon-144x144.png`          | Windows tablets           |
| 152x152 | `icon-152x152.png`          | iPad                      |
| 192x192 | `icon-192x192.png`          | Android Chrome (standard) |
| 384x384 | `icon-384x384.png`          | Android Chrome (high res) |
| 512x512 | `icon-512x512.png`          | Splash screens (standard) |
| 512x512 | `icon-512x512-maskable.png` | Maskable (adaptive icon)  |
| 192x192 | `icon-192x192-maskable.png` | Maskable (small)          |

### 2. Shortcut Icons (4 stuks)

Voor de app shortcuts in manifest.json:

| Size  | Filename                   | Purpose              |
| ----- | -------------------------- | -------------------- |
| 96x96 | `shortcut-gift-finder.png` | Gift Finder shortcut |
| 96x96 | `shortcut-deals.png`       | Deals shortcut       |
| 96x96 | `shortcut-favorites.png`   | Favorieten shortcut  |
| 96x96 | `shortcut-blog.png`        | Blog shortcut        |

## Design Specificaties

### Kleuren

- **Primary**: `#9333ea` (Purple - Gifteez brand kleur)
- **Background**: `#faf5ff` (Light purple)
- **Accent**: `#7c3aed` (Dark purple voor gradiënten)

### Logo/Icon Design

Het icon moet het Gifteez logo bevatten met:

- Herkenbare mascotte/geschenkverpakking symboliek
- Duidelijk leesbaar op kleine formaten (72x72)
- Voldoende contrast met achtergrond

### Standard Icons (niet-maskable)

- **Safe zone**: Volledig canvas kan gebruikt worden
- **Achtergrond**: Gebruik gradient van `#9333ea` naar `#7c3aed`
- **Logo**: Centraal geplaatst, wit of light purple
- **Padding**: 10-15% ruimte rondom het logo

### Maskable Icons

Maskable icons moeten voldoen aan Android's adaptive icon specificaties:

- **Safe zone**: Centraal cirkel met diameter 80% van canvas (40% radius vanaf center)
- **Bleed area**: 20% rondom safe zone (kan afgesneden worden)
- **Logo**: Moet volledig binnen safe zone blijven
- **Achtergrond**: Moet volledig canvas bedekken (inclusief bleed area)

## Generatie Opties

### Optie 1: Online Tool (Snelst)

1. Gebruik [PWA Asset Generator](https://www.pwabuilder.com/)
2. Upload een high-res source image (minimaal 512x512)
3. Configureer:
   - Achtergrondkleur: `#9333ea`
   - Padding: 10%
   - Genereer maskable variants
4. Download alle formaten

### Optie 2: Figma/Adobe Illustrator

1. Maak een 512x512 canvas
2. Design het icon volgens specificaties
3. Export naar alle benodigde formaten
4. Voor maskable variants: voeg extra bleed area toe

### Optie 3: ImageMagick Script

Als je al een source image hebt (bijv. `gifteez-icon-source.png`):

```bash
#!/bin/bash

# Standard icons
convert gifteez-icon-source.png -resize 72x72 public/icons/icon-72x72.png
convert gifteez-icon-source.png -resize 96x96 public/icons/icon-96x96.png
convert gifteez-icon-source.png -resize 128x128 public/icons/icon-128x128.png
convert gifteez-icon-source.png -resize 144x144 public/icons/icon-144x144.png
convert gifteez-icon-source.png -resize 152x152 public/icons/icon-152x152.png
convert gifteez-icon-source.png -resize 192x192 public/icons/icon-192x192.png
convert gifteez-icon-source.png -resize 384x384 public/icons/icon-384x384.png
convert gifteez-icon-source.png -resize 512x512 public/icons/icon-512x512.png

# Maskable icons (with extra padding for safe zone)
convert gifteez-icon-source.png -resize 400x400 -background "#9333ea" \
  -gravity center -extent 512x512 public/icons/icon-512x512-maskable.png
convert gifteez-icon-source.png -resize 154x154 -background "#9333ea" \
  -gravity center -extent 192x192 public/icons/icon-192x192-maskable.png

# Shortcut icons (with custom emoji/icons for each)
# Deze moeten handmatig gemaakt worden met unieke symbolen
```

## Bestands Locatie

Alle icons moeten in `/public/icons/` geplaatst worden:

```
public/
└── icons/
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png
    ├── icon-152x152.png
    ├── icon-192x192.png
    ├── icon-192x192-maskable.png
    ├── icon-384x384.png
    ├── icon-512x512.png
    ├── icon-512x512-maskable.png
    ├── shortcut-gift-finder.png
    ├── shortcut-deals.png
    ├── shortcut-favorites.png
    └── shortcut-blog.png
```

## Validatie

### Browser DevTools

1. Open Chrome DevTools (F12)
2. Ga naar Application tab
3. Klik op "Manifest" in sidebar
4. Check of alle icons correct laden
5. Test "Install app" functionaliteit

### Lighthouse PWA Audit

```bash
npm run build
npx serve dist
# Open Chrome DevTools → Lighthouse → PWA audit
# Target score: 90+ (100 is perfect)
```

### Maskable Icon Test

1. Bezoek [Maskable.app](https://maskable.app)
2. Upload de maskable icon variants
3. Test met verschillende masker shapes
4. Verifieer dat logo binnen safe zone blijft

## Referenties

- [Web App Manifest Specification](https://www.w3.org/TR/appmanifest/)
- [Maskable Icons Spec](https://web.dev/maskable-icon/)
- [PWA Icon Generator](https://www.pwabuilder.com/)
- [Adaptive Icons Guide](https://medium.com/google-design/designing-adaptive-icons-515af294c783)

## Huidige Status

✅ Manifest.json gereed (verwijst naar alle icons)  
⏳ Icons nog niet gegenereerd  
⏳ Source image nodig (Gifteez logo high-res)

## Volgende Stappen

1. Bepaal of er al een high-res Gifteez logo bestaat in `/public/images/`
2. Zo ja: gebruik dat als source voor icon generatie
3. Zo nee: design een simpel icon met gift/mascotte symbool
4. Genereer alle 14 icon variants
5. Test in browser met DevTools
6. Run Lighthouse PWA audit
