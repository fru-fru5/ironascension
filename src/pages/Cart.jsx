import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageHero from "../components/PageHero.jsx";
import ImagePlaceholder from "../components/ImagePlaceholder.jsx";
import Seo from "../components/Seo.jsx";
import { CloseIcon } from "../components/Icons.jsx";
import { useCart } from "../context/CartContext.jsx";
import { site, discounts, paymentMethods, freeGift } from "../data/site.js";

const money = (n) => `${site.currency}${Number.isInteger(n) ? n : n.toFixed(2)}`;

export default function Cart() {
  const { items, setQty, removeItem, clear, count, subtotal } = useCart();
  const [form, setForm] = useState({ name: "", email: "", phone: "", payment: "", contactVia: "", address: "", notes: "" });
  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoMsg, setPromoMsg] = useState("");
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const totals = useMemo(() => {
    const tier = discounts.volumeTiers.find((t) => count >= t.minItems);
    const volume = tier ? tier.percent : 0;
    const promoPct = promoApplied ? discounts.welcomeCode.percent : 0;
    const btc = form.payment === "Bitcoin" ? discounts.bitcoinPercent : 0;
    const combined = Math.min(volume + promoPct + btc, discounts.maxCombinedPercent);
    const discount = Math.round(((subtotal * combined) / 100) * 100) / 100;
    return { combined, discount, total: subtotal - discount, gift: subtotal >= freeGift.threshold };
  }, [count, subtotal, promoApplied, form.payment]);

  const applyPromo = () => {
    if (promo.trim().toUpperCase() === discounts.welcomeCode.code) {
      setPromoApplied(true);
      setPromoMsg(`Code applied: ${discounts.welcomeCode.percent}% off.`);
    } else {
      setPromoApplied(false);
      setPromoMsg("That code is not valid.");
    }
  };

  const buildMessage = () =>
    [
      `New order request - ${site.name}`,
      "",
      ...items.map((i) => `${i.qty} x ${i.name} - ${money(i.price * i.qty)}`),
      "",
      `Subtotal: ${money(subtotal)}`,
      totals.combined > 0 && `Discount (${totals.combined}% off): -${money(totals.discount)}`,
      "Shipping: Free",
      totals.gift && `Free gift: ${freeGift.item}`,
      `Total: ${money(totals.total)}`,
      "",
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      form.phone && `Phone: ${form.phone}`,
      form.payment && `Payment method: ${form.payment}`,
      `Contact me via: ${form.contactVia}`,
      form.address && `Shipping address: ${form.address}`,
      promoApplied && `Promo code: ${discounts.welcomeCode.code}`,
      form.notes && `Notes: ${form.notes}`,
    ]
      .filter(Boolean)
      .join("\n");

  const validate = () => {
    if (items.length === 0) return "Your cart is empty.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Enter a valid email address.";
    if (!form.contactVia) return "Choose how we should contact you.";
    return "";
  };

  const sendEmail = () => {
    const err = validate();
    setError(err);
    if (err) return;
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent("Order request")}&body=${encodeURIComponent(buildMessage())}`;
  };

  const sendWhatsApp = () => {
    const err = validate();
    setError(err);
    if (err) return;
    window.open(`https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(buildMessage())}`, "_blank", "noopener");
  };

  return (
    <>
      <Seo
        title={`Your Cart | ${site.name}`}
        description="Review your order request and send it to our team."
        path="/order"
        noindex
      />
      <PageHero
        eyebrow="Cart"
        title="Your Cart"
        text="Review your items and submit an order request. Nothing is charged here - our team follows up to confirm pricing and payment."
      />
      <section className="section">
        <div className="container cart-layout">
          <div className="panel">
            <h2>Order Summary</h2>
            {items.length === 0 ? (
              <p className="muted">
                Your cart is empty. <Link to="/products">Browse products</Link>.
              </p>
            ) : (
              <ul className="cart-items">
                {items.map((i) => (
                  <li key={i.key}>
                    <div className="cart-thumb">
                      <ImagePlaceholder src={i.image} alt={i.name} label="" ratio="1 / 1" />
                    </div>
                    <div className="cart-info">
                      <strong>{i.name}</strong>
                      <span className="muted">{money(i.price)} each</span>
                      <div className="qty">
                        <button aria-label={`Decrease ${i.name}`} onClick={() => setQty(i.key, i.qty - 1)}>−</button>
                        <span>{i.qty}</span>
                        <button aria-label={`Increase ${i.name}`} onClick={() => setQty(i.key, i.qty + 1)}>+</button>
                      </div>
                      <span className="price">{money(i.price * i.qty)}</span>
                      <button className="icon-btn" onClick={() => removeItem(i.key)} aria-label={`Remove ${i.name}`}>
                        <CloseIcon />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <dl className="totals">
              <div>
                <dt>Subtotal</dt>
                <dd className={totals.discount > 0 ? "strike" : ""}>{money(subtotal)}</dd>
              </div>
              {totals.discount > 0 && (
                <div className="green">
                  <dt>Discount ({totals.combined}% off)</dt>
                  <dd>-{money(totals.discount)}</dd>
                </div>
              )}
              <div>
                <dt>Shipping</dt>
                <dd className="strong">Free</dd>
              </div>
              {totals.gift && (
                <div>
                  <dt>Free Gift</dt>
                  <dd className="green strong">{freeGift.item}</dd>
                </div>
              )}
              <div className="grand">
                <dt>Total</dt>
                <dd>{money(totals.total)}</dd>
              </div>
            </dl>
            {items.length > 0 && (
              <button className="link-btn" onClick={clear}>Clear cart</button>
            )}
          </div>

          <div className="panel">
            <h2>Checkout Details</h2>
            <p className="lead-sm">Fill in your details below. We'll contact you to confirm your order.</p>
            <div className="form">
              <label>Name<input value={form.name} onChange={set("name")} placeholder="Your name" autoComplete="name" /></label>
              <label>Email *<input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" autoComplete="email" required /></label>
              <label>Phone<input type="tel" value={form.phone} onChange={set("phone")} placeholder="Your phone number" autoComplete="tel" /></label>
              <label>
                Payment Method
                <select value={form.payment} onChange={set("payment")}>
                  <option value="">Select a payment method</option>
                  {paymentMethods.map((m) => (
                    <option key={m} value={m}>
                      {m === "Bitcoin" ? `Bitcoin (${discounts.bitcoinPercent}% off)` : m}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                How should we contact you about your order? *
                <select value={form.contactVia} onChange={set("contactVia")} required>
                  <option value="">Select one</option>
                  <option>Text message</option>
                  <option>WhatsApp</option>
                </select>
                <small className="muted">Pick the one you're most active on.</small>
              </label>
              <label>Shipping Address<textarea rows="5" value={form.address} onChange={set("address")} placeholder="Street, city, state, zip" autoComplete="street-address" /></label>
              <div className="promo-wrap">
                <label htmlFor="promo">Promo code</label>
                <div className="promo-row">
                  <input id="promo" value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="Promo code" />
                  <button type="button" className="btn btn-outline" onClick={applyPromo}>Apply</button>
                </div>
              </div>
              {promoMsg && <p className={promoApplied ? "success" : "error"} role="status">{promoMsg}</p>}
              <label>Order Notes<textarea rows="5" value={form.notes} onChange={set("notes")} placeholder="Additional information" /></label>

              {error && <p className="error" role="alert">{error}</p>}
              <button type="button" className="btn btn-primary btn-block" onClick={sendEmail}>Send Order Request by Email</button>
              <button type="button" className="btn btn-wa btn-block" onClick={sendWhatsApp}>Send Order Request by WhatsApp</button>
              <p className="muted small">
                WhatsApp opens a chat with your order summary already typed in - just hit send.
              </p>
            </div>
            <Link to="/products" className="link-arrow">Continue Browsing</Link>
          </div>
        </div>
      </section>
    </>
  );
}
