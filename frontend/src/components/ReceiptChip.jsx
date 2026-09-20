import React, { useState } from "react";
import { IconCopy, IconCheck } from "./icons";

export default function ReceiptChip({ t, receiptId }) {
  const [copied, setCopied] = useState(false);

  if (!receiptId) return null;

  const handleCopy = () => {
    navigator.clipboard?.writeText(receiptId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncated = receiptId.length > 20
    ? `${receiptId.slice(0, 10)}...${receiptId.slice(-10)}`
    : receiptId;

  return (
    <div className="receipt-mono-pill" title={t.receiptTooltip}>
      <span style={{ fontWeight: 700, color: "var(--ink-2)", letterSpacing: "0.03em" }}>RECEIPT:</span>
      <span style={{ fontWeight: 700, color: "var(--ink)" }}>{truncated}</span>
      <button
        type="button"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.25rem",
          padding: "0.15rem 0.45rem",
          background: "var(--card)",
          border: "1px solid var(--line)",
          borderRadius: "var(--r-pill)",
          fontSize: "0.7rem",
          cursor: "pointer",
          color: "var(--ink-2)"
        }}
        onClick={handleCopy}
        aria-label="Copy receipt ID"
      >
        {copied ? (
          <>
            <IconCheck size={12} style={{ color: "var(--green-4)" }} />
            <span>{t.copiedReceipt}</span>
          </>
        ) : (
          <>
            <IconCopy size={12} />
            <span>{t.copyReceipt}</span>
          </>
        )}
      </button>
    </div>
  );
}
