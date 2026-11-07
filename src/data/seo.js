// Shared SEO helpers. Kept dependency-free so the post-build script can import them in Node.

export const DEFAULT_SITE_URL = "https://ironascensions.com";

export const normalizeBaseUrl = (value) => {
  const url = String(value || "").trim();
  return url ? url.replace(/\/+$/, "") : "";
};

export const absoluteUrl = (baseUrl, path = "/") => {
  const base = normalizeBaseUrl(baseUrl);
  const raw = String(path || "/");
  const clean = raw.startsWith("/") ? raw : `/${raw}`;
  if (!base) return clean;
  return `${base}${clean === "/" ? "/" : clean}`;
};

export const toAbsoluteUrl = (baseUrl, value) => {
  if (!value) return "";
  return /^https?:\/\//i.test(value) ? value : absoluteUrl(baseUrl, value);
};

export const cleanText = (value, max = 160) => {
  const text = String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return "";
  if (text.length <= max) return text;
  const sliced = text.slice(0, max - 1);
  const lastSpace = sliced.lastIndexOf(" ");
  const cut = lastSpace > max * 0.6 ? sliced.slice(0, lastSpace) : sliced;
  return `${cut.trimEnd()}…`;
};

export const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

export const escapeXml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export const escapeJsonLd = (value) =>
  JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");

export const buildSeo = ({
  site = {},
  baseUrl = "",
  title,
  description,
  path = "/",
  image,
  type = "website",
  noindex = false,
  jsonLd = [],
}) => {
  const fullTitle = cleanText(title || site.name || "", 70);
  const fullDescription = cleanText(description || site.tagline || "", 160);
  const canonical = absoluteUrl(baseUrl, path);
  const imageUrl = toAbsoluteUrl(baseUrl, image);

  return {
    title: fullTitle,
    description: fullDescription,
    canonical,
    url: canonical,
    robots: noindex ? "noindex, nofollow" : "index, follow",
    type,
    image: imageUrl,
    imageAlt: fullTitle,
    siteName: site.name || "",
    locale: "en_US",
    twitterCard: imageUrl ? "summary_large_image" : "summary",
    jsonLd: jsonLd.filter(Boolean),
  };
};

export const seoToHtml = (seo) => {
  const tags = [
    `<title>${escapeHtml(seo.title)}</title>`,
    seo.description
      ? `<meta name="description" content="${escapeHtml(seo.description)}" />`
      : "",
    `<meta name="robots" content="${escapeHtml(seo.robots)}" />`,
    seo.canonical ? `<link rel="canonical" href="${escapeHtml(seo.canonical)}" />` : "",
    `<meta property="og:type" content="${escapeHtml(seo.type)}" />`,
    seo.siteName ? `<meta property="og:site_name" content="${escapeHtml(seo.siteName)}" />` : "",
    `<meta property="og:title" content="${escapeHtml(seo.title)}" />`,
    seo.description
      ? `<meta property="og:description" content="${escapeHtml(seo.description)}" />`
      : "",
    seo.url ? `<meta property="og:url" content="${escapeHtml(seo.url)}" />` : "",
    seo.image ? `<meta property="og:image" content="${escapeHtml(seo.image)}" />` : "",
    seo.image
      ? `<meta property="og:image:alt" content="${escapeHtml(seo.imageAlt)}" />`
      : "",
    `<meta property="og:locale" content="${escapeHtml(seo.locale)}" />`,
    `<meta name="twitter:card" content="${escapeHtml(seo.twitterCard)}" />`,
    `<meta name="twitter:title" content="${escapeHtml(seo.title)}" />`,
    seo.description
      ? `<meta name="twitter:description" content="${escapeHtml(seo.description)}" />`
      : "",
    seo.image ? `<meta name="twitter:image" content="${escapeHtml(seo.image)}" />` : "",
    ...seo.jsonLd.map(
      (item) => `<script type="application/ld+json">${escapeJsonLd(item)}</script>`
    ),
  ];

  return tags.filter(Boolean).join("\n    ");
};

export const organizationJsonLd = ({ site = {}, baseUrl = "", logo }) => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${normalizeBaseUrl(baseUrl)}/#organization`,
  name: site.name || "Store",
  url: absoluteUrl(baseUrl, "/"),
  logo: toAbsoluteUrl(baseUrl, logo) || undefined,
  email: site.email || undefined,
  telephone: site.phone || undefined,
  description: site.tagline || undefined,
});

export const webSiteJsonLd = ({ site = {}, baseUrl = "" }) => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${normalizeBaseUrl(baseUrl)}/#website`,
  name: site.name || "Store",
  url: absoluteUrl(baseUrl, "/"),
  inLanguage: "en",
  publisher: { "@id": `${normalizeBaseUrl(baseUrl)}/#organization` },
});

export const siteJsonLd = ({ site, baseUrl, logo }) => [
  organizationJsonLd({ site, baseUrl, logo }),
  webSiteJsonLd({ site, baseUrl }),
];

export const breadcrumbJsonLd = ({ baseUrl, items = [] }) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: absoluteUrl(baseUrl, item.path),
  })),
});

export const collectionPageJsonLd = ({ name, description, url }) => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name,
  description,
  url,
});

export const webPageJsonLd = ({ type = "WebPage", name, description, url }) => ({
  "@context": "https://schema.org",
  "@type": type,
  name,
  description,
  url,
});

export const itemListJsonLd = ({ name, baseUrl, items = [] }) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  name,
  numberOfItems: items.length,
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    url: absoluteUrl(baseUrl, item.path),
  })),
});

export const productJsonLd = ({ site = {}, baseUrl = "", product, path, category }) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  name: product.name,
  description: cleanText(product.description, 500) || undefined,
  image: toAbsoluteUrl(baseUrl, product.image) || undefined,
  sku: String(product.id),
  category: category || undefined,
  brand: { "@type": "Brand", name: site.name || "Store" },
  offers: {
    "@type": "Offer",
    url: absoluteUrl(baseUrl, path),
    price: Number(product.price),
    priceCurrency: site.currencyCode || "USD",
    availability: "https://schema.org/InStock",
    itemCondition: "https://schema.org/NewCondition",
  },
});

export const faqJsonLd = (items = []) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
});
