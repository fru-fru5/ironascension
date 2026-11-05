import ProductCard from "../components/ProductCard.jsx";
import { products } from "../data/site.js";

export default function Category({ category }) {
  const list = products.filter((p) => p.categoryId === category.id);
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Category {category.id}</p>
          <h1>{category.name}</h1>
          <p className="lead">{category.blurb}</p>
        </div>
      </section>
      <div className="category-banner">
        <img src={category.banner} alt={`${category.name} banner`} />
      </div>
      <section className="section">
        <div className="container">
          <div className="grid grid-products">
            {list.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
