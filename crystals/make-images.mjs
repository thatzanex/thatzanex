// Makes the crystal pictures for every colour from the two green originals in source/:
// crystal.png (normal) and crystal-unstable.png. Each colour is the green turned to that hue.
// Run from a folder where sharp is installed:  node crystals/make-images.mjs
// Writes crystals/img/<id>.webp (300x300) for every crystal in crystals.json.
import { readFile, mkdir } from "node:fs/promises";
import sharp from "sharp";

const here = new URL("./", import.meta.url);
const path = (p) => new URL(p, here).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const { crystals } = JSON.parse(await readFile(path("crystals.json"), "utf8"));

// how far to turn the green (hue 139) for each colour, plus small brightness and saturation fixes
const LOOK = {
  blue: { hue: 132, saturation: 1.15, brightness: 0.95 },
  green: { hue: 0 },
  lime: { hue: -20, brightness: 1.03 },
  cyan: { hue: 55 },
  orange: { hue: -98, brightness: 1.05, saturation: 1.1 },
  "pure-blue": { hue: 150, saturation: 1.35, brightness: 0.95 },
  aqua: { hue: 30 },
  purple: { hue: 160, saturation: 1.3 },
  yellow: { hue: -62, brightness: 1.08, saturation: 1.1 },
  magenta: { hue: -150, saturation: 1.2 },
};

await mkdir(path("img"), { recursive: true });
for (const c of crystals) {
  const colour = c.id.replace(/^unstable-/, "");
  const look = LOOK[colour] ?? { hue: 0 };
  await sharp(path(`source/${c.unstable ? "crystal-unstable" : "crystal"}.png`))
    .resize(300, 300, { kernel: "lanczos3" })
    .modulate({ hue: look.hue, saturation: look.saturation ?? 1, brightness: look.brightness ?? 1 })
    .sharpen({ sigma: 0.6 })
    .webp({ quality: 88 })
    .toFile(path(`img/${c.id}.webp`));
}
console.log(`Made ${crystals.length} crystal pictures in crystals/img/`);
