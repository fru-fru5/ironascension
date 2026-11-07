import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import PageHero from "../components/PageHero.jsx";
import SearchBox from "../components/SearchBox.jsx";
import ProductCard from "../components/ProductCard.jsx";
import Seo from "../components/Seo.jsx";
import { images, categories, products, site } from "../data/site.js";

export default function Products() {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const results = useMemo(
    () => (query ? products.filter((p) => p.name.toLowerCase().includes(query)) : []),
    [query]
  );

  return (
    <>
      <Seo
        title={`Shop All Products | ${site.name}`}
        description={`Browse all ${products.length} products across ${categories.length} categories at ${site.name}. Search the catalog and request your order online.`}
        image={images.productsHero}
      />
      <div className="breadcrumb-bar">
        <div className="container">
          <Breadcrumbs
            items={[
              { name: "Home", path: "/" },
              { name: "Products", path: "/products" },
            ]}
          />
        </div>
      </div>
      <PageHero
        withBg
        bg={images.productsHero}
        bgLabel="Products hero background (images.productsHero)"
        eyebrow="Products"
        title="Product Categories"
        text="Browse the seven product categories and their assigned products."
      />
      <section className="section section-search">
        <div className="container">
          <SearchBox value={q} onChange={setQ} placeholder="Search products..." />
          <div className="gap-md" />
          {query ? (
            results.length ? (
              <div className="grid grid-products">
                {results.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <p className="muted">No products match "{q}".</p>
            )
          ) : (
            <div className="grid category-index">
              {categories.map((c) => {
                const n = products.filter((p) => p.categoryId === c.id).length;
                return (
                  <Link
                    key={c.id}
                    to={`/${c.slug}`}
                    className="category"
                    style={{ backgroundImage: `url(${c.cardImage || c.banner})` }}
                  >
                    <small>Category {String(c.id).padStart(2, "0")}</small>
                    <h3>{c.name}</h3>
                    <span>
                      {n} {n === 1 ? "product" : "products"} →
                    </span>
                  </Link>
                );
              })}
              <Link
                to="/merch"
                className="category"
                style={{ backgroundImage: `url(${images.lineup})` }}
              >
                <small>Collection</small>
                <h3>{site.merchLabel}</h3>
                <span>View merchandise →</span>
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
