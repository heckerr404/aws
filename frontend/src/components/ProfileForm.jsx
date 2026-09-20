import React, { useState } from "react";
import { INDIAN_STATES, SOCIAL_CATEGORIES, OCCUPATIONS, ARTISAN_TRADES } from "../demoProfiles";
import { IconChevronDown, IconArrowRight } from "./icons";
import { matchKeywords } from "../useSpeech";
import { useLocationDetect } from "../useLocationDetect";

export default function ProfileForm({
  t,
  lang,
  profile,
  onProfileChange,
  onSubmit,
  isLoading,
  speech,
  highlightedScheme,
  onClearHighlightedScheme,
}) {
  const [errors, setErrors] = useState({});
  const locationDetect = useLocationDetect();

  const handleFieldChange = (field, value) => {
    const updated = { ...profile, [field]: value };

    if (field === "occupation" && value !== "artisan") {
      updated.artisanTrade = "none";
    }
    if (field === "isEnrolledInHigherEd" && !value) {
      updated.class12Percentile = 0;
    }

    onProfileChange(updated);

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleVoiceFillTranscript = (transcript) => {
    const { result, matchedAny } = matchKeywords(transcript);
    if (matchedAny) {
      const updated = { ...profile, ...result };
      if (result.occupation && result.occupation !== "artisan") {
        updated.artisanTrade = "none";
      }
      onProfileChange(updated);
      const recognizedNames = [];
      if (result.state) {
        const s = INDIAN_STATES.find((x) => x.code === result.state);
        recognizedNames.push(`State: ${s?.name || result.state}`);
      }
      if (result.socialCategory) {
        const sc = SOCIAL_CATEGORIES.find((x) => x.code === result.socialCategory);
        recognizedNames.push(`Category: ${sc?.label || result.socialCategory}`);
      }
      if (result.occupation) {
        const occ = OCCUPATIONS.find((x) => x.code === result.occupation);
        recognizedNames.push(`Occupation: ${occ?.label || result.occupation}`);
      }
      if (speech?.showToast) {
        speech.showToast(`Voice filled: ${recognizedNames.join(" | ")}`);
      }
    } else {
      if (speech?.showToast) {
        speech.showToast(
          speech?.speechLang === "hi-IN"
            ? "समझ नहीं आया — कृपया मैन्युअल रूप से चुनें।"
            : "Didn't catch that — please select manually."
        );
      }
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!profile.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    } else {
      const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dobRegex.test(profile.dateOfBirth)) {
        newErrors.dateOfBirth = "Date of birth must be YYYY-MM-DD";
      }
    }

    if (!profile.state) newErrors.state = "State is required";
    if (!profile.gender) newErrors.gender = "Gender is required";
    if (!profile.socialCategory) newErrors.socialCategory = "Social category is required";
    if (!profile.occupation) newErrors.occupation = "Occupation is required";

    if (profile.occupation === "artisan" && (!profile.artisanTrade || profile.artisanTrade === "none")) {
      newErrors.artisanTrade = "Please specify artisan trade for artisan occupation";
    }

    if (typeof profile.familyIncomeInr !== "number" || profile.familyIncomeInr < 0) {
      newErrors.familyIncomeInr = "Annual family income must be a non-negative number";
    }

    if (profile.isEnrolledInHigherEd) {
      if (typeof profile.class12Percentile !== "number" || profile.class12Percentile < 0 || profile.class12Percentile > 100) {
        newErrors.class12Percentile = "Percentile must be between 0 and 100";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit();
    }
  };

  return (
    <form className="bento-card form-card" onSubmit={handleSubmit} noValidate>
      <div className="form-header-row">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
            <h2 className="form-header-title">{t.eligibilityTitle}</h2>
            <span className="voice-enabled-badge">🎙️ Voice-enabled</span>
          </div>
          <p className="form-header-subtitle">{t.eligibilitySubtitle}</p>
        </div>

        {speech?.isRecognitionSupported && (
          <div className="voice-header-controls">
            <div className="voice-lang-pill">
              <span className="voice-lang-label">Lang:</span>
              <select
                id="voice-lang-select"
                className="voice-lang-select"
                value={speech.speechLang}
                onChange={(e) => speech.setSpeechLang(e.target.value)}
                aria-label="Voice input language"
              >
                <option value="en-IN">English (en-IN)</option>
                <option value="hi-IN">हिन्दी (hi-IN)</option>
              </select>
            </div>

            <button
              type="button"
              className={`btn-voice-fill ${speech.listeningField === "general" ? "listening" : ""}`}
              onClick={() => speech.startListening("general", handleVoiceFillTranscript)}
              title="Voice Fill: Speak details (e.g. 'Farmer from Tamil Nadu OBC')"
            >
              {speech.listeningField === "general" ? (
                <>
                  <span className="mic-recording-pulse" />
                  <span>Listening...</span>
                </>
              ) : (
                <>
                  <span>🎙️</span>
                  <span>Voice Fill</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Scheme Focus Banner (if entered from Scheme Explorer) */}
      {highlightedScheme && (
        <div className="scheme-focus-banner" role="status" aria-live="polite">
          <div className="scheme-focus-badge-pill">
            <span className="scheme-focus-icon">🎯</span>
            <span>
              {t.checkingSchemePrefix || "Checking:"}{" "}
              <strong>
                {highlightedScheme.name?.[lang] || highlightedScheme.name?.en || highlightedScheme.name}
              </strong>
            </span>
          </div>
          <span className="scheme-focus-note">
            {t.singleSchemeModeNote || "Single-scheme mode — Evaluate will check only this scheme's Cedar policy"}
          </span>
          {onClearHighlightedScheme && (
            <button
              type="button"
              className="btn-clear-scheme-focus"
              onClick={onClearHighlightedScheme}
              title="Clear scheme focus"
              aria-label="Clear scheme focus"
            >
              ✕
            </button>
          )}
        </div>
      )}

      <div className="form-controls-grid">
        {/* State */}
        <div className="pill-select-wrap">
          <div className="field-label-row">
            <label htmlFor="state-select">{t.stateLabel} *</label>
            {locationDetect.isSupported && (
              <button
                type="button"
                className={`btn-auto-detect-location ${locationDetect.status}`}
                onClick={() => {
                  locationDetect.detectLocation((stateCode) => {
                    handleFieldChange("state", stateCode);
                  });
                }}
                disabled={locationDetect.status === "detecting"}
                title="Auto-detect state from GPS location"
              >
                {locationDetect.status === "detecting" ? (
                  <>
                    <span className="location-spinner" />
                    <span>Detecting...</span>
                  </>
                ) : locationDetect.status === "success" ? (
                  <>
                    <span>📍</span>
                    <span>Detected ✓</span>
                  </>
                ) : locationDetect.status === "error" ? (
                  <>
                    <span>📍</span>
                    <span>{locationDetect.errorMessage || "Couldn't detect — select manually"}</span>
                  </>
                ) : (
                  <>
                    <span>📍</span>
                    <span>Auto-detect my location</span>
                  </>
                )}
              </button>
            )}
          </div>
          <select
            id="state-select"
            className="pill-select"
            value={profile.state}
            onChange={(e) => {
              handleFieldChange("state", e.target.value);
              locationDetect.dismissHint();
            }}
          >
            {INDIAN_STATES.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name} ({s.code.toUpperCase()})
              </option>
            ))}
          </select>
          <span className="pill-select-chevron"><IconChevronDown /></span>
          {errors.state && <span style={{ fontSize: "0.75rem", color: "var(--err-ink)" }}>{errors.state}</span>}
          {locationDetect.showAutoFillHint && locationDetect.detectedInfo && (
            <div className="location-autofill-hint">
              <span>
                ✓ Auto-filled from your location ({locationDetect.detectedInfo.stateName}
                {locationDetect.detectedInfo.district ? `, ${locationDetect.detectedInfo.district}` : ""})
              </span>
              <button
                type="button"
                className="btn-dismiss-hint"
                onClick={locationDetect.dismissHint}
                aria-label="Dismiss hint"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Social Category */}
        <div className="pill-select-wrap">
          <label htmlFor="social-category">{t.socialCategoryLabel} *</label>
          <select
            id="social-category"
            className="pill-select"
            value={profile.socialCategory}
            onChange={(e) => handleFieldChange("socialCategory", e.target.value)}
          >
            {SOCIAL_CATEGORIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
          <span className="pill-select-chevron"><IconChevronDown /></span>
        </div>

        {/* Occupation */}
        <div className="pill-select-wrap">
          <label htmlFor="occupation-select">{t.occupationLabel} *</label>
          <select
            id="occupation-select"
            className="pill-select"
            value={profile.occupation}
            onChange={(e) => handleFieldChange("occupation", e.target.value)}
          >
            {OCCUPATIONS.map((o) => (
              <option key={o.code} value={o.code}>
                {o.label}
              </option>
            ))}
          </select>
          <span className="pill-select-chevron"><IconChevronDown /></span>
        </div>

        {/* Artisan Trade */}
        <div className="pill-select-wrap">
          <label htmlFor="artisan-trade">{t.artisanTradeLabel}</label>
          <select
            id="artisan-trade"
            className="pill-select"
            value={profile.artisanTrade}
            disabled={profile.occupation !== "artisan"}
            onChange={(e) => handleFieldChange("artisanTrade", e.target.value)}
          >
            {ARTISAN_TRADES.map((tItem) => (
              <option key={tItem.code} value={tItem.code}>
                {tItem.label}
              </option>
            ))}
          </select>
          <span className="pill-select-chevron"><IconChevronDown /></span>
          <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{t.artisanTradeHelp}</span>
          {errors.artisanTrade && <span style={{ fontSize: "0.75rem", color: "var(--err-ink)" }}>{errors.artisanTrade}</span>}
        </div>

        {/* Family Income */}
        <div className="pill-select-wrap">
          <label htmlFor="family-income">{t.incomeLabel} *</label>
          <input
            id="family-income"
            type="number"
            className="pill-input"
            min="0"
            step="10000"
            value={profile.familyIncomeInr}
            onChange={(e) => handleFieldChange("familyIncomeInr", Number(e.target.value))}
          />
          <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{t.incomeHelp}</span>
          {errors.familyIncomeInr && <span style={{ fontSize: "0.75rem", color: "var(--err-ink)" }}>{errors.familyIncomeInr}</span>}
        </div>

        {/* Class 12 Percentile (conditional) */}
        {profile.isEnrolledInHigherEd ? (
          <div className="pill-select-wrap">
            <label htmlFor="class12-score">{t.class12Label} *</label>
            <input
              id="class12-score"
              type="number"
              className="pill-input"
              min="0"
              max="100"
              step="1"
              value={profile.class12Percentile}
              onChange={(e) => handleFieldChange("class12Percentile", Number(e.target.value))}
            />
            <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{t.class12Help}</span>
            {errors.class12Percentile && <span style={{ fontSize: "0.75rem", color: "var(--err-ink)" }}>{errors.class12Percentile}</span>}
          </div>
        ) : (
          <div className="pill-select-wrap" style={{ visibility: "hidden" }} />
        )}

        {/* Two-column List Tiles for Yes/No Toggles */}
        <div className="toggle-tiles-grid">
          {/* Cultivable Land */}
          <div className="toggle-tile">
            <span className="toggle-tile-title">{t.hasCultivableLand}</span>
            <button
              type="button"
              className={`toggle-switch-btn ${profile.hasCultivableLand ? "checked" : ""}`}
              onClick={() => handleFieldChange("hasCultivableLand", !profile.hasCultivableLand)}
              aria-pressed={profile.hasCultivableLand}
              aria-label={t.hasCultivableLand}
            >
              <span className="toggle-thumb" />
            </button>
          </div>

          {/* Institutional Land */}
          <div className="toggle-tile">
            <span className="toggle-tile-title">{t.isInstitutionalLandHolder}</span>
            <button
              type="button"
              className={`toggle-switch-btn ${profile.isInstitutionalLandHolder ? "checked" : ""}`}
              onClick={() => handleFieldChange("isInstitutionalLandHolder", !profile.isInstitutionalLandHolder)}
              aria-pressed={profile.isInstitutionalLandHolder}
              aria-label={t.isInstitutionalLandHolder}
            >
              <span className="toggle-thumb" />
            </button>
          </div>

          {/* Income Tax Payer */}
          <div className="toggle-tile">
            <span className="toggle-tile-title">{t.isIncomeTaxPayer}</span>
            <button
              type="button"
              className={`toggle-switch-btn ${profile.isIncomeTaxPayer ? "checked" : ""}`}
              onClick={() => handleFieldChange("isIncomeTaxPayer", !profile.isIncomeTaxPayer)}
              aria-pressed={profile.isIncomeTaxPayer}
              aria-label={t.isIncomeTaxPayer}
            >
              <span className="toggle-thumb" />
            </button>
          </div>

          {/* Govt Employee */}
          <div className="toggle-tile">
            <span className="toggle-tile-title">{t.isGovtEmployee}</span>
            <button
              type="button"
              className={`toggle-switch-btn ${profile.isGovtEmployee ? "checked" : ""}`}
              onClick={() => handleFieldChange("isGovtEmployee", !profile.isGovtEmployee)}
              aria-pressed={profile.isGovtEmployee}
              aria-label={t.isGovtEmployee}
            >
              <span className="toggle-thumb" />
            </button>
          </div>

          {/* Bank Account */}
          <div className="toggle-tile">
            <span className="toggle-tile-title">{t.hasBankAccount}</span>
            <button
              type="button"
              className={`toggle-switch-btn ${profile.hasBankAccount ? "checked" : ""}`}
              onClick={() => handleFieldChange("hasBankAccount", !profile.hasBankAccount)}
              aria-pressed={profile.hasBankAccount}
              aria-label={t.hasBankAccount}
            >
              <span className="toggle-thumb" />
            </button>
          </div>

          {/* Enrolled in Higher Ed */}
          <div className="toggle-tile">
            <span className="toggle-tile-title">{t.isEnrolledInHigherEd}</span>
            <button
              type="button"
              className={`toggle-switch-btn ${profile.isEnrolledInHigherEd ? "checked" : ""}`}
              onClick={() => handleFieldChange("isEnrolledInHigherEd", !profile.isEnrolledInHigherEd)}
              aria-pressed={profile.isEnrolledInHigherEd}
              aria-label={t.isEnrolledInHigherEd}
            >
              <span className="toggle-thumb" />
            </button>
          </div>

          {/* Credit Scheme in Last 5 Years */}
          <div className="toggle-tile" style={{ gridColumn: "1 / -1" }}>
            <span className="toggle-tile-title">{t.availedCreditSchemeLast5Yrs}</span>
            <button
              type="button"
              className={`toggle-switch-btn ${profile.availedCreditSchemeLast5Yrs ? "checked" : ""}`}
              onClick={() => handleFieldChange("availedCreditSchemeLast5Yrs", !profile.availedCreditSchemeLast5Yrs)}
              aria-pressed={profile.availedCreditSchemeLast5Yrs}
              aria-label={t.availedCreditSchemeLast5Yrs}
            >
              <span className="toggle-thumb" />
            </button>
          </div>
        </div>

        {/* Submit Button (Full-width black pill with hover arrow) */}
        <div className="submit-wrap">
          <button
            type="submit"
            className="btn-submit-pill"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="status-dot checking" />
                <span>{t.evaluatingBtn}</span>
              </>
            ) : (
              <>
                <span>{t.checkBtn}</span>
                <span className="hover-arrow"><IconArrowRight /></span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
