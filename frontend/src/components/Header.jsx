import React from "react";
import { NavLink } from "react-router-dom";
import LanguageToggle from "./LanguageToggle";

export default function Header({ t, lang, onLangChange, backendStatus, identity, onLogout, onFaceVerify }) {

  const statusLabels = {
    online: t.backendOnline,
    offline: t.backendOffline,
    checking: t.backendChecking
  };

  // Route-based navigation items (separate pages)
  const navItems = [
    { label: t.browseSchemesNav || "Browse Schemes", to: "/schemes" },
    { label: t.checkEligibilityBtn, to: "/" },
    { label: t.featuresNav || "Features", to: "/features" },
    { label: t.howItWorksBtn, to: "/how-it-works" },
  ];

  const initials = identity?.name
    ? identity.name.split(" ").map((w) => w[0]).slice(0, 2).join("")
    : "?";

  return (
    <aside className="app-sidebar" role="navigation" aria-label="Main Navigation">
      <div className="sidebar-top">
        <div>
          <h1 className="brand-wordmark">
            Haqdaar<span className="brand-dot">.</span>
          </h1>
          <div 
            className="engine-status-pill"
            title={`Backend status: ${backendStatus}`}
            aria-live="polite"
          >
            <span className={`status-dot ${backendStatus}`} />
            <span>{statusLabels[backendStatus] || backendStatus}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `sidebar-nav-link ${isActive ? "active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="sidebar-bottom">
        {identity && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <button
              type="button"
              className="user-identity-chip"
              onClick={onFaceVerify}
              title="Run face liveness check"
              style={{ justifyContent: "flex-start" }}
            >
              <span className="user-avatar-dot">{initials}</span>
              <span style={{ flexGrow: 1, textAlign: "left" }}>{identity.name.split(" ")[0]}</span>
              {identity.faceVerified && <span className="face-verified-tick" title="Face verified">✅</span>}
            </button>
            <button
              type="button"
              className="login-btn-ghost"
              style={{ fontSize: "0.75rem", padding: "0.4rem 0.75rem", borderRadius: "10px" }}
              onClick={onLogout}
            >
              Sign out
            </button>
          </div>
        )}
        <LanguageToggle currentLang={lang} onChange={onLangChange} />
      </div>
    </aside>
  );
}
