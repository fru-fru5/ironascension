import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageHero from "../components/PageHero.jsx";
import SearchBox from "../components/SearchBox.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { images, categories, products } from "../data/site.js";

export default function Products() {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const results = useMemo(
    () => (query ? products.filter((p) => p.name.toLowerCase().includes(query)) : []),
    [query]
  );

  return (
    <>
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
                <span>View merchandise →</span>
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
