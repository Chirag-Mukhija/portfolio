// schema.org graph for the page: a Person, the ProfilePage about them, and the WebSite.
import { SITE_URL, site } from "@/content/site";
import { systems, problems } from "@/content/projects";

export function buildJsonLd() {
  const personId = `${SITE_URL}/#person`;
  const sameAs = [site.links.github, site.links.linkedin, site.links.leetcode].filter(
    (url): url is string => Boolean(url)
  );

  const graph = [
    {
      "@type": "Person",
      "@id": personId,
      name: site.name,
      givenName: site.firstName,
      familyName: site.lastName,
      url: SITE_URL,
      image: `${SITE_URL}/og.png`,
      email: `mailto:${site.email}`,
      jobTitle: site.role,
      description: site.seo.description,
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: site.education.school,
        url: site.education.schoolUrl,
        address: { "@type": "PostalAddress", addressLocality: "Bengaluru", addressCountry: "IN" },
      },
      homeLocation: {
        "@type": "Place",
        name: `${site.location.city}, ${site.location.region}, India`,
      },
      birthPlace: { "@type": "Place", name: `${site.hometown.city}, ${site.hometown.region}, India` },
      knowsAbout: [
        "Backend engineering",
        "Distributed systems",
        "System design",
        "PostgreSQL",
        "Redis",
        "Node.js",
        "Message queues",
        "Idempotency",
        "Data structures and algorithms",
        "Dynamic programming",
        "Graph algorithms",
      ],
      sameAs,
    },
    {
      "@type": "ProfilePage",
      "@id": `${SITE_URL}/#profile`,
      url: SITE_URL,
      name: site.seo.title,
      description: site.seo.description,
      inLanguage: "en-IN",
      dateModified: site.updated,
      mainEntity: { "@id": personId },
      hasPart: [...systems, ...problems].map((p) => ({
        "@type": "SoftwareSourceCode",
        name: "title" in p ? p.title : p.name,
        codeRepository: p.repo,
        [("team" in p && p.team) ? "contributor" : "author"]: { "@id": personId },
      })),
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: site.name,
      publisher: { "@id": personId },
      inLanguage: "en-IN",
    },
  ];

  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
}
