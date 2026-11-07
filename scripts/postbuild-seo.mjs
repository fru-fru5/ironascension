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
const globalJsonLd = siteJsonLd({ site, baseUrl, logo: images.logoHeader });
const withGlobal = (items = []) => [...globalJsonLd, ...items];
const today = new Date().toISOString().slice(0, 10);
const merchLabel = site.merchLabel || "Merch";

const productDescription = (product) => {
  const text = String(product.description || "")
    .replace(/^in stock\s*/i, "")
    .trim();
  return cleanText(text || `${product.name} from ${brand}.`);
};

const homeDescription = cleanText(
  `${brand} — ${site.tagline || "Premium performance products"}. Browse ${categories
    .map((category) => category.name)
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
  const title = `${category.name} | ${brand}`;
  const description = cleanText(
    `${category.blurb || category.name}. Shop ${category.name} products at ${brand}.`
  );

  addRoute({
    path: `/${category.slug}`,
    title,
    description,
    image: category.banner || category.cardImage,
    jsonLd: withGlobal([
      collectionPageJsonLd({
        name: title,
        description,
        url: absoluteUrl(baseUrl, `/${category.slug}`),
      }),
      itemListJsonLd({
        name: `${category.name} products`,
        baseUrl,
        items: list.map((product) => ({
          name: product.name,
          path: `/product/${product.id}`,
        })),
      }),
      breadcrumbJsonLd({
        baseUrl,
        items: [
          { name: "Home", path: "/" },
          { name: "Products", path: "/products" },
          { name: category.name, path: `/${category.slug}` },
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
  const routePath = `/product/${product.id}`;
  const title = `${product.name} | ${brand}`;
  const description = productDescription(product);

  addRoute({
    path: routePath,
    title,
    description,
    image: product.image,
    type: "product",
    jsonLd: withGlobal([
      productJsonLd({
        site,
        baseUrl,
        product,
        path: routePath,
        category: category?.name,
      }),
      breadcrumbJsonLd({
        baseUrl,
        items: [
          { name: "Home", path: "/" },
          { name: "Products", path: "/products" },
          ...(category
            ? [{ name: category.name, path: `/${category.slug}` }]
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

  return template
    .replace(defaultTitle, "")
    .replace(defaultDescription, "")
    .replace(marker, `${head}\n    `);
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
