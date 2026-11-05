import { useEffect, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import Logo from "./Logo.jsx";
import AnnouncementBar from "./AnnouncementBar.jsx";
import { CartIcon } from "./Icons.jsx";
import { useCart } from "../context/CartContext.jsx";
import { site } from "../data/site.js";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/products", label: "Products" },
  { to: "/merch", label: site.merchLabel },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <AnnouncementBar />
      <header className="header">
        <div className="container header-inner">
          <Logo />
          <nav id="main-nav" className={`nav ${open ? "open" : ""}`} aria-label="Main">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end}>
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="header-actions">
            <Link to="/order" className="cart-btn" aria-label={`Cart, ${count} items`}>
              <CartIcon />
              {count > 0 && <span className="cart-badge">{count}</span>}
            </Link>
            <button
              className="burger"
              aria-expanded={open}
              aria-controls="main-nav"
              aria-label="Toggle menu"
              onClick={() => setOpen((o) => !o)}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
