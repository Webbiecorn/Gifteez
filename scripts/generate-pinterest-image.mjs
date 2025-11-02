#!/usr/bin/env node
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'

// Config
const WIDTH = 1000
const HEIGHT = 1500
const TITLE = 'Cadeaugidsen: snel starten\nper budget en thema'
const SUBTITLE = 'Onder €25 · Onder €50 · Haar · Hem · Duurzaam · Gamer'

// Source image (as provided in repo; note the colon and spaces in filename)
const srcImageRel = 'public/images/Blog-afbeelding-Cadeaugidsen: snel starten per budget en thema.png'
const outImageRel = 'public/images/pinterest/cadeaugidsen-snel-starten-portrait.png'

const root = path.resolve(process.cwd())
const srcImagePath = path.join(root, srcImageRel)
const outImagePath = path.join(root, outImageRel)

// Ensure output dir exists
fs.mkdirSync(path.dirname(outImagePath), { recursive: true })

// Helper: SVG block for gradient background and text
const gradientSvg = (w, h) => `
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1f2937"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#e11d48"/>
      <stop offset="100%" stop-color="#fb7185"/>
    </linearGradient>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000000" flood-opacity="0.35"/>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <!-- top accent band -->
  <rect x="0" y="0" width="100%" height="220" fill="url(#accent)"/>
  <!-- subtle blobs -->
  <circle cx="120" cy="340" r="90" fill="#e11d48" opacity="0.12"/>
  <circle cx="900" cy="280" r="70" fill="#fb7185" opacity="0.12"/>
</svg>`

const titleSvg = (w) => `
<svg width="${w}" height="400" viewBox="0 0 ${w} 400" xmlns="http://www.w3.org/2000/svg">
  <style>
    .title { font: 800 68px 'Inter', 'Helvetica Neue', Arial, sans-serif; fill: #ffffff; }
    .subtitle { font: 600 28px 'Inter', 'Helvetica Neue', Arial, sans-serif; fill: #fde7ec; }
    .chip { font: 700 22px 'Inter', 'Helvetica Neue', Arial, sans-serif; fill: #e11d48; }
  </style>
  <text x="60" y="120" class="title">Cadeaugidsen: snel starten</text>
  <text x="60" y="190" class="title">per budget en thema</text>
  <text x="60" y="245" class="subtitle">${SUBTITLE}</text>
  <!-- brand chip -->
  <rect x="60" y="290" rx="24" ry="24" width="260" height="52" fill="#ffffff" opacity="0.9"/>
  <text x="90" y="325" class="chip">Gifteez.nl</text>
</svg>`

const footerSvg = (w) => `
<svg width="${w}" height="160" viewBox="0 0 ${w} 160" xmlns="http://www.w3.org/2000/svg">
  <style>
    .footer { font: 700 22px 'Inter', 'Helvetica Neue', Arial, sans-serif; fill: #ffffff; opacity: 0.9; }
  </style>
  <text x="60" y="110" class="footer">Vind snelle cadeautips met de AI GiftFinder — gifteez.nl/giftfinder</text>
</svg>`

async function main() {
  if (!fs.existsSync(srcImagePath)) {
    console.error('Source image not found:', srcImagePath)
    process.exit(1)
  }

  // Base with gradient
  const base = sharp(Buffer.from(gradientSvg(WIDTH, HEIGHT)))
    .resize(WIDTH, HEIGHT)
    .png()

  // Prepare blog image (rounded corners)
  const image = await sharp(srcImagePath)
    .resize(880, 600, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 92 })
    .toBuffer()

  const roundedMask = Buffer.from(`
    <svg width="880" height="600" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="880" height="600" rx="32" ry="32" />
    </svg>
  `)
  const roundedImage = await sharp(image)
    .composite([{ input: roundedMask, blend: 'dest-in' }])
    .png()
    .toBuffer()

  // Compose everything
  const output = await base
    .composite([
      { input: Buffer.from(titleSvg(WIDTH)), top: 20, left: 0 },
      // image panel shadow
      {
        input: Buffer.from('<svg width="900" height="620" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="900" height="620" rx="40" ry="40" fill="#000000" opacity="0.25"/></svg>'),
        top: 420,
        left: 50,
        blend: 'over'
      },
      { input: roundedImage, top: 430, left: 60 },
      { input: Buffer.from(footerSvg(WIDTH)), top: 1320, left: 0 },
    ])
    .png({ quality: 95 })
    .toBuffer()

  await sharp(output).toFile(outImagePath)
  console.log('Pinterest image generated at:', outImageRel)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
