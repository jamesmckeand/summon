/**
 * Fetches Deezer images for all static artists.
 * Only updates entries that are currently null/missing.
 * Output: lib/data/artist-images.json
 *
 * Usage: node scripts/fetch-artist-images.mjs
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// Normalize: lowercase, strip accents, strip non-alphanumeric
function normalise(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[^a-z0-9]/g, "");
}

const src = readFileSync(join(root, "lib/data/artists.ts"), "utf8");
const names = [...src.matchAll(/name:\s*"([^"]+)"/g)].map((m) => m[1]);

const existing = JSON.parse(readFileSync(join(root, "lib/data/artist-images.json"), "utf8"));
const missing = names.filter((n) => !existing[n]);

console.log(`Total: ${names.length} | Already have: ${names.length - missing.length} | Fetching: ${missing.length}`);

async function fetchImage(name, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(
        `https://api.deezer.com/search/artist?q=${encodeURIComponent(name)}&limit=5`
      );
      if (res.status === 429) {
        await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
        continue;
      }
      if (!res.ok) return null;
      const data = await res.json();
      const items = data.data ?? [];
      const nameNorm = normalise(name);

      // Strategy 1: exact normalised match
      let match = items.find((a) => normalise(a.name) === nameNorm);

      // Strategy 2: one contains the other
      if (!match) {
        match = items.find(
          (a) => normalise(a.name).includes(nameNorm) || nameNorm.includes(normalise(a.name))
        );
      }

      // Strategy 3: first word match (for "Tyler, the Creator" -> "tyler")
      if (!match) {
        const firstWord = nameNorm.replace(/[^a-z0-9].*/, "").slice(0, 6);
        if (firstWord.length >= 4) {
          match = items.find((a) => normalise(a.name).startsWith(firstWord));
        }
      }

      return match?.picture_big ?? match?.picture_medium ?? null;
    } catch {
      if (attempt < retries - 1) await new Promise((r) => setTimeout(r, 1000));
    }
  }
  return null;
}

const BATCH = 10;
let found = 0;

for (let i = 0; i < missing.length; i += BATCH) {
  const batch = missing.slice(i, i + BATCH);
  const results = await Promise.all(batch.map(fetchImage));
  batch.forEach((name, j) => {
    existing[name] = results[j];
    if (results[j]) found++;
  });
  process.stdout.write(`\r${Math.min(i + BATCH, missing.length)}/${missing.length} (${found} new images found)`);
  await new Promise((r) => setTimeout(r, 500));
}

console.log("\nDone. Writing JSON...");
writeFileSync(join(root, "lib/data/artist-images.json"), JSON.stringify(existing, null, 2));
writeFileSync(join(root, "public/artist-images.json"), JSON.stringify(existing, null, 2));
console.log(`Found ${found} new images. Total with images: ${Object.values(existing).filter(Boolean).length}/${names.length}`);
