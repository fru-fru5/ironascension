import { useEffect } from "react";
import { ChatIcon } from "./Icons.jsx";
import { site } from "../data/site.js";

const smartsuppKey = import.meta.env.VITE_SMARTSUPP_KEY;

export default function ChatButton() {
  useEffect(() => {
    if (!smartsuppKey || document.getElementById("smartsupp-loader")) return;

    window._smartsupp = window._smartsupp || {};
    window._smartsupp.key = smartsuppKey;

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
  }, []);

  if (smartsuppKey) return null;

  return (
    <a
      className="chat-btn"
      href={`https://wa.me/${site.whatsappNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
    >
      <ChatIcon />
      <span className="chat-dot" aria-hidden="true" />
    </a>
  );
}
