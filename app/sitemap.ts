import type { MetadataRoute } from "next";
import { CITIES } from "@/lib/data/cities";
import { cityToSlug } from "@/lib/utils/city-slug";

const BASE = "https://wesummon.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, priority: 1.0, changeFrequency: "daily" },
    { url: `${BASE}/explore`, priority: 0.9, changeFrequency: "daily" },
    { url: `${BASE}/cities`, priority: 0.8, changeFrequency: "daily" },
    { url: `${BASE}/shows`, priority: 0.8, changeFrequency: "daily" },
    { url: `${BASE}/login`, priority: 0.4, changeFrequency: "monthly" },
  ];

  const artistRoutes: MetadataRoute.Sitemap = Array.from({ length: 1001 }, (_, i) => ({
    url: `${BASE}/artist/${i + 1}`,
    priority: 0.7,
    changeFrequency: "weekly" as const,
  }));

  const cityRoutes: MetadataRoute.Sitemap = CITIES.map((city) => ({
    url: `${BASE}/cities/${cityToSlug(city)}`,
    priority: 0.8,
    changeFrequency: "daily" as const,
  }));

  return [...staticRoutes, ...artistRoutes, ...cityRoutes];
}
