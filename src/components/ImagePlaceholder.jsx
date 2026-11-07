// Shows the real image when `src` is set, otherwise a labelled placeholder.
export default function ImagePlaceholder({
  src,
  alt = "",
  label,
  ratio = "4 / 3",
  className = "",
  eager = false,
  priority = false,
  children,
}) {
  const style = { aspectRatio: ratio };
  return (
    <div className={`media ${className}`.trim()} style={style}>
      {src ? (
        <img
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          fetchpriority={priority ? "high" : undefined}
        />
      ) : (
        <div className="placeholder" role="img" aria-label={alt || label}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <circle cx="9" cy="10" r="1.6" />
            <path d="m4 18 5-5 4 4 3-3 4 4" />
          </svg>
          <span>{label || "Image placeholder"}</span>
        </div>
      )}
      {children}
    </div>
  );
}
