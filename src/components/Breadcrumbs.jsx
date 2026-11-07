import { Link } from "react-router-dom";

// Visible trail that mirrors the BreadcrumbList structured data in static HTML.
export default function Breadcrumbs({ items = [], className = "" }) {
  if (!items.length) return null;

  return (
    <nav className={`breadcrumbs ${className}`.trim()} aria-label="Breadcrumb">
      <ol>
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;
          return (
            <li key={`${item.path || item.name}-${index}`}>
              {isCurrent || !item.path ? (
                <span aria-current={isCurrent ? "page" : undefined}>{item.name}</span>
              ) : (
                <Link to={item.path}>{item.name}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
