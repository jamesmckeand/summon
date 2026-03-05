/**
 * Run once locally to pre-fetch Deezer images for all static artists.
 * Output: lib/data/artist-images.json (committed to repo)
 *
 * Usage: node scripts/fetch-artist-images.mjs
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// Extract artist names from artists.ts using regex
const src = readFileSync(join(root, "lib/data/artists.ts"), "utf8");
const names = [...src.matchAll(/name:\s*"([^"]+)"/g)].map((m) => m[1]);

console.log(`Found ${names.length} artists. Fetching Deezer images...`);

const normalise = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

async function fetchImage(name) {
  try {
    const res = await fetch(
      `https://api.deezer.com/search/artist?q=${encodeURIComponent(name)}&limit=3`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const items = data.data ?? [];
    const nameNorm = normalise(name);
    const match =
      items.find((a) => normalise(a.name) === nameNorm) ??
      items.find((a) => normalise(a.name).includes(nameNorm) || nameNorm.includes(normalise(a.name)));
    return match?.picture_big ?? match?.picture_medium ?? null;
  } catch {
    return null;
  }
}

const images = {};
const BATCH = 20;

for (let i = 0; i < names.length; i += BATCH) {
  const batch = names.slice(i, i + BATCH);
  const results = await Promise.all(batch.map(fetchImage));
  batch.forEach((name, j) => { images[name] = results[j]; });
  process.stdout.write(`\r${Math.min(i + BATCH, names.length)}/${names.length}`);
  // Small delay to avoid rate limiting
  if (i + BATCH < names.length) await new Promise((r) => setTimeout(r, 200));
}

console.log("\nDone. Writing JSON...");
writeFileSync(
  join(root, "lib/data/artist-images.json"),
  JSON.stringify(images, null, 2)
);
console.log("Wrote lib/data/artist-images.json");
