import React from "react";

export default function DemoBanner({ t, lang }) {
  return (
    <div
      className="demo-subtle-badge"
      role="note"
      aria-label="Demo Disclaimer: Not connected to UIDAI"
      title="Hackathon evaluation demo: Simulated credentials, not connected to UIDAI or real Aadhaar systems"
    >
      <span className="demo-subtle-dot" aria-hidden="true" />
      <span className="demo-subtle-tag">Demo</span>
      <span className="demo-subtle-sep" aria-hidden="true">·</span>
      <span className="demo-subtle-text">
        Not connected to UIDAI
      </span>
    </div>
  );
}

