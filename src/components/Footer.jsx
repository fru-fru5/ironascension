import { Link } from "react-router-dom";
import { LogoMark } from "./Logo.jsx";
import { site, images, telegramHref } from "../data/site.js";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link to="/" aria-label={`${site.name} home`}>
            <LogoMark src={images.logoFooter} size={84} />
          </Link>
          <p className="footer-tagline">{site.tagline}</p>
        </div>
        <div>
          <h4>Explore</h4>
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          <Link to="/merch">{site.merchLabel}</Link>
        </div>
        <div>
          <h4>Company</h4>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <a href={telegramHref()} target="_blank" rel="noopener noreferrer">Order via Telegram</a>
          <Link to="/order">Cart</Link>
        </div>
        <div>
          <h4>Legal</h4>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/shipping">Shipping &amp; Returns</Link>
        </div>
      </div>
      <div className="container footer-bottom">
        © {new Date().getFullYear()} {site.name}. All rights reserved.
      </div>
    </footer>
  );
}
