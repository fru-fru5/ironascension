// Post-build SEO: prerenders route-specific <head> tags, sitemap.xml and robots.txt.
// Runs after `vite build`, so crawlers receive real static HTML for every route.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";
import {
  DEFAULT_SITE_URL,
  absoluteUrl,
  breadcrumbJsonLd,
  buildSeo,
  cleanText,
  collectionPageJsonLd,
  escapeHtml,
  escapeXml,
  faqJsonLd,
  itemListJsonLd,
  normalizeBaseUrl,
  productJsonLd,
  seoToHtml,
  siteJsonLd,
  webPageJsonLd,
} from "../src/data/seo.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(root, "dist");
const catalogPath = path.join(root, "src", "data", "catalog.json");
const templatePath = path.join(distDir, "index.html");

if (!fs.existsSync(templatePath)) {
  console.error("[seo] dist/index.html not found. Run `vite build` first.");
  process.exit(1);
}

const env = loadEnv("production", root, "");
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const site = catalog.site || {};
const images = catalog.images || {};
const about = catalog.about || {};
const categories = catalog.categories || [];
const products = catalog.products || [];
const merch = catalog.merch || [];

const baseUrl = normalizeBaseUrl(
  env.VITE_SITE_URL || process.env.VITE_SITE_URL || DEFAULT_SITE_URL
);

const brand = site.name || "Store";
const brandText = (value) => String(value || "").replace(/\{brand\}/g, brand);
const isPlaceholderName = (value) => /^\.*$/.test(String(value ?? "").trim());
const visibleName = (value) =>
  isPlaceholderName(value) ? "" : String(value ?? "").trim();
const categorySeoName = (category) =>
  visibleName(category?.name) ||
  String(category?.introTitle || category?.blurb || "").trim() ||
  "Products";
const globalJsonLd = siteJsonLd({ site, baseUrl, logo: images.logoHeader });
const withGlobal = (items = []) => [...globalJsonLd, ...items];
const today = new Date().toISOString().slice(0, 10);
const merchLabel = site.merchLabel || "Merch";

const noscriptStyle =
  "max-width:760px;margin:0 auto;padding:40px 20px;font-family:sans-serif;color:#111";
const textToParagraphs = (value) =>
  String(value || "")
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");

const buildNoscript = (route) => {
  const heading = escapeHtml(route.heading || route.title || brand);
  const description = route.description ? `<p>${escapeHtml(route.description)}</p>` : "";
  const introTitle = route.noscriptIntroTitle
    ? `<h2>${escapeHtml(route.noscriptIntroTitle)}</h2>`
    : "";
  const intro = route.noscriptIntro ? textToParagraphs(route.noscriptIntro) : "";
  const faqTitle = escapeHtml(route.noscriptFaqTitle || "Frequently asked questions");
  const faq =
    Array.isArray(route.noscriptFaq) && route.noscriptFaq.length
      ? `<h2>${faqTitle}</h2>${route.noscriptFaq
          .map(
            (item) => `<h3>${escapeHtml(item.q)}</h3><p>${escapeHtml(item.a)}</p>`
          )
          .join("")}`
      : "";
  const links =
    Array.isArray(route.noscriptLinks) && route.noscriptLinks.length
      ? `<h2>Browse</h2><ul>${route.noscriptLinks
          .map(
            (item) =>
              `<li><a href="${escapeHtml(item.path)}">${escapeHtml(item.name)}</a></li>`
          )
          .join("")}</ul>`
      : "";

  return `<div style="${noscriptStyle}"><h1>${heading}</h1>${description}${introTitle}${intro}${faq}${links}<p><a href="/products">Browse the full catalog</a></p></div>`;
};

const productDescription = (product) => {
  const text = String(product.description || "")
    .replace(/^in stock\s*/i, "")
    .trim();
  return cleanText(text || `${product.name} from ${brand}.`);
};

const homeDescription = cleanText(
  `${brand} — ${site.tagline || "Premium performance products"}. Browse ${categories
    .map((category) => visibleName(category.name) || category.blurb || category.introTitle)
    .filter(Boolean)
    .join(", ")} and more.`
);

const routes = [];
const addRoute = (route) => routes.push(route);

addRoute({
  path: "/",
  title: `${brand} | ${site.tagline || "Premium Performance Products"}`,
  description: homeDescription,
  image: images.hero,
  type: "website",
  preload: true,
  heading: brand,
  noscriptIntro: homeDescription,
  noscriptLinks: categories.map((category) => ({
    name:
      visibleName(category.name) ||
      category.blurb ||
      category.introTitle ||
      "Products",
    path: `/${category.slug}`,
  })),
  jsonLd: withGlobal([
    webPageJsonLd({
      type: "WebPage",
      name: brand,
      description: homeDescription,
      url: absoluteUrl(baseUrl, "/"),
    }),
  ]),
  priority: "1.0",
  changefreq: "weekly",
});

addRoute({
  path: "/products",
  title: `Shop All Products | ${brand}`,
  description: `Browse all ${products.length} products across ${categories.length} categories at ${brand}. Search the catalog and request your order online.`,
  image: images.productsHero,
  preload: true,
  heading: "Shop All Products",
  noscriptIntro: `Browse all ${products.length} products across ${categories.length} categories at ${brand}. Search the catalog and request your order online.`,
  noscriptLinks: [
    ...categories.map((category) => ({
      name:
        visibleName(category.name) ||
        category.blurb ||
        category.introTitle ||
        "Products",
      path: `/${category.slug}`,
    })),
    { name: merchLabel, path: "/merch" },
  ],
  jsonLd: withGlobal([
    collectionPageJsonLd({
      name: `Shop All Products | ${brand}`,
      description: `Browse all ${products.length} products across ${categories.length} categories.`,
      url: absoluteUrl(baseUrl, "/products"),
    }),
    itemListJsonLd({
      name: `${brand} products`,
      baseUrl,
      items: products.map((product) => ({
        name: product.name,
        path: `/product/${product.id}`,
      })),
    }),
    breadcrumbJsonLd({
      baseUrl,
      items: [
        { name: "Home", path: "/" },
        { name: "Products", path: "/products" },
      ],
    }),
  ]),
  priority: "0.9",
  changefreq: "weekly",
});

categories.forEach((category) => {
  const list = products.filter((product) => product.categoryId === category.id);
  const categoryName = categorySeoName(category);
  const title = `${categoryName} | ${brand}`;
  const description = cleanText(
    category.seoDescription ||
      `${category.blurb || categoryName}. Shop ${categoryName} products at ${brand}.`
  );
  const faq = Array.isArray(category.faq)
    ? category.faq.filter((item) => item && item.q && item.a)
    : [];

  addRoute({
    path: `/${category.slug}`,
    title,
    description,
    image: category.banner || category.cardImage,
    preload: true,
    heading: categoryName,
    noscriptIntroTitle: category.introTitle,
    noscriptIntro: category.intro,
    noscriptFaqTitle: category.faqTitle,
    noscriptFaq: faq,
    noscriptLinks: list.map((product) => ({
      name: product.name,
      path: `/product/${product.id}`,
    })),
    jsonLd: withGlobal([
      collectionPageJsonLd({
        name: title,
        description,
        url: absoluteUrl(baseUrl, `/${category.slug}`),
      }),
      itemListJsonLd({
        name: `${categoryName} products`,
        baseUrl,
        items: list.map((product) => ({
          name: product.name,
          path: `/product/${product.id}`,
        })),
      }),
      ...(faq.length ? [faqJsonLd(faq)] : []),
      breadcrumbJsonLd({
        baseUrl,
        items: [
          { name: "Home", path: "/" },
          { name: "Products", path: "/products" },
          { name: categoryName, path: `/${category.slug}` },
        ],
      }),
    ]),
    priority: "0.8",
    changefreq: "weekly",
  });
});

addRoute({
  path: "/merch",
  title: `${merchLabel} | ${brand}`,
  description: `Shop ${brand} ${merchLabel.toLowerCase()} — training apparel and lifestyle accessories.`,
  image: images.merchHero,
  preload: true,
  heading: `${brand} ${merchLabel}`,
  noscriptIntro: `Shop ${brand} ${merchLabel.toLowerCase()} — training apparel and lifestyle accessories.`,
  noscriptLinks: merch.map((item) => ({
    name: item.name,
    path: `/merch/${item.id}`,
  })),
  jsonLd: withGlobal([
    collectionPageJsonLd({
      name: `${merchLabel} | ${brand}`,
      description: `Shop ${brand} ${merchLabel.toLowerCase()}.`,
      url: absoluteUrl(baseUrl, "/merch"),
    }),
    itemListJsonLd({
      name: `${brand} ${merchLabel}`,
      baseUrl,
      items: merch.map((item) => ({
        name: item.name,
        path: `/merch/${item.id}`,
      })),
    }),
    breadcrumbJsonLd({
      baseUrl,
      items: [
        { name: "Home", path: "/" },
        { name: merchLabel, path: "/merch" },
      ],
    }),
  ]),
  priority: "0.8",
  changefreq: "weekly",
});

const getCategory = (id) => categories.find((category) => category.id === id);

products.forEach((product) => {
  const category = getCategory(product.categoryId);
  const categoryName = category ? categorySeoName(category) : "";
  const routePath = `/product/${product.id}`;
  const title = `${product.name} | ${brand}`;
  const description = productDescription(product);

  addRoute({
    path: routePath,
    title,
    description,
    image: product.image,
    type: "product",
    preload: true,
    heading: product.name,
    noscriptIntro: description,
    noscriptLinks: [
      ...(categoryName ? [{ name: categoryName, path: `/${category.slug}` }] : []),
      { name: "All products", path: "/products" },
    ],
    jsonLd: withGlobal([
      productJsonLd({
        site,
        baseUrl,
        product,
        path: routePath,
        category: categoryName || undefined,
      }),
      breadcrumbJsonLd({
        baseUrl,
        items: [
          { name: "Home", path: "/" },
          { name: "Products", path: "/products" },
          ...(categoryName
            ? [{ name: categoryName, path: `/${category.slug}` }]
            : []),
          { name: product.name, path: routePath },
        ],
      }),
    ]),
    priority: "0.7",
    changefreq: "weekly",
  });
});

merch.forEach((item) => {
  const routePath = `/merch/${item.id}`;
  const title = `${item.name} | ${brand}`;
  const description = productDescription(item);

  addRoute({
    path: routePath,
    title,
    description,
    image: item.image,
    type: "product",
    preload: true,
    heading: item.name,
    noscriptIntro: description,
    noscriptLinks: [{ name: merchLabel, path: "/merch" }],
    jsonLd: withGlobal([
      productJsonLd({
        site,
        baseUrl,
        product: item,
        path: routePath,
        category: merchLabel,
      }),
      breadcrumbJsonLd({
        baseUrl,
        items: [
          { name: "Home", path: "/" },
          { name: merchLabel, path: "/merch" },
          { name: item.name, path: routePath },
        ],
      }),
    ]),
    priority: "0.7",
    changefreq: "weekly",
  });
});

const aboutTitle = brandText(about.heroTitle) || `About ${brand}`;
const aboutDescription = brandText(about.heroText) || `Learn more about ${brand}.`;

addRoute({
  path: "/about",
  title: aboutTitle,
  description: aboutDescription,
  image: images.about,
  type: "article",
  heading: aboutTitle,
  noscriptIntro: aboutDescription,
  jsonLd: withGlobal([
    webPageJsonLd({
      type: "AboutPage",
      name: aboutTitle,
      description: aboutDescription,
      url: absoluteUrl(baseUrl, "/about"),
    }),
    ...(Array.isArray(about.faqItems) && about.faqItems.length
      ? [faqJsonLd(about.faqItems)]
      : []),
    breadcrumbJsonLd({
      baseUrl,
      items: [
        { name: "Home", path: "/" },
        { name: "About", path: "/about" },
      ],
    }),
  ]),
  priority: "0.6",
  changefreq: "monthly",
});

addRoute({
  path: "/contact",
  title: `Contact ${brand}`,
  description: `Contact ${brand} customer and order support by email, phone or live chat.`,
  image: images.hero,
  heading: `Contact ${brand}`,
  noscriptIntro: `Contact ${brand} customer and order support by email, phone or live chat.`,
  jsonLd: withGlobal([
    webPageJsonLd({
      type: "ContactPage",
      name: `Contact ${brand}`,
      description: `Contact ${brand} customer and order support.`,
      url: absoluteUrl(baseUrl, "/contact"),
    }),
    breadcrumbJsonLd({
      baseUrl,
      items: [
        { name: "Home", path: "/" },
        { name: "Contact", path: "/contact" },
      ],
    }),
  ]),
  priority: "0.6",
  changefreq: "monthly",
});

const legalPages = [
  {
    path: "/privacy",
    title: "Privacy Policy",
    description: "How we handle your information.",
  },
  {
    path: "/terms",
    title: "Terms & Conditions",
    description: "Please review these terms before using the site.",
  },
  {
    path: "/shipping",
    title: "Shipping & Returns",
    description: "Our order-request process, shipping and return terms.",
  },
];

legalPages.forEach((page) => {
  addRoute({
    path: page.path,
    title: `${page.title} | ${brand}`,
    description: page.description,
    type: "article",
    heading: page.title,
    noscriptIntro: page.description,
    jsonLd: withGlobal([
      webPageJsonLd({
        name: `${page.title} | ${brand}`,
        description: page.description,
        url: absoluteUrl(baseUrl, page.path),
      }),
      breadcrumbJsonLd({
        baseUrl,
        items: [
          { name: "Home", path: "/" },
          { name: page.title, path: page.path },
        ],
      }),
    ]),
    priority: "0.3",
    changefreq: "yearly",
  });
});

addRoute({
  path: "/order",
  title: `Your Cart | ${brand}`,
  description: "Review your order request and send it to our team.",
  noindex: true,
  heading: "Your Cart",
  noscriptIntro:
    "Review your order request and send it to our team. The cart uses JavaScript, so please enable JavaScript to build and submit a request.",
  jsonLd: [],
});

const template = fs.readFileSync(templatePath, "utf8");
const marker = /<meta\s+name="seo-placeholder"[^>]*>\s*/i;
const defaultTitle = /<title>[\s\S]*?<\/title>\s*/i;
const defaultDescription = /<meta\s+name="description"[^>]*>\s*/i;

if (!marker.test(template)) {
  console.error(
    '[seo] Placeholder <meta name="seo-placeholder" content="replace-me" /> not found in index.html.'
  );
  process.exit(1);
}

const renderRoute = (route) => {
  const seo = buildSeo({
    site,
    baseUrl,
    title: route.title,
    description: route.description,
    path: route.path,
    image: route.image,
    type: route.type || "website",
    noindex: Boolean(route.noindex),
    jsonLd: route.jsonLd || [],
  });

  const head = seoToHtml(seo);
  const preload =
    route.preload && seo.image
      ? `<link rel="preload" as="image" href="${escapeHtml(seo.image)}" />`
      : "";

  return template
    .replace(defaultTitle, "")
    .replace(defaultDescription, "")
    .replace(marker, `${preload ? `${preload}\n    ` : ""}${head}\n    `)
    .replace(
      /<noscript>[\s\S]*?<\/noscript>/i,
      `<noscript>${buildNoscript(route)}</noscript>`
    );
};

routes.forEach((route) => {
  const relative = route.path.replace(/^\/+/, "");
  const target =
    route.path === "/"
      ? path.join(distDir, "index.html")
      : path.join(distDir, `${relative}.html`);

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, renderRoute(route), "utf8");
});

const sitemapUrls = routes
  .filter((route) => !route.noindex)
  .map(
    (route) => `  <url>
    <loc>${escapeXml(absoluteUrl(baseUrl, route.path))}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq || "monthly"}</changefreq>
    <priority>${route.priority || "0.5"}</priority>
  </url>`
  )
  .join("\n");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls}
</urlset>
`;

const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /order

Sitemap: ${absoluteUrl(baseUrl, "/sitemap.xml")}
`;

fs.writeFileSync(path.join(distDir, "sitemap.xml"), sitemap, "utf8");
fs.writeFileSync(path.join(distDir, "robots.txt"), robots, "utf8");

console.log(
  `[seo] Prerendered ${routes.length} routes, sitemap.xml and robots.txt for ${baseUrl}`
);
