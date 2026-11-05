import { Link } from "react-router-dom";
import PageHero from "../components/PageHero.jsx";
import ImagePlaceholder from "../components/ImagePlaceholder.jsx";
import BgSection from "../components/BgSection.jsx";
import { site, images, categories } from "../data/site.js";
import { faq } from "../data/legal.js";

const pad = (n) => String(n).padStart(2, "0");

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="The Brand"
        title={`About ${site.name}`}
        text="Considered design. Honest materials. Built to be worn hard."
      />

      <section className="section">
        <div className="container split">
          <div>
            <h2>More than a storefront.</h2>
            <p className="body-lg">
              At {site.name}, we design and curate premium clothing for athletes, creatives and
              everyday wearers. Our platform is a complete destination for tees, tanks, outerwear,
              bottoms and accessories, all built on strict standards for fabric, fit and finish.
            </p>
          </div>
          <ImagePlaceholder src={images.about} alt="Editorial portrait" label="Editorial portrait (images.about)" ratio="4 / 5" />
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <p className="eyebrow">Catalog</p>
          <h2>Our Catalog &amp; Product Divisions</h2>
          <p className="body-lg">We maintain distinct divisions, plus a dedicated merch line.</p>
          <div className="grid grid-info">
            {categories.map((c) => (
              <Link key={c.id} to={`/${c.slug}`} className="info-card">
                <span className="info-num">{pad(c.id)}</span>
                <h3>{c.name}</h3>
                <p className="muted">{c.blurb}</p>
              </Link>
            ))}
            <Link to="/merch" className="info-card">
              <span className="info-num">{pad(categories.length + 1)}</span>
              <h3>{site.name} {site.merchLabel}</h3>
              <p className="muted">A dedicated line of premium athletic apparel and training gear.</p>
            </Link>
          </div>
          <div className="gap-md" />
          <ImagePlaceholder src={images.aboutLineup} alt="Product lineup" label="Lineup image (images.aboutLineup)" ratio="16 / 9" />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="eyebrow">The Order-Request System</p>
          <h2>Discretion. Verification. Confirmation.</h2>
          <p className="body-lg">
            To keep every order accurate and discreet, {site.name} uses an Order-Request Cart
            Workflow rather than direct online payment processing.
          </p>
          <ol className="steps">
            <li>
              <h3>Select &amp; Reserve</h3>
              <p className="muted">Browse the catalog or merch section, choose your items and sizes, and submit an order request through the reservation cart.</p>
            </li>
            <li>
              <h3>Stock &amp; Size Verification</h3>
              <p className="muted">Our team reviews your request, verifies stock availability for your items and sizes, and reserves your allocation.</p>
            </li>
            <li>
              <h3>Fulfillment Confirmation</h3>
              <p className="muted">You receive direct, secure confirmation details with your order breakdown and simple payment steps to start dispatch.</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container prose">
          <p className="eyebrow">Quality Assurance &amp; Transparency</p>
          <h2>Checked, every batch.</h2>
          <p className="body-lg">
            Every item is inspected for stitching, fabric weight, colour consistency and sizing
            before it is listed. Whether you are ordering core pieces or official {site.name} gear,
            we prioritize total transparency and premium execution.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container prose">
          <p className="eyebrow">FAQ</p>
          <h2>Frequently Asked Questions</h2>
          <div className="faq">
            {faq.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA: background image slot = images.aboutCta */}
      <BgSection src={images.aboutCta} label="CTA background (images.aboutCta)" className="cta">
        <p className="eyebrow">Get In Touch</p>
        <h2>Questions about your order or sizing?</h2>
        <p className="lead">Our customer support team is available to assist with order requests, availability or sizing.</p>
        <div className="btn-stack">
          <Link to="/contact" className="btn btn-primary">Contact Support</Link>
          <Link to="/products" className="btn btn-outline">Browse Catalog</Link>
        </div>
      </BgSection>
    </>
  );
}
