import React from "react";

export default function ResultsSummary({ t, results }) {
  if (!results || !results.schemes) return null;

  const total = results.schemes.length;
  const eligibleCount = results.schemes.filter(
    (s) => s.decision === "ELIGIBLE"
  ).length;

  const percentage = total > 0 ? (eligibleCount / total) * 100 : 0;
  const summaryText = t.summaryFormat
    .replace("{eligible}", eligibleCount)
    .replace("{total}", total);

  // Semicircular gauge calculation (180 degree arc)
  // Radius = 60, circumference of half-circle = PI * 60 ≈ 188.5
  const radius = 60;
  const halfCircumference = Math.PI * radius;
  const strokeDashoffset = halfCircumference * (1 - eligibleCount / (total || 1));

  return (
    <div className="bento-card results-header-card" aria-live="polite">
      <div className="results-summary-info">
        <h2>{t.resultsHeading}</h2>
        <div className="results-summary-count">{summaryText}</div>

        <div
          className="hatch-bar-track"
          role="progressbar"
          aria-valuenow={eligibleCount}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label={summaryText}
        >
          <div
            className="hatch-bar-fill"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Semicircular Gauge (Pure SVG) */}
      <div className="gauge-wrap" aria-hidden="true">
        <svg width="150" height="90" viewBox="0 0 150 90">
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--lime-1)" />
              <stop offset="60%" stopColor="var(--lime-2)" />
              <stop offset="100%" stopColor="var(--green-3)" />
            </linearGradient>
            <pattern id="gaugeHatch" width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
            </pattern>
          </defs>
          {/* Background track arc */}
          <path
            d="M 15 80 A 60 60 0 0 1 135 80"
            fill="none"
            stroke="var(--line)"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {/* Filled progress arc */}
          <path
            d="M 15 80 A 60 60 0 0 1 135 80"
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={halfCircumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: "stroke-dashoffset 0.6s var(--ease)" }}
          />
          {/* Hatch overlay arc */}
          <path
            d="M 15 80 A 60 60 0 0 1 135 80"
            fill="none"
            stroke="url(#gaugeHatch)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={halfCircumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: "stroke-dashoffset 0.6s var(--ease)" }}
          />
          <text
            x="75"
            y="75"
            textAnchor="middle"
            fill="var(--ink)"
            fontSize="18"
            fontWeight="700"
            fontFamily="inherit"
          >
            {eligibleCount}/{total}
          </text>
        </svg>
      </div>
    </div>
  );
}
