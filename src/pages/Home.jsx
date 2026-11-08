import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import { site, images, categories, visibleName } from "../data/site.js";

export default function Home() {
  const categoryNames = categories
    .map((c) => visibleName(c.name) || c.blurb)
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <Seo
        title={`${site.name} | ${site.tagline}`}
        description={`${site.name} — ${site.tagline} Browse ${categories.length} product categories including ${categoryNames}.`}
        image={images.hero}
      />
      {/* HERO: background art = images.hero */}
      <section className="hero">
        <div className="hero-art">
          {images.hero && <img src={images.hero} alt={`${site.name} athlete training`} />}
        </div>
        <div className="container">
          <div className="hero-content">
            <div className="eyebrow">{site.name}</div>
            <h1>
              Built for those who <span>ascend.</span>
            </h1>
            <p className="lead">
              Premium clothing for training and everyday life. Clean cuts, strong fabrics and a sharp
              visual identity.
            </p>
            <div className="actions">
              <Link to="/products" className="btn btn-primary">Explore Products</Link>
              <Link to="/merch" className="btn btn-outline">Explore {site.merchLabel}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* THE BRAND */}
      <section className="section">
        <div className="container two brand-section">
          <div className="visual">
            {images.brand && <img src={images.brand} alt="Athlete training with dumbbells" />}
          </div>
          <div>
            <div className="eyebrow">The Brand</div>
            <h2>More than a catalog.</h2>
            <p className="lead" style={{ marginBottom: 16 }}>
              {site.name} curates high-quality apparel and premium athletic gear for serious
              athletes, creatives and everyday wearers, built on strict quality standards and a
              clean, premium aesthetic.
            </p>
            <p className="body-lg" style={{ marginBottom: 16 }}>
              Every piece is checked for fabric, fit and finish before it is listed, and every order
              runs through a discreet Order-Request Workflow: no card is charged until your items are
              verified and your dispatch is confirmed.
            </p>
            <Link to="/about" className="btn btn-primary">Learn More About Us</Link>
          </div>
        </div>
      </section>

      {/* CATALOG */}
      <section className="section gray" id="categories">
        <div className="container">
          <div className="eyebrow">Catalog</div>
          <h2>Browse by category</h2>
          <div className="two catalog-split">
            <div>
              <p className="lead" style={{ marginBottom: 24 }}>
                Seven specialized divisions cover the full range of the collection, from everyday
                basics to outerwear and accessories:
              </p>
              <ul className="cat-list">
                {categories.map((c) => (
                  <li key={c.id}>
                    <Link to={`/${c.slug}`}>
                      {visibleName(c.name) && <strong>{c.name}</strong>}
                      <span>{c.blurb}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link to="/products" className="btn btn-primary">Browse Products</Link>
            </div>
            <div className="visual">
              {images.lineup && <img src={images.lineup} alt={`${site.name} product lineup`} />}
            </div>
          </div>
        </div>
      </section>

      {/* TRAINING CULTURE */}
      <section className="section black">
        <div className="container two">
          <div>
            <div className="eyebrow">Training Culture</div>
            <h2>The gym is part of the identity.</h2>
            <p className="lead">
              Strong photography throughout the site: heavy training, focused athletes, gym equipment
              and dramatic lighting.
            </p>
          </div>
          <div className="visual">
            {images.lifestyle && <img src={images.lifestyle} alt="Athlete training in a dark industrial gym" />}
          </div>
        </div>
      </section>

      {/* MERCHANDISE */}
      <section className="section gray">
        <div className="container two">
          <div>
            <div className="eyebrow">Merchandise</div>
            <h2>Wear the identity.</h2>
            <p className="lead">
              Classic T-shirt, performance tank, long-sleeve training shirt, polo, hoodie, joggers,
              gym shorts, cap and shaker bottle.
            </p>
            <Link to="/merch" className="btn btn-primary">Explore {site.merchLabel}</Link>
          </div>
          <div className="visual">
            {images.merchTeaser && <img src={images.merchTeaser} alt="Athlete wearing gym apparel" />}
          </div>
        </div>
      </section>
    </>
  );
}
