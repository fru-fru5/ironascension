import PageHero from "./PageHero.jsx";
import { site } from "../data/site.js";

export default function LegalPage({ title, subtitle, sections, intro }) {
  return (
    <>
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
