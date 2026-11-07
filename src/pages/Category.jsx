import Breadcrumbs from "../components/Breadcrumbs.jsx";
import ProductCard from "../components/ProductCard.jsx";
import Seo from "../components/Seo.jsx";
import { products, site } from "../data/site.js";

const paragraphs = (value) =>
  String(value || "")
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);

export default function Category({ category }) {
  const list = products.filter((p) => p.categoryId === category.id);
  const faq = Array.isArray(category.faq)
    ? category.faq.filter((item) => item && item.q && item.a)
    : [];
  const text = (value) => String(value || "").replace(/\{brand\}/g, site.name);

  return (
    <>
      <Seo
        title={`${category.name} | ${site.name}`}
        description={
          category.seoDescription ||
          `${category.blurb || category.name}. Shop ${category.name} products at ${site.name}.`
        }
        path={`/${category.slug}`}
        image={category.banner || category.cardImage}
      />
      <div className="breadcrumb-bar">
        <div className="container">
          <Breadcrumbs
            items={[
              { name: "Home", path: "/" },
              { name: "Products", path: "/products" },
              { name: category.name, path: `/${category.slug}` },
            ]}
          />
        </div>
      </div>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Category {category.id}</p>
          <h1>{category.name}</h1>
          <p className="lead">{category.blurb}</p>
        </div>
      </section>
      {category.banner && (
        <div className="category-banner">
          <img
            src={category.banner}
            alt={`${category.name} product category`}
            loading="eager"
            decoding="async"
            fetchpriority="high"
          />
        </div>
      )}
      <section className="section">
        <div className="container">
          <div className="grid grid-products">
            {list.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {category.intro && (
        <section className="section section-alt category-intro">
          <div className="container prose">
            <p className="eyebrow">Category guide</p>
            <h2>{text(category.introTitle) || `About ${category.name}`}</h2>
            {paragraphs(text(category.intro)).map((paragraph, index) => (
              <p key={index} className="body-lg">
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      )}

      {faq.length > 0 && (
        <section className="section">
          <div className="container prose">
            <p className="eyebrow">FAQ</p>
            <h2>{text(category.faqTitle) || `${category.name} frequently asked questions`}</h2>
            <div className="faq">
              {faq.map((item, index) => (
                <details key={index}>
                  <summary>{text(item.q)}</summary>
                  <p>{text(item.a)}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
