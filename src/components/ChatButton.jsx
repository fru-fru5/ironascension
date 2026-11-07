import { useEffect } from "react";
import { ChatIcon } from "./Icons.jsx";

// Smartsupp chat key is a public client-side identifier. Override with VITE_SMARTSUPP_KEY if needed.
const DEFAULT_SMARTSUPP_KEY = "05a4cb749155ba6e48be24680ec1cb5f5ef040a3";
const smartsuppKey = String(
  import.meta.env.VITE_SMARTSUPP_KEY || DEFAULT_SMARTSUPP_KEY
).trim();

export default function ChatButton() {
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

  if (!smartsuppKey) return null;

  const openChat = () => {
    if (typeof window.smartsupp === "function") {
      window.smartsupp("chat:show");
      window.smartsupp("chat:open");
    }
  };

  return (
    <button type="button" className="chat-btn" onClick={openChat} aria-label="Open live chat">
      <ChatIcon />
      <span className="chat-dot" aria-hidden="true" />
    </button>
  );
}
