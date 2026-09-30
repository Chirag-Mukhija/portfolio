import type { MetadataRoute } from "next";
import { SITE_URL, site } from "@/content/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(site.updated),
      changeFrequency: "monthly",
      priority: 1,
      images: [site.portrait ? `${SITE_URL}${site.portrait}.jpg` : "", `${SITE_URL}/og.jpg`].filter(Boolean),
    },
  ];
}
