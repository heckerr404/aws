import React from "react";

export default function WhatWouldChange({ t, lang, counterfactuals, whatWouldChange }) {
  const items = whatWouldChange || counterfactuals || [];
  if (!items || items.length === 0) return null;

  const formatValue = (field, val) => {
    if (val === null || val === undefined) return "—";
    if (typeof val === "boolean") return val ? t.yes : t.no;
    if (field?.toLowerCase().includes("income")) {
      return `₹${Number(val).toLocaleString("en-IN")}`;
    }
    return String(val);
  };

  const getFieldLabel = (field) => {
    const map = {
      familyIncomeInr: t.incomeLabel,
      isIncomeTaxPayer: t.isIncomeTaxPayer,
      isGovtEmployee: t.isGovtEmployee,
      hasCultivableLand: t.hasCultivableLand,
      isInstitutionalLandHolder: t.isInstitutionalLandHolder,
      hasBankAccount: t.hasBankAccount,
      isEnrolledInHigherEd: t.isEnrolledInHigherEd,
      occupation: t.occupationLabel,
      artisanTrade: t.artisanTradeLabel,
      class12Percentile: t.class12Label
    };
    return map[field] || field;
  };

  return (
    <div className="what-would-change-panel">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
        <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--ok-ink)" }}>
          {t.whatWouldChangeTitle}
        </span>
        <span className="verified-policy-pill">
          {t.verifiedByEngineBadge}
        </span>
      </div>

      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.8rem", color: "var(--ok-ink)" }}>
        {items.map((item, idx) => {
          if (!item.change) {
            return (
              <li key={idx}>
                • <strong>{item.clauseId || "Criterion"}:</strong> {t.cannotBeChanged}
              </li>
            );
          }

          if (item.clauseId === "*") {
            return (
              <li key={idx}>
                • <strong>Combined:</strong> {t.combinedCounterfactual}
              </li>
            );
          }

          const fieldName = getFieldLabel(item.change.field);
          const targetVal = formatValue(item.change.field, item.change.targetValue);
          const currentVal = formatValue(item.change.field, item.change.currentValue);

          const renderedText = t.wouldBecomeEligibleText
            .replace("{field}", `"${fieldName}"`)
            .replace("{target}", targetVal)
            .replace("{current}", currentVal);

          return (
            <li key={idx}>
              • <span>{renderedText}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
