import { useState } from "react";
import { LogoMark } from "./Logo.jsx";
import { site, images, ageGate } from "../data/site.js";

const KEY = "age-verified";

export default function AgeGate({ children }) {
  const [state, setState] = useState(() => (localStorage.getItem(KEY) === "yes" ? "ok" : "ask"));
  if (!ageGate.enabled || state === "ok") return children;

  const yes = () => {
    localStorage.setItem(KEY, "yes");
    setState("ok");
  };

  return (
    <div className="age-gate" role="dialog" aria-modal="true" aria-labelledby="age-title">
      <div className="age-card">
        <LogoMark src={images.logoHeader} size={84} />
        {state === "ask" ? (
          <>
            <h1 id="age-title">Age Verification Required</h1>
            <p className="age-text">
              {site.name}
              {ageGate.message}
            </p>
            <p className="age-q">Are you {ageGate.minAge} years of age or older?</p>
            <button className="btn btn-primary btn-block" onClick={yes}>
              Yes, I am {ageGate.minAge} or older
            </button>
            <button className="btn btn-outline btn-block" onClick={() => setState("denied")}>
              No, I am under {ageGate.minAge}
            </button>
          </>
        ) : (
          <>
            <h1 id="age-title">Access Restricted</h1>
            <p className="age-text">You must be {ageGate.minAge} or older to enter this site.</p>
            <button className="btn btn-outline btn-block" onClick={() => setState("ask")}>
              Go back
            </button>
          </>
        )}
      </div>
    </div>
  );
}
