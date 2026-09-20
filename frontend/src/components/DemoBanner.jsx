import React from "react";

export default function DemoBanner({ t, lang }) {
  return (
    <aside className="demo-banner" role="banner" aria-label="Demo Disclaimer">
      <span className="demo-banner-badge">DEMO</span>
      <span lang={lang}>{t.banner}</span>
    </aside>
  );
}
