import React, { useState, useEffect, useRef } from "react";
import { Routes, Route, useNavigate, useSearchParams } from "react-router-dom";
import { translations } from "./i18n";
import { DEMO_PROFILES } from "./demoProfiles";
import { checkEligibility, health, isApiConfigured } from "./api";
import { useAuth } from "./auth/AuthContext";
import LoginPage from "./auth/LoginPage";
import FaceVerify from "./auth/FaceVerify";


import Header from "./components/Header";
import AadhaarCard from "./components/AadhaarCard";
import ProfileForm from "./components/ProfileForm";
import ResultsSummary from "./components/ResultsSummary";
import SchemeProofCard from "./components/SchemeProofCard";
import BreakItPanel from "./components/BreakItPanel";
import FeaturesPage from "./components/FeaturesPage";
import HowItWorksPage from "./components/HowItWorksPage";
import SchemesPage from "./components/SchemesPage";
import DocumentMapPage from "./components/DocumentMapPage";
import FrontlineModePage from "./components/FrontlineModePage";
import FaceVerifyPage from "./components/FaceVerifyPage";
import { ONBOARDED_SCHEMES } from "./schemesData";
import { IconLightning, IconArrowDown, IconShieldLocker, IconShieldCheck } from "./components/icons";
import { useSpeech } from "./useSpeech";
import DigiLockerModal from "./components/DigiLockerModal";

/* ─── Home Page Content (hero → profiles → form → results) ─── */
function HomePage({
  t, lang, speech,
  selectedDemoId, handleSelectDemo,
  cardData, setCardData,
  profile, setProfile,
  handleCheckEligibility, isLoading,
  errorMessage, results, sortedSchemes, changedSchemeIds,
  submittedProfile, handleResetBreakIt, handleLiveCheck, decisionDiffs, isLiveLoading,
  navigate,
  highlightedScheme, onClearHighlightedScheme,
  singleSchemeResult, onViewAllSchemes,
  onOpenDigiLocker,
  onOpenFaceVerify,
  isFaceVerified
}) {
  return (
    <main className="bento-grid">
      {/* 1. Hero Card */}
      <section className="bento-card hero-card">
        <div className="hero-deco-texture" aria-hidden="true">
          <div className="deco-block" />
          <div className="deco-block yellow" />
          <div className="deco-block orange" />
          <div className="deco-block" />
        </div>

        <div>
          <h2 className="hero-title">{t.heroTitle}</h2>
          <p className="hero-subtitle">{t.heroSubtitle}</p>
        </div>

        <div className="hero-actions">
          <button
            type="button"
            className="btn-pill-black"
            onClick={() => document.getElementById("profile-form-section")?.scrollIntoView({ behavior: "smooth" })}
          >
            <span>{t.checkEligibilityBtn}</span>
            <IconArrowDown size={14} />
          </button>
          <button
            type="button"
            className="btn-pill-white"
            onClick={() => navigate("/how-it-works")}
          >
            {t.howItWorksBtn}
          </button>
        </div>
      </section>

      {/* 2. Demo Avatar Chips Row */}
      <section className="bento-card demo-avatars-card" role="region" aria-label="Demo Profiles">
        <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--ink-2)" }}>
          {t.demoFillTitle}
        </span>

        <div className="demo-avatars-group">
          <button
            type="button"
            className={`avatar-chip-btn ${selectedDemoId === "murugan" ? "active" : ""}`}
            onClick={() => handleSelectDemo("murugan")}
          >
            <div className="avatar-circle">🌾</div>
            <span className="avatar-label">{t.muruganTag}</span>
          </button>

          <button
            type="button"
            className={`avatar-chip-btn ${selectedDemoId === "divya" ? "active" : ""}`}
            onClick={() => handleSelectDemo("divya")}
          >
            <div className="avatar-circle">🎓</div>
            <span className="avatar-label">{t.divyaTag}</span>
          </button>

          <button
            type="button"
            className={`avatar-chip-btn ${selectedDemoId === "rafiq" ? "active" : ""}`}
            onClick={() => handleSelectDemo("rafiq")}
          >
            <div className="avatar-circle">✂️</div>
            <span className="avatar-label">{t.rafiqTag}</span>
          </button>
        </div>
      </section>

      {/* 2b. DigiLocker Fast-Track Entry Bar */}
      <section className="digilocker-entry-bar" role="region" aria-label="DigiLocker Verification">
        <div className="digilocker-entry-left">
          <div className="digilocker-badge-icon" aria-hidden="true">
            <IconShieldLocker size={24} />
          </div>
          <div>
            <div className="digilocker-entry-title">
              <span>Fast-Track with DigiLocker</span>
            </div>
            <div className="digilocker-entry-desc">
              Import verified Aadhaar, Income & Caste certificates directly to auto-fill your criteria
            </div>
          </div>
        </div>

        <div className="digilocker-entry-right">
          <button
            type="button"
            className="btn-digilocker"
            onClick={onOpenDigiLocker}
          >
            <IconShieldLocker size={17} />
            <span>Login with DigiLocker</span>
          </button>
          <span className="digilocker-entry-note">
            In production, this would use DigiLocker's Partner API after UIDAI-approved onboarding.
          </span>
        </div>
      </section>

      {/* 3. Form Section (ID Card span 4 + Profile Form span 8) */}
      <div id="profile-form-section" style={{ gridColumn: "span 12", display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "1rem" }}>
        <AadhaarCard
          t={t}
          lang={lang}
          cardData={cardData}
          onCardDataChange={setCardData}
          dateOfBirth={profile.dateOfBirth}
          gender={profile.gender}
          onDobChange={(val) => setProfile((p) => ({ ...p, dateOfBirth: val }))}
          onGenderChange={(val) => setProfile((p) => ({ ...p, gender: val }))}
          speech={speech}
          onOpenDigiLocker={onOpenDigiLocker}
          onOpenFaceVerify={onOpenFaceVerify}
          isFaceVerified={isFaceVerified}
        />

        <ProfileForm
          t={t}
          lang={lang}
          profile={profile}
          onProfileChange={setProfile}
          onSubmit={() => handleCheckEligibility(null, highlightedScheme?.id || null)}
          isLoading={isLoading}
          speech={speech}
          highlightedScheme={highlightedScheme}
          onClearHighlightedScheme={onClearHighlightedScheme}
        />
      </div>

      {errorMessage && (
        <div style={{
          gridColumn: "span 12",
          background: "var(--err-bg)",
          borderRadius: "var(--r-inner)",
          padding: "1rem 1.25rem",
          color: "var(--err-ink)"
        }}>
          <strong>Error: </strong> {errorMessage}
        </div>
      )}

      {/* 4. Results Section */}
      {results && (
        <div id="results-section" style={{ gridColumn: "span 12", display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "1rem" }}>
          <ResultsSummary t={t} results={results} />

          <div className="schemes-bento-container">
            {sortedSchemes.map((scheme) => (
              <SchemeProofCard
                key={scheme.schemeId}
                t={t}
                lang={lang}
                scheme={scheme}
                isChanged={changedSchemeIds.has(scheme.schemeId)}
                speech={speech}
              />
            ))}
          </div>

          {/* Single-scheme mode: show "View all schemes" ghost button */}
          {singleSchemeResult && (
            <div style={{ gridColumn: "span 12", display: "flex", justifyContent: "center", paddingTop: "0.25rem" }}>
              <button
                type="button"
                className="btn-view-all-schemes"
                onClick={onViewAllSchemes}
                disabled={isLoading}
              >
                {isLoading
                  ? (t.evaluatingLabel || "Evaluating…")
                  : (t.viewAllSchemesBtn || "View eligibility for all 50 schemes →")}
              </button>
            </div>
          )}

          {/* Break It Panel */}
          <BreakItPanel
            t={t}
            lang={lang}
            profile={profile}
            originalProfile={submittedProfile}
            onReset={handleResetBreakIt}
            onLiveCheck={handleLiveCheck}
            diffs={decisionDiffs}
            isLiveLoading={isLiveLoading}
          />
        </div>
      )}
    </main>
  );
}

/* ─── Root App with Shared Layout + Routes ─── */
export default function App() {
  const { identity, logout, markFaceVerified } = useAuth();
  const [showFaceVerify, setShowFaceVerify] = useState(false);
  const [faceToast, setFaceToast] = useState(null);
  const speech = useSpeech();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [highlightedScheme, setHighlightedScheme] = useState(null);

  const [lang, setLang] = useState("en");
  const t = translations[lang];

  // Sync highlightedScheme with ?scheme= query parameter
  useEffect(() => {
    const schemeParam = searchParams.get("scheme");
    if (schemeParam) {
      const found = ONBOARDED_SCHEMES.find((s) => s.id === schemeParam);
      if (found) {
        setHighlightedScheme(found);
      }
    } else {
      setHighlightedScheme(null);
    }
  }, [searchParams]);

  const handleClearHighlightedScheme = () => {
    setHighlightedScheme(null);
    setSingleSchemeResult(null);
    if (searchParams.get("scheme")) {
      const next = new URLSearchParams(searchParams);
      next.delete("scheme");
      setSearchParams(next, { replace: true });
    }
  };

  // System status
  const [backendStatus, setBackendStatus] = useState("checking");
  const [apiConfigured] = useState(isApiConfigured());

  // Profile and cosmetic card state (NEVER persisted to browser storage)
  const [selectedDemoId, setSelectedDemoId] = useState("murugan");
  const [cardData, setCardData] = useState(DEMO_PROFILES.murugan.card);
  const [profile, setProfile] = useState(DEMO_PROFILES.murugan.profile);
  const [submittedProfile, setSubmittedProfile] = useState(DEMO_PROFILES.murugan.profile);

  // Results state
  const [results, setResults] = useState(null);
  const [previousResults, setPreviousResults] = useState(null);
  const [changedSchemeIds, setChangedSchemeIds] = useState(new Set());
  const [decisionDiffs, setDecisionDiffs] = useState([]);
  // When non-null, the current results pane shows only this single scheme's result.
  // Cleared to null after "View all schemes" is clicked (switches to batch mode).
  const [singleSchemeResult, setSingleSchemeResult] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveLoading, setIsLiveLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // DigiLocker modal & feedback state
  const [showDigiLockerModal, setShowDigiLockerModal] = useState(false);
  const [digiLockerToast, setDigiLockerToast] = useState(null);

  // Active in-flight live request tracker
  const inFlightLiveReqRef = useRef(0);

  // Initial health check
  useEffect(() => {
    let isMounted = true;
    if (!apiConfigured) {
      setBackendStatus("offline");
      return;
    }

    health()
      .then(() => {
        if (isMounted) setBackendStatus("online");
      })
      .catch(() => {
        if (isMounted) setBackendStatus("offline");
      });

    return () => {
      isMounted = false;
    };
  }, [apiConfigured]);

  // Load a demo profile
  const handleSelectDemo = (demoKey) => {
    const demo = DEMO_PROFILES[demoKey];
    if (!demo) return;
    setSelectedDemoId(demoKey);
    setCardData(demo.card);
    setProfile(demo.profile);
    setSubmittedProfile(demo.profile);
    setResults(null);
    setPreviousResults(null);
    setChangedSchemeIds(new Set());
    setDecisionDiffs([]);
    setSingleSchemeResult(null);
    setErrorMessage(null);
  };

  // Submit check from main form.
  // schemeId: when provided, runs single-scheme mode; when null, runs batch (all 50 schemes).
  const handleCheckEligibility = async (overrideProfile = null, schemeId = null) => {
    const targetProfile = overrideProfile || profile;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await checkEligibility(targetProfile, lang, null, schemeId);
      setSubmittedProfile(targetProfile);
      setPreviousResults(results);
      setResults(response);
      setChangedSchemeIds(new Set());
      setDecisionDiffs([]);
      // Track whether this was a single-scheme run
      setSingleSchemeResult(schemeId || null);

      // Smooth scroll to results
      setTimeout(() => {
        document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      setErrorMessage(err.message || "Failed to contact eligibility engine.");
    } finally {
      setIsLoading(false);
    }
  };

  // Run full batch check for all schemes using the currently submitted profile.
  const handleViewAllSchemes = async () => {
    setSingleSchemeResult(null);       // exit single-scheme mode immediately
    handleClearHighlightedScheme();    // clear the scheme focus badge
    await handleCheckEligibility(submittedProfile, null); // batch mode
  };

  // Live re-check in BreakItPanel (at most 1 in-flight, ignores stale)
  const handleLiveCheck = async (updatedProfile) => {
    if (!results) return;

    const requestId = ++inFlightLiveReqRef.current;
    setIsLiveLoading(true);

    try {
      const newResponse = await checkEligibility(updatedProfile, lang);
      if (requestId !== inFlightLiveReqRef.current) return;

      const diffs = [];
      const changedIds = new Set();

      const oldMap = new Map((results.schemes || []).map((s) => [s.schemeId, s]));
      (newResponse.schemes || []).forEach((newScheme) => {
        const oldScheme = oldMap.get(newScheme.schemeId);
        if (oldScheme && oldScheme.decision !== newScheme.decision) {
          changedIds.add(newScheme.schemeId);
          diffs.push({
            schemeId: newScheme.schemeId,
            oldDecision: oldScheme.decision,
            newDecision: newScheme.decision,
            reasons: (newScheme.clauses || []).filter((c) => !c.satisfied).map((c) => c.clauseId)
          });
        }
      });

      setPreviousResults(results);
      setResults(newResponse);
      setChangedSchemeIds(changedIds);
      setDecisionDiffs(diffs);
      setProfile(updatedProfile);
    } catch (err) {
      console.warn("Live check error:", err);
    } finally {
      if (requestId === inFlightLiveReqRef.current) {
        setIsLiveLoading(false);
      }
    }
  };

  const handleResetBreakIt = () => {
    setProfile(submittedProfile);
    if (results && previousResults) {
      setResults(previousResults);
    }
    setChangedSchemeIds(new Set());
    setDecisionDiffs([]);
  };

  const sortedSchemes = results?.schemes
    ? [...results.schemes].sort((a, b) => {
        const order = { ELIGIBLE: 0, NOT_ELIGIBLE: 1, ERROR: 2 };
        return (order[a.decision] ?? 3) - (order[b.decision] ?? 3);
      })
    : [];

  /* Gate: show login if not authenticated */
  if (!identity) {
    return (
      <LoginPage
        onLoginComplete={(profileKey) => {
          if (profileKey) {
            handleSelectDemo(profileKey);
            setDigiLockerToast("DigiLocker verified ✓ (demo)");
            setTimeout(() => setDigiLockerToast(null), 4000);
            navigate("/");
            setTimeout(() => {
              document.getElementById("profile-form-section")?.scrollIntoView({ behavior: "smooth" });
            }, 150);
          } else {
            navigate("/schemes");
          }
        }}
      />
    );
  }

  const handleFaceVerifyPass = () => {
    markFaceVerified();
    setShowFaceVerify(false);
    setFaceToast("Biometric Face Verification Successful ✓");
    setTimeout(() => setFaceToast(null), 4000);
  };

  return (
    <div className="app-shell-wrapper" lang={lang}>

      <div className="shell-grid">
        <Header
          t={t}
          lang={lang}
          onLangChange={setLang}
          backendStatus={backendStatus}
          identity={identity}
          onLogout={logout}
          onFaceVerify={() => setShowFaceVerify(true)}
        />

        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                t={t} lang={lang} speech={speech}
                selectedDemoId={selectedDemoId} handleSelectDemo={handleSelectDemo}
                cardData={cardData} setCardData={setCardData}
                profile={profile} setProfile={setProfile}
                handleCheckEligibility={handleCheckEligibility} isLoading={isLoading}
                errorMessage={errorMessage} results={results}
                sortedSchemes={sortedSchemes} changedSchemeIds={changedSchemeIds}
                submittedProfile={submittedProfile}
                handleResetBreakIt={handleResetBreakIt}
                handleLiveCheck={handleLiveCheck}
                decisionDiffs={decisionDiffs} isLiveLoading={isLiveLoading}
                navigate={navigate}
                highlightedScheme={highlightedScheme}
                onClearHighlightedScheme={handleClearHighlightedScheme}
                singleSchemeResult={singleSchemeResult}
                onViewAllSchemes={handleViewAllSchemes}
                onOpenDigiLocker={() => setShowDigiLockerModal(true)}
                onOpenFaceVerify={() => setShowFaceVerify(true)}
                isFaceVerified={identity?.faceVerified}
              />
            }
          />
          <Route
            path="/schemes"
            element={
              <SchemesPage
                t={t}
                lang={lang}
                onSelectScheme={(schemeId) => {
                  if (schemeId) {
                    const found = ONBOARDED_SCHEMES.find((s) => s.id === schemeId);
                    setHighlightedScheme(found || null);
                    navigate(`/?scheme=${schemeId}`);
                  } else {
                    setHighlightedScheme(null);
                    navigate("/");
                  }
                  setTimeout(() => {
                    document.getElementById("profile-form-section")?.scrollIntoView({ behavior: "smooth" });
                  }, 120);
                }}
              />
            }
          />
          <Route path="/document-map" element={<DocumentMapPage t={t} lang={lang} />} />
          <Route path="/frontline" element={<FrontlineModePage t={t} lang={lang} />} />
          <Route path="/face-verify" element={<FaceVerifyPage t={t} lang={lang} />} />
          <Route path="/features" element={<FeaturesPage t={t} />} />
          <Route path="/how-it-works" element={<HowItWorksPage t={t} />} />
        </Routes>
      </div>

      {/* Footer */}
      <footer className="app-shell-footer">
        <p>
          {t.footerDisclaimer.replace(
            "{publishedAt}",
            results?.catalogPublishedAt || "2026-09-19"
          )}
        </p>
        <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
          &ldquo;Haqdaar currently covers four schemes with hand-verified rules. The same pipeline extends to more schemes; human verification is a deliberate gate, not a limitation to hide.&rdquo;
        </p>
        <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
          {t.footerUidai}
        </p>
      </footer>

      {/* Floating Voice Recognition Feedback Toast */}
      {speech.toastMessage && (
        <div className="voice-toast" role="status">
          <span className="voice-toast-icon">🎙️</span>
          <span>{speech.toastMessage}</span>
        </div>
      )}

      {/* DigiLocker Consent Modal */}
      <DigiLockerModal
        isOpen={showDigiLockerModal}
        onClose={() => setShowDigiLockerModal(false)}
        onVerifySuccess={(profileKey) => {
          setShowDigiLockerModal(false);
          const targetKey = profileKey || "murugan";
          handleSelectDemo(targetKey);
          setDigiLockerToast("DigiLocker verified ✓ (demo)");
          setTimeout(() => setDigiLockerToast(null), 4000);
          navigate("/");
          setTimeout(() => {
            document.getElementById("profile-form-section")?.scrollIntoView({ behavior: "smooth" });
          }, 150);
        }}
      />

      {/* Face Verification Modal */}
      {showFaceVerify && (
        <FaceVerify
          lang={lang}
          onPass={handleFaceVerifyPass}
          onCancel={() => setShowFaceVerify(false)}
          onSkip={() => setShowFaceVerify(false)}
        />
      )}

      {/* Face Verification Toast */}
      {faceToast && (
        <div className="digilocker-toast" role="status" aria-live="polite">
          <IconShieldCheck size={20} />
          <span>{faceToast}</span>
        </div>
      )}

      {/* DigiLocker Toast */}
      {digiLockerToast && (
        <div className="digilocker-toast" role="status" aria-live="polite">
          <IconShieldCheck size={20} />
          <span>{digiLockerToast}</span>
        </div>
      )}
    </div>
  );
}
