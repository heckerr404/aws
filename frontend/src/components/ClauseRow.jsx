import React, { useState } from "react";
import { IconCheck, IconCross } from "./icons";

export default function ClauseRow({ t, lang, clause, hideCitation = false }) {
  const [showCitation, setShowCitation] = useState(false);
  const isFailed = !clause.satisfied;

  const citation = clause.citation;
  const citationText = citation && !hideCitation
    ? `${t.page} ${citation.page || "?"}${citation.section ? `, ${t.section}${citation.section}` : ""}`
    : null;

  return (
    <div className={`clause-history-row ${isFailed ? "failed" : "passed"}`}>
      <div className="clause-row-main">
        <div className="clause-left-meta">
          <div
            className={`status-tile-icon ${isFailed ? "failed" : "passed"}`}
            aria-label={isFailed ? t.failed : t.passed}
          >
            {isFailed ? <IconCross size={14} /> : <IconCheck size={14} />}
          </div>

          <span className="clause-code-chip">{clause.clauseId}</span>

          <span style={{ fontSize: "0.85rem", fontWeight: isFailed ? 600 : 500, color: "var(--ink)" }}>
            {clause.description?.[lang] || clause.description?.en || clause.clauseId}
          </span>
        </div>

        {citationText && (
          <button
            type="button"
            className="citation-link"
            onClick={() => setShowCitation(!showCitation)}
            aria-expanded={showCitation}
          >
            {citationText} ({showCitation ? t.hideCitation : t.viewCitation})
          </button>
        )}
      </div>

      {showCitation && citation?.quote && (
        <div style={{
          background: "var(--card)",
          borderLeft: "3px solid var(--lime-2)",
          padding: "0.55rem 0.85rem",
          fontSize: "0.78rem",
          color: "var(--ink-2)",
          fontStyle: "italic",
          borderRadius: "0 6px 6px 0",
          boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
        }}>
          <strong style={{ color: "var(--ink)", fontStyle: "normal", marginRight: "0.35rem" }}>
            {t.verbatimQuote}
          </strong>
          &ldquo;{citation.quote}&rdquo;
        </div>
      )}
    </div>
  );
}
