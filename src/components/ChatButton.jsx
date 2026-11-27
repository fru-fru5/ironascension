import { useEffect, useRef, useState } from "react";
import { ChatIcon, CloseIcon } from "./Icons.jsx";

// Tawk.to IDs are public client-side identifiers. Override with env vars if needed.
const DEFAULT_TAWK_PROPERTY_ID = "6b089d97467aa83d06cbeb6d";
const DEFAULT_TAWK_WIDGET_ID = "1k8cqf6gm";
const tawkPropertyId = String(
  import.meta.env.VITE_TAWKTO_PROPERTY_ID || DEFAULT_TAWK_PROPERTY_ID
).trim();
const tawkWidgetId = String(
  import.meta.env.VITE_TAWKTO_WIDGET_ID || DEFAULT_TAWK_WIDGET_ID
).trim();
const tawkSrc =
  tawkPropertyId && tawkWidgetId
    ? `https://embed.tawk.to/${tawkPropertyId}/${tawkWidgetId}`
    : "";

// Ask for contact details if an agent hasn't replied within this long.
const NO_REPLY_MS = 45_000;

const openWidget = () => {
  const api = window.Tawk_API;
  if (!api) return false;
  let opened = false;
  if (typeof api.showWidget === "function") {
    api.showWidget();
    opened = true;
  }
  if (typeof api.maximize === "function") {
    api.maximize();
    opened = true;
  }
  return opened;
};

export default function ChatButton() {
  const [showContactPrompt, setShowContactPrompt] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const noReplyTimer = useRef(null);
  const hideTimer = useRef(null);
  const pendingOpen = useRef(false);

  useEffect(() => {
    if (!tawkSrc) return;

    const api = (window.Tawk_API = window.Tawk_API || {});

    const hideLauncher = () => {
      if (typeof api.hideWidget === "function") api.hideWidget();
    };

    const stopWaiting = () => {
      if (noReplyTimer.current) {
        clearTimeout(noReplyTimer.current);
        noReplyTimer.current = null;
      }
      setShowContactPrompt(false);
    };

    // Tawk's own bubble is hidden so the site's button is the only chat launcher.
    api.onLoad = () => {
      hideLauncher();
      if (pendingOpen.current) {
        pendingOpen.current = false;
        openWidget();
      }
    };
    api.onChatMinimized = hideLauncher;

    // A visitor sent a message: wait for an agent reply, then offer the contact form.
    api.onChatMessageVisitor = () => {
      stopWaiting();
      setSubmitted(false);
      noReplyTimer.current = setTimeout(() => setShowContactPrompt(true), NO_REPLY_MS);
    };

    // An agent replied, so there's no need to ask for contact details.
    api.onChatMessageAgent = stopWaiting;

    hideLauncher();

    if (!document.getElementById("tawkto-loader")) {
      const firstScript = document.getElementsByTagName("script")[0];
      const script = document.createElement("script");
      script.id = "tawkto-loader";
      script.type = "text/javascript";
      script.async = true;
      script.src = tawkSrc;
      script.charset = "UTF-8";
      script.setAttribute("crossorigin", "*");
      (firstScript?.parentNode ?? document.head).insertBefore(
        script,
        firstScript ?? null
      );
    }

    // Tawk.to has no event-unsubscribe API; this component is mounted once at the app root.
    return () => {
      if (noReplyTimer.current) clearTimeout(noReplyTimer.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  if (!tawkSrc) return null;

  const openChat = () => {
    if (!openWidget()) pendingOpen.current = true;
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

    const api = window.Tawk_API;
    if (api && typeof api.setAttributes === "function") {
      try {
        const attributes = { email: contact.email.trim() };
        if (contact.name.trim()) attributes.name = contact.name.trim();
        if (contact.phone.trim()) attributes.phone = contact.phone.trim();
        api.setAttributes(attributes, () => {});
      } catch (error) {
        console.warn("Tawk.to contact details could not be attached", error);
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
