import { CITIES } from "@/lib/data/cities";

export function cityToSlug(city: string): string {
  return city
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function slugToCity(slug: string): string | null {
  return CITIES.find((c) => cityToSlug(c) === slug) ?? null;
}
