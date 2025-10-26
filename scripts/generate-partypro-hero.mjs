import { readFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import puppeteer from 'puppeteer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function main() {
  const rootDir = path.resolve(__dirname, '..')
  const outputPath = path.join(rootDir, 'public/images/blog-partypro-hero.png')

  const [balloonBuffer, logoBuffer] = await Promise.all([
    readFile('/tmp/partypro/balloon.png'),
    readFile('/tmp/partypro/logo.png'),
  ])

  const balloonDataUrl = `data:image/png;base64,${balloonBuffer.toString('base64')}`
  const logoDataUrl = `data:image/png;base64,${logoBuffer.toString('base64')}`

  const html = `<!DOCTYPE html>
  <html lang="nl">
    <head>
      <meta charset="utf-8" />
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; }
        body {
          margin: 0;
          width: 1600px;
          height: 900px;
          font-family: 'Poppins', 'Inter', 'Segoe UI', sans-serif;
          background: radial-gradient(circle at -20% 20%, #ffeef8 0%, #fff6fb 35%, rgba(255,255,255,0) 55%),
                      radial-gradient(circle at 120% 110%, rgba(255,210,239,0.9) 0%, rgba(250,232,255,0.6) 45%, rgba(255,255,255,0) 70%),
                      linear-gradient(135deg, #fdf2ff 0%, #ffe4f7 100%);
          color: #0f172a;
        }
        .hero {
          position: relative;
          width: 1600px;
          height: 900px;
          overflow: hidden;
        }
        .hero::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 30% 20%, rgba(236,72,153,0.12) 0%, rgba(236,72,153,0) 55%),
                      radial-gradient(circle at 70% 80%, rgba(14,165,233,0.10) 0%, rgba(14,165,233,0) 65%);
          pointer-events: none;
        }
        .badge {
          position: absolute;
          top: 110px;
          left: 120px;
          display: inline-flex;
          align-items: center;
          gap: 18px;
          padding: 18px 26px;
          background: rgba(255,255,255,0.85);
          border-radius: 999px;
          box-shadow: 0 15px 45px rgba(236, 72, 153, 0.12);
          backdrop-filter: blur(6px);
        }
        .badge span {
          font-size: 18px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #ec4899;
        }
        .badge img {
          height: 46px;
          width: auto;
        }
        .copy {
          position: absolute;
          top: 210px;
          left: 120px;
          max-width: 640px;
          z-index: 2;
        }
        .copy h1 {
          margin: 0 0 14px;
          font-size: 64px;
          line-height: 1.05;
          font-weight: 800;
          letter-spacing: -0.03em;
        }
        .copy h1 span {
          display: block;
          background-image: linear-gradient(90deg, #ec4899 0%, #9333ea 50%, #0ea5e9 100%);
          -webkit-background-clip: text;
          color: transparent;
        }
        .copy p {
          margin: 0;
          font-size: 24px;
          line-height: 1.5;
          color: #334155;
          font-weight: 500;
        }
        .copy .cta {
          margin-top: 34px;
          display: inline-flex;
          align-items: center;
          gap: 14px;
          padding: 18px 28px;
          border-radius: 16px;
          font-size: 20px;
          font-weight: 600;
          background: linear-gradient(135deg, #ec4899 0%, #9333ea 45%, #0ea5e9 100%);
          color: white;
          box-shadow: 0 25px 55px rgba(147, 51, 234, 0.30);
        }
        .product {
          position: absolute;
          right: 100px;
          bottom: -40px;
          width: 820px;
          filter: drop-shadow(0 45px 80px rgba(15, 23, 42, 0.18));
          transform: rotate(-2deg);
        }
        .glow {
          position: absolute;
          right: 260px;
          bottom: 60px;
          width: 480px;
          height: 480px;
          background: radial-gradient(circle, rgba(250,232,255,0.75) 0%, rgba(250,232,255,0) 70%);
          z-index: 0;
        }
      </style>
    </head>
    <body>
      <div class="hero">
        <div class="badge">
          <img src="${logoDataUrl}" alt="PartyPro logo" />
          <span>Partner spotlight</span>
        </div>
        <div class="copy">
          <h1>Feestdecor met <span>PartyPro.nl</span></h1>
          <p>Ballonnenbogen, confettisets en gender reveal kits worden nu dagelijks automatisch geüpdatet in onze feestcollecties.</p>
          <div class="cta">Ontdek de collectie →</div>
        </div>
        <div class="glow"></div>
        <img class="product" src="${balloonDataUrl}" alt="Ballonnenboog PartyPro" />
      </div>
    </body>
  </html>`

  const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1600, height: 900, deviceScaleFactor: 1 } })
  const page = await browser.newPage()
  await page.setContent(html, { waitUntil: 'networkidle0' })
  await page.screenshot({ path: outputPath, type: 'png' })
  await browser.close()

  console.log(`Hero image saved to ${outputPath}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
