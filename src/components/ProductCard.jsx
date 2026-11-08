import { Link } from "react-router-dom";
import ImagePlaceholder from "./ImagePlaceholder.jsx";
import { useCart } from "../context/CartContext.jsx";
import { getCategory, site, visibleName } from "../data/site.js";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const isMerch = product.kind === "merch";
  const cat = !isMerch ? getCategory(product.categoryId) : null;
  const href = isMerch ? `/merch/${product.id}` : `/product/${product.id}`;

  return (
    <article className="product-card">
      <Link to={href} aria-label={product.name}>
        <ImagePlaceholder src={product.image} alt={product.name} label="Product image" ratio="4 / 5" />
      </Link>
      <div className="product-body">
        {(isMerch || visibleName(cat?.name)) && (
          <p className="card-eyebrow">
            {isMerch ? site.merchLabel : visibleName(cat.name)}
          </p>
        )}
        <h3>{product.name}</h3>
        {isMerch && <p className="muted">{product.description}</p>}
        <p className="price">
          {site.currency}
          {product.price}
        </p>
        <div className="btn-pair">
          <Link to={href} className="btn btn-outline">
            {isMerch ? `View ${site.merchLabel}` : "View product"}
          </Link>
          <button className="btn btn-primary" onClick={() => addItem(product)}>
            Add to cart
          </button>
        </div>
      </div>
    </article>
  );
}
