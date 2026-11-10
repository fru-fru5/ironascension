export const defaultHome = {
  seoTitle: "",
  seoDescription: "",

  heroEyebrow: "{brand}",
  heroTitle: "Built for those who",
  heroAccent: "ascend.",
  heroText:
    "Premium clothing for training and everyday life. Clean cuts, strong fabrics and a sharp visual identity.",
  heroPrimaryLabel: "Explore Products",
  heroPrimaryLink: "/products",
  heroSecondaryLabel: "Explore {merchLabel}",
  heroSecondaryLink: "/merch",

  showBrand: true,
  brandEyebrow: "The Brand",
  brandTitle: "More than a catalog.",
  brandText:
    "{brand} curates high-quality apparel and premium athletic gear for serious athletes, creatives and everyday wearers, built on strict quality standards and a clean, premium aesthetic.",
  brandBody:
    "Every piece is checked for fabric, fit and finish before it is listed, and every order runs through a discreet Order-Request Workflow: no card is charged until your items are verified and your dispatch is confirmed.",
  brandCtaLabel: "Learn More About Us",
  brandCtaLink: "/about",

  showCatalog: true,
  catalogEyebrow: "Catalog",
  catalogTitle: "Browse by category",
  catalogText:
    "Seven specialized divisions cover the full range of the collection, from everyday basics to outerwear and accessories:",
  catalogCtaLabel: "Browse Products",
  catalogCtaLink: "/products",

  showTraining: true,
  trainingEyebrow: "Training Culture",
  trainingTitle: "The gym is part of the identity.",
  trainingText:
    "Strong photography throughout the site: heavy training, focused athletes, gym equipment and dramatic lighting.",

  showMerch: true,
  merchEyebrow: "Merchandise",
  merchTitle: "Wear the identity.",
  merchText:
    "Classic T-shirt, performance tank, long-sleeve training shirt, polo, hoodie, joggers, gym shorts, cap and shaker bottle.",
  merchCtaLabel: "Explore {merchLabel}",
  merchCtaLink: "/merch",
};

export const resolveHome = (value) => {
  const home = value && typeof value === "object" ? value : {};
  return { ...defaultHome, ...home };
};

export const formatHomeText = (value, brand = "", merchLabel = "") =>
  String(value ?? "")
    .replace(/\{brand\}/g, brand)
    .replace(/\{merchLabel\}/g, merchLabel);
