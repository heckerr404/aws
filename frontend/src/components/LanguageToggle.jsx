import React from "react";

export default function LanguageToggle({ currentLang, onChange }) {
  return (
    <div className="lang-toggle" role="group" aria-label="Select Language">
      <button
        type="button"
        className={`lang-btn ${currentLang === "en" ? "active" : ""}`}
        onClick={() => onChange("en")}
        aria-pressed={currentLang === "en"}
      >
        English
      </button>
      <button
        type="button"
        className={`lang-btn ${currentLang === "hi" ? "active" : ""}`}
        onClick={() => onChange("hi")}
        aria-pressed={currentLang === "hi"}
        lang="hi"
      >
        हिन्दी
      </button>
    </div>
  );
}
