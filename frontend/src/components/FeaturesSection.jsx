import React from "react";
import {
  IconIdCard,
  IconScales,
  IconReceipt,
  IconMicrophone,
  IconLocationPin,
  IconGridScan
} from "./icons";

export default function FeaturesSection({ t }) {
  const features = [
    {
      id: "aadhaar",
      icon: <IconIdCard size={22} />,
      title: t.featureAadhaarTitle || "Aadhaar-style Verification",
      description:
        t.featureAadhaarDesc ||
        "Enter your details in a familiar Aadhaar-shaped form — demo data only, never connected to UIDAI."
    },
    {
      id: "policy",
      icon: <IconScales size={22} />,
      title: t.featurePolicyTitle || "Policy-coded Decisions",
      description:
        t.featurePolicyDesc ||
        "No AI guesses. Every yes or no is compiled from real scheme rules into Cedar policy code."
    },
    {
      id: "receipts",
      icon: <IconReceipt size={22} />,
      title: t.featureReceiptsTitle || "Verified Decision Receipts",
      description:
        t.featureReceiptsDesc ||
        "Get the exact clause and reason behind every eligible or not-eligible result."
    },
    {
      id: "voice",
      icon: <IconMicrophone size={22} />,
      title: t.featureVoiceTitle || "Voice Fill",
      description:
        t.featureVoiceDesc ||
        "Speak your details in English or Hindi instead of typing — hands-free form filling."
    },
    {
      id: "location",
      icon: <IconLocationPin size={22} />,
      title: t.featureLocationTitle || "Auto-detect Location",
      description:
        t.featureLocationDesc ||
        "One tap detects your state from GPS, no manual scrolling through a dropdown."
    },
    {
      id: "multischeme",
      icon: <IconGridScan size={22} />,
      title: t.featureMultiSchemeTitle || "Multi-scheme Scan",
      description:
        t.featureMultiSchemeDesc ||
        "Check your eligibility against every onboarded scheme at once, not one at a time."
    }
  ];

  return (
    <section
      id="features-section"
      className="bento-card features-landing-card"
      role="region"
      aria-labelledby="features-heading"
    >
      <div className="features-header">
        <span className="features-pill-tag">CAPABILITIES</span>
        <h3 id="features-heading" className="features-title">
          {t.featuresHeading || "How Haqdaar checks you"}
        </h3>
        {t.featuresSubtitle && (
          <p className="features-subtitle">{t.featuresSubtitle}</p>
        )}
      </div>

      <div className="features-grid">
        {features.map((f) => (
          <div key={f.id} className="feature-item-card">
            <div className="feature-icon-wrapper" aria-hidden="true">
              {f.icon}
            </div>
            <h4 className="feature-card-title">{f.title}</h4>
            <p className="feature-card-desc">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
