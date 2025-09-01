import favicons from "favicons";
import sharp from "sharp";
import { writeFile, mkdir, readFile } from "fs/promises";
import { resolve } from "path";

const source = resolve("assets/favicon-source.png");
const paddedSource = resolve("assets/favicon-maskable-source.png");
const outDir = resolve("public");

const configuration = {
  path: "/", // Path for overriding default icons path. `string`
  appName: "Gifteez", // Your application's name. `string`
  appShortName: "Gifteez", // Your application's short name. `string`. Optional. If not set, appName will be used
  appDescription:
    "Vind razendsnel het perfecte cadeau met AI. Filter op interesses, budget en gelegenheid en ontvang persoonlijke cadeau-ideeën.",
  developerName: "Gifteez",
  developerURL: "https://gifteez.nl",
  dir: "auto",
  lang: "nl-NL",
  background: "#ffffff",
  theme_color: "#e11d48",
  appleStatusBarStyle: "default",
  display: "standalone",
  orientation: "any",
  scope: "/",
  start_url: "/",
  version: "1.0",
  logging: false,
  pixel_art: false,
  loadManifestWithCredentials: false,
  icons: {
    android: true,
    appleIcon: true,
    appleStartup: false,
    favicons: true,
    windows: false,
    yandex: false,
    coast: false,
    firefox: false,
  },
};

async function buildPaddedSource() {
  // Create a transparent square canvas with extra margin around the logo
  // Recommended safe area ~12% for maskable icons
  const target = 1024; // high-res base, favicons will downscale
  const margin = Math.round(target * 0.12);
  const inner = target - margin * 2;
  await sharp(source)
    .resize({ width: inner, height: inner, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({ top: margin, bottom: margin, left: margin, right: margin, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(paddedSource);
  return paddedSource;
}

async function main() {
  const input = await buildPaddedSource();
  const { images, files, html } = await favicons(input, configuration);

  await mkdir(outDir, { recursive: true });

  // Write images and files to public/
  await Promise.all(
    images.map(async (img) => {
      await writeFile(resolve(outDir, img.name), img.contents);
    })
  );
  await Promise.all(
    files.map(async (f) => {
      await writeFile(resolve(outDir, f.name), f.contents);
    })
  );

  // Output the HTML snippet to stdout for reference.
  console.log("Favicons HTML to add to <head>:\n" + html.join("\n"));

  // Ensure maskable icons in manifest
  const manifestPath = resolve(outDir, "manifest.webmanifest");
  try {
    const raw = await readFile(manifestPath, "utf-8");
    const manifest = JSON.parse(raw);
    if (Array.isArray(manifest.icons)) {
      let changed = false;
      for (const size of ["192x192", "512x512"]) {
        const icon = manifest.icons.find((i) => i.sizes === size);
        if (icon) {
          if (!icon.purpose || !String(icon.purpose).includes("maskable")) {
            icon.purpose = "any maskable";
            changed = true;
          }
        }
      }
      if (changed) {
        await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
        console.log("Updated manifest.webmanifest with maskable icons.");
      }
    }
  } catch (e) {
    console.warn("Could not update manifest for maskable icons:", e.message);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
