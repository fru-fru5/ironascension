import { useLocation } from "react-router-dom";
import Breadcrumbs from "./Breadcrumbs.jsx";
import PageHero from "./PageHero.jsx";
import Seo from "./Seo.jsx";
import { site } from "../data/site.js";

export default function LegalPage({ title, subtitle, sections, intro }) {
  const { pathname } = useLocation();

  return (
    <>
      <Seo
        title={`${title} | ${site.name}`}
        description={subtitle}
        path={pathname}
        type="article"
      />
      <div className="breadcrumb-bar">
        <div className="container">
          <Breadcrumbs
            items={[
              { name: "Home", path: "/" },
              { name: title, path: pathname },
            ]}
          />
        </div>
      </div>
      <PageHero eyebrow="Legal" title={title} text={subtitle} />
      <section className="section">
        <div className="container prose">
          <p className="muted small">
            Effective Date: {site.effectiveDate} · Last Updated: {site.effectiveDate}
          </p>
          {intro && <p>{intro}</p>}
          {sections.map((s) => (
            <div key={s.h}>
              <h2>{s.h}</h2>
              {s.p?.map((t, i) => (
                <p key={i}>{t}</p>
              ))}
              {s.ul && (
                <ul>
                  {s.ul.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          <p className="muted">
            Questions? Email <a href={`mailto:${site.email}`}>{site.email}</a>.
          </p>
        </div>
      </section>
    </>
  );
}
