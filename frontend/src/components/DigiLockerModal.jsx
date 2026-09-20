import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { IconShieldLocker, IconShieldCheck, IconFileCheck, IconCross, IconCheck } from "./icons";
import { AadhaarTopStripe, AadhaarDotTexture } from "./AadhaarCardHeader";

const CONSENT_DOCUMENTS = [
  {
    id: "aadhaar",
    name: "Aadhaar Card",
    issuer: "Unique Identification Authority of India (UIDAI)",
    description: "Demographic and verified identity record",
    icon: "🪪",
  },
  {
    id: "income",
    name: "Income Certificate",
    issuer: "Revenue Department / Tahsildar",
    description: "Annual family income certificate",
    icon: "📄",
  },
  {
    id: "caste",
    name: "Caste Certificate",
    issuer: "Department of Social Welfare",
    description: "Community reservation & category verification",
    icon: "📜",
  },
  {
    id: "domicile",
    name: "Domicile Certificate",
    issuer: "District Magistrate / Sub-Divisional Office",
    description: "Permanent resident state verification",
    icon: "🏛️",
  },
];

const DEMO_CITIZENS = [
  {
    id: "murugan",
    name: "Murugan Selvam",
    role: "Small Farmer (Madurai, TN)",
    income: "₹1,80,000 / yr",
    category: "OBC",
  },
  {
    id: "divya",
    name: "Divya Ramesh",
    role: "Higher-Ed Student (Coimbatore, TN)",
    income: "₹3,00,000 / yr",
    category: "General",
  },
  {
    id: "rafiq",
    name: "Rafiq Ansari",
    role: "Artisan / Weaver (Jaipur, RJ)",
    income: "₹90,000 / yr",
    category: "OBC",
  },
];

export default function DigiLockerModal({ isOpen, onClose, onVerifySuccess }) {
  const [selectedProfileId, setSelectedProfileId] = useState("murugan");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpError, setOtpError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setOtp("");
      setOtpSent(false);
      setIsVerifying(false);
      setOtpError("");
      // Prevent background scroll
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendOtp = () => {
    setOtpSent(true);
    setOtpError("");
    // Simulate instantaneous delivery of demo OTP
    setOtp("123456");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleOtpChange = (e) => {
    const clean = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(clean);
    if (otpError) setOtpError("");
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setOtpError("Please enter all 6 digits of the OTP.");
      return;
    }

    setIsVerifying(true);
    setOtpError("");

    setTimeout(() => {
      setIsVerifying(false);
      onVerifySuccess(selectedProfileId);
    }, 650);
  };

  const modalContent = (
    <div className="digilocker-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="digilocker-title">
      <div className="digilocker-modal-backdrop" onClick={onClose} />

      <div className="digilocker-modal-card">
        {/* Subtle circular/radial dot-pattern texture in bottom-left */}
        <AadhaarDotTexture />

        {/* Authentic top stripe matching reference */}
        <div style={{ padding: "0.85rem 1.4rem 0.35rem", background: "rgba(255, 255, 255, 0.45)" }}>
          <AadhaarTopStripe />
        </div>

        {/* DigiLocker Official Brand Header */}
        <div className="digilocker-header">
          <div className="digilocker-header-brand">
            <div className="digilocker-emblem-badge">
              <IconShieldLocker size={24} className="digilocker-emblem-icon" />
            </div>
            <div>
              <div className="digilocker-service-badge">
                <span className="digilocker-flag-stripe" />
                <span>DIGILOCKER CONSENT GATEWAY</span>
              </div>
              <h2 id="digilocker-title" className="digilocker-title">
                Haqdaar wants to access your DigiLocker documents
              </h2>
            </div>
          </div>

          <button
            type="button"
            className="digilocker-close-btn"
            onClick={onClose}
            aria-label="Close DigiLocker modal"
          >
            <IconCross size={18} />
          </button>
        </div>

        {/* Demo Warning Banner */}
        <div className="digilocker-demo-alert" role="alert">
          <span className="digilocker-alert-tag">DEMO</span>
          <span>This is a simulated DigiLocker flow, not connected to the real DigiLocker service.</span>
        </div>

        <div className="digilocker-body">
          {/* 1. Citizen Selection (for the demo simulation) */}
          <div className="digilocker-section">
            <label className="digilocker-section-label">
              <span>Select Citizen Account to Fetch Documents:</span>
            </label>
            <div className="digilocker-citizen-selector">
              {DEMO_CITIZENS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`digilocker-citizen-pill ${selectedProfileId === c.id ? "selected" : ""}`}
                  onClick={() => setSelectedProfileId(c.id)}
                >
                  <span className="citizen-pill-check">
                    {selectedProfileId === c.id ? "✓" : "○"}
                  </span>
                  <div className="citizen-pill-details">
                    <span className="citizen-pill-name">{c.name}</span>
                    <span className="citizen-pill-meta">{c.role}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Mock Document Consent List */}
          <div className="digilocker-section">
            <label className="digilocker-section-label">
              <span>Requested Documents for Statutory Eligibility:</span>
              <span className="digilocker-consent-status">4 of 4 Verified in Locker</span>
            </label>

            <div className="digilocker-doc-list">
              {CONSENT_DOCUMENTS.map((doc) => (
                <div key={doc.id} className="digilocker-doc-item">
                  <div className="digilocker-doc-checkbox-col">
                    <input
                      type="checkbox"
                      id={`doc-${doc.id}`}
                      checked
                      disabled
                      aria-label={`Consent granted for ${doc.name}`}
                      className="digilocker-checkbox"
                    />
                  </div>
                  <span className="digilocker-doc-emoji" aria-hidden="true">{doc.icon}</span>
                  <div className="digilocker-doc-info">
                    <div className="digilocker-doc-title">
                      <strong>{doc.name}</strong>
                      <span className="digilocker-doc-verified-pill">
                        <IconCheck size={11} /> Verified
                      </span>
                    </div>
                    <div className="digilocker-doc-issuer">{doc.issuer}</div>
                    <div className="digilocker-doc-desc">{doc.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. 6-Digit OTP Form */}
          <form onSubmit={handleVerify} className="digilocker-otp-form" noValidate>
            <div className="digilocker-otp-header">
              <label htmlFor="digilocker-otp-input" className="digilocker-section-label" style={{ marginBottom: 0 }}>
                <span>Enter 6-Digit DigiLocker Consent OTP:</span>
              </label>
              {!otpSent ? (
                <button
                  type="button"
                  className="digilocker-btn-send-otp"
                  onClick={handleSendOtp}
                >
                  Send OTP
                </button>
              ) : (
                <button
                  type="button"
                  className="digilocker-btn-send-otp sent"
                  onClick={handleSendOtp}
                  title="Resend OTP"
                >
                  OTP Sent ✓ (Resend)
                </button>
              )}
            </div>

            <div className="digilocker-otp-input-wrap">
              <input
                id="digilocker-otp-input"
                ref={inputRef}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                placeholder="• • • • • •"
                onChange={handleOtpChange}
                className="digilocker-otp-input"
                autoComplete="one-time-code"
              />
              {!otp && (
                <button
                  type="button"
                  className="digilocker-otp-quickfill"
                  onClick={handleSendOtp}
                >
                  Click "Send OTP" to test
                </button>
              )}
            </div>

            {/* Simulated Demo OTP Hint */}
            <div className="digilocker-otp-hint-row">
              <span className="digilocker-otp-hint">
                Demo OTP: <strong>123456</strong>
              </span>
              {otp !== "123456" && (
                <button
                  type="button"
                  className="digilocker-btn-text"
                  onClick={() => { setOtp("123456"); setOtpSent(true); }}
                >
                  Auto-fill 123456
                </button>
              )}
            </div>

            {otpError && (
              <p className="digilocker-error" role="alert">
                {otpError}
              </p>
            )}

            <div className="digilocker-actions">
              <button
                type="button"
                className="digilocker-btn-cancel"
                onClick={onClose}
                disabled={isVerifying}
              >
                Deny & Cancel
              </button>
              <button
                type="submit"
                className="digilocker-btn-submit"
                disabled={otp.length !== 6 || isVerifying}
              >
                {isVerifying ? (
                  <>
                    <span className="digilocker-spinner" />
                    <span>Fetching Documents…</span>
                  </>
                ) : (
                  <>
                    <IconShieldCheck size={18} />
                    <span>Verify & Continue</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Modal Footer Disclaimer */}
        <div className="digilocker-footer">
          <IconShieldLocker size={14} className="digilocker-footer-icon" />
          <span>In production, this would use DigiLocker's Partner API after UIDAI-approved onboarding.</span>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
}
