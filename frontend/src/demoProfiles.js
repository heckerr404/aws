/**
 * demoProfiles.js — Golden demographic and identity demo profiles
 * Note: Aadhaar numbers and resident details are purely cosmetic and never sent to the backend.
 */

export const DEMO_PROFILES = {
  murugan: {
    id: "murugan",
    tagKey: "muruganTag",
    // Cosmetic Aadhaar Card details (browser only)
    card: {
      name: "Murugan Selvam",
      address: "12/4 East Street, Madurai, Tamil Nadu 625001",
      aadhaar: "1234 5678 9012"
    },
    // True citizen evaluation attributes
    profile: {
      dateOfBirth: "1981-03-10",
      state: "tn",
      gender: "male",
      socialCategory: "obc",
      occupation: "farmer",
      artisanTrade: "none",
      familyIncomeInr: 180000,
      hasCultivableLand: true,
      isInstitutionalLandHolder: false,
      isIncomeTaxPayer: false,
      isGovtEmployee: false,
      hasBankAccount: true,
      isEnrolledInHigherEd: false,
      class12Percentile: 0,
      availedCreditSchemeLast5Yrs: false
    }
  },

  divya: {
    id: "divya",
    tagKey: "divyaTag",
    card: {
      name: "Divya Ramesh",
      address: "44 Green Meadows, Coimbatore, Tamil Nadu 641018",
      aadhaar: "2345 6789 0123"
    },
    profile: {
      dateOfBirth: "2006-08-01",
      state: "tn",
      gender: "female",
      socialCategory: "general",
      occupation: "student",
      artisanTrade: "none",
      familyIncomeInr: 300000,
      hasCultivableLand: false,
      isInstitutionalLandHolder: false,
      isIncomeTaxPayer: false,
      isGovtEmployee: false,
      hasBankAccount: true,
      isEnrolledInHigherEd: true,
      class12Percentile: 92,
      availedCreditSchemeLast5Yrs: false
    }
  },

  rafiq: {
    id: "rafiq",
    tagKey: "rafiqTag",
    card: {
      name: "Rafiq Mohammed",
      address: "7-A Weaver Colony, Tiruppur, Tamil Nadu 641604",
      aadhaar: "3456 7890 1234"
    },
    profile: {
      dateOfBirth: "1994-01-15",
      state: "tn",
      gender: "male",
      socialCategory: "general",
      occupation: "artisan",
      artisanTrade: "tailor",
      familyIncomeInr: 200000,
      hasCultivableLand: false,
      isInstitutionalLandHolder: false,
      isIncomeTaxPayer: false,
      isGovtEmployee: false,
      hasBankAccount: true,
      isEnrolledInHigherEd: false,
      class12Percentile: 0,
      availedCreditSchemeLast5Yrs: false
    }
  }
};

export const INDIAN_STATES = [
  { code: "ap", name: "Andhra Pradesh" },
  { code: "ar", name: "Arunachal Pradesh" },
  { code: "as", name: "Assam" },
  { code: "br", name: "Bihar" },
  { code: "cg", name: "Chhattisgarh" },
  { code: "ga", name: "Goa" },
  { code: "gj", name: "Gujarat" },
  { code: "hr", name: "Haryana" },
  { code: "hp", name: "Himachal Pradesh" },
  { code: "jh", name: "Jharkhand" },
  { code: "ka", name: "Karnataka" },
  { code: "kl", name: "Kerala" },
  { code: "mp", name: "Madhya Pradesh" },
  { code: "mh", name: "Maharashtra" },
  { code: "mn", name: "Manipur" },
  { code: "ml", name: "Meghalaya" },
  { code: "mz", name: "Mizoram" },
  { code: "nl", name: "Nagaland" },
  { code: "od", name: "Odisha" },
  { code: "pb", name: "Punjab" },
  { code: "rj", name: "Rajasthan" },
  { code: "sk", name: "Sikkim" },
  { code: "tn", name: "Tamil Nadu" },
  { code: "ts", name: "Telangana" },
  { code: "tr", name: "Tripura" },
  { code: "up", name: "Uttar Pradesh" },
  { code: "uk", name: "Uttarakhand" },
  { code: "wb", name: "West Bengal" },
  { code: "dl", name: "Delhi" },
  { code: "jk", name: "Jammu and Kashmir" },
  { code: "la", name: "Ladakh" },
  { code: "py", name: "Puducherry" }
];

export const SOCIAL_CATEGORIES = [
  { code: "general", label: "General" },
  { code: "obc", label: "Other Backward Class (OBC)" },
  { code: "sc", label: "Scheduled Caste (SC)" },
  { code: "st", label: "Scheduled Tribe (ST)" },
  { code: "ews", label: "Economically Weaker Section (EWS)" }
];

export const OCCUPATIONS = [
  { code: "farmer", label: "Farmer / Agriculturalist" },
  { code: "artisan", label: "Artisan / Traditional Craftsperson" },
  { code: "student", label: "Student" },
  { code: "salaried", label: "Salaried Private Sector" },
  { code: "self_employed", label: "Self-Employed / Trader" },
  { code: "unemployed", label: "Unemployed / Homemaker" },
  { code: "other", label: "Other" }
];

export const ARTISAN_TRADES = [
  { code: "none", label: "None / Not Applicable" },
  { code: "carpenter", label: "Carpenter (Suthar)" },
  { code: "boat_maker", label: "Boat Maker" },
  { code: "armourer", label: "Armourer" },
  { code: "blacksmith", label: "Blacksmith (Lohar)" },
  { code: "hammer_tool_maker", label: "Hammer & Tool Kit Maker" },
  { code: "locksmith", label: "Locksmith" },
  { code: "goldsmith", label: "Goldsmith (Sonar)" },
  { code: "potter", label: "Potter (Kumhaar)" },
  { code: "sculptor", label: "Sculptor (Moortikar)" },
  { code: "cobbler", label: "Cobbler (Charmakar)" },
  { code: "mason", label: "Mason (Rajmistri)" },
  { code: "basket_maker", label: "Basket/Mat/Broom Maker" },
  { code: "doll_toy_maker", label: "Doll & Toy Maker" },
  { code: "barber", label: "Barber (Naai)" },
  { code: "garland_maker", label: "Garland Maker (Malakaar)" },
  { code: "washerman", label: "Washerman (Dhobi)" },
  { code: "tailor", label: "Tailor (Darzi)" },
  { code: "fishing_net_maker", label: "Fishing Net Maker" }
];
