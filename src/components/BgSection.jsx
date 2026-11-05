// Section with a BACKGROUND image slot (empty = dark placeholder + hint).
export default function BgSection({ src, label, className = "", children }) {
  const style = src ? { backgroundImage: `url(${src})` } : undefined;
  return (
    <section className={`bg-section ${src ? "" : "bg-empty"} ${className}`} style={style}>
      <div className="bg-overlay" />
      {!src && <span className="bg-hint">{label}</span>}
      <div className="container bg-content">{children}</div>
    </section>
  );
}
