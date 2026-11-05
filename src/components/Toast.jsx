import { useCart } from "../context/CartContext.jsx";

export default function Toast() {
  const { toast } = useCart();
  return (
    <div className={`toast ${toast ? "show" : ""}`} role="status" aria-live="polite">
      {toast}
    </div>
  );
}
