import { useEffect, useState } from "react";
import { announcements } from "../data/site.js";

export default function AnnouncementBar() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (announcements.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % announcements.length), 4500);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="announce" role="status">
      <span className="dot" aria-hidden="true" />
      <span key={i}>{announcements[i]}</span>
    </div>
  );
}
