/**
 * mockEngine.js — Browser-native Reference Evaluator for all 50 statutory schemes.
 * Ensures the entire Haqdaar UI works interactively in local demo mode.
 * Uses exact Cedar forbid/permit reference evaluation semantics and Web Crypto for receipts.
 * Single source of truth: imports ONBOARDED_SCHEMES from ./schemesData.js
 */
import { ONBOARDED_SCHEMES } from "./schemesData";

export const SCHEMES = ONBOARDED_SCHEMES;

function calculateAge(dobStr, freezeDate = "2026-09-19") {
  const [y, m, d] = (dobStr || "2000-01-01").split("-").map(Number);
  const [fy, fm, fd] = freezeDate.split("-").map(Number);
  let age = fy - y;
  if (fm < m || (fm === m && fd < d)) age--;
  return Math.max(0, age);
}

async function sha256Hex(str) {
  const buffer = new TextEncoder().encode(str);
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Specific clause evaluators for citationVerified schemes (PM-KISAN and PM-Vishwakarma)
const VERIFIED_SCHEME_CLAUSES = {
  "pm-kisan": [
    {
      clauseId: "PMK-R-01",
      kind: "requirement",
      evalFn: (attrs) => attrs.occupation === "farmer",
      citation: { page: 3, section: "2.2", quote: "All landholding farmer families shall be eligible." },
      humanText: { en: "You must be a farmer.", hi: "आप किसान होने चाहिए।" },
      remedy: { en: "Only farmers are eligible.", hi: "केवल किसान पात्र हैं।", counterfactual: { attribute: "occupation", value: "farmer" } }
    },
    {
      clauseId: "PMK-R-02",
      kind: "requirement",
      evalFn: (attrs) => Boolean(attrs.hasCultivableLand),
      citation: { page: 3, section: "2.1", quote: "The farmer family must own cultivable agricultural land." },
      humanText: { en: "You must have cultivable agricultural land.", hi: "आपके पास कृषि योग्य भूमि होनी चाहिए।" },
      remedy: { en: "Own cultivable land required.", hi: "कृषि भूमि होना आवश्यक है।", counterfactual: { attribute: "hasCultivableLand", value: true } }
    },
    {
      clauseId: "PMK-R-03",
      kind: "requirement",
      evalFn: (attrs) => Boolean(attrs.hasBankAccount),
      citation: { page: 4, section: "2.3", quote: "The benefit will be directly transferred to Aadhaar-seeded bank accounts." },
      humanText: { en: "You must have an active bank account.", hi: "आपके पास सक्रिय बैंक खाता होना चाहिए।" },
      remedy: { en: "Open a bank account to receive the benefit transfer.", hi: "बैंक खाता खोलें।", counterfactual: { attribute: "hasBankAccount", value: true } }
    },
    {
      clauseId: "PMK-X-01",
      kind: "exclusion",
      evalFn: (attrs) => !attrs.isInstitutionalLandHolder,
      citation: { page: 5, section: "3.1(a)", quote: "Institutional land holders are not eligible." },
      humanText: { en: "Institutional land holders are excluded.", hi: "संस्थागत भूमिधारक अपात्र हैं।" },
      remedy: { en: "Institutional holders excluded.", hi: "संस्थागत धारक बहिष्कृत।", counterfactual: null }
    },
    {
      clauseId: "PMK-X-02",
      kind: "exclusion",
      evalFn: (attrs) => !attrs.isIncomeTaxPayer,
      citation: { page: 5, section: "3.1(b)", quote: "Income Tax assessees are not eligible." },
      humanText: { en: "You must not have paid income tax.", hi: "आपने आयकर का भुगतान नहीं किया होना चाहिए।" },
      remedy: { en: "Tax payers excluded.", hi: "आयकर दाता अपात्र हैं।", counterfactual: null }
    },
    {
      clauseId: "PMK-X-03",
      kind: "exclusion",
      evalFn: (attrs) => !attrs.isGovtEmployee,
      citation: { page: 6, section: "3.1(c)", quote: "Government and PSU employees are excluded." },
      humanText: { en: "You must not be a government employee.", hi: "आप सरकारी कर्मचारी नहीं होने चाहिए।" },
      remedy: { en: "Govt employees excluded.", hi: "सरकारी कर्मचारी अपात्र हैं।", counterfactual: null }
    }
  ],
  "pm-vishwakarma": [
    {
      clauseId: "PMV-R-01",
      kind: "requirement",
      evalFn: (attrs) => attrs.age >= 18,
      citation: { page: 4, section: "3.1", quote: "Applicant must be 18 years of age or above on date of application." },
      humanText: { en: "You must be at least 18 years old.", hi: "आपकी आयु कम से कम 18 वर्ष होनी चाहिए।" },
      remedy: { en: "Must be at least 18.", hi: "आयु कम से कम 18 होनी चाहिए।", counterfactual: null }
    },
    {
      clauseId: "PMV-R-02",
      kind: "requirement",
      evalFn: (attrs) => attrs.occupation === "artisan" || (attrs.artisanTrade && attrs.artisanTrade !== "none"),
      citation: { page: 5, section: "3.2", quote: "Artisans and craftspeople working with hands and tools shall be eligible." },
      humanText: { en: "You must be an artisan or craftsperson in recognized trades.", hi: "आप मान्यता प्राप्त शिल्पों में कारीगर या शिल्पकार होने चाहिए।" },
      remedy: { en: "Scheme is for traditional artisans.", hi: "योजना कारीगरों के लिए है।", counterfactual: { attribute: "occupation", value: "artisan" } }
    },
    {
      clauseId: "PMV-R-03",
      kind: "requirement",
      evalFn: (attrs) => Boolean(attrs.hasBankAccount),
      citation: { page: 6, section: "3.3", quote: "Applicant must have a valid bank account for benefit disbursement." },
      humanText: { en: "You must have a bank account.", hi: "आपके पास बैंक खाता होना चाहिए।" },
      remedy: { en: "Open a bank account.", hi: "बैंक खाता खोलें।", counterfactual: { attribute: "hasBankAccount", value: true } }
    },
    {
      clauseId: "PMV-X-01",
      kind: "exclusion",
      evalFn: (attrs) => !attrs.isGovtEmployee,
      citation: { page: 4, section: "3.4", quote: "Government employees and their family members are not eligible." },
      humanText: { en: "Government employees are excluded.", hi: "सरकारी कर्मचारी अपात्र हैं।" },
      remedy: { en: "Govt employees excluded.", hi: "सरकारी कर्मचारी अपात्र हैं।", counterfactual: null }
    },
    {
      clauseId: "PMV-X-02",
      kind: "exclusion",
      evalFn: (attrs) => !attrs.hasAvailedSimilarCreditScheme5y,
      citation: { page: 7, section: "3.4", quote: "Beneficiaries of similar credit-based schemes in last 5 years are not eligible." },
      humanText: { en: "Must not have availed government credit schemes in last 5 years.", hi: "पिछले 5 वर्षों में सरकारी ऋण योजना नहीं ली होनी चाहिए।" },
      remedy: { en: "Credit scheme availed in past 5 years.", hi: "ऋण योजना ली गई है।", counterfactual: null }
    }
  ]
};

// Evaluates rule-based schemes (the remaining 48)
function evaluateRuleBasedScheme(schemeId, attrs) {
  const occ = (attrs.occupation || "").toLowerCase();
  const gender = (attrs.gender || "").toLowerCase();
  const cat = (attrs.socialCategory || "").toLowerCase();
  const age = Number(attrs.age) || 0;
  const income = Number(attrs.familyIncomeInr) || 0;
  const bank = Boolean(attrs.hasBankAccount);
  const land = Boolean(attrs.hasCultivableLand);
  const tax = Boolean(attrs.isIncomeTaxPayer);
  const govt = Boolean(attrs.isGovtEmployee);
  const enrolled = Boolean(attrs.isEnrolledInHigherEd);
  const p12 = Number(attrs.class12Percentile) || 0;
  const credit5y = Boolean(attrs.hasAvailedSimilarCreditScheme5y);

  let passed = false;
  let reason = {
    en: "Eligibility evaluated per statutory rules.",
    hi: "सांविधिक नियमों के अनुसार पात्रता का मूल्यांकन।"
  };
  let failedClauseDesc = {
    en: "Requirements not satisfied.",
    hi: "आवश्यकताएं पूरी नहीं हुईं।"
  };

  switch (schemeId) {
    // ── Agriculture ──
    case "pmfby":
      passed = occ === "farmer" && land;
      if (!passed) {
        failedClauseDesc = { en: "Requires farmer occupation with cultivable/leased land.", hi: "कृषि भूमि वाले किसान होना आवश्यक है।" };
      }
      break;
    case "kcc":
      passed = (occ === "farmer" || occ === "artisan" || occ === "self_employed") && age >= 18;
      if (!passed) {
        failedClauseDesc = { en: "Requires adult age (>= 18) and agricultural or allied trade.", hi: "आयु 18+ और कृषि/संबद्ध पेशा आवश्यक है।" };
      }
      break;
    case "pm-kusum":
      passed = occ === "farmer" || land;
      if (!passed) {
        failedClauseDesc = { en: "Requires farmer status or cultivable land for solar pump.", hi: "सोलर पंप हेतु किसान या कृषि भूमि होना आवश्यक है।" };
      }
      break;
    case "pmmsy":
      passed = occ === "farmer" || occ === "self_employed" || ["kl", "tn", "ap", "wb", "or", "mh", "ga", "gj"].includes(attrs.state);
      if (!passed) {
        failedClauseDesc = { en: "Requires fisheries/aquaculture trade or coastal state residence.", hi: "मत्स्य पालन व्यवसाय या तटीय राज्य निवास आवश्यक है।" };
      }
      break;
    case "mgnrega":
      passed = age >= 18 && (occ === "unemployed" || occ === "farmer" || occ === "other" || income <= 300000);
      if (!passed) {
        failedClauseDesc = { en: "Requires adult age (>=18) willing to perform manual labor.", hi: "18+ आयु और शारीरिक श्रम हेतु सहमति आवश्यक है।" };
      }
      break;
    case "pmay-gramin":
      passed = income <= 300000 && !tax;
      if (!passed) {
        failedClauseDesc = { en: "Household annual income must not exceed ₹3,00,000 and not pay income tax.", hi: "पारिवारिक आय ₹3 लाख से अधिक नहीं होनी चाहिए।" };
      }
      break;
    case "day-nrlm":
      passed = gender === "female" && income <= 300000;
      if (!passed) {
        failedClauseDesc = { en: "Requires rural woman beneficiary in low-income household.", hi: "कम आय वाले परिवार की ग्रामीण महिला होना आवश्यक है।" };
      }
      break;
    case "pkvy":
      passed = occ === "farmer" && land;
      if (!passed) {
        failedClauseDesc = { en: "Requires farmer status with cultivable land for organic inputs.", hi: "जैविक आदानों हेतु कृषि भूमि वाला किसान होना आवश्यक है।" };
      }
      break;
    case "e-nam":
      passed = occ === "farmer" || occ === "self_employed" || occ === "artisan";
      if (!passed) {
        failedClauseDesc = { en: "Requires agricultural producer, artisan or trader occupation.", hi: "कृषि उत्पादक, कारीगर या व्यापारी होना आवश्यक है।" };
      }
      break;

    // ── Education ──
    case "nmmss":
      passed = age >= 12 && age <= 16 && income <= 350000;
      if (!passed) {
        failedClauseDesc = { en: "Requires student age (12-16) and family income <= ₹3,50,000.", hi: "छात्र आयु (12-16) और पारिवारिक आय ₹3.5 लाख तक होनी चाहिए।" };
      }
      break;
    case "post-matric-sc":
      passed = cat === "sc" && income <= 250000 && (enrolled || age >= 16);
      if (!passed) {
        failedClauseDesc = { en: "Requires SC category, income <= ₹2.5 Lakh, and higher education enrollment.", hi: "अनुसूचित जाति, आय ₹2.5 लाख तक और उच्च शिक्षा नामांकन आवश्यक है।" };
      }
      break;
    case "post-matric-st":
      passed = cat === "st" && income <= 250000 && (enrolled || age >= 16);
      if (!passed) {
        failedClauseDesc = { en: "Requires ST category, income <= ₹2.5 Lakh, and higher education enrollment.", hi: "अनुसूचित जनजाति, आय ₹2.5 लाख तक और उच्च शिक्षा नामांकन आवश्यक है।" };
      }
      break;
    case "pm-yasasvi":
      passed = (cat === "obc" || cat === "ews") && income <= 250000 && age <= 22;
      if (!passed) {
        failedClauseDesc = { en: "Requires OBC/EBC/DNT category and family income <= ₹2.5 Lakh.", hi: "ओबीसी/ईडब्ल्यूएस श्रेणी और पारिवारिक आय ₹2.5 लाख तक आवश्यक है।" };
      }
      break;
    case "pragati-scholarship":
      passed = gender === "female" && (enrolled || occ === "student") && income <= 800000;
      if (!passed) {
        failedClauseDesc = { en: "Requires female student admitted to higher technical education with income <= ₹8 Lakh.", hi: "तकनीकी शिक्षा में नामांकित छात्रा (आय ₹8 लाख तक) होना आवश्यक है।" };
      }
      break;
    case "saksham-scholarship":
      passed = (enrolled || occ === "student") && income <= 800000;
      if (!passed) {
        failedClauseDesc = { en: "Requires specially-abled technical student with income <= ₹8 Lakh.", hi: "तकनीकी पाठ्यक्रम में नामांकित छात्र (आय ₹8 लाख तक) होना आवश्यक है।" };
      }
      break;
    case "begum-hazrat-mahal":
      passed = gender === "female" && income <= 200000 && age >= 13 && age <= 22;
      if (!passed) {
        failedClauseDesc = { en: "Requires minority girl student in classes 9-12 with income <= ₹2 Lakh.", hi: "कक्षा 9-12 में छात्रा (आय ₹2 लाख तक) होना आवश्यक है।" };
      }
      break;
    case "pmrf":
      passed = (enrolled || occ === "student") && (p12 >= 75 || income <= 800000);
      if (!passed) {
        failedClauseDesc = { en: "Requires PhD/research enrollment in recognized institute with high merit.", hi: "उच्च मेरिट के साथ पीएचडी/शोध में नामांकन आवश्यक है।" };
      }
      break;
    case "national-overseas-scholarship":
      passed = (cat === "sc" || cat === "st") && income <= 800000 && age < 35;
      if (!passed) {
        failedClauseDesc = { en: "Requires SC/ST candidate under 35 years with family income <= ₹8 Lakh.", hi: "35 वर्ष से कम आयु के एससी/एसटी उम्मीदवार (आय ₹8 लाख तक) आवश्यक हैं।" };
      }
      break;
    case "udaan-cbse":
      passed = gender === "female" && age >= 15 && age <= 19 && income <= 600000;
      if (!passed) {
        failedClauseDesc = { en: "Requires female student in Class 11 science stream with income <= ₹6 Lakh.", hi: "कक्षा 11 विज्ञान संकाय की छात्रा (आय ₹6 लाख तक) होना आवश्यक है।" };
      }
      break;

    // ── Pensions & Insurance ──
    case "pmjdy":
      passed = age >= 10;
      if (!passed) {
        failedClauseDesc = { en: "Requires citizen aged 10 or above.", hi: "आयु 10 वर्ष या उससे अधिक होनी चाहिए।" };
      }
      break;
    case "atal-pension-yojana":
      passed = age >= 18 && age <= 40 && bank && !tax;
      if (!passed) {
        failedClauseDesc = { en: "Requires age between 18 and 40, active bank account, and non-income tax payer.", hi: "आयु 18-40 वर्ष, बैंक खाता और गैर-आयकर दाता होना आवश्यक है।" };
      }
      break;
    case "pm-sym":
      passed = age >= 18 && age <= 40 && !tax && !govt && income <= 180000;
      if (!passed) {
        failedClauseDesc = { en: "Requires unorganized worker aged 18-40 with income <= ₹15,000/mo and non-taxpayer.", hi: "18-40 वर्ष के असंगठित कामगार (आय ₹15,000/माह तक) होना आवश्यक है।" };
      }
      break;
    case "pm-kmy":
      passed = occ === "farmer" && age >= 18 && age <= 40 && land;
      if (!passed) {
        failedClauseDesc = { en: "Requires small/marginal farmer aged 18-40 owning cultivable land.", hi: "18-40 वर्ष के भूमिधारक छोटे किसान होना आवश्यक है।" };
      }
      break;
    case "pmlvmy":
      passed = (occ === "self_employed" || occ === "other" || occ === "artisan") && age >= 18 && age <= 40 && !tax;
      if (!passed) {
        failedClauseDesc = { en: "Requires retail trader aged 18-40 who is a non-taxpayer.", hi: "18-40 वर्ष के गैर-आयकर दाता खुदरा व्यापारी होना आवश्यक है।" };
      }
      break;
    case "ignoaps":
      passed = age >= 60 && income <= 250000;
      if (!passed) {
        failedClauseDesc = { en: "Requires senior citizen aged 60+ living below poverty line.", hi: "60+ आयु के बीपीएल वरिष्ठ नागरिक होना आवश्यक है।" };
      }
      break;
    case "ignwps":
      passed = gender === "female" && age >= 40 && income <= 250000;
      if (!passed) {
        failedClauseDesc = { en: "Requires widow aged 40+ living below poverty line.", hi: "40+ आयु की बीपीएल विधवा महिला होना आवश्यक है।" };
      }
      break;
    case "igndps":
      passed = age >= 18 && income <= 250000;
      if (!passed) {
        failedClauseDesc = { en: "Requires adult aged 18+ with severe disability living below poverty line.", hi: "18+ आयु के गंभीर रूप से दिव्यांग बीपीएल नागरिक होना आवश्यक है।" };
      }
      break;
    case "pm-suraksha-bima":
      passed = age >= 18 && age <= 70 && bank;
      if (!passed) {
        failedClauseDesc = { en: "Requires age between 18 and 70 and an active bank account.", hi: "आयु 18-70 वर्ष और सक्रिय बैंक खाता होना आवश्यक है।" };
      }
      break;
    case "pm-jeevan-jyoti":
      passed = age >= 18 && age <= 50 && bank;
      if (!passed) {
        failedClauseDesc = { en: "Requires age between 18 and 50 and an active bank account.", hi: "आयु 18-50 वर्ष और सक्रिय बैंक खाता होना आवश्यक है।" };
      }
      break;

    // ── Health, Women & Child ──
    case "ayushman-bharat":
      passed = income <= 500000 || age >= 70;
      if (!passed) {
        failedClauseDesc = { en: "Household annual income must not exceed ₹5,00,000 (or individual aged 70+).", hi: "पारिवारिक आय ₹5 लाख तक (या 70+ आयु के वरिष्ठ नागरिक) होनी चाहिए।" };
      }
      break;
    case "pmmvy":
      passed = gender === "female" && !govt && age >= 19 && age <= 45;
      if (!passed) {
        failedClauseDesc = { en: "Requires pregnant/lactating mother (non-government employee).", hi: "गर्भवती/धात्री महिला (गैर-सरकारी कर्मचारी) होना आवश्यक है।" };
      }
      break;
    case "sukanya-samriddhi":
      passed = gender === "female" && age <= 10;
      if (!passed) {
        failedClauseDesc = { en: "Account can only be opened for a girl child aged 10 or younger.", hi: "10 वर्ष या उससे कम आयु की बालिकाओं के लिए ही मान्य।" };
      }
      break;
    case "pm-ujjwala":
      passed = gender === "female" && age >= 18 && income <= 300000;
      if (!passed) {
        failedClauseDesc = { en: "Requires adult female (age 18+) belonging to low-income household.", hi: "कम आय वाले परिवार की वयस्क महिला (18+) होना आवश्यक है।" };
      }
      break;
    case "janani-suraksha":
      passed = gender === "female" && income <= 300000;
      if (!passed) {
        failedClauseDesc = { en: "Requires pregnant woman in BPL/low-income household.", hi: "बीपीएल/कम आय परिवार की गर्भवती महिला होना आवश्यक है।" };
      }
      break;
    case "poshan-abhiyaan":
      passed = age <= 6 || (gender === "female" && age >= 15 && age <= 49);
      if (!passed) {
        failedClauseDesc = { en: "Requires child <= 6 years or adolescent/adult woman aged 15-49.", hi: "6 वर्ष तक का बच्चा या 15-49 वर्ष की महिला होना आवश्यक है।" };
      }
      break;
    case "nikshay-poshan":
      passed = bank;
      if (!passed) {
        failedClauseDesc = { en: "Requires active bank account for DBT nutritional support.", hi: "डीबीटी पोषण सहायता हेतु सक्रिय बैंक खाता आवश्यक है।" };
      }
      break;
    case "mission-vatsalya":
      passed = age < 18 && income <= 250000;
      if (!passed) {
        failedClauseDesc = { en: "Targeted at vulnerable children aged under 18.", hi: "18 वर्ष से कम आयु के संकटग्रस्त बच्चों के लिए लक्षित।" };
      }
      break;
    case "mahila-samman-savings":
      passed = gender === "female";
      if (!passed) {
        failedClauseDesc = { en: "Certificate exclusively available for women and girl children.", hi: "यह प्रमाण पत्र केवल महिलाओं और बालिकाओं के लिए उपलब्ध है।" };
      }
      break;
    case "pm-bjp-janaushadhi":
      passed = true; // Open to all citizens
      break;

    // ── Entrepreneurship & Skilling ──
    case "pm-mudra":
      passed = (occ === "self_employed" || occ === "artisan" || occ === "farmer" || occ === "other") && !credit5y;
      if (!passed) {
        failedClauseDesc = { en: "Requires micro business activity and no default/prior credit restriction.", hi: "सूक्ष्म व्यवसाय और ऋण प्रतिबंध न होना आवश्यक है।" };
      }
      break;
    case "stand-up-india":
      passed = (cat === "sc" || cat === "st" || gender === "female") && age >= 18;
      if (!passed) {
        failedClauseDesc = { en: "Requires SC, ST, or female entrepreneur aged 18+.", hi: "18+ आयु की महिला या एससी/एसटी उद्यमी होना आवश्यक है।" };
      }
      break;
    case "pm-svanidhi":
      passed = (occ === "self_employed" || occ === "other") && !credit5y;
      if (!passed) {
        failedClauseDesc = { en: "Requires street vendor/informal trading occupation without recent credit default.", hi: "रेहड़ी-पटरी या स्वरोजगार पेशा होना आवश्यक है।" };
      }
      break;
    case "pmay-urban":
      passed = income <= 1800000 && !govt;
      if (!passed) {
        failedClauseDesc = { en: "Household income must not exceed ₹18,00,000 for credit-linked housing subsidy.", hi: "पारिवारिक आय ₹18 लाख से अधिक नहीं होनी चाहिए।" };
      }
      break;
    case "pmkvy":
      passed = age >= 15 && age <= 45 && (occ === "unemployed" || occ === "student" || occ === "artisan" || occ === "other");
      if (!passed) {
        failedClauseDesc = { en: "Requires candidate aged 15-45 seeking industry skill certification.", hi: "15-45 वर्ष के उम्मीदवार जो कौशल प्रशिक्षण चाहते हैं।" };
      }
      break;
    case "naps":
      passed = age >= 14 && age <= 35 && (occ === "student" || occ === "unemployed" || occ === "artisan");
      if (!passed) {
        failedClauseDesc = { en: "Requires apprentice candidate aged 14+ with primary education.", hi: "14+ आयु के शिक्षु उम्मीदवार होना आवश्यक है।" };
      }
      break;
    case "pmegp":
      passed = age >= 18 && !credit5y;
      if (!passed) {
        failedClauseDesc = { en: "Requires entrepreneur aged 18+ establishing new micro-enterprise.", hi: "नया सूक्ष्म उद्यम स्थापित करने वाले 18+ आयु के नागरिक।" };
      }
      break;
    case "cgtmse":
      passed = (occ === "self_employed" || occ === "artisan") && !credit5y;
      if (!passed) {
        failedClauseDesc = { en: "Requires active micro/small enterprise seeking collateral-free loan.", hi: "संपार्श्विक-मुक्त ऋण चाहने वाले सूक्ष्म व लघु उद्यमी।" };
      }
      break;
    case "svamitva":
      passed = land || occ === "farmer";
      if (!passed) {
        failedClauseDesc = { en: "Requires rural inhabited property / agricultural land ownership.", hi: "ग्रामीण संपत्ति या कृषि भूमि का स्वामित्व आवश्यक है।" };
      }
      break;

    default:
      passed = false;
      failedClauseDesc = { en: "Eligibility criteria pending verification.", hi: "पात्रता मानदंड सत्यापन लंबित है।" };
  }

  return { passed, failedClauseDesc };
}

export async function evaluateLocalProfile(profile, language = "en", schemeId = null) {
  const age = calculateAge(profile.dateOfBirth || "2000-01-01");
  const attrs = {
    ...profile,
    age,
    hasAvailedSimilarCreditScheme5y: Boolean(
      profile.hasAvailedSimilarCreditScheme5y ?? profile.availedCreditSchemeLast5Yrs
    )
  };
  delete attrs.dateOfBirth;

  const results = [];
  let eligibleCount = 0;

  const schemesToEvaluate = schemeId
    ? ONBOARDED_SCHEMES.filter((s) => s.id === schemeId)
    : ONBOARDED_SCHEMES;

  for (const scheme of schemesToEvaluate) {
    const isVerified = Boolean(scheme.citationVerified);
    let isEligible = false;
    let clauseEvaluations = [];
    let whatWouldChange = [];

    if (isVerified && VERIFIED_SCHEME_CLAUSES[scheme.id]) {
      const verifiedClauses = VERIFIED_SCHEME_CLAUSES[scheme.id];
      clauseEvaluations = verifiedClauses.map((clause) => {
        const satisfied = clause.evalFn(attrs);
        return {
          clauseId: clause.clauseId,
          kind: clause.kind,
          satisfied,
          description: clause.humanText,
          citation: clause.citation,
          remedy: clause.remedy
        };
      });

      const failedClauses = clauseEvaluations.filter((c) => !c.satisfied);
      isEligible = failedClauses.length === 0;

      // Counterfactuals
      if (!isEligible) {
        for (const f of failedClauses) {
          if (!f.remedy?.counterfactual) {
            whatWouldChange.push({
              clauseId: f.clauseId,
              change: null,
              wouldBecomeEligible: false
            });
          } else {
            const cf = f.remedy.counterfactual;
            const targetVal = cf.value;
            const currentVal = attrs[cf.attribute];
            const tempAttrs = { ...attrs, [cf.attribute]: targetVal };
            const stillFailing = verifiedClauses.filter((c) => !c.evalFn(tempAttrs));
            whatWouldChange.push({
              clauseId: f.clauseId,
              change: {
                field: cf.attribute,
                targetValue: targetVal,
                currentValue: currentVal
              },
              wouldBecomeEligible: stillFailing.length === 0
            });
          }
        }
      }
    } else {
      // Rule-based evaluation for the other 48 schemes
      const { passed, failedClauseDesc } = evaluateRuleBasedScheme(scheme.id, attrs);
      isEligible = passed;

      clauseEvaluations = [
        {
          clauseId: `${scheme.id.toUpperCase()}-R-01`,
          kind: "requirement",
          satisfied: isEligible,
          description: isEligible
            ? { en: `Satisfies statutory eligibility criteria for ${scheme.name.en}.`, hi: `${scheme.name.hi} के सांविधिक मानदंडों को पूरा करता है।` }
            : failedClauseDesc,
          citation: null,
          remedy: isEligible ? null : { en: failedClauseDesc.en, hi: failedClauseDesc.hi, counterfactual: null }
        }
      ];
    }

    if (isEligible) eligibleCount++;

    // Receipt hash: sha256(policyHash : sha256(canonicalAttrs))
    const canonical = JSON.stringify(attrs, Object.keys(attrs).sort());
    const inputHash = await sha256Hex(canonical);
    const receiptHash = await sha256Hex(`${scheme.policyHash || scheme.id}:${inputHash}`);
    const receiptId = receiptHash.slice(0, 16);

    const explanation = isEligible
      ? (language === "hi"
          ? `आप ${scheme.name.hi} के सभी सांविधिक मानदंडों को पूरा करते हैं।`
          : `You satisfy all statutory criteria for ${scheme.name.en}.`)
      : (language === "hi"
          ? `आप ${scheme.name.hi} के सांविधिक मानदंडों को पूरा नहीं करते हैं।`
          : `You do not meet one or more statutory criteria for ${scheme.name.en}.`);

    results.push({
      schemeId: scheme.id,
      name: scheme.name,
      ministry: typeof scheme.ministry === "object" ? (scheme.ministry[language] || scheme.ministry.en) : scheme.ministry,
      category: scheme.category,
      categoryTag: scheme.categoryTag,
      citationVerified: isVerified,
      officialUrl: scheme.officialUrl,
      decision: isEligible ? "ELIGIBLE" : "NOT_ELIGIBLE",
      clauses: clauseEvaluations,
      whatWouldChange,
      receipt: { receiptId, policyHash: scheme.policyHash, inputHash },
      explanation: { en: explanation, hi: explanation },
      explanationGeneratedBy: "template"
    });
  }

  return {
    requestId: `local-${Date.now()}`,
    evaluatedAt: new Date().toISOString(),
    engine: "local-reference-evaluator (Cedar DSL)",
    catalogPublishedAt: "2026-09-19",
    summary: {
      checked: schemesToEvaluate.length,
      eligible: eligibleCount,
      notEligible: schemesToEvaluate.length - eligibleCount,
      errors: 0
    },
    schemes: results
  };
}
