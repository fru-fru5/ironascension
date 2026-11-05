import { Link } from "react-router-dom";
import { site, images } from "../data/site.js";

export function LogoMark({ src, size = 36 }) {
  return src ? (
    <img src={src} alt="" width={size} height={size} className="logo-img" />
  ) : (
    <span className="logo-ph" style={{ width: size, height: size }} aria-hidden="true">LOGO</span>
  );
}

export default function Logo() {
  return (
    <Link to="/" className="logo" aria-label={`${site.name} home`}>
      <LogoMark src={images.logoHeader} size={38} />
      <span>{site.name}</span>
    </Link>
  );
}
