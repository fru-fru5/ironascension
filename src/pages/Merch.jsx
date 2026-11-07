import { useState } from "react";
import PageHero from "../components/PageHero.jsx";
import SearchBox from "../components/SearchBox.jsx";
import ProductCard from "../components/ProductCard.jsx";
import Seo from "../components/Seo.jsx";
import { images, merch, site } from "../data/site.js";

export default function Merch() {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const list = merch.filter((m) => m.name.toLowerCase().includes(query));
  return (
    <>
      <Seo
        title={`${site.merchLabel} | ${site.name}`}
        description={`Shop ${site.name} ${site.merchLabel.toLowerCase()} — training apparel and lifestyle accessories.`}
        path="/merch"
        image={images.merchHero}
      />
      <PageHero
        withBg
        bg={images.merchHero}
        bgLabel="Merch hero background (images.merchHero)"
        eyebrow="Merchandise"
        title={`${site.name} ${site.merchLabel}`}
        text="Training apparel and lifestyle accessories."
      />
      <section className="section section-search">
        <div className="container">
          <SearchBox value={q} onChange={setQ} placeholder={`Search ${site.merchLabel.toLowerCase()}...`} />
          <div className="gap-md" />
          {list.length ? (
            <div className="grid grid-products">
              {list.map((m) => (
                <ProductCard key={m.id} product={m} />
              ))}
            </div>
          ) : (
            <p className="muted">Nothing matches "{q}".</p>
          )}
        </div>
      </section>
    </>
  );
}
