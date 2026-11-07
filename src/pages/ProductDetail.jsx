import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import ImagePlaceholder from "../components/ImagePlaceholder.jsx";
import ProductCard from "../components/ProductCard.jsx";
import Seo from "../components/Seo.jsx";
import { useCart } from "../context/CartContext.jsx";
import { getCategory, merch, products, site } from "../data/site.js";
import NotFound from "./NotFound.jsx";

const summarize = (value) =>
  String(value || "")
    .replace(/^in stock\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();

export default function ProductDetail() {
  const { id } = useParams();
  const product = [...products, ...merch].find((p) => p.id === id);
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);

  if (!product) return <NotFound />;
  const isMerch = product.kind === "merch";
  const cat = isMerch ? null : getCategory(product.categoryId);
  const path = isMerch ? `/merch/${product.id}` : `/product/${product.id}`;
  const backPath = isMerch ? "/merch" : cat ? `/${cat.slug}` : "/products";
  const backLabel = isMerch ? site.merchLabel : cat ? cat.name : "Products";

  const sameGroup = isMerch
    ? merch.filter((item) => item.id !== product.id)
    : products.filter((item) => item.id !== product.id && item.categoryId === product.categoryId);
  const seen = new Set([product.id, ...sameGroup.map((item) => item.id)]);
  const fillers = [...products, ...merch].filter((item) => !seen.has(item.id));
  const related = [...sameGroup, ...fillers].slice(0, 4);

  const breadcrumbItems = isMerch
    ? [
        { name: "Home", path: "/" },
        { name: site.merchLabel, path: "/merch" },
        { name: product.name, path },
      ]
    : [
        { name: "Home", path: "/" },
        { name: "Products", path: "/products" },
        ...(cat ? [{ name: cat.name, path: `/${cat.slug}` }] : []),
        { name: product.name, path },
      ];

  return (
    <>
      <Seo
        title={`${product.name} | ${site.name}`}
        description={summarize(product.description) || `${product.name} from ${site.name}.`}
        path={path}
        image={product.image}
        type="product"
      />
      <div className="breadcrumb-bar">
        <div className="container">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
      </div>
      <section className="section">
        <div className="container">
          <div className="split split-top">
            <ImagePlaceholder
              src={product.image}
              alt={product.name}
              label="Product image"
              ratio="4 / 5"
              eager
              priority
            />
            <div>
              <p className="eyebrow">
                {isMerch ? site.merchLabel : cat ? `Category ${cat.id} · ${cat.name}` : "Product"}
              </p>
              <h1 className="h1-plain">{product.name}</h1>
              <p className="price price-lg">
                {site.currency}
                {product.price}
              </p>
              <p className="body-lg">{product.description}</p>

              <div className="form">
                <div>
                  <span className="label-text">Quantity</span>
                  <div className="qty">
                    <button aria-label="Decrease quantity" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                    <span>{qty}</span>
                    <button aria-label="Increase quantity" onClick={() => setQty(qty + 1)}>+</button>
                  </div>
                </div>
                <button className="btn btn-primary btn-block" onClick={() => addItem(product, qty)}>
                  Add to cart
                </button>
                <Link to="/order" className="btn btn-outline btn-block">Go to cart</Link>
              </div>
              <p className="muted product-back">
                <Link to={backPath}>Browse all {backLabel}</Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section section-alt related-products">
          <div className="container">
            <div className="section-head">
              <div>
                <p className="eyebrow">Keep browsing</p>
                <h2>Related products</h2>
              </div>
              <Link to={backPath} className="btn btn-outline">View all {backLabel}</Link>
            </div>
            <div className="grid grid-products">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
