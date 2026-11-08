import { Link } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import PageHero from "../components/PageHero.jsx";
import ImagePlaceholder from "../components/ImagePlaceholder.jsx";
import BgSection from "../components/BgSection.jsx";
import Seo from "../components/Seo.jsx";
import { site, images, categories, about, visibleName } from "../data/site.js";
import { formatAboutText } from "../data/about.js";

const pad = (n) => String(n).padStart(2, "0");

export default function About() {
  const text = (value) => formatAboutText(value, site.name);

  return (
    <>
      <Seo
        title={text(about.heroTitle)}
        description={text(about.heroText)}
        path="/about"
        image={images.about}
        type="article"
      />
      <div className="breadcrumb-bar">
        <div className="container">
          <Breadcrumbs
            items={[
              { name: "Home", path: "/" },
              { name: "About", path: "/about" },
            ]}
          />
        </div>
      </div>
      <PageHero
        eyebrow={text(about.heroEyebrow)}
        title={text(about.heroTitle)}
        text={text(about.heroText)}
      />

      <section className="section">
        <div className="container split">
          <div>
            <h2>{text(about.introTitle)}</h2>
            <p className="body-lg">{text(about.introBody)}</p>
          </div>
          <ImagePlaceholder src={images.about} alt="Editorial portrait" label="Editorial portrait (images.about)" ratio="4 / 5" />
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <p className="eyebrow">{text(about.catalogEyebrow)}</p>
          <h2>{text(about.catalogTitle)}</h2>
          <p className="body-lg">{text(about.catalogText)}</p>
          <div className="grid grid-info">
            {categories.map((c) => (
              <Link key={c.id} to={`/${c.slug}`} className="info-card">
                <span className="info-num">{pad(c.id)}</span>
                {visibleName(c.name) && <h3>{c.name}</h3>}
                <p className="muted">{c.blurb}</p>
              </Link>
            ))}
            <Link to="/merch" className="info-card">
              <span className="info-num">{pad(categories.length + 1)}</span>
              <h3>{text(about.merchTitle)}</h3>
              <p className="muted">{text(about.merchText)}</p>
            </Link>
          </div>
          <div className="gap-md" />
          <ImagePlaceholder src={images.aboutLineup} alt="Product lineup" label="Lineup image (images.aboutLineup)" ratio="16 / 9" />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="eyebrow">{text(about.processEyebrow)}</p>
          <h2>{text(about.processTitle)}</h2>
          <p className="body-lg">{text(about.processText)}</p>
          <ol className="steps">
            {about.processSteps.map((step, index) => (
              <li key={index}>
                <h3>{text(step.title)}</h3>
                <p className="muted">{text(step.text)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container prose">
          <p className="eyebrow">{text(about.qualityEyebrow)}</p>
          <h2>{text(about.qualityTitle)}</h2>
          <p className="body-lg">{text(about.qualityBody)}</p>
        </div>
      </section>

      <section className="section">
        <div className="container prose">
          <p className="eyebrow">{text(about.faqEyebrow)}</p>
          <h2>{text(about.faqTitle)}</h2>
          <div className="faq">
            {about.faqItems.map((item, index) => (
              <details key={index}>
                <summary>{text(item.q)}</summary>
                <p>{text(item.a)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA: background image slot = images.aboutCta */}
      <BgSection src={images.aboutCta} label="CTA background (images.aboutCta)" className="cta">
        <p className="eyebrow">{text(about.ctaEyebrow)}</p>
        <h2>{text(about.ctaTitle)}</h2>
        <p className="lead">{text(about.ctaText)}</p>
        <div className="btn-stack">
          <Link to="/contact" className="btn btn-primary">{text(about.ctaPrimaryLabel)}</Link>
          <Link to="/products" className="btn btn-outline">{text(about.ctaSecondaryLabel)}</Link>
        </div>
      </BgSection>
    </>
  );
}
