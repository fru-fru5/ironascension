// Page title block. Pass `bg` (+ `bgLabel`) for a hero with a BACKGROUND image slot.
export default function PageHero({ eyebrow, title, text, bg, bgLabel, withBg = false }) {
  const style = bg ? { backgroundImage: `url(${bg})` } : undefined;
  return (
    <section className={`page-hero ${withBg ? "has-bg" : ""} ${withBg && !bg ? "bg-empty" : ""}`} style={style}>
      {withBg && <div className="bg-overlay" />}
      {withBg && !bg && <span className="bg-hint">{bgLabel}</span>}
      <div className="container page-hero-inner">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {text && <p className="lead">{text}</p>}
      </div>
    </section>
  );
}
