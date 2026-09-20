# Haqdaar Demo Runbook & Pitch Guide

> *"Everyone else built a chatbot that guesses. We built the only one that proves it, with a receipt."*

---

## 1. The 3-Minute Pitch Script (Timed)

| Time | Beat | Content |
|---|---|---|
| **0:00 – 0:20** | **Hook** | A farmer in Tamil Nadu misses PM-KISAN because a local agent told him he didn't qualify. Whoever tells an Indian citizen "yes" or "no" today is guessing — whether it's an agent or a generative AI chatbot. |
| **0:20 – 0:45** | **Insight** | Chatbots hallucinate eligibility criteria. A wrong "yes" wastes a full day's wages traveling to a government office; a wrong "no" denies life-changing statutory entitlements. We do not guess. We prove. |
| **0:45 – 1:30** | **Live Demo 1: Golden Profiles** | Click **Divya (student)**. Show she is **ELIGIBLE** for Central Sector Scholarship and APY. Point to the statutory clause rows with exact gazette page numbers (§2.1, Page 4). Click **Murugan (farmer)**: Show why he is **NOT ELIGIBLE** for the scholarship with the exact determining clauses. |
| **1:30 – 2:15** | **Live Demo 2: "Try to Break It"** | **Invite a judge or mentor to pick any edge case.** Use the live Break-It panel: change family income from ₹4,60,000 to ₹4,50,000. It flips live in 400ms to ELIGIBLE with the badge *"Verified by re-running the policy"*. Change age to 41 for Atal Pension Yojana: immediately flips to NOT ELIGIBLE under statutory age bounds. |
| **2:15 – 2:45** | **Architecture & Provability** | Walk through the 4-step pipeline: Gazette PDF → Rules DSL → Cedar policy in Amazon Verified Permissions. Emphasize: *"AI extracts rules once, offline. At decision time, zero AI is involved in deciding eligibility."* Show the cryptographic SHA-256 receipt ID: deterministic and auditable. |
| **2:45 – 3:00** | **Closing & Next Horizon** | *"Everyone else built a chatbot that guesses. We built the only one that proves it, with a receipt."* Next step: Integrate DigiLocker for verified consent-driven citizen inputs, and expand scheme coverage using our automated ingestion pipeline. |

---

## 2. Pre-Demo Checklist (30 Minutes Before Demo)

- [ ] Run `make smoke` against the deployed stack to ensure all 9 golden profile cases pass.
- [ ] Ensure `--allow-unverified` was NOT used for the demo seed (all four rule files verified with real page numbers and verbatim citations).
- [ ] Amplify hosting URL loads smoothly on mobile data and venue Wi-Fi.
- [ ] `AllowedOrigin` in API Gateway HTTP API is restricted to the Amplify domain.
- [ ] Amazon Bedrock model access confirmed in region (`anthropic.claude-3-5-haiku-20241022-v1:0` or active inference profile); explanation shows `generatedBy: "bedrock"` (or template fallback).
- [ ] Browser zoom set to 125%, system dark mode off, browser notifications silenced, language default EN.
- [ ] Second laptop or mobile device with the site open as a ready backup.
- [ ] Screenshots of each golden profile result saved in `docs/fallback/`.

---

## 3. Failure Playbook

| Symptom | Likely Cause | Fast Fix |
|---|---|---|
| **Results never load** | API URL incorrect or CORS block | Verify `VITE_API_BASE_URL` in `frontend/.env`, redeploy SAM stack with matching `AllowedOrigin`. |
| **502 `POLICY_ENGINE_UNAVAILABLE`** | AVP throttling or incorrect policy store ID | Verify `PolicyStoreId` parameter in SAM stack; retry request once; fall back to saved screenshots. |
| **All schemes return `ERROR`** | Schema and policy mismatch after schema modification | Run `python scripts/bootstrap_avp.py` followed by `python scripts/seed_from_rules.py --stack-name haqdaar`. |
| **`NO_SCHEMES_PUBLISHED`** | DynamoDB catalog table has not been seeded | Run `make seed`. |
| **Explanation is template text** | Bedrock model access not granted or invoke timeout | Normal and non-fatal for demo. State: *"The plain-language summary is optional AI; the eligibility decision is from formal Cedar code."* |
| **Unexpected decision** | Rule condition mis-transcribed | Edit `rules/<scheme>.rules.json`, re-run `make seed`, and re-run `make smoke`. Highlight this: *"This is the exact purpose of provable receipts — the clause is transparent and fixable."* |

---

## 4. Anticipated Judge Questions & Crisp Answers

### Q1: Why not just use an LLM for eligibility?
> **Answer:** Large Language Models are probabilistic and non-deterministic. They hallucinate income thresholds, miscalculate age edge cases, and provide no audit trail. Haqdaar uses Bedrock strictly offline to draft rules and for post-decision plain-language summaries under strict guardrails. The decision itself is 100% formal code.

### Q2: Why Cedar and Amazon Verified Permissions?
> **Answer:** AVP with Cedar was built for microsecond, deterministic policy evaluation. It provides determining policy IDs directly in the evaluation response, allowing us to pinpoint the exact failing statutory clause. We repurposed AWS's enterprise authorization engine into a citizen rights verification engine.

### Q3: How do you guarantee the rules are accurate?
> **Answer:** Every rule clause carries the statutory gazette page number, paragraph reference, and verbatim statutory quote. In our pipeline, publishing to production is gated on human sign-off (`verified: true`). Golden test suites continuously assert expected decisions.

### Q4: How is citizen privacy protected?
> **Answer:** Haqdaar has no user database, no cookies, no localStorage, and no request-body logging. Date of birth is converted to age and discarded in memory; names, addresses, and Aadhaar numbers stay strictly within the browser DOM. The receipt is a SHA-256 hash of policy version + derived inputs.

### Q5: Can this scale to thousands of government schemes?
> **Answer:** Yes. The ingestion pipeline (Amazon Textract OCR → Bedrock rule drafting → human review → Cedar compiler) operates per scheme. Human review is an intentional regulatory gate, not a bottleneck. Once compiled, AVP evaluates 30 schemes concurrently in milliseconds.

---

## 5. Honest Scope Statement

> **"Haqdaar currently covers four schemes with hand-verified rules. The same pipeline extends to more schemes; human verification is a deliberate gate, not a limitation to hide."**
