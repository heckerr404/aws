import React from "react";
import SchemesExplorer from "./SchemesExplorer";

export default function SchemesPage({ t, lang, onSelectScheme }) {
  return (
    <main className="bento-grid">
      <SchemesExplorer t={t} lang={lang} onSelectScheme={onSelectScheme} />
    </main>
  );
}
