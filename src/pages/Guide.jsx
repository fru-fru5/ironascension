import { Link } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import PageHero from "../components/PageHero.jsx";
import Seo from "../components/Seo.jsx";
import { categories, discounts, freeGift, paymentMethods, site, visibleName } from "../data/site.js";
import { guideDescription, guideFaq } from "../data/guide.js";

const pad = (n) => String(n).padStart(2, "0");

export default function Guide() {
  return (
    <>
      <Seo
        title={`Ordering Guide | ${site.name}`}
        description={guideDescription}
        path="/guide"
        type="article"
      />
      <div className="breadcrumb-bar">
        <div className="container">
          <Breadcrumbs
            items={[
              { name: "Home", path: "/" },
              { name: "Buying Guide", path: "/guide" },
            ]}
          />
        </div>
      </div>
      <PageHero
        eyebrow="Buying Guide"
        title="How to order with confidence"
        text={guideDescription}
      />

      <section className="section">
        <div className="container">
          <p className="eyebrow">Step 1</p>
          <h2>Choose the right category</h2>
          <p className="body-lg">
            Our catalog is split into focused divisions so you can compare options by format and strength before
            you request anything. Every listing shows the current catalog price and a clear product description.
          </p>
          <div className="grid grid-info">
            {categories.map((category) => (
              <Link key={category.id} to={`/${category.slug}`} className="info-card">
                <span className="info-num">{pad(category.id)}</span>
                <h3>{visibleName(category.name) || category.blurb}</h3>
                <p className="muted">{category.blurb}</p>
              </Link>
            ))}
          </div>
          <div className="gap-md" />
          <p>
            Not sure where to start? <Link to="/contact" className="link-btn">Ask our support team</Link> with the
            format or strength you have in mind and we'll point you to the right listing.
          </p>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <p className="eyebrow">Step 2</p>
          <h2>Submit an order request</h2>
          <p className="body-lg">
            Add the items you want to the cart, fill in your contact and shipping details, and choose a payment
            method. Nothing is charged at this stage — the request simply reserves your selection while we check it.
          </p>
          <ol className="steps">
            <li>
              <h3>Build your request</h3>
              <p>Add items from one or several categories. Volume discounts apply automatically as your cart grows.</p>
            </li>
            <li>
              <h3>We verify availability</h3>
              <p>Our team reviews your request, confirms stock and reserves your allocation before any payment details are sent.</p>
            </li>
            <li>
              <h3>You get dispatch instructions</h3>
              <p>Once confirmed, we send your order breakdown with payment and discreet shipping details by your preferred contact method.</p>
            </li>
          </ol>
          <div className="gap-md" />
          <Link to="/products" className="btn btn-red">Browse the catalog</Link>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="eyebrow">Step 3</p>
          <h2>Pricing, discounts &amp; payment</h2>
          <p className="body-lg">
            Prices are shown on every listing. Mix &amp; Match discounts apply automatically as your cart grows, new customers
            can use code <strong>{discounts.welcomeCode.code}</strong> for {discounts.welcomeCode.percent}% off, and paying with
            Bitcoin takes another {discounts.bitcoinPercent}% off. These stack up to a combined {discounts.maxCombinedPercent}% cap.
          </p>
          <p>You can choose from: {paymentMethods.join(", ")}. We confirm the method with you directly after your request.</p>
          <p className="muted">
            Orders over {site.currency}{freeGift.threshold} in total qualify for a free {freeGift.item}, and every order is
            packed discreetly with tracking sent by email where available.
          </p>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <h2>Common questions</h2>
          <div className="faq">
            {guideFaq.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
