#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const imagesDir = path.resolve(process.cwd(), 'public', 'images');
const DRY_RUN = process.argv.includes('--dry-run');

function log(level, message, meta = {}) {
  const payload = { ts: new Date().toISOString(), level, message, ...meta };
  // eslint-disable-next-line no-console
  console[level === 'error' ? 'error' : (level === 'warn' ? 'warn' : 'log')](JSON.stringify(payload));
}

const SUPPORTED_INPUTS = ['.png', '.jpg', '.jpeg'];
const TARGETS = [
  { ext: '.webp', options: { quality: 82 } },
  { ext: '.avif', options: { quality: 50 } }
];

async function ensureFormats(file) {
  const full = path.join(imagesDir, file);
  if (!fs.existsSync(full)) {
    log('warn', 'Source disappeared before processing', { file });
    return { generated: 0, skipped: 0 };
  }
  const ext = path.extname(full).toLowerCase();
  if (!SUPPORTED_INPUTS.includes(ext)) {
    log('warn', 'Unsupported source format skipped', { file, ext });
    return { generated: 0, skipped: 1 };
  }
  const base = full.slice(0, -ext.length);

  // Short-circuit: if all targets exist, skip quickly
  const allPresent = TARGETS.every(t => fs.existsSync(base + t.ext));
  if (allPresent) {
    log('log', 'All target formats already exist - skipping', { file });
    return { generated: 0, skipped: TARGETS.length };
  }

  let generated = 0;
  let skipped = 0;
  for (const t of TARGETS) {
    const out = base + t.ext;
    if (fs.existsSync(out)) {
      skipped++;
      continue;
    }
    if (DRY_RUN) {
      log('log', 'Dry-run: would generate', { file, target: t.ext });
      continue;
    }
    try {
      await sharp(full, { limitInputPixels: false })
        .resize({ width: 800, withoutEnlargement: true })
        .toFormat(t.ext.slice(1), t.options)
        .toFile(out);
      generated++;
      log('log', 'Generated format', { source: path.basename(file), output: path.basename(out) });
    } catch (e) {
      try {
        fs.copyFileSync(full, out + '.failed');
      } catch {}
      log('warn', 'Failed to generate', { output: path.basename(out), error: e.message });
    }
  }
  return { generated, skipped };
}

async function run() {
  if (!fs.existsSync(imagesDir)) {
    log('warn', 'Images directory not found', { dir: imagesDir });
    return;
  }
  const started = Date.now();
  const files = fs.readdirSync(imagesDir);
  const whitelistPrefixes = ['trending-', 'collection-', 'planner', 'about-', 'og-tech-gifts', 'quiz-illustration'];
  const candidateFiles = files.filter(f => whitelistPrefixes.some(p => f.startsWith(p)));
  let totalGenerated = 0;
  let totalSkipped = 0;
  for (const f of candidateFiles) {
    if (f.endsWith('.webp') || f.endsWith('.avif')) continue; // ignore target formats as input
    const { generated, skipped } = await ensureFormats(f);
    totalGenerated += generated;
    totalSkipped += skipped;
  }
  log('log', 'Run summary', {
    processedSources: candidateFiles.length,
    generated: totalGenerated,
    skipped: totalSkipped,
    dryRun: DRY_RUN,
    ms: Date.now() - started
  });
}

run();
