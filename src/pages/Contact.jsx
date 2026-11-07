import { useState } from "react";
import PageHero from "../components/PageHero.jsx";
import Seo from "../components/Seo.jsx";
import { MailIcon, PhoneIcon, ClockIcon } from "../components/Icons.jsx";
import { site, images } from "../data/site.js";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", orderId: "", subject: "", message: "" });
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.message.trim()) {
      setError("Please enter your email and a message.");
      return;
    }
    setError("");
    const body = [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      form.orderId && `Order Request ID: ${form.orderId}`,
      "",
      form.message,
    ]
      .filter((l) => l !== false)
      .join("\n");
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(
      form.subject || "Support request"
    )}&body=${encodeURIComponent(body)}`;
  };

  return (
    <>
      <Seo
        title={`Contact ${site.name}`}
        description={`Contact ${site.name} customer and order support by email, phone or live chat.`}
        path="/contact"
        image={images.hero}
      />
      <PageHero eyebrow="Support" title={`Contact ${site.name}`} text="Get in touch with Customer & Order Support." />
      <section className="section">
        <div className="container split split-top">
          <div>
            <h2>Let's talk.</h2>
            <p className="body-lg">
              Have questions about submitting an order request, checking catalog availability,
              tracking a shipment, or checking product availability? Our
              dedicated support team is available to assist you.
            </p>
            <div className="contact-cards">
              <div className="contact-card">
                <span className="contact-ico"><MailIcon /></span>
                <div>
                  <span className="contact-label">Email Support</span>
                  <a href={`mailto:${site.email}`}>{site.email}</a>
                </div>
              </div>
              <div className="contact-card">
                <span className="contact-ico"><PhoneIcon /></span>
                <div>
                  <span className="contact-label">Phone Support</span>
                  <a href={`tel:${site.phone.replace(/[^+\d]/g, "")}`}>{site.phone}</a>
                </div>
              </div>
              <div className="contact-card">
                <span className="contact-ico"><ClockIcon /></span>
                <div>
                  <span className="contact-label">Working Hours</span>
                  <span className="contact-value">{site.hours}</span>
                </div>
              </div>
            </div>
            <p className="muted">Inquiries submitted outside of working hours will be processed on the following business day.</p>
            <h3 className="h3-plain">How Order Request Support Works</h3>
            <ul className="body-list">
              <li><strong>Order Status Inquiries:</strong> Please include your Order Request ID below for faster processing.</li>
              <li><strong>Merchandise Exchanges:</strong> For exchanges on {site.name} apparel and gear, contact support with your order details within {site.returnWindowDays} days of delivery.</li>
              <li><strong>Catalog &amp; Stock Questions:</strong> For questions on specific item availability, our logistics team can verify stock and reservation status upon request.</li>
            </ul>
          </div>

          <form className="form" onSubmit={submit} noValidate>
            <label>Name<input value={form.name} onChange={set("name")} placeholder="Your name" autoComplete="name" /></label>
            <label>Email *<input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" autoComplete="email" required /></label>
            <label>Order Request ID (if applicable)<input value={form.orderId} onChange={set("orderId")} placeholder="e.g. OR-1234" /></label>
            <label>Subject<input value={form.subject} onChange={set("subject")} placeholder="How can we help?" /></label>
            <label>Message *<textarea rows="6" value={form.message} onChange={set("message")} placeholder="Your message" required /></label>
            {error && <p className="error" role="alert">{error}</p>}
            <button className="btn btn-primary btn-block" type="submit">Send Message</button>
          </form>
        </div>
      </section>
    </>
  );
}
