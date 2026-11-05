import { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import AgeGate from "./components/AgeGate.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import ChatButton from "./components/ChatButton.jsx";
import Toast from "./components/Toast.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import LegalPage from "./components/LegalPage.jsx";
import Home from "./pages/Home.jsx";
import Products from "./pages/Products.jsx";
import Category from "./pages/Category.jsx";
import Merch from "./pages/Merch.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Cart from "./pages/Cart.jsx";
import NotFound from "./pages/NotFound.jsx";
import { categories } from "./data/site.js";
import { terms, shipping, privacy } from "./data/legal.js";

const Admin = lazy(() => import("./pages/admin/Admin.jsx"));

export default function App() {
  const { pathname } = useLocation();

  if (import.meta.env.DEV && pathname.startsWith("/admin")) {
    return (
      <Suspense fallback={<div className="admin admin-centered">Loading admin...</div>}>
        <Admin />
      </Suspense>
    );
  }

  return (
    <AgeGate>
      <ScrollToTop />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          {categories.map((c) => (
            <Route key={c.id} path={`/${c.slug}`} element={<Category category={c} />} />
          ))}
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/merch" element={<Merch />} />
          <Route path="/merch/:id" element={<ProductDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/order" element={<Cart />} />
          <Route path="/privacy" element={<LegalPage title="Privacy Policy" subtitle="How we handle your information." {...privacy} />} />
          <Route path="/terms" element={<LegalPage title="Terms & Conditions" subtitle="Please review these terms before using the site." {...terms} />} />
          <Route path="/shipping" element={<LegalPage title="Shipping & Returns" subtitle="Our order-request process, shipping and return terms." {...shipping} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <ChatButton />
      <Toast />
    </AgeGate>
  );
}
