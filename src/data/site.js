import catalog from "./catalog.json";

export const site = catalog.site;
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
