import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { lookupAadhaar, verifyOtp, normaliseAadhaar } from "./demoRegistry";
import { useAuth } from "./AuthContext";
import FaceVerify from "./FaceVerify";
import DigiLockerModal from "../components/DigiLockerModal";
import { IconShieldLocker } from "../components/icons";
import { AadhaarTopStripe, AadhaarDotTexture } from "../components/AadhaarCardHeader";

/* Tiny helper: format input as XXXX XXXX XXXX */
function formatAadhaar(raw) {
  const digits = raw.replace(/\D/g, "").slice(0, 12);
  const parts = [];
  for (let i = 0; i < digits.length; i += 4) parts.push(digits.slice(i, i + 4));
  return parts.join(" ");
}

/* Fake OTP dispatch — just logs to console */
function dispatchFakeOtp(name, otp) {
  console.info(`[DEMO OTP] ${name}: ${otp}`);
}

const STEP = { AADHAAR: "aadhaar", OTP: "otp", FACE: "face" };

export default function LoginPage({ onLoginComplete }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(STEP.AADHAAR);
  const [aadhaar, setAadhaar] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [entry, setEntry] = useState(null);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showFaceVerify, setShowFaceVerify] = useState(false);
  const [showDigiLocker, setShowDigiLocker] = useState(false);
  const otpRefs = useRef([]);

  /* ---------- Step 1: Submit Aadhaar ---------- */
  const handleAadhaarSubmit = (e) => {
    e.preventDefault();
    setError("");
    const found = lookupAadhaar(aadhaar);
    if (!found) {
      setError("Aadhaar not found in demo registry. Try 9999 1111 0001.");
      return;
    }
    setEntry(found);
    setSending(true);
    setTimeout(() => {
      dispatchFakeOtp(found.name, found.otp);
      setSending(false);
      setStep(STEP.OTP);
    }, 800);
  };

  /* ---------- OTP box helpers ---------- */
  const handleOtpChange = (idx, val) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    if (digit && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
  };

  /* ---------- Step 2: Verify OTP ---------- */
  const handleOtpSubmit = (e) => {
    e.preventDefault();
    setError("");
    const code = otp.join("");
    if (code.length < 6) { setError("Enter all 6 digits."); return; }
    setVerifying(true);
    setTimeout(() => {
      if (verifyOtp(aadhaar, code)) {
        setVerifying(false);
        setStep(STEP.FACE);
      } else {
        setVerifying(false);
        setError("OTP mismatch. Check the demo hint.");
        setOtp(["", "", "", "", "", ""]);
        otpRefs.current[0]?.focus();
      }
    }, 600);
  };

  /* ---------- Step 3: Finish (face is optional skip) ---------- */
  const finishLogin = (faceVerified = false) => {
    const canonical = normaliseAadhaar(aadhaar);
    login({
      aadhaarNumber: canonical,
      name: entry.name,
      dob: entry.dob,
      gender: entry.gender,
      faceVerified,
    });
    if (onLoginComplete) {
      onLoginComplete();
    } else {
      navigate("/schemes");
    }
  };

  /* ---------- DigiLocker Mock Flow ---------- */
  const handleDigiLockerSuccess = (profileKey) => {
    setShowDigiLocker(false);
    const registryMap = {
      murugan: "9999 1111 0001",
      divya: "9999 2222 0002",
      rafiq: "9999 3333 0003",
    };
    const aadhaarNum = registryMap[profileKey] || "9999 1111 0001";
    const found = lookupAadhaar(aadhaarNum) || {
      name: "Murugan Selvam",
      dob: "1972-06-14",
      gender: "Male",
    };
    login({
      aadhaarNumber: aadhaarNum,
      name: found.name,
      dob: found.dob,
      gender: found.gender,
      faceVerified: true,
      source: "digilocker",
    });
    if (onLoginComplete) {
      onLoginComplete(profileKey);
    } else {
      navigate("/");
    }
  };

  /* ---------- Render ---------- */
  return (
    <div className="login-shell">
      {/* Decorative blobs */}
      <div className="login-blob login-blob-1" aria-hidden="true" />
      <div className="login-blob login-blob-2" aria-hidden="true" />

      <div className="login-card">
        {/* Subtle circular/radial dot-pattern texture in bottom-left */}
        <AadhaarDotTexture />

        {/* Authentic top stripe matching reference with triangle taper & navy scales logo */}
        <AadhaarTopStripe />

        {/* Header */}
        <div className="login-header">
          <h1 className="login-brand">Haqdaar</h1>
          <p className="login-tagline">Your rights, verified.</p>
          <span className="demo-badge">DEMO — Not UIDAI</span>
        </div>

        {/* Progress dots */}
        <div className="login-steps" aria-label="Steps">
          {[STEP.AADHAAR, STEP.OTP, STEP.FACE].map((s, i) => (
            <div
              key={s}
              className={`login-step-dot ${step === s ? "active" : ""} ${
                (step === STEP.OTP && i === 0) || (step === STEP.FACE && i <= 1) ? "done" : ""
              }`}
            />
          ))}
        </div>

        {/* ── Step 1: Aadhaar entry ── */}
        {step === STEP.AADHAAR && (
          <form onSubmit={handleAadhaarSubmit} className="login-form" noValidate>
            <div className="login-field">
              <label className="login-label" htmlFor="aadhaar-input">
                Aadhaar Number
              </label>
              <input
                id="aadhaar-input"
                className="login-input"
                type="text"
                inputMode="numeric"
                placeholder="9999 1111 0001"
                value={aadhaar}
                maxLength={14}
                onChange={(e) => setAadhaar(formatAadhaar(e.target.value))}
                autoComplete="off"
                autoFocus
              />
              <p className="login-hint">
                Demo numbers: <code>9999 1111 0001</code> · <code>9999 2222 0002</code> · <code>9999 3333 0003</code>
              </p>
            </div>

            {error && <p className="login-error" role="alert">{error}</p>}

            <button
              type="submit"
              className="login-btn-primary"
              disabled={sending || aadhaar.replace(/\D/g, "").length < 12}
            >
              {sending ? "Sending OTP…" : "Send OTP →"}
            </button>

            <div className="login-divider">
              <span>or authenticate via</span>
            </div>

            <button
              type="button"
              className="btn-digilocker"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => setShowDigiLocker(true)}
            >
              <IconShieldLocker size={18} />
              <span>Login with DigiLocker</span>
            </button>
            <p className="login-hint" style={{ textAlign: "center", marginTop: "0.45rem", fontSize: "0.72rem" }}>
              In production, this would use DigiLocker's Partner API after UIDAI-approved onboarding.
            </p>
          </form>
        )}

        {/* ── Step 2: OTP ── */}
        {step === STEP.OTP && entry && (
          <form onSubmit={handleOtpSubmit} className="login-form" noValidate>
            <p className="login-info">
              OTP sent to <strong>{entry.name}</strong>'s registered mobile. Check console for demo OTP.
            </p>
            <div className="otp-row" onPaste={handleOtpPaste}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (otpRefs.current[idx] = el)}
                  className="otp-box"
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  aria-label={`OTP digit ${idx + 1}`}
                  autoFocus={idx === 0}
                />
              ))}
            </div>
            <p className="login-hint otp-demo-hint">
              Demo hint — {entry.name.split(" ")[0]}'s OTP: <code>{entry.otp}</code>
            </p>

            {error && <p className="login-error" role="alert">{error}</p>}

            <button
              type="submit"
              className="login-btn-primary"
              disabled={verifying || otp.join("").length < 6}
            >
              {verifying ? "Verifying…" : "Verify OTP →"}
            </button>
            <button
              type="button"
              className="login-btn-ghost"
              onClick={() => { setStep(STEP.AADHAAR); setError(""); setOtp(["","","","","",""]); }}
            >
              ← Back
            </button>
          </form>
        )}

        {/* ── Step 3: Face verification gate ── */}
        {step === STEP.FACE && (
          <div className="login-form face-gate">
            <p className="login-info">
              <strong>{entry?.name}</strong> verified. Proceed to face liveness check for extra security, or skip.
            </p>
            <button
              type="button"
              className="login-btn-primary"
              onClick={() => finishLogin(false)}
              style={{ marginBottom: "0.5rem" }}
            >
              Continue to App (skip face check)
            </button>
            <button
              type="button"
              className="login-btn-face"
              onClick={(e) => {
                e.preventDefault();
                setShowFaceVerify(true);
              }}
            >
              📷 Run Face Liveness Check
            </button>
            <p className="login-hint" style={{ marginTop: "0.75rem" }}>
              Face check uses your camera on-device. No video is uploaded.
            </p>
          </div>
        )}
      </div>

      {showFaceVerify && (
        <FaceVerify
          onPass={() => {
            setShowFaceVerify(false);
            finishLogin(true);
          }}
          onCancel={() => setShowFaceVerify(false)}
          onSkip={() => {
            setShowFaceVerify(false);
            finishLogin(false);
          }}
        />
      )}

      <DigiLockerModal
        isOpen={showDigiLocker}
        onClose={() => setShowDigiLocker(false)}
        onVerifySuccess={handleDigiLockerSuccess}
      />
    </div>
  );
}
