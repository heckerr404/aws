import React from "react";

export default function HowItWorks({ t }) {
  return (
    <section className="how-it-works-wrap" id="how-it-works" aria-labelledby="how-it-works-heading">
      <h2 style={{ fontSize: "1.45rem", fontWeight: 600 }} id="how-it-works-heading">
        {t.howItWorksHeading}
      </h2>

      <div className="how-cards-row">
        <div className="how-step-card">
          <div className="step-num-circle">01</div>
          <h3 className="step-title">{t.step1Title}</h3>
          <p className="step-desc">{t.step1Desc}</p>
        </div>

        <div className="how-step-card">
          <div className="step-num-circle">02</div>
          <h3 className="step-title">{t.step2Title}</h3>
          <p className="step-desc">{t.step2Desc}</p>
        </div>

        <div className="how-step-card">
          <div className="step-num-circle">03</div>
          <h3 className="step-title">{t.step3Title}</h3>
          <p className="step-desc">{t.step3Desc}</p>
        </div>

        <div className="how-step-card">
          <div className="step-num-circle">04</div>
          <h3 className="step-title">{t.step4Title}</h3>
          <p className="step-desc">{t.step4Desc}</p>
        </div>
      </div>

      <div style={{
        marginTop: "1.25rem",
        textAlign: "center",
        fontSize: "0.85rem",
        fontWeight: 600,
        color: "var(--ink-2)"
      }}>
        ⚡ {t.howItWorksFooter}
      </div>
    </section>
  );
}
