# Hero Image & Overlay Guidance

## Current Implementation
- File: `components/GiftFinderPage.tsx`
- Full-bleed hero uses a `<picture>` with optional WebP source and PNG fallback.
- Intrinsic size attributes `width=1920` and `height=860` added to stabilize layout (reduces CLS risk).
- Overlay UI (buttons + headings) centered with flex.
- Subtle `bg-gradient-to-t from-black/50 via-black/10 to-black/0` mask improves text contrast.

## Adding AVIF
If you generate an AVIF variant place it in `public/images/giftfinder-hero.avif` and add:
```tsx
<source srcSet="/images/giftfinder-hero.avif" type="image/avif" />
```
immediately above the WebP source.

## Adjusting Overlay Buttons
- Locate the overlay container: `div.absolute.inset-0.flex...`
- To reposition individual buttons precisely: wrap each `<button>` in a `div` with `absolute top-[..] left-[..]` and remove the shared flex layout.
- Maintain `aria-label` for accessibility.

## Image Variants / Responsive Sources
Add responsive densities if you create multiple widths:
```tsx
<img
  src="/images/giftfinder-hero-1280.png"
  srcSet="/images/giftfinder-hero-1280.png 1280w, /images/giftfinder-hero-1600.png 1600w, /images/giftfinder-hero-1920.png 1920w"
  sizes="(max-width: 1024px) 100vw, 1280px"
  ...
/>
```
Then adjust `width`/`height` to match the largest intrinsic asset.

## Preloading (Optional)
Add in `index.html` `<head>` if LCP becomes an issue:
```html
<link rel="preload" as="image" href="/images/giftfinder-hero.png" imagesrcset="/images/giftfinder-hero.webp 1920w, /images/giftfinder-hero.png 1920w" imagesizes="100vw">
```

## Lighthouse / Web Vitals Checklist
- LCP element: hero image or main heading text. Ensure image is not delayed by JS.
- CLS: intrinsic dimensions + no late-loading fonts shifting hero.
- TBT: Keep overlay logic lightweight (no heavy synchronous code on mount).

## Future Enhancements
1. Generate WebP/AVIF automatically in existing responsive image script.
2. Add blur-up placeholder (tiny base64) using a low-quality preview `<img>` swapped once loaded.
3. Introduce per-button analytics events (category: HeroOverlay, action: click, label: Budget/Gelegenheid/etc.).

## Troubleshooting
- If WebP missing: the browser simply uses PNG fallback.
- If hero appears stretched: verify aspect ratio utility `aspect-[16/9]` and that provided image roughly matches (crop if needed).
- If text is unreadable: increase overlay gradient opacity `from-black/60` or add text shadow class `drop-shadow-2xl`.
