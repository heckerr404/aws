import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ONBOARDED_SCHEMES } from "../schemesData";
import { IconArrowRight } from "./icons";

export default function SchemesExplorer({ t, lang, onSelectScheme }) {
  const navigate = useNavigate();
  const searchContainerRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Single navigation function for both card clicks and autocomplete selection
  const handleExploreScheme = (schemeId) => {
    if (onSelectScheme) {
      onSelectScheme(schemeId);
    } else {
      navigate(`/?scheme=${schemeId}`);
      setTimeout(() => {
        document.getElementById("profile-form-section")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const handleCheckAll = () => {
    if (onSelectScheme) {
      onSelectScheme(null);
    }
    navigate("/");
    setTimeout(() => {
      document.getElementById("profile-form-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Debounce search input by 150ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm);
      if (searchTerm.trim().length > 0) {
        setIsDropdownOpen(true);
      } else {
        setIsDropdownOpen(false);
      }
      setActiveIndex(-1);
    }, 150);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter schemes across name, ministry, and category
  const searchResults = useMemo(() => {
    const term = debouncedTerm.trim().toLowerCase();
    if (!term) return [];

    return ONBOARDED_SCHEMES.filter((scheme) => {
      const nameEn = (scheme.name?.en || "").toLowerCase();
      const nameHi = (scheme.name?.hi || "").toLowerCase();
      const fullNameEn = (scheme.fullName?.en || "").toLowerCase();
      const ministryEn = (scheme.ministry?.en || "").toLowerCase();
      const ministryHi = (scheme.ministry?.hi || "").toLowerCase();
      const category = (scheme.category || "").toLowerCase();
      const badge = (scheme.badge || scheme.categoryTag || "").toLowerCase();

      return (
        nameEn.includes(term) ||
        nameHi.includes(term) ||
        fullNameEn.includes(term) ||
        ministryEn.includes(term) ||
        ministryHi.includes(term) ||
        category.includes(term) ||
        badge.includes(term)
      );
    });
  }, [debouncedTerm]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isDropdownOpen || searchResults.length === 0) {
      if (e.key === "ArrowDown" && searchTerm.trim().length > 0) {
        setIsDropdownOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < searchResults.length) {
        handleSelectAutocomplete(searchResults[activeIndex].id);
      }
    } else if (e.key === "Escape") {
      setIsDropdownOpen(false);
      setActiveIndex(-1);
    }
  };

  const handleSelectAutocomplete = (schemeId) => {
    handleExploreScheme(schemeId);
    setSearchTerm("");
    setDebouncedTerm("");
    setIsDropdownOpen(false);
    setActiveIndex(-1);
  };

  return (
    <section className="bento-card schemes-explorer-card" role="region" aria-labelledby="schemes-heading">
      {/* Header Banner */}
      <div className="schemes-explorer-header">
        <div className="schemes-explorer-header-left">
          <span className="features-pill-tag">CATALOG</span>
          <h2 id="schemes-heading" className="schemes-explorer-title">
            {t.browseSchemesHeading || "Statutory Schemes Explorer"}
          </h2>
          <p className="schemes-explorer-subtitle">
            {t.browseSchemesSubtitle ||
              "Explore all currently onboarded welfare schemes evaluated via deterministic Cedar policy code."}
          </p>

          {/* Search Bar with Autocomplete */}
          <div className="schemes-search-container" ref={searchContainerRef}>
            <div className="schemes-search-input-wrapper">
              <span className="schemes-search-icon" aria-hidden="true">
                🔍
              </span>
              <input
                type="text"
                className="schemes-search-input"
                placeholder={t.searchSchemesPlaceholder || "Search schemes by name, ministry, or category..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (debouncedTerm.trim().length > 0) setIsDropdownOpen(true);
                }}
                aria-label="Search schemes by name, ministry, or category"
                aria-expanded={isDropdownOpen}
                aria-autocomplete="list"
                aria-controls="schemes-search-dropdown"
              />
              {searchTerm && (
                <button
                  type="button"
                  className="schemes-search-clear-btn"
                  onClick={() => {
                    setSearchTerm("");
                    setDebouncedTerm("");
                    setIsDropdownOpen(false);
                    setActiveIndex(-1);
                  }}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div
                id="schemes-search-dropdown"
                className="schemes-autocomplete-dropdown"
                role="listbox"
              >
                {searchResults.length === 0 ? (
                  <div className="schemes-dropdown-empty" role="option" aria-selected="false">
                    {t.noSchemesFound || "No schemes found — try a different term."}
                  </div>
                ) : (
                  searchResults.map((scheme, idx) => {
                    const sName = scheme.name?.[lang] || scheme.name?.en || scheme.id;
                    const sMinistry = scheme.ministry?.[lang] || scheme.ministry?.en || "";
                    const isSelected = idx === activeIndex;

                    return (
                      <div
                        key={scheme.id}
                        id={`scheme-opt-${scheme.id}`}
                        role="option"
                        aria-selected={isSelected}
                        className={`schemes-dropdown-row ${isSelected ? "active" : ""}`}
                        onClick={() => handleSelectAutocomplete(scheme.id)}
                        onMouseEnter={() => setActiveIndex(idx)}
                      >
                        <span className="schemes-dropdown-icon">{scheme.icon}</span>
                        <div className="schemes-dropdown-text">
                          <strong className="schemes-dropdown-name">{sName}</strong>
                          <span className="schemes-dropdown-ministry">{sMinistry}</span>
                        </div>
                        <span className={`schemes-dropdown-badge ${scheme.citationVerified ? "verified" : "rule-based"}`}>
                          {scheme.citationVerified ? "✓ Citation-verified" : "Rule-based"}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action button in top-right to check all schemes at once */}
        <div className="schemes-explorer-header-right">
          <button
            type="button"
            className="btn-check-all-schemes"
            onClick={handleCheckAll}
          >
            <span>{t.checkAllSchemesBtn || "Check eligibility for all schemes at once →"}</span>
          </button>
        </div>
      </div>

      {/* Grid of 50 Scheme Cards */}
      <div className="schemes-explorer-grid">
        {ONBOARDED_SCHEMES.map((scheme) => {
          const schemeName = scheme.name?.[lang] || scheme.name?.en || scheme.id;
          const ministry = scheme.ministry?.[lang] || scheme.ministry?.en || "";
          const oneLiner = scheme.oneLiner?.[lang] || scheme.oneLiner?.en || "";
          const targetAudience = scheme.targetAudience?.[lang] || scheme.targetAudience?.en || "";

          return (
            <div key={scheme.id} className="scheme-explorer-item">
              <div className="scheme-explorer-top">
                <div className="scheme-icon-badge">
                  <span className="scheme-emoji">{scheme.icon}</span>
                  <span className="scheme-category-pill">{scheme.badge}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <span className={`scheme-tier-badge ${scheme.citationVerified ? "verified" : "rule-based"}`}>
                    {scheme.citationVerified ? "✓ Citation-verified" : "Rule-based"}
                  </span>
                  <div className="scheme-clause-count-chip">
                    {scheme.clausesCount} clauses
                  </div>
                </div>
              </div>

              <div className="scheme-explorer-body">
                <h3 className="scheme-explorer-name">{schemeName}</h3>
                <p className="scheme-explorer-ministry">{ministry}</p>
                <p className="scheme-explorer-desc">{oneLiner}</p>
                <div className="scheme-target-box">
                  <span className="scheme-target-label">Who it&apos;s for:</span>
                  <span className="scheme-target-text">{targetAudience}</span>
                </div>
              </div>

              <div className="scheme-explorer-actions">
                <button
                  type="button"
                  className="btn-explore-eligibility"
                  onClick={() => handleExploreScheme(scheme.id)}
                >
                  <span>{t.exploreEligibilityBtn || "Explore Eligibility →"}</span>
                  <IconArrowRight size={14} />
                </button>
                {scheme.officialUrl && (
                  <a
                    href={scheme.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="scheme-guidelines-link"
                  >
                    Guidelines ↗
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
