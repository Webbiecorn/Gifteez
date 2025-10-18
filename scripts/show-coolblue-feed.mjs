#!/usr/bin/env node

import { readFile, stat } from 'fs/promises';
import { existsSync } from 'fs';
import { resolve, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const feedPath = resolve(repoRoot, 'data/importedProducts.json');
const fallbackPath = resolve(repoRoot, 'data/sampleProducts.json');
const storageKey = 'gifteez_coolblue_feed_v1';

const log = (label, value = '') => {
  console.log(`\x1b[36m${label}\x1b[0m ${value}`);
};

async function fileInfo(path) {
  if (!existsSync(path)) {
    return null;
  }

  const info = await stat(path);
  const raw = await readFile(path, 'utf-8');
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    parsed = null;
  }

  const products = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.products) ? parsed.products : [];

  return {
    path,
    relPath: relative(repoRoot, path),
    size: info.size,
    mtime: info.mtime,
    count: products.length,
    sample: products.slice(0, 3).map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      category: item.category
    }))
  };
}

async function main() {
  log('🔍  Coolblue feed lookup tool');
  console.log();

  log('📂 Repository root:', repoRoot);
  log('🪪 LocalStorage key (browser):', storageKey);
  console.log('   → Gebruik de browser console: window.localStorage.getItem("' + storageKey + '")');
  console.log('     of voer via DevTools Application ➝ Local Storage ➝ gifteez.nl →', storageKey);
  console.log();

  const info = await fileInfo(feedPath);

  if (info) {
    log('✅ Bundled Coolblue feed gevonden:', info.relPath);
    log('   Producten:', info.count.toString());
    log('   Bestandsgrootte:', `${(info.size / 1024).toFixed(1)} KB`);
    log('   Laatst aangepast:', info.mtime.toISOString());
    console.log();

    if (info.sample.length) {
      log('   Voorbeelditems:');
      console.table(info.sample);
    }
  } else {
    log('⚠️  Geen bundled feed gevonden op', relative(repoRoot, feedPath));
  }

  console.log();

  const fallbackInfo = await fileInfo(fallbackPath);
  if (fallbackInfo) {
    log('🛟 Fallback sample feed:', fallbackInfo.relPath);
    log('   Producten:', fallbackInfo.count.toString());
  }

  console.log();

  log('📜 Feed update scripts:');
  console.log('   • scripts/feedDownloader.mjs  (automatisch downloaden via Awin)');
  console.log('   • scripts/processCsv.mjs      (converteren naar importedProducts.json)');
  console.log();

  log('👉 Gebruik', 'npm run show:coolblue-feed');
  console.log('   of voer rechtstreeks: node scripts/show-coolblue-feed.mjs');
  console.log();
}

main().catch((error) => {
  console.error('❌ Lookup mislukt:', error);
  process.exitCode = 1;
});
