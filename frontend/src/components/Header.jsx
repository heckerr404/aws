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
    { label: t.documentMapNav || "Document Map", to: "/document-map" },
    { label: t.frontlineModeNav || "Frontline Mode", to: "/frontline" },
    { label: t.faceVerifyNav || "Face Verification", to: "/face-verify" },
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
          <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem", marginBottom: "0.75rem" }}>
            <div className="user-identity-chip" style={{ justifyContent: "flex-start", cursor: "default" }}>
              <span className="user-avatar-dot">{initials}</span>
              <span style={{ flexGrow: 1, textAlign: "left" }}>{identity.name.split(" ")[0]}</span>
              {identity.faceVerified && <span className="face-verified-tick" title="Face verified">✅</span>}
            </div>
            <button
              type="button"
              className="btn-face-verify-sidebar"
              onClick={onFaceVerify}
              title="Run biometric face liveness check"
            >
              <span>📷</span>
              <span>{identity.faceVerified ? "Face Verified ✓" : "Verify Face"}</span>
            </button>
            <button
              type="button"
              className="login-btn-ghost"
              style={{ fontSize: "0.75rem", padding: "0.35rem 0.75rem", borderRadius: "8px" }}
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
