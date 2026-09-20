import React, { useState, useEffect, useRef } from "react";
import { OCCUPATIONS } from "../demoProfiles";
import { IconChevronDown } from "./icons";

export default function BreakItPanel({
  t,
  lang,
  profile,
  originalProfile,
  onReset,
  onLiveCheck,
  diffs,
  isLiveLoading
}) {
  const [localProfile, setLocalProfile] = useState(profile);
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    setLocalProfile(profile);
  }, [profile]);

  const updateAndTrigger = (updater) => {
    const next = typeof updater === "function" ? updater(localProfile) : updater;
    setLocalProfile(next);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      onLiveCheck(next);
    }, 400);
  };

  const handleIncomeChange = (val) => {
    const num = Math.max(0, Number(val) || 0);
    updateAndTrigger((prev) => ({ ...prev, familyIncomeInr: num }));
  };

  const handleToggle = (field) => {
    updateAndTrigger((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleOccupationChange = (val) => {
    updateAndTrigger((prev) => {
      const upd = { ...prev, occupation: val };
      if (val !== "artisan") upd.artisanTrade = "none";
      return upd;
    });
  };

  const handleDobChange = (val) => {
    updateAndTrigger((prev) => ({ ...prev, dateOfBirth: val }));
  };

  return (
    <section className="break-it-card" aria-labelledby="break-it-heading">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h3 id="break-it-heading" style={{ fontSize: "1.35rem", fontWeight: 600 }}>
            🧪 {t.breakItTitle}
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: "0.2rem" }}>
            {t.breakItDesc}
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {isLiveLoading && (
            <span style={{ fontSize: "0.75rem", color: "var(--green-4)", fontWeight: 700 }}>
              ⚡ Re-evaluating...
            </span>
          )}
          <button
            type="button"
            className="btn-pill-white"
            style={{ minHeight: "36px", padding: "0.3rem 0.85rem", fontSize: "0.8rem" }}
            onClick={() => {
              setLocalProfile(originalProfile);
              onReset();
            }}
          >
            ↺ {t.resetBtn}
          </button>
        </div>
      </div>

      <div className="break-it-controls">
        {/* Income Slider + Number */}
        <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--ink-2)" }} htmlFor="break-income">
              {t.incomeLabel}: <strong>₹{localProfile.familyIncomeInr.toLocaleString("en-IN")}</strong>
            </label>
            <input
              type="number"
              className="pill-input"
              style={{ width: "160px", minHeight: "36px", padding: "0.3rem 0.75rem" }}
              value={localProfile.familyIncomeInr}
              onChange={(e) => handleIncomeChange(e.target.value)}
              step="10000"
            />
          </div>
          <input
            id="break-income"
            type="range"
            min="0"
            max="1200000"
            step="10000"
            className="custom-range-slider"
            value={localProfile.familyIncomeInr}
            onChange={(e) => handleIncomeChange(e.target.value)}
          />
        </div>

        {/* Date of Birth / Age */}
        <div className="pill-select-wrap">
          <label htmlFor="break-dob">{t.dobLabel}</label>
          <input
            id="break-dob"
            type="date"
            className="pill-input"
            value={localProfile.dateOfBirth}
            onChange={(e) => handleDobChange(e.target.value)}
          />
        </div>

        {/* Occupation */}
        <div className="pill-select-wrap">
          <label htmlFor="break-occ">{t.occupationLabel}</label>
          <select
            id="break-occ"
            className="pill-select"
            value={localProfile.occupation}
            onChange={(e) => handleOccupationChange(e.target.value)}
          >
            {OCCUPATIONS.map((o) => (
              <option key={o.code} value={o.code}>
                {o.label}
              </option>
            ))}
          </select>
          <span className="pill-select-chevron"><IconChevronDown /></span>
        </div>

        {/* Quick Toggles */}
        <div className="toggle-tile">
          <span className="toggle-tile-title">{t.isIncomeTaxPayer}</span>
          <button
            type="button"
            className={`toggle-switch-btn ${localProfile.isIncomeTaxPayer ? "checked" : ""}`}
            onClick={() => handleToggle("isIncomeTaxPayer")}
            aria-pressed={localProfile.isIncomeTaxPayer}
          >
            <span className="toggle-thumb" />
          </button>
        </div>

        <div className="toggle-tile">
          <span className="toggle-tile-title">{t.isGovtEmployee}</span>
          <button
            type="button"
            className={`toggle-switch-btn ${localProfile.isGovtEmployee ? "checked" : ""}`}
            onClick={() => handleToggle("isGovtEmployee")}
            aria-pressed={localProfile.isGovtEmployee}
          >
            <span className="toggle-thumb" />
          </button>
        </div>

        <div className="toggle-tile">
          <span className="toggle-tile-title">{t.hasCultivableLand}</span>
          <button
            type="button"
            className={`toggle-switch-btn ${localProfile.hasCultivableLand ? "checked" : ""}`}
            onClick={() => handleToggle("hasCultivableLand")}
            aria-pressed={localProfile.hasCultivableLand}
          >
            <span className="toggle-thumb" />
          </button>
        </div>

        <div className="toggle-tile">
          <span className="toggle-tile-title">{t.isEnrolledInHigherEd}</span>
          <button
            type="button"
            className={`toggle-switch-btn ${localProfile.isEnrolledInHigherEd ? "checked" : ""}`}
            onClick={() => handleToggle("isEnrolledInHigherEd")}
            aria-pressed={localProfile.isEnrolledInHigherEd}
          >
            <span className="toggle-thumb" />
          </button>
        </div>
      </div>

      {/* Decision Diff List */}
      {diffs && diffs.length > 0 && (
        <div style={{
          marginTop: "1rem",
          background: "var(--warn-bg)",
          borderRadius: "var(--r-inner)",
          padding: "0.75rem 1rem",
          fontSize: "0.85rem",
          color: "var(--warn-ink)"
        }}>
          <strong style={{ display: "block", marginBottom: "0.3rem" }}>
            {t.diffHeader}
          </strong>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            {diffs.map((d, i) => (
              <li key={i}>
                🔄 <strong>{d.schemeId.toUpperCase()}:</strong> {d.oldDecision} ➔ <strong>{d.newDecision}</strong>
                {d.reasons?.length > 0 && ` (Determining clause: ${d.reasons.join(", ")})`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
