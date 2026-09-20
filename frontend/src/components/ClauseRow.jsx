import React from "react";
import { IconCheck, IconCross } from "./icons";

export default function ClauseRow({ t, lang, clause }) {
  const isFailed = !clause.satisfied;

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
      </div>
    </div>
  );
}
