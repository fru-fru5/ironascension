import { SearchIcon } from "./Icons.jsx";

export default function SearchBox({ value, onChange, placeholder }) {
  return (
    <div className="search">
      <span className="search-icon"><SearchIcon /></span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </div>
  );
}
