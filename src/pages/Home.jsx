import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import { site, images, categories, home, visibleName } from "../data/site.js";
import { formatHomeText } from "../data/home.js";

export default function Home() {
  const text = (value) => formatHomeText(value, site.name, site.merchLabel);
  const categoryNames = categories
    .map((c) => visibleName(c.name) || c.blurb)
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <Seo
        title={text(home.seoTitle) || `${site.name} | ${site.tagline}`}
        description={
          text(home.seoDescription) ||
          `${site.name} — ${site.tagline} Browse ${categories.length} product categories including ${categoryNames}.`
        }
        image={images.hero}
      />
      {/* HERO: background art = images.hero */}
      <section className="hero">
        <div className="hero-art">
          {images.hero && <img src={images.hero} alt={`${site.name} athlete training`} />}
        </div>
        <div className="container">
          <div className="hero-content">
            <div className="eyebrow">{text(home.heroEyebrow)}</div>
            <h1>
              {text(home.heroTitle)}
              {text(home.heroAccent) && (
                <>
                  {" "}
                  <span>{text(home.heroAccent)}</span>
                </>
              )}
            </h1>
            <p className="lead">{text(home.heroText)}</p>
            <div className="actions">
              <Link to={home.heroPrimaryLink || "/products"} className="btn btn-primary">
                {text(home.heroPrimaryLabel)}
              </Link>
              <Link to={home.heroSecondaryLink || "/merch"} className="btn btn-outline">
                {text(home.heroSecondaryLabel)}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* THE BRAND */}
      {home.showBrand && (
        <section className="section">
          <div className="container two brand-section">
            <div className="visual">
              {images.brand && <img src={images.brand} alt="Athlete training with dumbbells" />}
            </div>
            <div>
              <div className="eyebrow">{text(home.brandEyebrow)}</div>
              <h2>{text(home.brandTitle)}</h2>
              <p className="lead" style={{ marginBottom: 16 }}>
                {text(home.brandText)}
              </p>
              <p className="body-lg" style={{ marginBottom: 16 }}>
                {text(home.brandBody)}
              </p>
              <Link to={home.brandCtaLink || "/about"} className="btn btn-primary">
                {text(home.brandCtaLabel)}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CATALOG */}
      {home.showCatalog && (
        <section className="section gray" id="categories">
          <div className="container">
            <div className="eyebrow">{text(home.catalogEyebrow)}</div>
            <h2>{text(home.catalogTitle)}</h2>
            <div className="two catalog-split">
              <div>
                <p className="lead" style={{ marginBottom: 24 }}>
                  {text(home.catalogText)}
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
                <Link to={home.catalogCtaLink || "/products"} className="btn btn-primary">
                  {text(home.catalogCtaLabel)}
                </Link>
              </div>
              <div className="visual">
                {images.lineup && <img src={images.lineup} alt={`${site.name} product lineup`} />}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TRAINING CULTURE */}
      {home.showTraining && (
        <section className="section black">
          <div className="container two">
            <div>
              <div className="eyebrow">{text(home.trainingEyebrow)}</div>
              <h2>{text(home.trainingTitle)}</h2>
              <p className="lead">{text(home.trainingText)}</p>
            </div>
            <div className="visual">
              {images.lifestyle && (
                <img src={images.lifestyle} alt="Athlete training in a dark industrial gym" />
              )}
            </div>
          </div>
        </section>
      )}

      {/* MERCHANDISE */}
      {home.showMerch && (
        <section className="section gray">
          <div className="container two">
            <div>
              <div className="eyebrow">{text(home.merchEyebrow)}</div>
              <h2>{text(home.merchTitle)}</h2>
              <p className="lead">{text(home.merchText)}</p>
              <Link to={home.merchCtaLink || "/merch"} className="btn btn-primary">
                {text(home.merchCtaLabel)}
              </Link>
            </div>
            <div className="visual">
              {images.merchTeaser && <img src={images.merchTeaser} alt="Athlete wearing gym apparel" />}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
