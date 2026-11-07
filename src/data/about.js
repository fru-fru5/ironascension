import { faq } from "./legal.js";

export const defaultAbout = {
  heroEyebrow: "The Brand",
  heroTitle: "About {brand}",
  heroText: "Considered design. Honest materials. Built to be worn hard.",
  introTitle: "More than a storefront.",
  introBody:
    "At {brand}, we design and curate premium clothing for athletes, creatives and everyday wearers. Our platform is a complete destination for tees, tanks, outerwear, bottoms and accessories, all built on strict standards for fabric, fit and finish.",
  catalogEyebrow: "Catalog",
  catalogTitle: "Our Catalog & Product Divisions",
  catalogText: "We maintain distinct divisions, plus a dedicated merch line.",
  merchTitle: "{brand} Merch",
  merchText: "A dedicated line of premium athletic apparel and training gear.",
  processEyebrow: "The Order-Request System",
  processTitle: "Discretion. Verification. Confirmation.",
  processText:
    "To keep every order accurate and discreet, {brand} uses an Order-Request Cart Workflow rather than direct online payment processing.",
  processSteps: [
    {
      title: "Select & Reserve",
      text: "Browse the catalog or merch section, choose your items, and submit an order request through the reservation cart.",
    },
    {
      title: "Stock Verification",
      text: "Our team reviews your request, verifies stock availability for your items, and reserves your allocation.",
    },
    {
      title: "Fulfillment Confirmation",
      text: "You receive direct, secure confirmation details with your order breakdown and simple payment steps to start dispatch.",
    },
  ],
  qualityEyebrow: "Quality Assurance & Transparency",
  qualityTitle: "Checked, every batch.",
  qualityBody:
    "Every item is inspected for stitching, fabric weight and colour consistency before it is listed. Whether you are ordering core pieces or official {brand} gear, we prioritize total transparency and premium execution.",
  faqEyebrow: "FAQ",
  faqTitle: "Frequently Asked Questions",
  faqItems: faq,
  ctaEyebrow: "Get In Touch",
  ctaTitle: "Questions about your order?",
  ctaText: "Our customer support team is available to assist with order requests or availability.",
  ctaPrimaryLabel: "Contact Support",
  ctaSecondaryLabel: "Browse Catalog",
};

export const resolveAbout = (value) => {
  const about = value && typeof value === "object" ? value : {};
  return {
    ...defaultAbout,
    ...about,
    processSteps: Array.isArray(about.processSteps) ? about.processSteps : defaultAbout.processSteps,
    faqItems: Array.isArray(about.faqItems) ? about.faqItems : defaultAbout.faqItems,
  };
};

export const formatAboutText = (value, brand = "") =>
  String(value ?? "").replace(/\{brand\}/g, brand);
