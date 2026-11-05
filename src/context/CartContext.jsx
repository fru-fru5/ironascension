import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "store-cart-v2";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });
  const [toast, setToast] = useState("");
  const timer = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo(() => {
    const showToast = (msg) => {
      setToast(msg);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setToast(""), 1800);
    };

    const addItem = (product, size, qty = 1) => {
      setItems((prev) => {
        const key = `${product.id}|${size}`;
        const found = prev.find((i) => i.key === key);
        if (found) return prev.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i));
        return [
          ...prev,
          { key, id: product.id, name: product.name, price: product.price, image: product.image, sizes: product.sizes, size, qty },
        ];
      });
      showToast(`${product.name} added to cart`);
    };

    const setQty = (key, qty) =>
      setItems((prev) =>
        qty <= 0 ? prev.filter((i) => i.key !== key) : prev.map((i) => (i.key === key ? { ...i, qty } : i))
      );

    const setSize = (key, size) =>
      setItems((prev) => {
        const line = prev.find((i) => i.key === key);
        if (!line) return prev;
        const newKey = `${line.id}|${size}`;
        const other = prev.find((i) => i.key === newKey);
        if (other) {
          return prev
            .filter((i) => i.key !== key)
            .map((i) => (i.key === newKey ? { ...i, qty: i.qty + line.qty } : i));
        }
        return prev.map((i) => (i.key === key ? { ...i, key: newKey, size } : i));
      });

    const removeItem = (key) => setItems((prev) => prev.filter((i) => i.key !== key));
    const clear = () => setItems([]);
    const count = items.reduce((n, i) => n + i.qty, 0);
    const subtotal = items.reduce((n, i) => n + i.qty * i.price, 0);
    return { items, addItem, setQty, setSize, removeItem, clear, count, subtotal, toast };
  }, [items, toast]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
