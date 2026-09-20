import React from "react";
import ClauseRow from "./ClauseRow";
import WhatWouldChange from "./WhatWouldChange";
import ReceiptChip from "./ReceiptChip";
import { IconCheck, IconCross } from "./icons";

export default function SchemeProofCard({ t, lang, scheme, isChanged, speech }) {
  const isEligible = scheme.decision === "ELIGIBLE";
  const isNotEligible = scheme.decision === "NOT_ELIGIBLE";

  const pillClass = isEligible
    ? "eligible"
    : isNotEligible
    ? "not-eligible"
    : "error";

  const pillText = isEligible
    ? t.eligible
    : isNotEligible
    ? t.notEligible
    : t.errorStatus;

  // Sort clauses: failed first, then satisfied
  const sortedClauses = [...(scheme.clauses || [])].sort((a, b) => {
    if (!a.satisfied && b.satisfied) return -1;
    if (a.satisfied && !b.satisfied) return 1;
    return 0;
  });

  const schemeName = scheme.name?.[lang] || scheme.name?.en || scheme.schemeId;
  const explanationText = scheme.explanation?.[lang] || scheme.explanation?.en || scheme.explanation;
  const isAiGenerated = scheme.explanationGeneratedBy === "bedrock";

  const isSpeakingThis = speech?.speakingSchemeId === scheme.schemeId;

  const handleReadAloud = () => {
    if (isSpeakingThis) {
      speech.stopSpeaking();
      return;
    }

    const decisionWord = isEligible
      ? (lang === "hi" ? "पात्र (ELIGIBLE)" : "ELIGIBLE")
      : (lang === "hi" ? "अपात्र (NOT ELIGIBLE)" : "NOT ELIGIBLE");

    let speechScript = `${schemeName}. Status: ${decisionWord}. `;

    if (explanationText) {
      speechScript += `${explanationText}. `;
    } else if (sortedClauses.length > 0) {
      const failed = sortedClauses.filter((c) => !c.satisfied);
      if (failed.length > 0) {
        const failReasons = failed
          .slice(0, 2)
          .map((f) => f.requirementText?.[lang] || f.requirementText?.en || f.requirementText)
          .join(", ");
        speechScript += `Failed requirement: ${failReasons}. `;
      } else {
        speechScript += `Satisfied all statutory criteria. `;
      }
    }

    speech?.speakText(scheme.schemeId, speechScript);
  };

  return (
    <article className="bento-proof-card" aria-labelledby={`scheme-title-${scheme.schemeId}`}>
      {/* 4px top accent */}
      <div className={`card-top-accent ${isEligible ? "eligible" : "not-eligible"}`} />

      <div className="bento-proof-header">
        <div>
          <h3 id={`scheme-title-${scheme.schemeId}`} className="scheme-heading">
            {schemeName}
          </h3>
          <p className="scheme-sub-ministry">{scheme.ministry}</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
          {isChanged && (
            <span className="demo-banner-badge" style={{ background: "var(--orange)" }}>
              {t.changedBadge}
            </span>
          )}

          {speech?.isSynthesisSupported && (
            <button
              type="button"
              className={`btn-read-aloud ${isSpeakingThis ? "speaking" : ""}`}
              onClick={handleReadAloud}
              title={isSpeakingThis ? "Stop reading" : "Read result aloud"}
              aria-label={isSpeakingThis ? "Stop reading result aloud" : `Read ${schemeName} result aloud`}
            >
              {isSpeakingThis ? (
                <>
                  <span className="audio-wave-dot" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <span>🔊</span>
                  <span className="read-aloud-text">Read aloud</span>
                </>
              )}
            </button>
          )}

          <div className={`status-pill ${pillClass}`}>
            {isEligible ? <IconCheck size={13} /> : isNotEligible ? <IconCross size={13} /> : "⚠"}
            <span>{pillText}</span>
          </div>
        </div>
      </div>

      {/* Clause Table */}
      {sortedClauses.length > 0 && (
        <div>
          <div className="clause-section-label">
            {scheme.citationVerified
              ? (t.clausesTitle || "STATUTORY CLAUSE VERIFICATION TABLE")
              : (t.ruleBasedEligibilityCheck || "RULE-BASED ELIGIBILITY CHECK")}
          </div>
          <div className="clause-history-list">
            {sortedClauses.map((clause) => (
              <ClauseRow
                key={clause.clauseId}
                t={t}
                lang={lang}
                clause={clause}
                hideCitation={!scheme.citationVerified}
              />
            ))}
          </div>
          {!scheme.citationVerified && (
            <p className="rule-based-note" style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "0.45rem", fontStyle: "italic" }}>
              {lang === "hi"
                ? "योजना नियमों पर आधारित — इस योजना के लिए आधिकारिक खंड उद्धरण सत्यापन लंबित है।"
                : "Based on scheme rules — official clause citations pending verification for this scheme."}
            </p>
          )}
        </div>
      )}

      {/* What Would Change (Counterfactuals) */}
      {(scheme.whatWouldChange || scheme.counterfactuals) && (
        <WhatWouldChange
          t={t}
          lang={lang}
          whatWouldChange={scheme.whatWouldChange || scheme.counterfactuals}
        />
      )}

      {/* Limitations (if any) */}
      {scheme.limitations && scheme.limitations.length > 0 && (
        <div style={{
          padding: "0.65rem 0.85rem",
          background: "var(--warn-bg)",
          borderRadius: "var(--r-inner)",
          fontSize: "0.8rem",
          color: "var(--warn-ink)"
        }}>
          <strong style={{ display: "block", marginBottom: "0.2rem" }}>
            ⚠️ {t.limitationsTitle}
          </strong>
          <ul style={{ listStyle: "disc", paddingLeft: "1.2rem", margin: 0 }}>
            {scheme.limitations.map((lim, idx) => (
              <li key={idx}>{typeof lim === "object" ? (lim[lang] || lim.en) : lim}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer / Summary / Receipt */}
      <div className="proof-card-footer">
        {explanationText && (
          <div className="summary-strip">
            <span className="summary-strip-label">
              {isAiGenerated ? t.aiSummaryLabel : t.templateSummaryLabel}
            </span>
            <p className="summary-strip-text">{explanationText}</p>
          </div>
        )}

        <div className="receipt-pill-row">
          <ReceiptChip t={t} receiptId={scheme.receipt?.receiptId || scheme.receiptId} />

          {scheme.officialUrl && (
            <a
              href={scheme.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: "0.8rem", fontWeight: 600 }}
            >
              {t.officialSource} ↗
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
