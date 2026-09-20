/**
 * documentDependencies.js — Master prerequisite & issuance document graph for statutory schemes.
 * Models multi-tiered Indian government document chains (Root Prerequisites → Intermediate Certificates → Final Application Documents).
 */

export const DOCUMENT_METADATA = {
  "Aadhaar Card": {
    authority: "UIDAI / Aadhaar Seva Kendra / CSC",
    category: "Identity & Proof of Age",
    icon: "🪪",
    estimatedDays: "7-15 days",
    description: "12-digit biometric identity card.",
    isRoot: true,
  },
  "Ration Card (NFSA / BPL / Antyodaya)": {
    authority: "Food & Civil Supplies Department / Fair Price Shop",
    category: "Family & Subsidies",
    icon: "🌾",
    estimatedDays: "15-30 days",
    description: "Official household ration entitlement card.",
    isRoot: false,
  },
  "Residence Proof / Utility Bill": {
    authority: "Electricity Board / Municipal Corp / Gram Panchayat",
    category: "Address Proof",
    icon: "🏠",
    estimatedDays: "Instant - 3 days",
    description: "Electricity bill, water bill, or registered house tax receipt.",
    isRoot: true,
  },
  "Birth Certificate": {
    authority: "Municipal Corporation / Registrar of Births & Deaths / Gram Panchayat",
    category: "Age & Civil Registration",
    icon: "👶",
    estimatedDays: "7-14 days",
    description: "Official birth registration certificate.",
    isRoot: true,
  },
  "Voter ID Card (EPIC)": {
    authority: "Election Commission of India (ECI) / BLO",
    category: "Identity & Address",
    icon: "🗳️",
    estimatedDays: "15-30 days",
    description: "Electoral Photo Identity Card.",
    isRoot: true,
  },
  "PAN Card": {
    authority: "Income Tax Department / NSDL / UTIITSL",
    category: "Financial Identity",
    icon: "💳",
    estimatedDays: "7-10 days",
    description: "10-digit alphanumeric permanent account number.",
    isRoot: false,
  },
  "Active Savings Bank Account Passbook": {
    authority: "Public/Private Commercial Bank / Post Office / Regional Rural Bank",
    category: "Banking & DBT",
    icon: "🏦",
    estimatedDays: "1-3 days",
    description: "Bank passbook with clear IFSC and Aadhaar-seeded NPCI mapping.",
    isRoot: false,
  },
  "Domicile / Residence Certificate": {
    authority: "Tehsildar / Sub-Divisional Magistrate (SDM) / Revenue Dept",
    category: "State Residence Proof",
    icon: "📜",
    estimatedDays: "10-15 days",
    description: "Statutory certificate establishing permanent domicile in state.",
    isRoot: false,
  },
  "Income Certificate": {
    authority: "Tehsildar / Revenue Officer / Block Development Office",
    category: "Financial Verification",
    icon: "💰",
    estimatedDays: "7-14 days",
    description: "Official certificate verifying total annual family income.",
    isRoot: false,
  },
  "Caste Certificate (SC / ST / OBC / EWS)": {
    authority: "Tehsildar / Sub-Divisional Officer (SDO) / Social Welfare Dept",
    category: "Social Category Verification",
    icon: "📑",
    estimatedDays: "15-30 days",
    description: "Statutory certificate proving caste category or EWS status.",
    isRoot: false,
  },
  "Self-Declaration Affidavit / Patwari Income Inquiry": {
    authority: "Notary Public / Village Patwari / Lekhpal",
    category: "Affidavit & Local Inquiry",
    icon: "✍️",
    estimatedDays: "1-2 days",
    description: "Sworn affidavit of annual earnings with local patwari sign-off.",
    isRoot: true,
  },
  "Land Ownership Record (Khatauni / ROR / 7/12)": {
    authority: "State Revenue Department / Bhulekh Portal / Tehsildar",
    category: "Land & Property",
    icon: "🚜",
    estimatedDays: "3-7 days",
    description: "Record of Rights (ROR) / certified land holding extract.",
    isRoot: false,
  },
  "Land Mutation Record / Registered Sale Deed": {
    authority: "Sub-Registrar Office / Tehsildar Revenue Court",
    category: "Land Title",
    icon: "📑",
    estimatedDays: "15-45 days",
    description: "Registered sale deed or inheritance mutation (Dakhil-Kharij).",
    isRoot: true,
  },
  "Trade Skill Certificate / Gram Panchayat Endorsement": {
    authority: "Gram Panchayat / Ward Councilor / District Industries Centre (DIC)",
    category: "Occupation & Artisan",
    icon: "🔨",
    estimatedDays: "3-7 days",
    description: "Official verification slip of traditional artisan practice.",
    isRoot: true,
  },
  "e-Shram Card / UAN Number": {
    authority: "Ministry of Labour & Employment / CSC / Shram Suvidha",
    category: "Unorganized Worker Registry",
    icon: "👷",
    estimatedDays: "Instant (online)",
    description: "12-digit Universal Account Number for unorganized workers.",
    isRoot: false,
  },
  "SECC 2011 Survey Inclusion / BPL Household ID": {
    authority: "Gram Sabha / Block Development Officer (BDO)",
    category: "Deprivation Census",
    icon: "📋",
    estimatedDays: "Varies by Census/Survey",
    description: "Socio-Economic and Caste Census household index.",
    isRoot: true,
  },
  "College Admission Slip & Fee Receipt": {
    authority: "Accredited University / College Administration",
    category: "Higher Education",
    icon: "🎓",
    estimatedDays: "1-2 days",
    description: "Current academic year admission confirmation and fee invoice.",
    isRoot: false,
  },
  "Class 10 & 12 Marksheets": {
    authority: "State Secondary Education Board / CBSE / CISCE",
    category: "Educational Qualification",
    icon: "📝",
    estimatedDays: "Instant (Available)",
    description: "Official board examination passing certificates.",
    isRoot: true,
  },
  "Mother & Child Protection (MCP) Card": {
    authority: "Anganwadi Center / ASHA Worker / Primary Health Centre (PHC)",
    category: "Maternal Health",
    icon: "🤱",
    estimatedDays: "1 day (at First ANC)",
    description: "Ministry of Health maternal health tracking record.",
    isRoot: true,
  },
  "Street Vendor Vending Certificate / LoR": {
    authority: "Town Vending Committee (TVC) / Urban Local Body (ULB)",
    category: "Urban Livelihood",
    icon: "🛒",
    estimatedDays: "7-21 days",
    description: "Letter of Recommendation or Urban Local Body survey token.",
    isRoot: true,
  },
  "Disability Certificate (UDID)": {
    authority: "District Medical Board / Swavlamban Portal",
    category: "Differently Abled Proof",
    icon: "♿",
    estimatedDays: "15-30 days",
    description: "Unique Disability ID card certifying 40%+ disability.",
    isRoot: false,
  },
  "Medical Assessment Certificate": {
    authority: "District Civil Hospital / Chief Medical Officer (CMO)",
    category: "Medical Verification",
    icon: "🩺",
    estimatedDays: "3-7 days",
    description: "Clinical evaluation report from registered government medical officer.",
    isRoot: true,
  },
  "Udyam Registration Certificate": {
    authority: "Ministry of MSME (Udyam Portal)",
    category: "Business Registration",
    icon: "🏢",
    estimatedDays: "Instant (Online)",
    description: "Government MSME registration for micro/small enterprises.",
    isRoot: false,
  },
  "Patwari Sowing & Crop Damage Slip": {
    authority: "Village Patwari / Revenue Inspector / Agriculture Officer",
    category: "Agriculture Inspection",
    icon: "🌱",
    estimatedDays: "2-5 days",
    description: "Current season crop sowing Girdawari verification.",
    isRoot: true,
  }
};

export const SCHEME_DOCUMENT_DEPENDENCIES = {
  "pm-kisan": {
    schemeName: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
    category: "Agriculture & Rural Development",
    required: [
      "Aadhaar Card",
      "Land Ownership Record (Khatauni / ROR / 7/12)",
      "Active Savings Bank Account Passbook"
    ],
    dependencies: {
      "Land Ownership Record (Khatauni / ROR / 7/12)": [
        "Land Mutation Record / Registered Sale Deed"
      ],
      "Active Savings Bank Account Passbook": [
        "Aadhaar Card",
        "PAN Card"
      ],
      "PAN Card": [
        "Aadhaar Card"
      ]
    },
    unverified: false,
    notes: "Direct Benefit Transfer goes strictly to Aadhaar-seeded NPCI mapped bank accounts."
  },
  "pm-vishwakarma": {
    schemeName: "PM Vishwakarma Scheme",
    category: "Entrepreneurship/Skilling & Urban Welfare",
    required: [
      "Aadhaar Card",
      "Trade Skill Certificate / Gram Panchayat Endorsement",
      "Active Savings Bank Account Passbook",
      "Ration Card (NFSA / BPL / Antyodaya)"
    ],
    dependencies: {
      "Trade Skill Certificate / Gram Panchayat Endorsement": [
        "Aadhaar Card",
        "Self-Declaration Affidavit / Patwari Income Inquiry"
      ],
      "Active Savings Bank Account Passbook": [
        "Aadhaar Card",
        "PAN Card"
      ],
      "Ration Card (NFSA / BPL / Antyodaya)": [
        "Income Certificate",
        "Residence Proof / Utility Bill"
      ],
      "Income Certificate": [
        "Self-Declaration Affidavit / Patwari Income Inquiry",
        "Residence Proof / Utility Bill"
      ]
    },
    unverified: false,
    notes: "Requires level-1 verification by Gram Pradhan / Ward Member followed by skill assessment."
  },
  "post-matric-sc": {
    schemeName: "Post-Matric Scholarship for SC Students",
    category: "Education/Scholarships & Youth",
    required: [
      "Caste Certificate (SC / ST / OBC / EWS)",
      "Income Certificate",
      "College Admission Slip & Fee Receipt",
      "Active Savings Bank Account Passbook",
      "Aadhaar Card"
    ],
    dependencies: {
      "Caste Certificate (SC / ST / OBC / EWS)": [
        "Domicile / Residence Certificate",
        "Aadhaar Card"
      ],
      "Domicile / Residence Certificate": [
        "Residence Proof / Utility Bill",
        "Birth Certificate",
        "Voter ID Card (EPIC)"
      ],
      "Income Certificate": [
        "Self-Declaration Affidavit / Patwari Income Inquiry",
        "Residence Proof / Utility Bill"
      ],
      "College Admission Slip & Fee Receipt": [
        "Class 10 & 12 Marksheets"
      ],
      "Active Savings Bank Account Passbook": [
        "Aadhaar Card",
        "PAN Card"
      ]
    },
    unverified: false,
    notes: "Family annual income ceiling is ₹2.5 Lakh per annum."
  },
  "pm-awas-gramin": {
    schemeName: "Pradhan Mantri Awaas Yojana - Gramin (PMAY-G)",
    category: "Agriculture & Rural Development",
    required: [
      "SECC 2011 Survey Inclusion / BPL Household ID",
      "Aadhaar Card",
      "Active Savings Bank Account Passbook",
      "Land Ownership Record (Khatauni / ROR / 7/12)"
    ],
    dependencies: {
      "Land Ownership Record (Khatauni / ROR / 7/12)": [
        "Land Mutation Record / Registered Sale Deed"
      ],
      "Active Savings Bank Account Passbook": [
        "Aadhaar Card"
      ]
    },
    unverified: false,
    notes: "Geo-tagged photo of non-pucca/kutcha dwelling required before installment release."
  },
  "ayushman-bharat": {
    schemeName: "Ayushman Bharat PM-JAY",
    category: "Health/Women & Child Welfare",
    required: [
      "Aadhaar Card",
      "Ration Card (NFSA / BPL / Antyodaya)",
      "SECC 2011 Survey Inclusion / BPL Household ID"
    ],
    dependencies: {
      "Ration Card (NFSA / BPL / Antyodaya)": [
        "Income Certificate",
        "Residence Proof / Utility Bill"
      ],
      "Income Certificate": [
        "Self-Declaration Affidavit / Patwari Income Inquiry"
      ]
    },
    unverified: false,
    notes: "Provides ₹5,00,000 annual secondary/tertiary cashless health insurance per family."
  },
  "pm-ujjwala": {
    schemeName: "Pradhan Mantri Ujjwala Yojana (PMUY)",
    category: "Health/Women & Child Welfare",
    required: [
      "Ration Card (NFSA / BPL / Antyodaya)",
      "Aadhaar Card",
      "Active Savings Bank Account Passbook",
      "Self-Declaration Affidavit / Patwari Income Inquiry"
    ],
    dependencies: {
      "Ration Card (NFSA / BPL / Antyodaya)": [
        "Income Certificate",
        "Residence Proof / Utility Bill"
      ],
      "Income Certificate": [
        "Self-Declaration Affidavit / Patwari Income Inquiry"
      ],
      "Active Savings Bank Account Passbook": [
        "Aadhaar Card"
      ]
    },
    unverified: false,
    notes: "LPG connection is registered strictly in the name of an adult female family member."
  },
  "pm-svanidhi": {
    schemeName: "PM Street Vendor's AtmaNirbhar Nidhi (PM SVANidhi)",
    category: "Entrepreneurship/Skilling & Urban Welfare",
    required: [
      "Street Vendor Vending Certificate / LoR",
      "Aadhaar Card",
      "Active Savings Bank Account Passbook"
    ],
    dependencies: {
      "Street Vendor Vending Certificate / LoR": [
        "Aadhaar Card",
        "Voter ID Card (EPIC)"
      ],
      "Active Savings Bank Account Passbook": [
        "Aadhaar Card",
        "PAN Card"
      ]
    },
    unverified: false,
    notes: "Collateral-free working capital loan of ₹10,000 → ₹20,000 → ₹50,000 with 7% interest subsidy."
  },
  "sukanya-samriddhi": {
    schemeName: "Sukanya Samriddhi Yojana (SSY)",
    category: "Health/Women & Child Welfare",
    required: [
      "Birth Certificate",
      "Aadhaar Card",
      "PAN Card",
      "Residence Proof / Utility Bill"
    ],
    dependencies: {
      "PAN Card": [
        "Aadhaar Card"
      ]
    },
    unverified: false,
    notes: "Account opened for girl child below 10 years of age with high compounding tax-free interest."
  },
  "pm-matru-vandana": {
    schemeName: "Pradhan Mantri Matru Vandana Yojana (PMMVY)",
    category: "Health/Women & Child Welfare",
    required: [
      "Mother & Child Protection (MCP) Card",
      "Aadhaar Card",
      "Active Savings Bank Account Passbook"
    ],
    dependencies: {
      "Mother & Child Protection (MCP) Card": [
        "Aadhaar Card"
      ],
      "Active Savings Bank Account Passbook": [
        "Aadhaar Card"
      ]
    },
    unverified: false,
    notes: "Maternity benefit of ₹5,000 in DBT installments upon timely institutional ANC and immunizations."
  },
  "nsap-old-age": {
    schemeName: "Indira Gandhi National Old Age Pension (IGNOAPS)",
    category: "Pensions/Insurance & Social Security",
    required: [
      "Aadhaar Card",
      "Income Certificate",
      "Active Savings Bank Account Passbook",
      "Ration Card (NFSA / BPL / Antyodaya)"
    ],
    dependencies: {
      "Income Certificate": [
        "Self-Declaration Affidavit / Patwari Income Inquiry",
        "Domicile / Residence Certificate"
      ],
      "Domicile / Residence Certificate": [
        "Residence Proof / Utility Bill",
        "Voter ID Card (EPIC)"
      ],
      "Ration Card (NFSA / BPL / Antyodaya)": [
        "Residence Proof / Utility Bill",
        "Aadhaar Card"
      ]
    },
    unverified: false,
    notes: "Applicant must be aged 60+ and belong to a verified Below Poverty Line (BPL) household."
  },
  "pm-mudra-shishu": {
    schemeName: "Pradhan Mantri MUDRA Yojana (Shishu Loan)",
    category: "Entrepreneurship/Skilling & Urban Welfare",
    required: [
      "Udyam Registration Certificate",
      "Aadhaar Card",
      "PAN Card",
      "Residence Proof / Utility Bill",
      "Active Savings Bank Account Passbook"
    ],
    dependencies: {
      "Udyam Registration Certificate": [
        "Aadhaar Card",
        "PAN Card"
      ],
      "PAN Card": [
        "Aadhaar Card"
      ],
      "Active Savings Bank Account Passbook": [
        "Aadhaar Card"
      ]
    },
    unverified: false,
    notes: "Provides collateral-free business loans up to ₹50,000 for micro-enterprises and vendors."
  },
  "pm-shram-yogi": {
    schemeName: "PM Shram Yogi Maan-dhan (PM-SYM)",
    category: "Pensions/Insurance & Social Security",
    required: [
      "e-Shram Card / UAN Number",
      "Aadhaar Card",
      "Active Savings Bank Account Passbook"
    ],
    dependencies: {
      "e-Shram Card / UAN Number": [
        "Aadhaar Card",
        "Active Savings Bank Account Passbook"
      ],
      "Active Savings Bank Account Passbook": [
        "Aadhaar Card"
      ]
    },
    unverified: false,
    notes: "Assured monthly pension of ₹3,000 after age 60 for unorganized workers earning ≤ ₹15,000/mo."
  },
  "kisan-credit-card": {
    schemeName: "Kisan Credit Card (KCC)",
    category: "Agriculture & Rural Development",
    required: [
      "Land Ownership Record (Khatauni / ROR / 7/12)",
      "Patwari Sowing & Crop Damage Slip",
      "Aadhaar Card",
      "PAN Card",
      "Active Savings Bank Account Passbook"
    ],
    dependencies: {
      "Land Ownership Record (Khatauni / ROR / 7/12)": [
        "Land Mutation Record / Registered Sale Deed"
      ],
      "PAN Card": [
        "Aadhaar Card"
      ]
    },
    unverified: false,
    notes: "Subsidized agricultural working capital credit at 4% effective interest upon prompt repayment."
  },
  "pmfby": {
    schemeName: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    category: "Agriculture & Rural Development",
    required: [
      "Patwari Sowing & Crop Damage Slip",
      "Land Ownership Record (Khatauni / ROR / 7/12)",
      "Active Savings Bank Account Passbook",
      "Aadhaar Card"
    ],
    dependencies: {
      "Land Ownership Record (Khatauni / ROR / 7/12)": [
        "Land Mutation Record / Registered Sale Deed"
      ],
      "Active Savings Bank Account Passbook": [
        "Aadhaar Card"
      ]
    },
    unverified: false,
    notes: "Comprehensive crop loss insurance with farmer premium of only 1.5% - 2%."
  },
  "divyangjan-swavlamban": {
    schemeName: "Divyangjan Swavlamban Yojana (Disability Pension & Support)",
    category: "Pensions/Insurance & Social Security",
    required: [
      "Disability Certificate (UDID)",
      "Income Certificate",
      "Aadhaar Card",
      "Active Savings Bank Account Passbook"
    ],
    dependencies: {
      "Disability Certificate (UDID)": [
        "Medical Assessment Certificate",
        "Aadhaar Card"
      ],
      "Income Certificate": [
        "Self-Declaration Affidavit / Patwari Income Inquiry",
        "Domicile / Residence Certificate"
      ],
      "Domicile / Residence Certificate": [
        "Residence Proof / Utility Bill"
      ]
    },
    unverified: true,
    notes: "Requires minimum 40% benchmark disability certified by designated Medical Board."
  }
};
