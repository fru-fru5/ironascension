import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import ImagePlaceholder from "../components/ImagePlaceholder.jsx";
import { BackArrow } from "../components/Icons.jsx";
import { useCart } from "../context/CartContext.jsx";
import { getCategory, merch, products, site } from "../data/site.js";
import NotFound from "./NotFound.jsx";

export default function ProductDetail() {
  const { id } = useParams();
  const product = [...products, ...merch].find((p) => p.id === id);
  const { addItem } = useCart();
  const [size, setSize] = useState(null);
  const [qty, setQty] = useState(1);

  if (!product) return <NotFound />;
  const isMerch = product.kind === "merch";
  const cat = isMerch ? null : getCategory(product.categoryId);
  const chosen = size || (product.sizes.includes(site.defaultSize) ? site.defaultSize : product.sizes[0]);

  return (
    <section className="section">
      <div className="container">
        <Link to={isMerch ? "/merch" : cat ? `/${cat.slug}` : "/products"} className="back-link">
          <BackArrow /> Back to {isMerch ? site.merchLabel.toLowerCase() : "category"}
        </Link>
        <div className="split split-top">
          <ImagePlaceholder src={product.image} alt={product.name} label="Product image" ratio="4 / 5" />
          <div>
            <p className="eyebrow">{isMerch ? site.merchLabel : `Category ${cat.id} · ${cat.name}`}</p>
            <h1 className="h1-plain">{product.name}</h1>
            <p className="price price-lg">
              {site.currency}
              {product.price}
            </p>
            <p className="body-lg">{product.description}</p>

            <div className="form">
              <label>
                Size
                <select value={chosen} onChange={(e) => setSize(e.target.value)}>
                  {product.sizes.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <div>
                <span className="label-text">Quantity</span>
                <div className="qty">
                  <button aria-label="Decrease quantity" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                  <span>{qty}</span>
                  <button aria-label="Increase quantity" onClick={() => setQty(qty + 1)}>+</button>
                </div>
              </div>
              <button className="btn btn-primary btn-block" onClick={() => addItem(product, chosen, qty)}>
                Add to cart
              </button>
              <Link to="/order" className="btn btn-outline btn-block">Go to cart</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
