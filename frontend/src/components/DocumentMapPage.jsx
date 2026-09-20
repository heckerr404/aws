import React, { useState, useMemo } from "react";
import { SCHEME_DOCUMENT_DEPENDENCIES, DOCUMENT_METADATA } from "../data/documentDependencies";
import { ONBOARDED_SCHEMES } from "../schemesData";
import { IconCheck, IconSearch } from "./icons";

export default function DocumentMapPage({ t, lang }) {
  const schemeKeys = Object.keys(SCHEME_DOCUMENT_DEPENDENCIES);
  const [selectedSchemeId, setSelectedSchemeId] = useState(schemeKeys[0] || "pm-kisan");
  const [searchQuery, setSearchQuery] = useState("");
  const [checkedDocs, setCheckedDocs] = useState({});
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Available schemes in the dropdown
  const schemeOptions = useMemo(() => {
    return ONBOARDED_SCHEMES.filter((s) => SCHEME_DOCUMENT_DEPENDENCIES[s.id]).map((s) => ({
      id: s.id,
      name: s.name?.[lang] || s.name?.en || s.fullName?.en || s.id,
      category: s.category,
      icon: s.icon || "📄",
    }));
  }, [lang]);

  const currentSchemeData = SCHEME_DOCUMENT_DEPENDENCIES[selectedSchemeId] || SCHEME_DOCUMENT_DEPENDENCIES["pm-kisan"];

  // Compute full dependency graph for the active scheme
  const graph = useMemo(() => {
    if (!currentSchemeData) return { allDocs: [], rootDocs: [], tiers: [], edges: [] };

    const deps = currentSchemeData.dependencies || {};
    const required = currentSchemeData.required || [];

    // Collect all documents
    const allDocsSet = new Set(required);
    Object.keys(deps).forEach((k) => {
      allDocsSet.add(k);
      (deps[k] || []).forEach((d) => allDocsSet.add(d));
    });

    const allDocs = Array.from(allDocsSet);

    // Identify root documents (docs that have no prerequisites)
    const rootDocs = allDocs.filter((doc) => !deps[doc] || deps[doc].length === 0);

    // Calculate tiers: Tier 0 = Direct Required, Tier 1 = Prerequisites of Direct, Tier 2 = Prerequisites of Tier 1, etc.
    const tiers = [];
    let currentTier = [...required];
    const visited = new Set(currentTier);
    tiers.push({ level: 1, title: "Tier 1: Final Scheme Application Documents", docs: currentTier });

    let depth = 2;
    while (currentTier.length > 0 && depth < 5) {
      const nextTierSet = new Set();
      currentTier.forEach((doc) => {
        const docDeps = deps[doc] || [];
        docDeps.forEach((prereq) => {
          if (!visited.has(prereq)) {
            nextTierSet.add(prereq);
            visited.add(prereq);
          }
        });
      });

      if (nextTierSet.size === 0) break;
      const nextTierDocs = Array.from(nextTierSet);
      tiers.push({
        level: depth,
        title: `Tier ${depth}: Prerequisite Documents & Supporting Proofs`,
        docs: nextTierDocs,
      });
      currentTier = nextTierDocs;
      depth++;
    }

    return { allDocs, rootDocs, tiers, deps };
  }, [currentSchemeData]);

  const toggleDocCheck = (docName) => {
    setCheckedDocs((prev) => ({
      ...prev,
      [docName]: !prev[docName],
    }));
  };

  const totalDocsCount = graph.allDocs.length;
  const collectedCount = graph.allDocs.filter((d) => checkedDocs[d]).length;
  const progressPercent = totalDocsCount > 0 ? Math.round((collectedCount / totalDocsCount) * 100) : 0;

  // Generate step-by-step checklist
  const checklistSteps = useMemo(() => {
    const steps = [];
    // Step 1: Root documents
    if (graph.rootDocs.length > 0) {
      steps.push({
        stepNumber: 1,
        title: "Obtain Foundational / Root Documents First",
        subtitle: "These have zero prerequisites and form the basis for all further applications.",
        docs: graph.rootDocs,
      });
    }

    // Intermediate tiers
    const intermediate = graph.allDocs.filter(
      (d) => !graph.rootDocs.includes(d) && !currentSchemeData.required.includes(d)
    );
    if (intermediate.length > 0) {
      steps.push({
        stepNumber: 2,
        title: "Apply for Intermediate Certificates & Revenue Attestations",
        subtitle: "Use your root documents to get these official departmental certifications.",
        docs: intermediate,
      });
    }

    // Final application
    steps.push({
      stepNumber: steps.length + 1,
      title: "Submit Final Scheme Application Dossier",
      subtitle: "Attach these validated documents to complete your statutory scheme enrollment.",
      docs: currentSchemeData.required,
    });

    return steps;
  }, [graph, currentSchemeData]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="bento-grid document-map-page" role="main">
      {/* Top Banner / Hero Header */}
      <section className="bento-card doc-map-hero-card">
        <div className="doc-map-hero-top">
          <div>
            <div className="doc-map-pill-badge">
              <span>🗺️</span>
              <span>PREREQUISITE DEPENDENCY GRAPH</span>
            </div>
            <h1 className="doc-map-title">Document Dependency Map</h1>
            <p className="doc-map-subtitle">
              See every document you'll need — and what each one requires first. Never get turned away at a government counter again.
            </p>
          </div>

          <div className="doc-map-actions">
            <button
              type="button"
              className="login-btn-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1.1rem" }}
              onClick={() => setIsPrintModalOpen(true)}
              title="Open structured printable checklist"
            >
              <span>🖨️</span>
              <span>Print / Save as Checklist</span>
            </button>
          </div>
        </div>

        {/* Scheme Selector Bar */}
        <div className="doc-scheme-selector-bar">
          <label htmlFor="scheme-doc-select" className="doc-selector-label">
            <strong>Select Scheme to Map:</strong>
          </label>
          <div className="doc-select-wrapper">
            <select
              id="scheme-doc-select"
              className="doc-scheme-select"
              value={selectedSchemeId}
              onChange={(e) => setSelectedSchemeId(e.target.value)}
            >
              {schemeOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.icon} {opt.name} ({opt.category})
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Progress & Quick Stats Ribbon */}
      <section className="bento-card doc-stats-ribbon">
        <div className="doc-stat-col">
          <span className="doc-stat-number">{totalDocsCount}</span>
          <span className="doc-stat-label">Total Documents in Chain</span>
        </div>
        <div className="doc-stat-divider" />
        <div className="doc-stat-col">
          <span className="doc-stat-number" style={{ color: "var(--india-green)" }}>
            {graph.rootDocs.length}
          </span>
          <span className="doc-stat-label">"Start Here" Root Documents</span>
        </div>
        <div className="doc-stat-divider" />
        <div className="doc-stat-col">
          <span className="doc-stat-number" style={{ color: "var(--saffron)" }}>
            {collectedCount} / {totalDocsCount}
          </span>
          <span className="doc-stat-label">Marked as Collected ({progressPercent}%)</span>
        </div>
        <div className="doc-stat-divider" />
        <div className="doc-stat-progress-bar-container">
          <div className="doc-stat-progress-track">
            <div
              className="doc-stat-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="doc-stat-progress-caption">
            {progressPercent === 100
              ? "🎉 Ready for submission!"
              : `${totalDocsCount - collectedCount} documents remaining`}
          </span>
        </div>
      </section>

      {/* Notice Tag if unverified */}
      {currentSchemeData.unverified && (
        <div className="doc-unverified-banner">
          <span>⚠️</span>
          <span>
            <strong>Regional variation note:</strong> Some document rules for this scheme vary by state. Marked as <em>unverified — confirm locally with your Tehsil / Block office</em>.
          </span>
        </div>
      )}

      {/* Visual Tree / Flow Hierarchy */}
      <section className="bento-card doc-tree-section">
        <div className="doc-tree-header">
          <div>
            <h2 className="doc-tree-title">
              📋 Document Dependency Flow for {currentSchemeData.schemeName}
            </h2>
            <p className="doc-tree-subtitle">
              Follow from bottom (Start Here) to top (Final Application Submission).
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="doc-map-legend">
          <div className="legend-item">
            <span className="legend-chip legend-root">🌱 Start Here</span>
            <span>Root document (0 prerequisites needed)</span>
          </div>
          <div className="legend-item">
            <span className="legend-chip legend-required">🎯 Directly Required</span>
            <span>Final scheme submission document</span>
          </div>
          <div className="legend-item">
            <span className="legend-chip legend-inter">📑 Prerequisite Chain</span>
            <span>Intermediate certificate</span>
          </div>
        </div>

        {/* Tiers View */}
        <div className="doc-tiers-container">
          {graph.tiers.map((tier, tIdx) => (
            <div key={tier.level} className="doc-tier-block">
              <div className="doc-tier-badge-row">
                <span className={`doc-tier-badge tier-${tier.level}`}>
                  {tier.title}
                </span>
                {tIdx > 0 && <div className="doc-connector-arrow">▲ Depends on items below ▲</div>}
              </div>

              <div className="doc-cards-grid">
                {tier.docs.map((docName) => {
                  const meta = DOCUMENT_METADATA[docName] || {
                    authority: "Concerned Government Department",
                    category: "Statutory Proof",
                    icon: "📄",
                    estimatedDays: "5-10 days",
                    isRoot: false,
                  };
                  const isRoot = graph.rootDocs.includes(docName);
                  const isDirectRequired = currentSchemeData.required.includes(docName);
                  const isChecked = Boolean(checkedDocs[docName]);
                  const prerequisites = graph.deps[docName] || [];

                  return (
                    <div
                      key={docName}
                      className={`doc-node-card ${isRoot ? "is-root-node" : ""} ${
                        isDirectRequired ? "is-required-node" : ""
                      } ${isChecked ? "is-collected" : ""}`}
                    >
                      <div className="doc-node-top">
                        <div className="doc-node-icon-title">
                          <span className="doc-node-icon">{meta.icon}</span>
                          <div>
                            <h3 className="doc-node-name">{docName}</h3>
                            <span className="doc-node-category">{meta.category}</span>
                          </div>
                        </div>

                        <label className="doc-checkbox-label" title="Mark if you already have this document">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleDocCheck(docName)}
                            className="doc-checkbox-input"
                          />
                          <span className="doc-checkbox-custom">
                            {isChecked && <IconCheck size={12} />}
                          </span>
                          <span className="doc-checkbox-text">
                            {isChecked ? "Have it" : "Need it"}
                          </span>
                        </label>
                      </div>

                      <div className="doc-node-body">
                        <div className="doc-node-detail-row">
                          <span className="doc-detail-label">🏛️ Issuing Office:</span>
                          <span className="doc-detail-val">{meta.authority}</span>
                        </div>
                        <div className="doc-node-detail-row">
                          <span className="doc-detail-label">⏱️ Typical Timeline:</span>
                          <span className="doc-detail-val">{meta.estimatedDays}</span>
                        </div>

                        {prerequisites.length > 0 && (
                          <div className="doc-prereq-box">
                            <span className="doc-prereq-title">Requires first:</span>
                            <ul className="doc-prereq-list">
                              {prerequisites.map((p) => (
                                <li key={p} className={checkedDocs[p] ? "prereq-ready" : "prereq-pending"}>
                                  {checkedDocs[p] ? "✅ " : "⏳ "} {p}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="doc-node-footer">
                        {isRoot ? (
                          <span className="doc-tag-root">🌱 Start Here (No prerequisites)</span>
                        ) : isDirectRequired ? (
                          <span className="doc-tag-required">🎯 Directly Required</span>
                        ) : (
                          <span className="doc-tag-intermediate">🔗 Supporting Prerequisite</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Printable / Checklist Modal */}
      {isPrintModalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content doc-checklist-modal printable-content">
            <div className="modal-header">
              <div>
                <span className="modal-badge">ORDERED CITIZEN CHECKLIST</span>
                <h2 className="modal-title">{currentSchemeData.schemeName}</h2>
                <p className="modal-subtitle">
                  Step-by-step action plan to assemble all required documentation.
                </p>
              </div>
              <button
                type="button"
                className="modal-close-btn no-print"
                onClick={() => setIsPrintModalOpen(false)}
                aria-label="Close checklist"
              >
                ✕
              </button>
            </div>

            <div className="doc-checklist-body">
              {checklistSteps.map((step) => (
                <div key={step.stepNumber} className="checklist-step-card">
                  <div className="checklist-step-header">
                    <span className="checklist-step-circle">{step.stepNumber}</span>
                    <div>
                      <h4 className="checklist-step-title">{step.title}</h4>
                      <p className="checklist-step-desc">{step.subtitle}</p>
                    </div>
                  </div>

                  <div className="checklist-doc-items">
                    {step.docs.map((doc) => {
                      const meta = DOCUMENT_METADATA[doc] || {};
                      const isChecked = Boolean(checkedDocs[doc]);
                      return (
                        <div key={doc} className={`checklist-item-row ${isChecked ? "item-checked" : ""}`}>
                          <div className="checklist-item-left">
                            <span className="checklist-item-icon">{meta.icon || "📄"}</span>
                            <div>
                              <strong className="checklist-item-name">{doc}</strong>
                              <span className="checklist-item-meta">
                                🏛️ {meta.authority} · ⏱️ {meta.estimatedDays}
                              </span>
                            </div>
                          </div>
                          <span className="checklist-status-badge">
                            {isChecked ? "✅ Collected" : "⏳ Pending"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {currentSchemeData.notes && (
                <div className="checklist-notes-box">
                  <strong>📌 Crucial Submission Tip:</strong> {currentSchemeData.notes}
                </div>
              )}
            </div>

            <div className="modal-footer no-print">
              <button
                type="button"
                className="login-btn-primary"
                onClick={handlePrint}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
              >
                <span>🖨️</span>
                <span>Print Checklist (Ctrl+P)</span>
              </button>
              <button
                type="button"
                className="login-btn-ghost"
                onClick={() => setIsPrintModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
