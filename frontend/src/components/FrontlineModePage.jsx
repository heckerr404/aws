import React, { useState } from "react";
import { checkEligibility } from "../api";
import { INDIAN_STATES, SOCIAL_CATEGORIES, OCCUPATIONS } from "../demoProfiles";
import { IconCheck, IconCross, IconChevronDown } from "./icons";

const INITIAL_SAMPLE_COHORT = [
  {
    id: "person-1",
    name: "Rameshwar Patel",
    village: "Rampur Kalan, Ward 4",
    status: "pending",
    profile: {
      dateOfBirth: "1984-05-12",
      state: "up",
      gender: "male",
      socialCategory: "obc",
      occupation: "farmer",
      artisanTrade: "none",
      familyIncomeInr: 120000,
      hasCultivableLand: true,
      isInstitutionalLandHolder: false,
      isIncomeTaxPayer: false,
      isGovtEmployee: false,
      hasBankAccount: true,
      isEnrolledInHigherEd: false,
      class12Percentile: 0,
      availedCreditSchemeLast5Yrs: false,
    },
    results: null,
  },
  {
    id: "person-2",
    name: "Meena Devi Prajapati",
    village: "Kumbhar Toli, Ward 7",
    status: "pending",
    profile: {
      dateOfBirth: "1992-11-24",
      state: "up",
      gender: "female",
      socialCategory: "obc",
      occupation: "artisan",
      artisanTrade: "potter",
      familyIncomeInr: 96000,
      hasCultivableLand: false,
      isInstitutionalLandHolder: false,
      isIncomeTaxPayer: false,
      isGovtEmployee: false,
      hasBankAccount: true,
      isEnrolledInHigherEd: false,
      class12Percentile: 0,
      availedCreditSchemeLast5Yrs: false,
    },
    results: null,
  },
  {
    id: "person-3",
    name: "Suraj Valmiki",
    village: "Nagar Basti, Sector 2",
    status: "pending",
    profile: {
      dateOfBirth: "2005-02-14",
      state: "up",
      gender: "male",
      socialCategory: "sc",
      occupation: "student",
      artisanTrade: "none",
      familyIncomeInr: 180000,
      hasCultivableLand: false,
      isInstitutionalLandHolder: false,
      isIncomeTaxPayer: false,
      isGovtEmployee: false,
      hasBankAccount: true,
      isEnrolledInHigherEd: true,
      class12Percentile: 88,
      availedCreditSchemeLast5Yrs: false,
    },
    results: null,
  },
  {
    id: "person-4",
    name: "Kanti Lal Bheel",
    village: "Panchayat Purva",
    status: "pending",
    profile: {
      dateOfBirth: "1962-08-10",
      state: "up",
      gender: "male",
      socialCategory: "st",
      occupation: "daily_wage",
      artisanTrade: "none",
      familyIncomeInr: 72000,
      hasCultivableLand: false,
      isInstitutionalLandHolder: false,
      isIncomeTaxPayer: false,
      isGovtEmployee: false,
      hasBankAccount: true,
      isEnrolledInHigherEd: false,
      class12Percentile: 0,
      availedCreditSchemeLast5Yrs: false,
    },
    results: null,
  },
];

const PRESETS = [
  {
    label: "🌾 Marginal Farmer (PM-KISAN / KCC focus)",
    data: {
      name: "Bhanu Pratap",
      village: "Dhanapur, Block 3",
      profile: {
        dateOfBirth: "1980-06-15",
        state: "up",
        gender: "male",
        socialCategory: "obc",
        occupation: "farmer",
        artisanTrade: "none",
        familyIncomeInr: 140000,
        hasCultivableLand: true,
        isInstitutionalLandHolder: false,
        isIncomeTaxPayer: false,
        isGovtEmployee: false,
        hasBankAccount: true,
        isEnrolledInHigherEd: false,
        class12Percentile: 0,
        availedCreditSchemeLast5Yrs: false,
      },
    },
  },
  {
    label: "🔨 Traditional Artisan / Weaver (Vishwakarma focus)",
    data: {
      name: "Lakshmi Bai",
      village: "Bunkar Mohalla",
      profile: {
        dateOfBirth: "1988-09-20",
        state: "up",
        gender: "female",
        socialCategory: "sc",
        occupation: "artisan",
        artisanTrade: "weaver",
        familyIncomeInr: 90000,
        hasCultivableLand: false,
        isInstitutionalLandHolder: false,
        isIncomeTaxPayer: false,
        isGovtEmployee: false,
        hasBankAccount: true,
        isEnrolledInHigherEd: false,
        class12Percentile: 0,
        availedCreditSchemeLast5Yrs: false,
      },
    },
  },
  {
    label: "🎓 SC College Student (Post-Matric Scholarship focus)",
    data: {
      name: "Amit Kumar Gautam",
      village: "Ambedkar Nagar, Ward 9",
      profile: {
        dateOfBirth: "2004-03-22",
        state: "up",
        gender: "male",
        socialCategory: "sc",
        occupation: "student",
        artisanTrade: "none",
        familyIncomeInr: 160000,
        hasCultivableLand: false,
        isInstitutionalLandHolder: false,
        isIncomeTaxPayer: false,
        isGovtEmployee: false,
        hasBankAccount: true,
        isEnrolledInHigherEd: true,
        class12Percentile: 91,
        availedCreditSchemeLast5Yrs: false,
      },
    },
  },
  {
    label: "👵 Senior Citizen (Old Age Pension / PM-SYM focus)",
    data: {
      name: "Shanti Devi",
      village: "Gram Purwa",
      profile: {
        dateOfBirth: "1960-01-01",
        state: "up",
        gender: "female",
        socialCategory: "general",
        occupation: "unemployed",
        artisanTrade: "none",
        familyIncomeInr: 45000,
        hasCultivableLand: false,
        isInstitutionalLandHolder: false,
        isIncomeTaxPayer: false,
        isGovtEmployee: false,
        hasBankAccount: true,
        isEnrolledInHigherEd: false,
        class12Percentile: 0,
        availedCreditSchemeLast5Yrs: false,
      },
    },
  },
];

function calculateAge(dobStr) {
  if (!dobStr) return 0;
  const [y, m, d] = dobStr.split("-").map(Number);
  const now = new Date("2026-09-19");
  let age = now.getFullYear() - y;
  const mon = now.getMonth() + 1;
  const day = now.getDate();
  if (mon < m || (mon === m && day < d)) age--;
  return Math.max(0, age);
}

export default function FrontlineModePage({ t, lang }) {
  const [sessionLocation, setSessionLocation] = useState("Varanasi District — Block Sevapuri");
  const [workerName, setWorkerName] = useState("Pooja Sharma (VLE / ASHA Facilitator)");
  const [cohort, setCohort] = useState(INITIAL_SAMPLE_COHORT);
  const [isCheckingAll, setIsCheckingAll] = useState(false);
  const [expandedPersonId, setExpandedPersonId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Person Form State
  const [newPersonName, setNewPersonName] = useState("");
  const [newPersonVillage, setNewPersonVillage] = useState("");
  const [newPersonProfile, setNewPersonProfile] = useState({
    dateOfBirth: "1990-01-01",
    state: "up",
    gender: "male",
    socialCategory: "obc",
    occupation: "farmer",
    artisanTrade: "none",
    familyIncomeInr: 120000,
    hasCultivableLand: true,
    isInstitutionalLandHolder: false,
    isIncomeTaxPayer: false,
    isGovtEmployee: false,
    hasBankAccount: true,
    isEnrolledInHigherEd: false,
    class12Percentile: 0,
    availedCreditSchemeLast5Yrs: false,
  });

  // Calculate cohort summary stats
  const totalCount = cohort.length;
  const checkedCount = cohort.filter((p) => p.status === "checked").length;
  const totalEligibleCount = cohort.reduce((sum, p) => {
    if (!p.results) return sum;
    const eligibleSchemes = (p.results.schemes || []).filter((s) => s.decision === "ELIGIBLE");
    return sum + eligibleSchemes.length;
  }, 0);

  // Run eligibility evaluation on a single person
  const checkSinglePerson = async (personId) => {
    const person = cohort.find((p) => p.id === personId);
    if (!person) return;

    try {
      const resp = await checkEligibility(person.profile, lang, null, null);
      setCohort((prev) =>
        prev.map((p) =>
          p.id === personId
            ? { ...p, status: "checked", results: resp }
            : p
        )
      );
    } catch (err) {
      console.error("Evaluation failed for person:", err);
    }
  };

  // Run batch eligibility evaluation on all cohort members in parallel
  const handleCheckAll = async () => {
    if (cohort.length === 0) return;
    setIsCheckingAll(true);

    try {
      const promises = cohort.map(async (p) => {
        const resp = await checkEligibility(p.profile, lang, null, null);
        return {
          ...p,
          status: "checked",
          results: resp,
        };
      });

      const updatedCohort = await Promise.all(promises);
      setCohort(updatedCohort);
      // Auto-expand the first person with eligible results
      const firstEligible = updatedCohort.find((p) =>
        (p.results?.schemes || []).some((s) => s.decision === "ELIGIBLE")
      );
      if (firstEligible) {
        setExpandedPersonId(firstEligible.id);
      }
    } catch (err) {
      console.error("Batch check failed:", err);
    } finally {
      setIsCheckingAll(false);
    }
  };

  // Start fresh session
  const handleStartNewSession = () => {
    if (window.confirm("Start a new frontline session? Current cohort data will be reset.")) {
      setCohort([]);
      setExpandedPersonId(null);
    }
  };

  // Load standard sample cohort
  const handleLoadSampleCohort = () => {
    setCohort(INITIAL_SAMPLE_COHORT);
    setExpandedPersonId(null);
  };

  // Delete a person from the cohort
  const handleDeletePerson = (id) => {
    setCohort((prev) => prev.filter((p) => p.id !== id));
    if (expandedPersonId === id) setExpandedPersonId(null);
  };

  // Add person submit
  const handleAddPersonSubmit = (e) => {
    e.preventDefault();
    if (!newPersonName.trim()) return;

    const newPerson = {
      id: `person-${Date.now()}`,
      name: newPersonName.trim(),
      village: newPersonVillage.trim() || "Local Ward",
      status: "pending",
      profile: { ...newPersonProfile },
      results: null,
    };

    setCohort((prev) => [...prev, newPerson]);
    setIsAddModalOpen(false);
    setNewPersonName("");
    setNewPersonVillage("");
  };

  // Apply preset to form
  const applyPreset = (preset) => {
    setNewPersonName(preset.data.name);
    setNewPersonVillage(preset.data.village);
    setNewPersonProfile(preset.data.profile);
  };

  // Export cohort session as CSV
  const handleExportCSV = () => {
    if (cohort.length === 0) {
      alert("Cohort is currently empty. Add households or load sample cohort first.");
      return;
    }

    const headers = [
      "Session ID",
      "Frontline Worker",
      "Location / Village",
      "Beneficiary Name",
      "Age",
      "Gender",
      "Social Category",
      "Occupation",
      "Annual Income (INR)",
      "Evaluation Status",
      "Eligible Schemes Count",
      "Eligible Scheme Names",
    ];

    const rows = cohort.map((p, idx) => {
      const age = calculateAge(p.profile.dateOfBirth);
      const eligibleList = (p.results?.schemes || [])
        .filter((s) => s.decision === "ELIGIBLE")
        .map((s) => s.name?.[lang] || s.name?.en || s.schemeId)
        .join("; ");

      return [
        `FLW-${idx + 101}`,
        `"${workerName}"`,
        `"${p.village}"`,
        `"${p.name}"`,
        age,
        p.profile.gender,
        p.profile.socialCategory.toUpperCase(),
        p.profile.occupation,
        p.profile.familyIncomeInr,
        p.status,
        p.results ? (p.results.schemes || []).filter((s) => s.decision === "ELIGIBLE").length : 0,
        `"${eligibleList || "None / Not Evaluated"}"`,
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `haqdaar_frontline_cohort_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="bento-grid frontline-page" role="main">
      {/* Top Banner / Hero */}
      <section className="bento-card frontline-hero-card">
        <div className="frontline-hero-top">
          <div>
            <div className="frontline-pill-tag">
              <span>👥</span>
              <span>FRONTLINE WORKER & SHG COHORT MODE</span>
            </div>
            <h1 className="frontline-title">Frontline Worker Mode</h1>
            <p className="frontline-subtitle">
              Check eligibility for multiple households in one session. Empower ASHA workers, VLEs, and Gram Panchayat volunteers to scan entire communities at scale.
            </p>
          </div>

          <div className="frontline-top-actions">
            <button
              type="button"
              className="login-btn-ghost"
              onClick={handleStartNewSession}
              title="Reset current session"
            >
              🔄 Start New Session
            </button>
            <button
              type="button"
              className="login-btn-ghost"
              onClick={handleLoadSampleCohort}
              title="Load 4 realistic sample rural households"
            >
              📂 Load Demo Cohort
            </button>
            <button
              type="button"
              className="login-btn-primary"
              onClick={handleExportCSV}
              title="Export all cohort eligibility results as CSV"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
            >
              <span>📊</span>
              <span>Export as CSV</span>
            </button>
          </div>
        </div>

        {/* Worker Session Metadata Bar */}
        <div className="frontline-meta-ribbon">
          <div className="frontline-meta-item">
            <span className="frontline-meta-label">📍 Camp / Village:</span>
            <input
              type="text"
              className="frontline-meta-input"
              value={sessionLocation}
              onChange={(e) => setSessionLocation(e.target.value)}
              placeholder="e.g. Rampur Kalan Gram Panchayat"
            />
          </div>
          <div className="frontline-meta-item">
            <span className="frontline-meta-label">🧑‍💼 Frontline Worker:</span>
            <input
              type="text"
              className="frontline-meta-input"
              value={workerName}
              onChange={(e) => setWorkerName(e.target.value)}
              placeholder="e.g. Sunita Devi (ASHA / CSC)"
            />
          </div>
          <div className="frontline-demo-notice">
            <span>ℹ️ Session data is temporary for this demo.</span>
          </div>
        </div>
      </section>

      {/* Summary Stats Banner */}
      <section className="bento-card frontline-summary-card">
        <div className="fl-stat-box">
          <span className="fl-stat-num">{totalCount}</span>
          <span className="fl-stat-label">People in Cohort</span>
        </div>
        <div className="fl-stat-divider" />
        <div className="fl-stat-box">
          <span className="fl-stat-num" style={{ color: checkedCount === totalCount && totalCount > 0 ? "var(--india-green)" : "var(--saffron)" }}>
            {checkedCount} / {totalCount}
          </span>
          <span className="fl-stat-label">Evaluated</span>
        </div>
        <div className="fl-stat-divider" />
        <div className="fl-stat-box">
          <span className="fl-stat-num" style={{ color: "var(--india-green)" }}>
            {totalEligibleCount}
          </span>
          <span className="fl-stat-label">Total Scheme Entitlements Discovered</span>
        </div>
        <div className="fl-stat-divider" />
        <div className="fl-action-col">
          <button
            type="button"
            className="fl-btn-check-all"
            disabled={isCheckingAll || totalCount === 0}
            onClick={handleCheckAll}
          >
            {isCheckingAll ? (
              <>
                <span className="spinner" />
                <span>Checking All 50 Schemes in Parallel...</span>
              </>
            ) : (
              <>
                <span>⚡</span>
                <span>Check All ({totalCount} People)</span>
              </>
            )}
          </button>
          <button
            type="button"
            className="fl-btn-add-person"
            onClick={() => setIsAddModalOpen(true)}
          >
            <span>➕</span>
            <span>Add Person</span>
          </button>
        </div>
      </section>

      {/* Cohort Table */}
      <section className="bento-card frontline-table-card">
        <div className="fl-table-header-row">
          <div>
            <h2 className="fl-table-title">👥 Household Cohort Roster</h2>
            <p className="fl-table-subtitle">
              Click any row to expand statutory eligibility details and entitlement breakdown.
            </p>
          </div>
        </div>

        {cohort.length === 0 ? (
          <div className="fl-empty-state">
            <span className="fl-empty-icon">📭</span>
            <h3>No people in this session yet</h3>
            <p>Add a person manually or load the pre-populated demo cohort to begin batch checking.</p>
            <div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <button
                type="button"
                className="login-btn-primary"
                onClick={() => setIsAddModalOpen(true)}
              >
                ➕ Add First Person
              </button>
              <button
                type="button"
                className="login-btn-ghost"
                onClick={handleLoadSampleCohort}
              >
                📂 Load Demo Cohort
              </button>
            </div>
          </div>
        ) : (
          <div className="fl-table-wrapper">
            <table className="fl-table" role="table">
              <thead>
                <tr>
                  <th>Beneficiary Name</th>
                  <th>Village / Ward</th>
                  <th>Demographics</th>
                  <th>Occupation</th>
                  <th>Income</th>
                  <th>Status</th>
                  <th>Eligible Schemes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cohort.map((p) => {
                  const age = calculateAge(p.profile.dateOfBirth);
                  const isExpanded = expandedPersonId === p.id;
                  const eligibleSchemes = (p.results?.schemes || []).filter(
                    (s) => s.decision === "ELIGIBLE"
                  );
                  const notEligibleSchemes = (p.results?.schemes || []).filter(
                    (s) => s.decision === "NOT_ELIGIBLE"
                  );

                  return (
                    <React.Fragment key={p.id}>
                      <tr
                        className={`fl-row ${p.status === "checked" ? "row-checked" : ""} ${
                          isExpanded ? "row-expanded" : ""
                        }`}
                        onClick={() => setExpandedPersonId(isExpanded ? null : p.id)}
                        style={{ cursor: "pointer" }}
                      >
                        <td>
                          <div className="fl-person-name-cell">
                            <span className="fl-avatar-dot">
                              {p.name.slice(0, 1)}
                            </span>
                            <div>
                              <strong className="fl-person-name">{p.name}</strong>
                              <span className="fl-person-subid">{p.id}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="fl-village-tag">{p.village}</span>
                        </td>
                        <td>
                          <div className="fl-demo-chips">
                            <span className="fl-chip">{age} yrs</span>
                            <span className="fl-chip">{p.profile.gender}</span>
                            <span className="fl-chip fl-chip-cat">{p.profile.socialCategory.toUpperCase()}</span>
                          </div>
                        </td>
                        <td>
                          <span className="fl-occ-text">
                            {p.profile.occupation === "farmer"
                              ? "🌾 Farmer"
                              : p.profile.occupation === "artisan"
                              ? `🔨 Artisan (${p.profile.artisanTrade})`
                              : p.profile.occupation === "student"
                              ? "🎓 Student"
                              : p.profile.occupation === "daily_wage"
                              ? "👷 Daily Wage"
                              : p.profile.occupation}
                          </span>
                        </td>
                        <td>
                          <span className="fl-income-text">
                            ₹{p.profile.familyIncomeInr.toLocaleString("en-IN")}/yr
                          </span>
                        </td>
                        <td>
                          {p.status === "checked" ? (
                            <span className="fl-status-badge status-done">
                              ✅ Evaluated
                            </span>
                          ) : (
                            <span className="fl-status-badge status-pending">
                              ⏳ Pending
                            </span>
                          )}
                        </td>
                        <td>
                          {p.status === "checked" ? (
                            <span className="fl-eligible-count-badge">
                              🎉 {eligibleSchemes.length} Eligible
                            </span>
                          ) : (
                            <span className="fl-untested-badge">—</span>
                          )}
                        </td>
                        <td>
                          <div className="fl-row-actions" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              className="fl-action-icon-btn"
                              title="Evaluate this person individually"
                              onClick={() => checkSinglePerson(p.id)}
                            >
                              ⚡
                            </button>
                            <button
                              type="button"
                              className="fl-action-icon-btn"
                              title="Delete person"
                              onClick={() => handleDeletePerson(p.id)}
                            >
                              🗑️
                            </button>
                            <button
                              type="button"
                              className="fl-action-icon-btn"
                              title={isExpanded ? "Collapse" : "Expand results"}
                              onClick={() => setExpandedPersonId(isExpanded ? null : p.id)}
                            >
                              <IconChevronDown
                                size={14}
                                style={{
                                  transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                                  transition: "transform 0.2s ease",
                                }}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Results Drawer */}
                      {isExpanded && (
                        <tr className="fl-expanded-row">
                          <td colSpan={8}>
                            <div className="fl-results-drawer">
                              <div className="fl-drawer-top">
                                <div>
                                  <h4 className="fl-drawer-title">
                                    Scheme Entitlements for {p.name}
                                  </h4>
                                  <p className="fl-drawer-subtitle">
                                    Verified against all 50 statutory schemes in Cedar Policy Engine.
                                  </p>
                                </div>
                                <div className="fl-drawer-counts">
                                  <span className="fl-drawer-pill eligible">
                                    ✅ {eligibleSchemes.length} Eligible
                                  </span>
                                  <span className="fl-drawer-pill not-eligible">
                                    ❌ {notEligibleSchemes.length} Not Eligible
                                  </span>
                                </div>
                              </div>

                              {p.status !== "checked" ? (
                                <div className="fl-drawer-empty">
                                  <span>⏳ Eligibility check not run yet.</span>
                                  <button
                                    type="button"
                                    className="login-btn-primary"
                                    style={{ marginTop: "0.5rem" }}
                                    onClick={() => checkSinglePerson(p.id)}
                                  >
                                    ⚡ Run Eligibility Check Now
                                  </button>
                                </div>
                              ) : (
                                <div className="fl-drawer-schemes-grid">
                                  {eligibleSchemes.map((sch) => (
                                    <div key={sch.schemeId} className="fl-scheme-card-item eligible">
                                      <div className="fl-scheme-item-top">
                                        <div>
                                          <h5 className="fl-scheme-name">
                                            {sch.name?.[lang] || sch.name?.en || sch.schemeId}
                                          </h5>
                                          <span className="fl-scheme-ministry">{sch.ministry}</span>
                                        </div>
                                        <span className="fl-pill-eligible">ELIGIBLE</span>
                                      </div>

                                      <div className="fl-scheme-benefit-box">
                                        <strong>Benefit: </strong>
                                        <span>{sch.explanation?.[lang] || sch.explanation?.en || "Direct statutory benefit"}</span>
                                      </div>

                                      <div className="fl-clause-summary">
                                        <span className="fl-clause-summary-title">Passed Criteria:</span>
                                        <ul className="fl-clause-list">
                                          {(sch.clauses || []).slice(0, 3).map((cl) => (
                                            <li key={cl.clauseId}>
                                              ✅ {cl.description?.[lang] || cl.description?.en || cl.clauseId}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  ))}

                                  {eligibleSchemes.length === 0 && (
                                    <div className="fl-no-eligible-notice">
                                      <span>⚠️ Does not qualify for tested statutory schemes based on current criteria.</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Add Person Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content fl-add-person-modal">
            <div className="modal-header">
              <div>
                <span className="modal-badge">NEW HOUSEHOLD REGISTRATION</span>
                <h2 className="modal-title">Add Person to Session</h2>
                <p className="modal-subtitle">
                  Capture demographic criteria to test across all 50 statutory schemes.
                </p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsAddModalOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* Quick Presets */}
            <div className="fl-preset-bar">
              <span className="fl-preset-label">⚡ 1-Click Fast Presets:</span>
              <div className="fl-preset-buttons">
                {PRESETS.map((pr, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="fl-preset-btn"
                    onClick={() => applyPreset(pr)}
                  >
                    {pr.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAddPersonSubmit} className="fl-add-form">
              <div className="fl-form-grid">
                <div className="fl-field">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    required
                    className="my-card-input"
                    value={newPersonName}
                    onChange={(e) => setNewPersonName(e.target.value)}
                    placeholder="e.g. Geeta Devi"
                  />
                </div>

                <div className="fl-field">
                  <label>Village / Hamlet / Ward</label>
                  <input
                    type="text"
                    className="my-card-input"
                    value={newPersonVillage}
                    onChange={(e) => setNewPersonVillage(e.target.value)}
                    placeholder="e.g. Ward 3, Rampur"
                  />
                </div>

                <div className="fl-field">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    required
                    className="my-card-input"
                    value={newPersonProfile.dateOfBirth}
                    onChange={(e) =>
                      setNewPersonProfile({ ...newPersonProfile, dateOfBirth: e.target.value })
                    }
                  />
                </div>

                <div className="fl-field">
                  <label>Gender</label>
                  <select
                    className="my-card-input"
                    value={newPersonProfile.gender}
                    onChange={(e) =>
                      setNewPersonProfile({ ...newPersonProfile, gender: e.target.value })
                    }
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="transgender">Transgender</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="fl-field">
                  <label>State</label>
                  <select
                    className="my-card-input"
                    value={newPersonProfile.state}
                    onChange={(e) =>
                      setNewPersonProfile({ ...newPersonProfile, state: e.target.value })
                    }
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="fl-field">
                  <label>Social Category</label>
                  <select
                    className="my-card-input"
                    value={newPersonProfile.socialCategory}
                    onChange={(e) =>
                      setNewPersonProfile({ ...newPersonProfile, socialCategory: e.target.value })
                    }
                  >
                    {SOCIAL_CATEGORIES.map((sc) => (
                      <option key={sc.code} value={sc.code}>
                        {sc.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="fl-field">
                  <label>Occupation</label>
                  <select
                    className="my-card-input"
                    value={newPersonProfile.occupation}
                    onChange={(e) =>
                      setNewPersonProfile({ ...newPersonProfile, occupation: e.target.value })
                    }
                  >
                    {OCCUPATIONS.map((occ) => (
                      <option key={occ.code} value={occ.code}>
                        {occ.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="fl-field">
                  <label>Annual Family Income (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    className="my-card-input"
                    value={newPersonProfile.familyIncomeInr}
                    onChange={(e) =>
                      setNewPersonProfile({
                        ...newPersonProfile,
                        familyIncomeInr: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="fl-checkbox-grid">
                <label className="fl-check-item">
                  <input
                    type="checkbox"
                    checked={newPersonProfile.hasCultivableLand}
                    onChange={(e) =>
                      setNewPersonProfile({
                        ...newPersonProfile,
                        hasCultivableLand: e.target.checked,
                      })
                    }
                  />
                  <span>Owns Cultivable Land</span>
                </label>

                <label className="fl-check-item">
                  <input
                    type="checkbox"
                    checked={newPersonProfile.hasBankAccount}
                    onChange={(e) =>
                      setNewPersonProfile({
                        ...newPersonProfile,
                        hasBankAccount: e.target.checked,
                      })
                    }
                  />
                  <span>Active Bank Account</span>
                </label>

                <label className="fl-check-item">
                  <input
                    type="checkbox"
                    checked={newPersonProfile.isIncomeTaxPayer}
                    onChange={(e) =>
                      setNewPersonProfile({
                        ...newPersonProfile,
                        isIncomeTaxPayer: e.target.checked,
                      })
                    }
                  />
                  <span>Income Tax Payer</span>
                </label>

                <label className="fl-check-item">
                  <input
                    type="checkbox"
                    checked={newPersonProfile.isGovtEmployee}
                    onChange={(e) =>
                      setNewPersonProfile({
                        ...newPersonProfile,
                        isGovtEmployee: e.target.checked,
                      })
                    }
                  />
                  <span>Govt / PSU Employee</span>
                </label>

                <label className="fl-check-item">
                  <input
                    type="checkbox"
                    checked={newPersonProfile.isEnrolledInHigherEd}
                    onChange={(e) =>
                      setNewPersonProfile({
                        ...newPersonProfile,
                        isEnrolledInHigherEd: e.target.checked,
                      })
                    }
                  />
                  <span>Enrolled in Higher Education</span>
                </label>
              </div>

              <div className="modal-footer" style={{ marginTop: "1.2rem" }}>
                <button type="submit" className="login-btn-primary">
                  ➕ Add Person to Cohort
                </button>
                <button
                  type="button"
                  className="login-btn-ghost"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
