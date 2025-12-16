# 🎁 Gifteez.nl - Complete Design Specification

> **Voor AI Agents**: Dit document bevat alle visuele specs om Gifteez.nl na te bouwen.

## Brand Identity

**Website**: https://gifteez.nl  
**Type**: Nederlandse cadeaugids website  
**Stack**: React + TypeScript + Tailwind CSS + Vite

---

## 🎨 Kleurenpalet

### Primary Colors (Crimson/Rose)

```css
--primary-50: #fef2f2; /* Zeer licht - backgrounds */
--primary-100: #fee2e2;
--primary-200: #fecaca;
--primary-300: #fca5a5;
--primary-400: #f87171;
--primary-500: #ef4444;
--primary-600: #dc2626; /* Default */
--primary-700: #b91c1c;
--primary-800: #991b1b;
--primary-900: #7f1d1d; /* Headings/text */
--primary-950: #450a0a; /* Zeer donker */
```

### Accent Colors (Vibrant Rose - CTAs)

```css
--accent: #f43f5e; /* Primaire CTA kleur */
--accent-hover: #e11d48; /* Hover state */
--accent-light: #fb7185;
--accent-dark: #be123c;
```

### Secondary Colors (Warm Peach - Backgrounds)

```css
--secondary-50: #fffbf5;
--secondary-100: #fff7ed; /* Default achtergrond */
--secondary-200: #fef3e2;
--secondary-300: #fde8c8;
--secondary-400: #fcd9a6;
```

### Highlight Colors (Amber - Badges)

```css
--highlight: #fb923c;
--highlight-light: #fdba74;
--highlight-dark: #ea580c;
```

### Semantic Colors

```css
/* Success */
--success: #10b981;
--success-bg: #d1fae5;

/* Error */
--error: #ef4444;
--error-bg: #fee2e2;

/* Warning */
--warning: #f59e0b;
--warning-bg: #fef3c7;

/* Info */
--info: #3b82f6;
--info-bg: #dbeafe;
```

### Muted Backgrounds

```css
--muted-rose: #ffe4e6;
--muted-purple: #f3e8ff;
--muted-blue: #dbeafe;
--muted-green: #d1fae5;
--muted-yellow: #fef3c7;
```

### Neutrals (Text & UI)

```css
--neutral-50: #fafafa;
--neutral-100: #f5f5f5;
--neutral-200: #e5e5e5;
--neutral-300: #d4d4d4;
--neutral-400: #a3a3a3;
--neutral-500: #737373;
--neutral-600: #525252;
--neutral-700: #404040;
--neutral-800: #262626;
--neutral-900: #171717;
```

### Page Background

```css
--light-bg: #fff4f7; /* Zacht roze achtergrond */
```

---

## 📝 Typografie

### Font Families

```css
/* Headings */
font-family: 'Poppins', sans-serif;
font-weight: 700;

/* Body text */
font-family: 'Open Sans', sans-serif;
font-weight: 400;

/* UI elements */
font-family: 'Inter', 'Open Sans', sans-serif;
```

### Font Sizes (Responsive)

```css
/* Headings */
--text-h1: clamp(2rem, 5vw, 3.5rem); /* 32-56px */
--text-h2: clamp(1.75rem, 4vw, 2.5rem); /* 28-40px */
--text-h3: clamp(1.5rem, 3vw, 2rem); /* 24-32px */
--text-h4: clamp(1.25rem, 2.5vw, 1.5rem); /* 20-24px */
--text-h5: clamp(1.125rem, 2vw, 1.25rem); /* 18-20px */

/* Body */
--text-lead: 1.25rem; /* 20px - intro paragraphs */
--text-body: 1rem; /* 16px - regular text */
--text-small: 0.875rem; /* 14px - captions */
--text-micro: 0.75rem; /* 12px - labels */
```

### Line Heights

```css
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

---

## 📐 Spacing & Layout

### Spacing Scale (rem)

```css
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem; /* 8px */
--space-3: 0.75rem; /* 12px */
--space-4: 1rem; /* 16px */
--space-5: 1.25rem; /* 20px */
--space-6: 1.5rem; /* 24px */
--space-8: 2rem; /* 32px */
--space-10: 2.5rem; /* 40px */
--space-12: 3rem; /* 48px */
--space-16: 4rem; /* 64px */
--space-20: 5rem; /* 80px */
--space-24: 6rem; /* 96px */
```

### Container Widths

```css
--container-xs: 480px;
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1440px;
```

### Container Padding

```css
/* Mobile */
padding: 1rem;
/* SM */
padding: 1.25rem;
/* MD */
padding: 1.5rem;
/* LG+ */
padding: 2rem;
```

---

## 🔲 Border Radius

```css
--radius-none: 0;
--radius-sm: 0.25rem; /* 4px - kleine elementen */
--radius: 0.5rem; /* 8px - default */
--radius-md: 0.75rem; /* 12px */
--radius-lg: 1rem; /* 16px - cards */
--radius-xl: 1.25rem; /* 20px */
--radius-2xl: 1.5rem; /* 24px - hero sections */
--radius-3xl: 2rem; /* 32px */
--radius-full: 9999px; /* Pills/badges */
```

---

## 🌑 Shadows (Elevation)

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

/* Glow effects voor CTAs */
--shadow-glow: 0 0 20px rgba(244, 63, 94, 0.3);
--shadow-glow-lg: 0 0 40px rgba(244, 63, 94, 0.4);
```

---

## 📚 Z-Index Layers

```css
--z-base: 10; /* Basis elementen */
--z-dropdown: 70; /* Dropdowns */
--z-sticky: 80; /* Sticky headers */
--z-modal: 50; /* Modals */
--z-tooltip: 60; /* Tooltips */
--z-cookie: 90; /* Cookie banners */
--z-top: 100; /* Hoogste laag */
```

---

## 🔘 Button Componenten

### Variants

| Variant     | Achtergrond      | Tekst     | Gebruik             |
| ----------- | ---------------- | --------- | ------------------- |
| `primary`   | `#dc2626`        | wit       | Hoofdacties         |
| `accent`    | `#f43f5e` + glow | wit       | CTAs                |
| `secondary` | `#fff7ed`        | `#7f1d1d` | Secundaire acties   |
| `ghost`     | transparent      | `#7f1d1d` | Tertiaire acties    |
| `success`   | `#10b981`        | wit       | Bevestigingen       |
| `error`     | `#ef4444`        | wit       | Destructieve acties |

### Sizes

| Size | Height | Padding   | Font Size |
| ---- | ------ | --------- | --------- |
| `sm` | 36px   | 12px 16px | 14px      |
| `md` | 44px   | 12px 20px | 16px      |
| `lg` | 52px   | 14px 24px | 18px      |
| `xl` | 60px   | 16px 32px | 20px      |

### States

```css
/* Hover */
transform: translateY(-1px);
box-shadow: var(--shadow-md);

/* Active */
transform: translateY(0);

/* Disabled */
opacity: 0.5;
cursor: not-allowed;

/* Focus */
outline: 2px solid var(--accent);
outline-offset: 2px;
```

---

## 🏷️ Badge Componenten

### Variants

| Variant   | Achtergrond | Tekst     |
| --------- | ----------- | --------- |
| `default` | `#f5f5f5`   | `#525252` |
| `primary` | `#fee2e2`   | `#991b1b` |
| `success` | `#d1fae5`   | `#059669` |
| `error`   | `#fee2e2`   | `#dc2626` |
| `warning` | `#fef3c7`   | `#d97706` |
| `info`    | `#dbeafe`   | `#2563eb` |

### Sizes

```css
/* sm */
padding: 2px 8px;
font-size: 12px;
/* md */
padding: 4px 10px;
font-size: 14px;
/* lg */
padding: 6px 12px;
font-size: 16px;
```

---

## 🃏 Card Componenten

### Base Card

```css
background: white;
border-radius: 16px;
border: 1px solid #e5e5e5;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
padding: 24px;
```

### Card Variants

| Variant       | Extra Styling                                      |
| ------------- | -------------------------------------------------- |
| `default`     | Basis styling                                      |
| `elevated`    | `shadow-md`, hover: `shadow-lg`                    |
| `bordered`    | `border-width: 2px`                                |
| `interactive` | Clickable, `cursor: pointer`, hover: `scale(1.02)` |
| `accent`      | Accent achtergrond + glow                          |

---

## 🎭 Animaties

### Fade In

```css
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
animation: fade-in 0.3s ease-out;
```

### Fade In Up

```css
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
animation: fade-in-up 0.4s ease-out;
```

### Bounce Gentle (Mascot)

```css
@keyframes bounce-gentle {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}
animation: bounce-gentle 2s ease-in-out infinite;
```

### Hover Scale

```css
transition: transform 0.2s ease;
&:hover {
  transform: scale(1.02);
}
```

---

## 📱 Breakpoints

```css
--breakpoint-xs: 480px;
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1440px;
--breakpoint-3xl: 1680px;
```

---

## 🏠 Pagina Structuur

### Header

- **Hoogte**: 64-80px
- **Achtergrond**: Wit of transparent
- **Logo**: Links
- **Navigatie**: Midden (desktop) of hamburger (mobile)
- **CTAs**: Rechts (AI Coach, Favorieten)

### Hero Section

- **Achtergrond**: Gradient van `--secondary-100` naar wit
- **Padding**: 80-120px verticaal
- **Max-width**: 1280px gecentreerd

### Footer

- **Achtergrond**: `--primary-900` (donker)
- **Tekst**: Wit
- **Padding**: 48-64px verticaal
- **Kolommen**: 4 (Gidsen, Over, Legal, Social)

---

## 🖼️ Afbeeldingen

### Product Cards

- **Formaat**: 1:1 (vierkant)
- **Border-radius**: 12px
- **Object-fit**: contain
- **Achtergrond**: wit

### Hero Images

- **Formaat**: 16:9 of 3:2
- **Border-radius**: 24px
- **Object-fit**: cover

### Blog Headers

- **Formaat**: 1200x630 (OG standaard)
- **Border-radius**: 24px

---

## 🎯 Belangrijke UI Patronen

### Product Card

```
┌─────────────────────────┐
│  [Product Image 1:1]    │
│                         │
├─────────────────────────┤
│ ⭐⭐⭐⭐⭐ 4.8           │  ← Rating
│ Product Naam            │  ← Titel (Poppins Bold)
│ Korte beschrijving...   │  ← Subtitel (grijs)
├─────────────────────────┤
│ €49,99        [Shop →]  │  ← Prijs + CTA
└─────────────────────────┘
```

### Filter Pills

```
[ Alle ] [ 🎄 Kerst ] [ 💝 Voor haar ] [ 💰 Onder €50 ]
   ↑           ↑
 Active     Inactive
 (accent)   (muted bg)
```

### Price Display

```css
font-family: 'Poppins', sans-serif;
font-weight: 700;
font-size: 1.5rem;
color: var(--primary-900);
```

---

## 🔗 Belangrijke URL Structuur

```
/                           → Homepage
/cadeaugidsen               → Alle gidsen overzicht
/cadeaugidsen/{slug}        → Specifieke cadeaugids
/blog                       → Blog overzicht
/blog/{slug}                → Blog artikel
/gift-finder                → AI Gift Finder
/over-ons                   → Over Gifteez
/contact                    → Contact pagina
```

---

## 📦 Tech Stack

- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS v3
- **Build**: Vite
- **Hosting**: Firebase Hosting
- **Fonts**: Google Fonts (Poppins, Open Sans, Inter)
- **Icons**: Lucide React

---

## 🎨 Canva/Figma Export Kleuren

Voor design tools, gebruik deze HEX codes:

| Naam       | HEX       | RGB           |
| ---------- | --------- | ------------- |
| Primary    | `#7f1d1d` | 127, 29, 29   |
| Accent     | `#f43f5e` | 244, 63, 94   |
| Background | `#fff4f7` | 255, 244, 247 |
| Success    | `#10b981` | 16, 185, 129  |
| Warning    | `#f59e0b` | 245, 158, 11  |
| Error      | `#ef4444` | 239, 68, 68   |

---

_Gegenereerd op: December 2025_  
_Website: https://gifteez.nl_
