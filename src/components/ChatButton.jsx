import { useEffect, useRef, useState } from "react";
import { ChatIcon, CloseIcon } from "./Icons.jsx";

// Smartsupp chat key is a public client-side identifier. Override with VITE_SMARTSUPP_KEY if needed.
const DEFAULT_SMARTSUPP_KEY = "05a4cb749155ba6e48be24680ec1cb5f5ef040a3";
const smartsuppKey = String(
  import.meta.env.VITE_SMARTSUPP_KEY || DEFAULT_SMARTSUPP_KEY
).trim();

// Ask for contact details if an agent hasn't replied within this long.
const NO_REPLY_MS = 45_000;

export default function ChatButton() {
  const [showContactPrompt, setShowContactPrompt] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const noReplyTimer = useRef(null);
  const hideTimer = useRef(null);
  const eventsBound = useRef(false);

  useEffect(() => {
    if (!smartsuppKey || document.getElementById("smartsupp-loader")) return;

    window._smartsupp = window._smartsupp || {};
    window._smartsupp.key = smartsuppKey;
    // Hide Smartsupp's built-in bubble so the site's button is the only launcher.
    window._smartsupp.hideBanner = true;

    window.smartsupp ||
      (function (d) {
        const o = (window.smartsupp = function () {
          o._.push(arguments);
        });
        o._ = [];
        const s = d.getElementsByTagName("script")[0];
        const c = d.createElement("script");
        c.id = "smartsupp-loader";
        c.type = "text/javascript";
        c.charset = "utf-8";
        c.async = true;
        c.src = "https://www.smartsuppchat.com/loader.js?";
        s.parentNode.insertBefore(c, s);
      })(document);

    // Keep Smartsupp's built-in launcher hidden so the site's chat button is the only trigger.
    window.smartsupp("chat:hide");
    window.smartsupp("on", "messenger_close", () => window.smartsupp("chat:hide"));
  }, []);

  useEffect(() => {
    if (!smartsuppKey || eventsBound.current) return;
    const api = window.smartsupp;
    if (typeof api !== "function") return;
    eventsBound.current = true;

    const stopWaiting = () => {
      if (noReplyTimer.current) {
        clearTimeout(noReplyTimer.current);
        noReplyTimer.current = null;
      }
      setShowContactPrompt(false);
    };

    // A visitor sent a message: wait for an agent reply, then offer the contact form.
    api("on", "message_sent", () => {
      stopWaiting();
      setSubmitted(false);
      noReplyTimer.current = setTimeout(() => setShowContactPrompt(true), NO_REPLY_MS);
    });

    // An agent replied, so there's no need to ask for contact details.
    api("on", "message_received", stopWaiting);

    // Smartsupp has no event-unsubscribe API; this component is mounted once at the app root.
    return () => {
      if (noReplyTimer.current) clearTimeout(noReplyTimer.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  if (!smartsuppKey) return null;

  const openChat = () => {
    if (typeof window.smartsupp === "function") {
      window.smartsupp("chat:show");
      window.smartsupp("chat:open");
    }
  };

  const dismiss = () => {
    if (noReplyTimer.current) {
      clearTimeout(noReplyTimer.current);
      noReplyTimer.current = null;
    }
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    setShowContactPrompt(false);
  };

  const updateContact = (field) => (event) =>
    setContact((current) => ({ ...current, [field]: event.target.value }));

  const submitContact = (event) => {
    event.preventDefault();
    if (!contact.email.trim()) return;

    if (typeof window.smartsupp === "function") {
      try {
        if (contact.name.trim()) window.smartsupp("name", contact.name.trim());
        window.smartsupp("email", contact.email.trim());
        if (contact.phone.trim()) window.smartsupp("phone", contact.phone.trim());
      } catch (error) {
        console.warn("Smartsupp contact details could not be attached", error);
      }
    }

    setSubmitted(true);
    hideTimer.current = setTimeout(() => setShowContactPrompt(false), 6000);
  };

  return (
    <>
      {showContactPrompt && (
        <div className="chat-contact" role="dialog" aria-label="Leave your contact details">
          <button type="button" className="chat-contact-close" onClick={dismiss} aria-label="Dismiss">
            <CloseIcon />
          </button>
          {submitted ? (
            <p className="chat-contact-done">Thanks — we've got your details and will get back to you shortly.</p>
          ) : (
            <form className="form" onSubmit={submitContact}>
              <h3>Still waiting on a reply?</h3>
              <p>Leave us your contact info and we'll get back to you as soon as we can.</p>
              <label>
                Name
                <input value={contact.name} onChange={updateContact("name")} placeholder="Your name" autoComplete="name" />
              </label>
              <label>
                Email *
                <input type="email" value={contact.email} onChange={updateContact("email")} placeholder="you@example.com" autoComplete="email" required />
              </label>
              <label>
                Phone
                <input type="tel" value={contact.phone} onChange={updateContact("phone")} placeholder="Your phone number" autoComplete="tel" />
              </label>
              <button type="submit" className="btn">Send my details</button>
            </form>
          )}
        </div>
      )}
      <button type="button" className="chat-btn" onClick={openChat} aria-label="Open live chat">
        <ChatIcon />
        <span className="chat-dot" aria-hidden="true" />
      </button>
    </>
  );
}
