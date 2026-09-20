import React from "react";
import { IconCardChip, IconLock, IconShieldLocker } from "./icons";
import { AadhaarTopStripe, AadhaarDotTexture } from "./AadhaarCardHeader";

export default function AadhaarCard({
  t,
  lang,
  cardData,
  onCardDataChange,
  dateOfBirth,
  gender,
  onDobChange,
  onGenderChange,
  onOpenDigiLocker,
}) {
  const handleAadhaarChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 12);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, "$1 ");
    onCardDataChange({ ...cardData, aadhaar: formatted });
  };

  return (
    <div className="id-card-column">
      <div className="my-card-style" aria-label="Cosmetic Identity Card">
        {/* Subtle circular/radial dot-pattern texture in bottom-left */}
        <AadhaarDotTexture />

        {/* Authentic top stripe matching reference */}
        <AadhaarTopStripe />

        <div className="my-card-watermark">{t.watermark}</div>

        <div className="my-card-header">
          <IconCardChip size={36} />
          <div style={{ textAlign: "right" }}>
            <span className="my-card-pill">
              DEMO ID
            </span>
          </div>
        </div>

        <div className="my-card-body">
          <div className="my-card-field">
            <label htmlFor="card-name">{t.nameLabel}</label>
            <input
              id="card-name"
              type="text"
              className="my-card-input"
              value={cardData.name}
              onChange={(e) => onCardDataChange({ ...cardData, name: e.target.value })}
              placeholder="e.g. Murugan Selvam"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            <div className="my-card-field">
              <label htmlFor="card-dob">{t.dobLabel}</label>
              <input
                id="card-dob"
                type="date"
                className="my-card-input"
                value={dateOfBirth}
                onChange={(e) => onDobChange(e.target.value)}
                required
              />
            </div>

            <div className="my-card-field">
              <label htmlFor="card-gender">{t.genderLabel}</label>
              <select
                id="card-gender"
                className="my-card-input"
                value={gender}
                onChange={(e) => onGenderChange(e.target.value)}
              >
                <option value="male">{t.male}</option>
                <option value="female">{t.female}</option>
                <option value="transgender">{t.transgender}</option>
                <option value="other">{t.other}</option>
              </select>
            </div>
          </div>

          <div className="my-card-field">
            <label htmlFor="card-address">{t.addressLabel}</label>
            <input
              id="card-address"
              type="text"
              className="my-card-input"
              value={cardData.address}
              onChange={(e) => onCardDataChange({ ...cardData, address: e.target.value })}
              placeholder="e.g. 12/4 East Street, Madurai"
            />
          </div>

          <div className="my-card-field">
            <label htmlFor="card-aadhaar">{t.aadhaarNumberLabel}</label>
            <input
              id="card-aadhaar"
              type="text"
              className="my-card-input"
              value={cardData.aadhaar}
              onChange={handleAadhaarChange}
              placeholder="1234 5678 9012"
              maxLength={14}
            />
          </div>

          <div className="my-card-number-strip" aria-hidden="true">
            {cardData.aadhaar || "•••• •••• ••••"}
          </div>
        </div>
      </div>

      {onOpenDigiLocker && (
        <div style={{ marginTop: "0.6rem", display: "flex", justifyContent: "center" }}>
          <button
            type="button"
            className="btn-digilocker-inline"
            onClick={onOpenDigiLocker}
            style={{ width: "100%", justifyContent: "center", padding: "0.5rem" }}
            title="Import documents directly from DigiLocker"
          >
            <IconShieldLocker size={15} />
            <span>Auto-fill documents via DigiLocker</span>
          </button>
        </div>
      )}

      <div className="privacy-guarantee-card">
        <IconLock size={18} style={{ color: "var(--ink)", flexShrink: 0, marginTop: "2px" }} />
        <div>
          <strong style={{ color: "var(--ink)", fontWeight: 700 }}>🔒 Privacy Guarantee: </strong>
          <span style={{ color: "var(--ink-2)", fontWeight: 400 }}>{t.aadhaarNote}</span>
        </div>
      </div>
    </div>
  );
}
