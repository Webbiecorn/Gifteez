# 📌 Gifteez Pinterest Pin Style Guide

## Brand Kleuren

| Naam             | HEX       | Gebruik                            |
| ---------------- | --------- | ---------------------------------- |
| **Primary Rose** | `#e11d48` | CTA buttons, accenten, prijsbadges |
| **Rose Light**   | `#fecdd3` | Achtergronden, highlights          |
| **Rose Dark**    | `#be123c` | Hover states                       |
| **Wit**          | `#ffffff` | Tekst op donkere achtergrond       |
| **Grijs Dark**   | `#1f2937` | Hoofdtekst                         |
| **Grijs Light**  | `#f3f4f6` | Achtergronden                      |

---

## Typografie

### Fonts (Canva)

- **Titel**: Montserrat Bold of Poppins Bold
- **Subtitel**: Montserrat Medium of Poppins Medium
- **Body**: Inter Regular of Open Sans Regular

### Grootte richtlijnen (1000x1500 canvas)

| Element     | Grootte |
| ----------- | ------- |
| Grote titel | 72-96px |
| Subtitel    | 36-48px |
| Body tekst  | 24-32px |
| Prijsbadge  | 48-60px |
| CTA tekst   | 28-36px |

---

## Template 1: Product Pin 🛍️

**Formaat**: 1000 x 1500 px  
**Bestandsnaam**: `gifteez-product-pin-template.canva`

### Layout

```
┌──────────────────────────────────────┐
│                                      │
│         ┌──────────────────┐         │
│         │                  │         │
│         │   PRODUCT        │         │  ← 600x600px
│         │   IMAGE          │         │    afgeronde hoeken 20px
│         │                  │         │
│         └──────────────────┘         │
│                                      │
│  ┌──────────────────────────────┐    │
│  │ 🏠 {title}                   │    │  ← Emoji + titel
│  │                              │    │    Montserrat Bold 48px
│  │ {subtitle}                   │    │    Inter 28px, grijs
│  └──────────────────────────────┘    │
│                                      │
│         ┌──────────────┐             │
│         │  💰 {price}  │             │  ← Prijsbadge
│         └──────────────┘             │    Rose achtergrond
│                                      │    Wit tekst 48px
│                                      │
│  ────────────────────────────────    │  ← Dunne lijn
│                                      │
│  [Gifteez Logo]   Bekijk op Gifteez →│  ← Footer
│                                      │
└──────────────────────────────────────┘
```

### Canva Bulk Create Velden

| Veld in CSV | Canva Element      |
| ----------- | ------------------ |
| `title`     | Titel tekstveld    |
| `subtitle`  | Subtitel tekstveld |
| `price`     | Prijsbadge tekst   |
| `image_url` | Productafbeelding  |

### Kleuren voor dit template

- **Achtergrond**: `#ffffff` (wit) of `#fef2f2` (rose-50)
- **Titel**: `#1f2937` (grijs-800)
- **Subtitel**: `#6b7280` (grijs-500)
- **Prijsbadge BG**: `#e11d48` (primary rose)
- **Prijsbadge tekst**: `#ffffff` (wit)
- **CTA**: `#e11d48` (primary rose)

---

## Template 2: Gids Overview Pin 📋

**Formaat**: 1000 x 1500 px  
**Bestandsnaam**: `gifteez-gids-overview-template.canva`

### Layout

```
┌──────────────────────────────────────┐
│                                      │
│           🏠 20 CADEAUS              │  ← Emoji + nummer
│              VOOR                    │    Montserrat Bold 72px
│          THUISWERKERS                │
│                                      │
│         Complete gids 2025           │  ← Subtitel
│       Van budget tot premium         │    Inter 32px
│                                      │
│  ┌────────┐  ┌────────┐  ┌────────┐  │
│  │  IMG   │  │  IMG   │  │  IMG   │  │  ← Product grid
│  │   1    │  │   2    │  │   3    │  │    3 of 6 kleine
│  └────────┘  └────────┘  └────────┘  │    productfotos
│  ┌────────┐  ┌────────┐  ┌────────┐  │
│  │  IMG   │  │  IMG   │  │  IMG   │  │
│  │   4    │  │   5    │  │   6    │  │
│  └────────┘  └────────┘  └────────┘  │
│                                      │
│       ┌─────────────────────┐        │
│       │  Bekijk de gids →   │        │  ← CTA button
│       └─────────────────────┘        │    Rose achtergrond
│                                      │
│           [Gifteez Logo]             │
│                                      │
└──────────────────────────────────────┘
```

### Canva Bulk Create Velden

| Veld in CSV | Canva Element                        |
| ----------- | ------------------------------------ |
| `title`     | Grote titel ("20 Slimme Cadeaus...") |
| `subtitle`  | "Complete gids 2025..."              |

### Kleuren

- **Achtergrond**: Gradient `#fecdd3` → `#ffffff` (rose light naar wit)
- **Titel**: `#1f2937`
- **CTA button**: `#e11d48` met witte tekst

---

## Template 3: Vraag Pin ❓

**Formaat**: 1000 x 1500 px  
**Bestandsnaam**: `gifteez-vraag-pin-template.canva`

### Layout

```
┌──────────────────────────────────────┐
│                                      │
│                                      │
│                                      │
│                                      │
│       Op zoek naar het               │  ← Vraag
│       perfecte cadeau?               │    Montserrat Bold 64px
│                                      │
│                                      │
│         Voor thuiswerkers?           │  ← Subtitel
│                                      │    Inter 40px, grijs
│                                      │
│                                      │
│         ┌──────────────────┐         │
│         │ Ontdek 20+       │         │  ← CTA button groot
│         │ ideeën →         │         │    Rose achtergrond
│         └──────────────────┘         │    Wit tekst
│                                      │
│                                      │
│           [Gifteez Logo]             │
│                                      │
└──────────────────────────────────────┘
```

### Kleuren

- **Achtergrond**: `#1f2937` (donkergrijs) of `#e11d48` (rose)
- **Tekst**: `#ffffff` (wit)
- **CTA button**: `#ffffff` met `#e11d48` tekst (contrast)

---

## Template 4: Persona Pin 👤

**Formaat**: 1000 x 1500 px  
**Bestandsnaam**: `gifteez-persona-pin-template.canva`

### Layout

```
┌──────────────────────────────────────┐
│                                      │
│           ┌──────────┐               │
│           │    👤    │               │  ← Persona icoon
│           │          │               │    of illustratie
│           └──────────┘               │
│                                      │
│         De Productiviteit-           │  ← Persona label
│              Freak                   │    Montserrat Bold 56px
│                                      │
│    ┌──────────────────────────┐      │
│    │ Wil alles optimaliseren: │      │
│    │ tweede scherm, snelle    │      │  ← Summary
│    │ muis, goede koptelefoon. │      │    Inter 28px
│    │ Zoekt gadgets die werk   │      │    In box met border
│    │ efficiënter maken.       │      │
│    └──────────────────────────┘      │
│                                      │
│         ┌──────────────────┐         │
│         │ Bekijk           │         │  ← CTA
│         │ aanbevelingen →  │         │
│         └──────────────────┘         │
│                                      │
│           [Gifteez Logo]             │
│                                      │
└──────────────────────────────────────┘
```

### Canva Bulk Create Velden

| Veld in CSV | Canva Element                             |
| ----------- | ----------------------------------------- |
| `title`     | Persona label ("De Productiviteit-Freak") |
| `subtitle`  | Summary tekst                             |

### Persona Iconen

| Persona              | Emoji/Icoon |
| -------------------- | ----------- |
| Productiviteit-Freak | 🚀 of ⚡    |
| Comfort-Zoeker       | 🛋️ of 💆    |
| Sfeer-Creator        | 🌿 of ✨    |

---

## Gifteez Logo Gebruik

### Logo Placement

- **Positie**: Onderaan gecentreerd of linksonder
- **Marge**: Minimaal 40px van de rand
- **Grootte**: Max 200px breed

### Logo Varianten

- **Op lichte achtergrond**: Primair logo (gekleurd)
- **Op donkere achtergrond**: Wit logo variant

---

## Pinterest Best Practices

### ✅ Do's

- Gebruik hoge kwaliteit productafbeeldingen (min. 600x600px)
- Voeg altijd een duidelijke CTA toe
- Houd tekst kort en leesbaar
- Gebruik emoji's voor visuele aantrekkingskracht
- Maak prijzen prominent zichtbaar
- Voeg je branding toe (logo + kleuren)

### ❌ Don'ts

- Geen overvolle pins met te veel tekst
- Geen kleine of onleesbare tekst
- Geen lage kwaliteit afbeeldingen
- Geen pins zonder CTA
- Geen inconsistente branding

---

## Canva Bulk Create Workflow

### Stap 1: Template maken

1. Open Canva → Create Design → Custom Size → 1000 x 1500
2. Maak je template volgens bovenstaande specs
3. Markeer tekstvelden als "Connect data"

### Stap 2: CSV uploaden

1. Ga naar Apps → Bulk Create
2. Upload `cadeaus-voor-thuiswerkers.csv`
3. Koppel kolommen aan elementen

### Stap 3: Genereren

1. Klik "Generate designs"
2. Review alle varianten
3. Download als PNG of direct naar Pinterest

---

## Bestandsnamen voor Export

Gebruik dit format voor export:

```
gifteez-pin-{slug}-{type}-{nummer}.png

Voorbeelden:
gifteez-pin-thuiswerkers-product-01.png
gifteez-pin-thuiswerkers-product-02.png
gifteez-pin-thuiswerkers-gids-overview.png
gifteez-pin-thuiswerkers-vraag.png
gifteez-pin-thuiswerkers-persona-productiviteit.png
```

---

## Pinterest Board Structuur

Aanbevolen boards:

- **Cadeaus voor Thuiswerkers** → Alle thuiswerker pins
- **Cadeaus voor Nachtlezers** → Alle nachtlezer pins
- **Cadeau Inspiratie** → Mix van beide + toekomstige niches
- **Tech Cadeaus** → Cross-categorie tech items
- **Budget Cadeaus onder €50** → Goedkopere opties

---

_Laatste update: 30 november 2025_
