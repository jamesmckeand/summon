import { ARTISTS } from "@/lib/data/artists";

export function artistToSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function slugToArtist(slug: string) {
  return ARTISTS.find((a) => artistToSlug(a.name) === slug) ?? null;
}
