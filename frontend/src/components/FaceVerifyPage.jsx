import React, { useState } from "react";
import FaceVerify from "../auth/FaceVerify";
import { useAuth } from "../auth/AuthContext";
import { IconCheck, IconShieldCheck } from "./icons";

export default function FaceVerifyPage({ t, lang }) {
  const { identity } = useAuth();
  const [isRunningModal, setIsRunningModal] = useState(false);

  return (
    <main className="bento-grid face-verify-page" role="main">
      {/* Top Banner / Hero Card */}
      <section className="bento-card face-page-hero-card" style={{ gridColumn: "span 12" }}>
        <div className="face-page-hero-top">
          <div>
            <div className="face-page-pill-badge">
              <span>📷</span>
              <span>ON-DEVICE BIOMETRIC LIVENESS</span>
            </div>
            <h1 className="face-page-title">Face Verification</h1>
            <p className="face-page-subtitle">
              Verify citizen liveness with 100% on-device MediaPipe vision models. No photos, videos, or biometrics are ever uploaded to any cloud server or government agency.
            </p>
          </div>

          <div className="face-page-hero-action">
            <button
              type="button"
              className="login-btn-primary"
              onClick={() => setIsRunningModal(true)}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.4rem", fontSize: "0.95rem" }}
            >
              <span>📷</span>
              <span>{identity?.faceVerified ? "Re-run Face Verification" : "Start Face Verification"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Status Card */}
      <section className="bento-card face-page-status-card" style={{ gridColumn: "span 12" }}>
        <div className="face-status-banner-content">
          <div className="face-status-left">
            <div className={`face-status-icon-bubble ${identity?.faceVerified ? "is-verified" : "is-pending"}`}>
              {identity?.faceVerified ? "✅" : "⏳"}
            </div>
            <div>
              <h3 className="face-status-title">
                {identity?.faceVerified
                  ? "Biometric Identity Status: VERIFIED"
                  : "Biometric Identity Status: PENDING"}
              </h3>
              <p className="face-status-desc">
                {identity?.faceVerified
                  ? `Citizen ${identity?.name || "beneficiary"} has successfully passed 3D facial liveness challenge checks.`
                  : `Citizen ${identity?.name || "beneficiary"} has not completed real-time biometric liveness verification yet.`}
              </p>
            </div>
          </div>

          <div className="face-status-right">
            <span className={`face-status-badge ${identity?.faceVerified ? "badge-verified" : "badge-pending"}`}>
              {identity?.faceVerified ? "Liveness Verified ✓" : "Verification Required"}
            </span>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="bento-card face-page-info-card" style={{ gridColumn: "span 12" }}>
        <h3 className="face-info-heading">How Haqdaar's Face Liveness Works</h3>
        <div className="face-info-grid">
          <div className="face-info-box">
            <span className="face-info-icon">🔒</span>
            <h4 className="face-info-title">Zero-Server Privacy</h4>
            <p className="face-info-text">
              The neural network runs entirely inside your browser's WebAssembly & WebGL memory. Camera frames are analyzed in real-time and immediately discarded.
            </p>
          </div>

          <div className="face-info-box">
            <span className="face-info-icon">🎲</span>
            <h4 className="face-info-title">Cryptographic Challenges</h4>
            <p className="face-info-text">
              Randomized challenges (blinking, head yaw turns, mouth opening) are chosen via cryptographic entropy to defeat printed photos and deepfake replays.
            </p>
          </div>

          <div className="face-info-box">
            <span className="face-info-icon">⚡</span>
            <h4 className="face-info-title">Sub-Second Processing</h4>
            <p className="face-info-text">
              Real-time 468-point 3D facial mesh detection runs at 30+ frames per second on commodity laptops, tablets, and smartphones.
            </p>
          </div>
        </div>
      </section>

      {/* Live Verification Modal */}
      {isRunningModal && (
        <FaceVerify
          lang={lang}
          onPass={() => {
            setIsRunningModal(false);
          }}
          onCancel={() => setIsRunningModal(false)}
          onSkip={() => setIsRunningModal(false)}
        />
      )}
    </main>
  );
}
