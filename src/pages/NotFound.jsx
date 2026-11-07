import { Link } from "react-router-dom";
import PageHero from "../components/PageHero.jsx";
import Seo from "../components/Seo.jsx";
import { site } from "../data/site.js";

export default function NotFound() {
  return (
    <>
      <Seo
        title={`Page Not Found | ${site.name}`}
        description="That page does not exist or has moved."
        noindex
      />
      <PageHero eyebrow="404" title="Page not found" text="That page does not exist or has moved." />
      <section className="section">
        <div className="container">
          <Link to="/" className="btn btn-primary">Back to home</Link>
        </div>
      </section>
    </>
  );
}
