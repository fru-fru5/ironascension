import { Link } from "react-router-dom";
import PageHero from "../components/PageHero.jsx";

export default function NotFound() {
  return (
    <>
      <PageHero eyebrow="404" title="Page not found" text="That page does not exist or has moved." />
      <section className="section">
        <div className="container">
          <Link to="/" className="btn btn-primary">Back to home</Link>
        </div>
      </section>
    </>
  );
}
