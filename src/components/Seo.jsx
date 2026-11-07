import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { site } from "../data/site.js";
import { buildSeo, DEFAULT_SITE_URL } from "../data/seo.js";

const envSiteUrl = String(import.meta.env.VITE_SITE_URL || "").trim();

const getBaseUrl = () => {
  if (envSiteUrl) return envSiteUrl;
  return DEFAULT_SITE_URL;
};

const setMeta = (key, value, attribute = "name") => {
  const selector = `meta[${attribute}="${key}"]`;
  const existing = document.head.querySelector(selector);
  if (value == null || value === "") {
    if (existing) existing.remove();
    return;
  }
  const element = existing || document.createElement("meta");
  if (!existing) {
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", value);
};

const setLink = (rel, href) => {
  const selector = `link[rel="${rel}"]`;
  const existing = document.head.querySelector(selector);
  if (!href) {
    if (existing) existing.remove();
    return;
  }
  const element = existing || document.createElement("link");
  if (!existing) {
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
};

// Updates the document head on client-side navigation. Static crawlers get the
// same tags prerendered per route by scripts/postbuild-seo.mjs.
export default function Seo({
  title,
  description,
  path,
  image,
  type = "website",
  noindex = false,
}) {
  const location = useLocation();
  const baseUrl = getBaseUrl();
  const canonicalPath = path || location.pathname;
  const data = buildSeo({
    site,
    baseUrl,
    title,
    description,
    path: canonicalPath,
    image,
    type,
    noindex,
  });

  useEffect(() => {
    document.title = data.title;

    setMeta("description", data.description);
    setMeta("robots", data.robots);
    setLink("canonical", data.canonical);

    setMeta("og:type", data.type, "property");
    setMeta("og:site_name", data.siteName, "property");
    setMeta("og:title", data.title, "property");
    setMeta("og:description", data.description, "property");
    setMeta("og:url", data.url, "property");
    setMeta("og:image", data.image, "property");
    setMeta("og:image:alt", data.imageAlt, "property");
    setMeta("og:locale", data.locale, "property");

    setMeta("twitter:card", data.twitterCard);
    setMeta("twitter:title", data.title);
    setMeta("twitter:description", data.description);
    setMeta("twitter:image", data.image);

    document.head.querySelector('meta[name="seo-placeholder"]')?.remove();
  }, [
    data.title,
    data.description,
    data.robots,
    data.canonical,
    data.url,
    data.type,
    data.image,
    data.imageAlt,
    data.siteName,
    data.locale,
    data.twitterCard,
  ]);

  return null;
}
