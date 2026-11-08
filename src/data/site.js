import catalog from "./catalog.json";
import { resolveAbout } from "./about.js";

export const site = catalog.site;
export const about = resolveAbout(catalog.about);
export const announcements = catalog.announcements;
export const freeGift = catalog.freeGift;
export const ageGate = catalog.ageGate;
export const images = catalog.images;
export const discounts = catalog.discounts;
export const paymentMethods = catalog.paymentMethods;
export const categories = catalog.categories;
export const products = catalog.products;
export const merch = catalog.merch;
export const getCategory = (id) => categories.find((c) => c.id === id);

// A category name of "." (or empty) is a placeholder that should not be shown.
const placeholderName = /^\.*$/;
export const isPlaceholderName = (value) => placeholderName.test(String(value ?? "").trim());
export const visibleName = (value) =>
  isPlaceholderName(value) ? "" : String(value ?? "").trim();
export const categorySeoName = (category) =>
  visibleName(category?.name) ||
  String(category?.introTitle || category?.blurb || "").trim() ||
  "Products";
