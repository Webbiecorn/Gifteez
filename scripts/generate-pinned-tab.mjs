import { resolve } from "path";
import { writeFile } from "fs/promises";
import { Potrace } from "potrace";

const source = resolve("assets/favicon-maskable-source.png");
const out = resolve("public/safari-pinned-tab.svg");

function traceToSVG(inputPath, options = {}) {
  return new Promise((resolvePromise, reject) => {
    const tracer = new Potrace({
      threshold: 180,
      turdSize: 50,
      turnPolicy: Potrace.TURNPOLICY_MAJORITY,
      optTolerance: 0.4,
      background: "transparent",
      color: "#000000",
      ...options,
    });
    tracer.loadImage(inputPath, (err) => {
      if (err) return reject(err);
      tracer.getSVG((err2, svg) => {
        if (err2) return reject(err2);
        resolvePromise(svg);
      });
    });
  });
}

async function main() {
  const svg = await traceToSVG(source);
  // Ensure pinned tab compatibility: black fill, no inline colors besides black
  const cleaned = svg
    .replace(/fill="#[0-9A-Fa-f]{3,6}"/g, 'fill="#000000"')
    .replace(/stroke="#[0-9A-Fa-f]{3,6}"/g, 'stroke="none"');
  await writeFile(out, cleaned);
  console.log("Generated:", out);
}

main().catch((e) => {
  console.error("Failed to generate pinned tab:", e.message);
  process.exit(1);
});
