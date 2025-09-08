#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const imagesDir = path.resolve(process.cwd(), 'public', 'images');

async function ensureFormats(file) {
  const full = path.join(imagesDir, file);
  if (!fs.existsSync(full)) return;
  const ext = path.extname(full).toLowerCase();
  if (!['.png', '.jpg', '.jpeg'].includes(ext)) return;
  const base = full.slice(0, -ext.length);
  const targets = [
    { ext: '.webp', options: { quality: 82 } },
    { ext: '.avif', options: { quality: 50 } }
  ];
  for (const t of targets) {
    const out = base + t.ext;
    if (fs.existsSync(out)) continue;
    try {
      await sharp(full, { limitInputPixels: false })
        .resize({ width: 800, withoutEnlargement: true })
        .toFormat(t.ext.slice(1), t.options)
        .toFile(out);
      console.log('Generated', path.basename(out));
    } catch (e) {
      try {
        // Fallback: just copy original bytes if conversion failed (still allows <picture> ordering to prefer PNG)
        fs.copyFileSync(full, out + '.failed');
      } catch {}
      console.warn('Failed to generate', out, e.message);
    }
  }
}

async function run() {
  if (!fs.existsSync(imagesDir)) return;
  const files = fs.readdirSync(imagesDir);
  // Only generate for trending + collection images for now
  const whitelistPrefixes = ['trending-', 'collection-', 'planner', 'about-', 'og-tech-gifts', 'quiz-illustration'];
  const filtered = files.filter(f => whitelistPrefixes.some(p => f.startsWith(p)));
  for (const f of filtered) {
    // Skip already converted alt formats (.webp/.avif)
    if (f.endsWith('.webp') || f.endsWith('.avif')) continue;
    await ensureFormats(f);
  }
}

run();
