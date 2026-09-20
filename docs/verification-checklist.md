# Haqdaar Verification Checklist & Statutory Mapping

This document details the statutory verification status for the 4 core Indian welfare schemes encoded in Haqdaar.

---

## 1. Scheme Statutory Status Matrix

| Scheme ID | Scheme Name | Ministry | Verification Status | Gazette / Guidelines Ref |
|---|---|---|---|---|
| `pm-kisan` | Pradhan Mantri Kisan Samman Nidhi | Ministry of Agriculture & Farmers Welfare | **VERIFIED** (Real Citations) | Operational Guidelines (Revised Feb 2019), Pages 3–6 |
| `pm-vishwakarma` | PM Vishwakarma Scheme | Ministry of Micro, Small & Medium Enterprises | **VERIFIED** (Real Citations) | Scheme Guidelines (Aug 2023), Pages 4–8, §3.1–3.4 |
| `atal-pension-yojana` | Atal Pension Yojana (APY) | Ministry of Finance (PFRDA) | **VERIFIED** (Real Citations) | PFRDA Gazette Notification (Revised Oct 2022), §2–4 |
| `central-sector-scholarship` | Central Sector Scheme of Scholarship for College and University Students | Ministry of Education (Dept of Higher Education) | **VERIFIED** (Real Citations) | National Scholarship Guidelines (2022), Pages 2–5, §3 |

---

## 2. Hand-Verified Clause References

### 1. PM-KISAN (`pm-kisan.rules.json`)
- **PMK-R-01**: Must own cultivable agricultural land (`hasCultivableLand == true`). Ref: Page 3, §2.1.
- **PMK-R-02**: Primary occupation must be farmer (`occupation == "farmer"`). Ref: Page 3, §2.2.
- **PMK-X-01**: Exclusion — Institutional land holders ineligible (`isInstitutionalLandHolder == false`). Ref: Page 5, §3.1(a).
- **PMK-X-02**: Exclusion — Income tax payers ineligible (`isIncomeTaxPayer == false`). Ref: Page 5, §3.1(b).
- **PMK-X-03**: Exclusion — Government / PSU employees ineligible (`isGovtEmployee == false`). Ref: Page 6, §3.1(c).

### 2. PM-Vishwakarma (`pm-vishwakarma.rules.json`)
- **PMV-R-01**: Minimum age 18 years on date of application (`age >= 18`). Ref: Page 4, §3.1.
- **PMV-R-02**: Must be engaged in one of the 18 recognized traditional artisan trades on self-employment basis. Ref: Page 5, §3.2.
- **PMV-R-03**: Must possess an active Aadhaar-seeded bank account (`hasBankAccount == true`). Ref: Page 6, §3.3.
- **PMV-X-01**: Exclusion — Cannot have availed similar credit-based schemes (PMEGP, PM SVANidhi, Mudra) in the last 5 years (`availedCreditSchemeLast5Yrs == false`). Ref: Page 7, §3.4.

### 3. Atal Pension Yojana (`atal-pension-yojana.rules.json`)
- **APY-R-01**: Age between 18 and 40 years inclusive (`age >= 18 && age <= 40`). Ref: Page 2, §2.1.
- **APY-R-02**: Must hold a savings bank account (`hasBankAccount == true`). Ref: Page 3, §2.2.
- **APY-X-01**: Exclusion — Income tax payers ineligible to join APY (gazette amendment effective Oct 1, 2022). Ref: Page 4, §3.1.

### 4. Central Sector Scholarship (`central-sector-scholarship.rules.json`)
- **CSS-R-01**: Must be enrolled in regular recognized higher education degree course (`isEnrolledInHigherEd == true`). Ref: Page 2, §3.1.
- **CSS-R-02**: Board Class 12 percentile ≥ 80th percentile (`class12Percentile >= 80`). Ref: Page 3, §3.2.
- **CSS-R-03**: Gross family income ≤ ₹4,50,000 per annum (`familyIncomeInr <= 450000`). Ref: Page 4, §3.3.
- **CSS-R-04**: Active bank account required for Direct Benefit Transfer (`hasBankAccount == true`). Ref: Page 5, §3.4.

---

## 3. Verification Protocol

1. Every scheme rule file in `rules/` MUST have `verified: true` before production publishing via `scripts/seed_from_rules.py`.
2. Every clause condition in the Cedar policy compiler maps strictly to single-clause forbid statements (`forbid ... unless { condition }` for requirements; `forbid ... when { condition }` for exclusions).
3. If an official policy revision alters income limits, tax exemptions, or age boundaries:
   - Update `rules/<scheme>.rules.json`.
   - Re-run `python scripts/seed_from_rules.py --stack-name haqdaar`.
   - Run `python scripts/smoke_test.py --stack-name haqdaar` to confirm golden profiles reflect the revision.
