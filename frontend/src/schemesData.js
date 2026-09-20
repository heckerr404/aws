/**
 * schemesData.js — Master catalog of all 50 central government statutory schemes.
 * Contains exact Cedar policy texts, ministries, target profiles, benefits, and citation verification flags.
 * Single source of truth for both Explorer catalog and evaluation engine.
 */

export const SCHEME_CATEGORIES = [
  "Agriculture & Rural Development",
  "Education/Scholarships & Youth",
  "Pensions/Insurance & Social Security",
  "Health/Women & Child Welfare",
  "Entrepreneurship/Skilling & Urban Welfare"
];

export const ONBOARDED_SCHEMES = [
  {
    "id": "pm-kisan",
    "name": {
      "en": "PM-KISAN",
      "hi": "पीएम-किसान"
    },
    "fullName": {
      "en": "Pradhan Mantri Kisan Samman Nidhi",
      "hi": "प्रधानमंत्री किसान सम्मान निधि"
    },
    "category": "Agriculture & Rural Development",
    "categoryTag": "Income Support",
    "ministry": {
      "en": "Ministry of Agriculture & Farmers Welfare",
      "hi": "कृषि एवं किसान कल्याण मंत्रालय"
    },
    "targetProfile": {
      "en": "Landholding farmer families with cultivable land.",
      "hi": "कृषि योग्य भूमि वाले भूमिधारक किसान परिवार।"
    },
    "primaryBenefit": {
      "en": "₹6,000 per year (3 installments).",
      "hi": "प्रति वर्ष ₹6,000 (3 समान किस्तों में)।"
    },
    "citationVerified": true,
    "icon": "🌾",
    "clausesCount": 6,
    "officialUrl": "https://pmkisan.gov.in",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"pm-kisan\"\n)\nwhen {\n    principal.occupation == \"Farmer\" &&\n    principal.ownsLand == true &&\n    principal.paysIncomeTax == false &&\n    principal.holdsConstitutionalPost == false\n};",
    "schemeId": "pm-kisan",
    "badge": "Income Support",
    "targetAudience": {
      "en": "Landholding farmer families with cultivable land.",
      "hi": "कृषि योग्य भूमि वाले भूमिधारक किसान परिवार।"
    },
    "oneLiner": {
      "en": "₹6,000 per year (3 installments).",
      "hi": "प्रति वर्ष ₹6,000 (3 समान किस्तों में)।"
    },
    "policyHash": "ede43a14ee46412df9705eaea0caa17e"
  },
  {
    "id": "pmfby",
    "name": {
      "en": "PM Fasal Bima Yojana (PMFBY)",
      "hi": "पीएम फसल बीमा योजना"
    },
    "fullName": {
      "en": "Pradhan Mantri Fasal Bima Yojana",
      "hi": "प्रधानमंत्री फसल बीमा योजना"
    },
    "category": "Agriculture & Rural Development",
    "categoryTag": "Crop Insurance",
    "ministry": {
      "en": "Ministry of Agriculture & Farmers Welfare",
      "hi": "कृषि एवं किसान कल्याण मंत्रालय"
    },
    "targetProfile": {
      "en": "Crop farmers owning or leasing land growing notified crops.",
      "hi": "अधिसूचित फसलें उगाने वाले भूमि मालिक या पट्टेदार किसान।"
    },
    "primaryBenefit": {
      "en": "Subsidized crop insurance.",
      "hi": "सब्सिडी युक्त फसल बीमा।"
    },
    "citationVerified": false,
    "icon": "🌱",
    "clausesCount": 3,
    "officialUrl": "https://pmfby.gov.in",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"pmfby\"\n)\nwhen {\n    principal.occupation == \"Farmer\" &&\n    principal.ownsOrLeasesLand == true &&\n    principal.growingNotifiedCrops == true\n};",
    "schemeId": "pmfby",
    "badge": "Crop Insurance",
    "targetAudience": {
      "en": "Crop farmers owning or leasing land growing notified crops.",
      "hi": "अधिसूचित फसलें उगाने वाले भूमि मालिक या पट्टेदार किसान।"
    },
    "oneLiner": {
      "en": "Subsidized crop insurance.",
      "hi": "सब्सिडी युक्त फसल बीमा।"
    },
    "policyHash": "84faa18e52a5046511434489bf4b271e"
  },
  {
    "id": "kcc",
    "name": {
      "en": "Kisan Credit Card (KCC)",
      "hi": "किसान क्रेडिट कार्ड (KCC)"
    },
    "fullName": {
      "en": "Kisan Credit Card Scheme",
      "hi": "किसान क्रेडिट कार्ड योजना"
    },
    "category": "Agriculture & Rural Development",
    "categoryTag": "Credit Support",
    "ministry": {
      "en": "Ministry of Agriculture & Farmers Welfare",
      "hi": "कृषि एवं किसान कल्याण मंत्रालय"
    },
    "targetProfile": {
      "en": "Farmers and allied workers (fisheries, animal husbandry) aged 18+.",
      "hi": "18 वर्ष या उससे अधिक आयु के किसान व पशुपालक।"
    },
    "primaryBenefit": {
      "en": "Institutional short-term credit.",
      "hi": "रियायती संस्थागत अल्पकालिक ऋण।"
    },
    "citationVerified": false,
    "icon": "💳",
    "clausesCount": 2,
    "officialUrl": "https://agricoop.nic.in",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"kcc\"\n)\nwhen {\n    (principal.occupation == \"Farmer\" || principal.occupation == \"Fisherman\" || principal.occupation == \"AnimalHusbandry\") &&\n    principal.age >= 18\n};",
    "schemeId": "kcc",
    "badge": "Credit Support",
    "targetAudience": {
      "en": "Farmers and allied workers (fisheries, animal husbandry) aged 18+.",
      "hi": "18 वर्ष या उससे अधिक आयु के किसान व पशुपालक।"
    },
    "oneLiner": {
      "en": "Institutional short-term credit.",
      "hi": "रियायती संस्थागत अल्पकालिक ऋण।"
    },
    "policyHash": "a161a6558f74dc3a4b7bbb14bc72aef8"
  },
  {
    "id": "pm-kusum",
    "name": {
      "en": "PM-KUSUM",
      "hi": "पीएम-कुसुम योजना"
    },
    "fullName": {
      "en": "PM Kisan Urja Suraksha evam Utthaan Mahabhiyan",
      "hi": "प्रधानमंत्री किसान ऊर्जा सुरक्षा एवं उत्थान महाभियान"
    },
    "category": "Agriculture & Rural Development",
    "categoryTag": "Solar Energy",
    "ministry": {
      "en": "Ministry of New and Renewable Energy",
      "hi": "नवीन और नवीकरणीय ऊर्जा मंत्रालय"
    },
    "targetProfile": {
      "en": "Farmers, Panchayats, or Cooperatives seeking solar pumps.",
      "hi": "सोलर पंप लगाने के इच्छुक किसान या पंचायतें।"
    },
    "primaryBenefit": {
      "en": "Subsidies for solar agriculture pumps.",
      "hi": "सौर कृषि पंपों के लिए 60% तक सब्सिडी।"
    },
    "citationVerified": false,
    "icon": "☀️",
    "clausesCount": 2,
    "officialUrl": "https://pmkusum.mnre.gov.in",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"pm-kusum\"\n)\nwhen {\n    principal.occupation == \"Farmer\" || principal.entityType == \"Panchayat\" || principal.entityType == \"Cooperative\"\n};",
    "schemeId": "pm-kusum",
    "badge": "Solar Energy",
    "targetAudience": {
      "en": "Farmers, Panchayats, or Cooperatives seeking solar pumps.",
      "hi": "सोलर पंप लगाने के इच्छुक किसान या पंचायतें।"
    },
    "oneLiner": {
      "en": "Subsidies for solar agriculture pumps.",
      "hi": "सौर कृषि पंपों के लिए 60% तक सब्सिडी।"
    },
    "policyHash": "19008a9bb5719709b1510e8dc1ae2e9e"
  },
  {
    "id": "pmmsy",
    "name": {
      "en": "PM Matsya Sampada (PMMSY)",
      "hi": "पीएम मत्स्य संपदा योजना"
    },
    "fullName": {
      "en": "Pradhan Mantri Matsya Sampada Yojana",
      "hi": "प्रधानमंत्री मत्स्य संपदा योजना"
    },
    "category": "Agriculture & Rural Development",
    "categoryTag": "Fisheries",
    "ministry": {
      "en": "Ministry of Fisheries, Animal Husbandry and Dairying",
      "hi": "मत्स्य पालन, पशुपालन और डेयरी मंत्रालय"
    },
    "targetProfile": {
      "en": "Fishers, fish farmers, and fish vendors.",
      "hi": "मछुआरे, मछली पालक और मछली विक्रेता।"
    },
    "primaryBenefit": {
      "en": "Financial assistance for fishing infra.",
      "hi": "मत्स्य बुनियादी ढांचे के लिए वित्तीय सहायता।"
    },
    "citationVerified": false,
    "icon": "🐟",
    "clausesCount": 2,
    "officialUrl": "https://pmmsy.dof.gov.in",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"pmmsy\"\n)\nwhen {\n    principal.occupation == \"Fisherman\" || principal.occupation == \"FishFarmer\" || principal.occupation == \"FishVendor\"\n};",
    "schemeId": "pmmsy",
    "badge": "Fisheries",
    "targetAudience": {
      "en": "Fishers, fish farmers, and fish vendors.",
      "hi": "मछुआरे, मछली पालक और मछली विक्रेता।"
    },
    "oneLiner": {
      "en": "Financial assistance for fishing infra.",
      "hi": "मत्स्य बुनियादी ढांचे के लिए वित्तीय सहायता।"
    },
    "policyHash": "e058724129058e0c71a3b0e755b17375"
  },
  {
    "id": "mgnrega",
    "name": {
      "en": "MGNREGA",
      "hi": "मनरेगा"
    },
    "fullName": {
      "en": "Mahatma Gandhi National Rural Employment Guarantee Act",
      "hi": "महात्मा गांधी राष्ट्रीय ग्रामीण रोजगार गारंटी अधिनियम"
    },
    "category": "Agriculture & Rural Development",
    "categoryTag": "Rural Employment",
    "ministry": {
      "en": "Ministry of Rural Development",
      "hi": "ग्रामीण विकास मंत्रालय"
    },
    "targetProfile": {
      "en": "Rural unskilled adult workers willing to do manual labor.",
      "hi": "शारीरिक श्रम के इच्छुक ग्रामीण वयस्क कामगार।"
    },
    "primaryBenefit": {
      "en": "100 days of guaranteed wage employment.",
      "hi": "100 दिनों का गारंटीकृत मजदूरी रोजगार।"
    },
    "citationVerified": false,
    "icon": "👷",
    "clausesCount": 3,
    "officialUrl": "https://nrega.nic.in",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"mgnrega\"\n)\nwhen {\n    principal.residenceArea == \"Rural\" &&\n    principal.age >= 18 &&\n    principal.willingnessToDoManualLabor == true\n};",
    "schemeId": "mgnrega",
    "badge": "Rural Employment",
    "targetAudience": {
      "en": "Rural unskilled adult workers willing to do manual labor.",
      "hi": "शारीरिक श्रम के इच्छुक ग्रामीण वयस्क कामगार।"
    },
    "oneLiner": {
      "en": "100 days of guaranteed wage employment.",
      "hi": "100 दिनों का गारंटीकृत मजदूरी रोजगार।"
    },
    "policyHash": "5169f8c6fc656b3c0120752b4de9e169"
  },
  {
    "id": "pmay-gramin",
    "name": {
      "en": "PMAY-Gramin",
      "hi": "पीएम आवास योजना - ग्रामीण"
    },
    "fullName": {
      "en": "Pradhan Mantri Awaas Yojana - Gramin",
      "hi": "प्रधानमंत्री आवास योजना - ग्रामीण"
    },
    "category": "Agriculture & Rural Development",
    "categoryTag": "Rural Housing",
    "ministry": {
      "en": "Ministry of Rural Development",
      "hi": "ग्रामीण विकास मंत्रालय"
    },
    "targetProfile": {
      "en": "Rural homeless or kutcha house dwellers listed in SECC 2011.",
      "hi": "SECC 2011 में सूचीबद्ध बेघर या कच्चे घरों वाले ग्रामीण परिवार।"
    },
    "primaryBenefit": {
      "en": "Financial aid for constructing a house.",
      "hi": "पक्के मकान के निर्माण के लिए वित्तीय सहायता।"
    },
    "citationVerified": false,
    "icon": "🏡",
    "clausesCount": 3,
    "officialUrl": "https://pmayg.nic.in",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"pmay-gramin\"\n)\nwhen {\n    principal.residenceArea == \"Rural\" &&\n    principal.ownsPuccaHouse == false &&\n    principal.listedInSECC2011 == true\n};",
    "schemeId": "pmay-gramin",
    "badge": "Rural Housing",
    "targetAudience": {
      "en": "Rural homeless or kutcha house dwellers listed in SECC 2011.",
      "hi": "SECC 2011 में सूचीबद्ध बेघर या कच्चे घरों वाले ग्रामीण परिवार।"
    },
    "oneLiner": {
      "en": "Financial aid for constructing a house.",
      "hi": "पक्के मकान के निर्माण के लिए वित्तीय सहायता।"
    },
    "policyHash": "ade421e9f4c29b2d7abd8ecd5e0ad28a"
  },
  {
    "id": "day-nrlm",
    "name": {
      "en": "DAY-NRLM",
      "hi": "डीएवाई-एनआरएलएम (आजीविका)"
    },
    "fullName": {
      "en": "Deendayal Antyodaya Yojana - NRLM",
      "hi": "दीनदयाल अंत्योदय योजना - राष्ट्रीय ग्रामीण आजीविका मिशन"
    },
    "category": "Agriculture & Rural Development",
    "categoryTag": "Livelihoods & SHG",
    "ministry": {
      "en": "Ministry of Rural Development",
      "hi": "ग्रामीण विकास मंत्रालय"
    },
    "targetProfile": {
      "en": "Rural poor women organized into Self Help Groups (SHGs).",
      "hi": "स्वयं सहायता समूहों में संगठित ग्रामीण गरीब महिलाएं।"
    },
    "primaryBenefit": {
      "en": "Livelihood promotion and SHG linkages.",
      "hi": "आजीविका संवर्धन और एसएचजी लिंकेज।"
    },
    "citationVerified": false,
    "icon": "🤝",
    "clausesCount": 4,
    "officialUrl": "https://aajeevika.gov.in",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"day-nrlm\"\n)\nwhen {\n    principal.residenceArea == \"Rural\" &&\n    principal.gender == \"Female\" &&\n    principal.isBPL == true &&\n    principal.memberOfSHG == true\n};",
    "schemeId": "day-nrlm",
    "badge": "Livelihoods & SHG",
    "targetAudience": {
      "en": "Rural poor women organized into Self Help Groups (SHGs).",
      "hi": "स्वयं सहायता समूहों में संगठित ग्रामीण गरीब महिलाएं।"
    },
    "oneLiner": {
      "en": "Livelihood promotion and SHG linkages.",
      "hi": "आजीविका संवर्धन और एसएचजी लिंकेज।"
    },
    "policyHash": "0ce7448dadf2c71f75904957ca30db7f"
  },
  {
    "id": "pkvy",
    "name": {
      "en": "PKVY (Paramparagat Krishi)",
      "hi": "परंपरागत कृषि विकास योजना"
    },
    "fullName": {
      "en": "Paramparagat Krishi Vikas Yojana",
      "hi": "परंपरागत कृषि विकास योजना"
    },
    "category": "Agriculture & Rural Development",
    "categoryTag": "Organic Farming",
    "ministry": {
      "en": "Ministry of Agriculture & Farmers Welfare",
      "hi": "कृषि एवं किसान कल्याण मंत्रालय"
    },
    "targetProfile": {
      "en": "Farmers practicing organic farming in clusters of 20+ hectares.",
      "hi": "20 हेक्टेयर या अधिक क्लस्टर में जैविक खेती करने वाले किसान।"
    },
    "primaryBenefit": {
      "en": "₹50,000 per hectare for organic inputs.",
      "hi": "जैविक आदानों के लिए ₹50,000 प्रति हेक्टेयर।"
    },
    "citationVerified": false,
    "icon": "🌿",
    "clausesCount": 3,
    "officialUrl": "https://pgsindia-ncof.gov.in",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"pkvy\"\n)\nwhen {\n    principal.occupation == \"Farmer\" &&\n    principal.farmingMethod == \"Organic\" &&\n    principal.landClusterSize >= 20\n};",
    "schemeId": "pkvy",
    "badge": "Organic Farming",
    "targetAudience": {
      "en": "Farmers practicing organic farming in clusters of 20+ hectares.",
      "hi": "20 हेक्टेयर या अधिक क्लस्टर में जैविक खेती करने वाले किसान।"
    },
    "oneLiner": {
      "en": "₹50,000 per hectare for organic inputs.",
      "hi": "जैविक आदानों के लिए ₹50,000 प्रति हेक्टेयर।"
    },
    "policyHash": "045cdd30e6e4bc6508c8ed3737699826"
  },
  {
    "id": "e-nam",
    "name": {
      "en": "e-NAM",
      "hi": "ई-नाम (राष्ट्रीय कृषि बाजार)"
    },
    "fullName": {
      "en": "National Agriculture Market",
      "hi": "राष्ट्रीय कृषि बाजार"
    },
    "category": "Agriculture & Rural Development",
    "categoryTag": "Agri Market",
    "ministry": {
      "en": "Ministry of Agriculture & Farmers Welfare",
      "hi": "कृषि एवं किसान कल्याण मंत्रालय"
    },
    "targetProfile": {
      "en": "Farmers, traders, and FPOs selling produce.",
      "hi": "फसल बेचने वाले किसान, व्यापारी और एफपीओ।"
    },
    "primaryBenefit": {
      "en": "Access to national electronic trading portal.",
      "hi": "राष्ट्रीय इलेक्ट्रॉनिक व्यापार पोर्टल तक पहुंच।"
    },
    "citationVerified": false,
    "icon": "📊",
    "clausesCount": 2,
    "officialUrl": "https://enam.gov.in",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"e-nam\"\n)\nwhen {\n    principal.occupation == \"Farmer\" || principal.occupation == \"Trader\" || principal.occupation == \"FPO\"\n};",
    "schemeId": "e-nam",
    "badge": "Agri Market",
    "targetAudience": {
      "en": "Farmers, traders, and FPOs selling produce.",
      "hi": "फसल बेचने वाले किसान, व्यापारी और एफपीओ।"
    },
    "oneLiner": {
      "en": "Access to national electronic trading portal.",
      "hi": "राष्ट्रीय इलेक्ट्रॉनिक व्यापार पोर्टल तक पहुंच।"
    },
    "policyHash": "edad4ccf5d4698f731ec23006272263b"
  },
  {
    "id": "nmmss",
    "name": {
      "en": "NMMSS",
      "hi": "एनएमएमएसएस छात्रवृत्ति"
    },
    "fullName": {
      "en": "National Means-cum-Merit Scholarship Scheme",
      "hi": "राष्ट्रीय साधन-सह-योग्यता छात्रवृत्ति योजना"
    },
    "category": "Education/Scholarships & Youth",
    "categoryTag": "School Scholarship",
    "ministry": {
      "en": "Ministry of Education",
      "hi": "शिक्षा मंत्रालय"
    },
    "targetProfile": {
      "en": "Meritorious government school students in Class 8.",
      "hi": "कक्षा 8 में सरकारी स्कूल के मेधावी छात्र।"
    },
    "primaryBenefit": {
      "en": "₹12,000 per annum scholarship.",
      "hi": "₹12,000 प्रति वर्ष छात्रवृत्ति।"
    },
    "citationVerified": false,
    "icon": "🎒",
    "clausesCount": 4,
    "officialUrl": "https://scholarships.gov.in",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"nmmss\"\n)\nwhen {\n    principal.class == 8 &&\n    principal.class7Marks >= 55 &&\n    principal.familyIncome <= 350000 &&\n    principal.schoolType == \"Government\"\n};",
    "schemeId": "nmmss",
    "badge": "School Scholarship",
    "targetAudience": {
      "en": "Meritorious government school students in Class 8.",
      "hi": "कक्षा 8 में सरकारी स्कूल के मेधावी छात्र।"
    },
    "oneLiner": {
      "en": "₹12,000 per annum scholarship.",
      "hi": "₹12,000 प्रति वर्ष छात्रवृत्ति।"
    },
    "policyHash": "14a207ab3c43100388db835b83f9f057"
  },
  {
    "id": "post-matric-sc",
    "name": {
      "en": "Post-Matric SC",
      "hi": "पोस्ट-मैट्रिक एससी छात्रवृत्ति"
    },
    "fullName": {
      "en": "Post-Matric Scholarship Scheme for SC Students",
      "hi": "अनुसूचित जाति के छात्रों के लिए पोस्ट-मैट्रिक छात्रवृत्ति"
    },
    "category": "Education/Scholarships & Youth",
    "categoryTag": "SC Scholarship",
    "ministry": {
      "en": "Ministry of Social Justice and Empowerment",
      "hi": "सामाजिक न्याय और अधिकारिता मंत्रालय"
    },
    "targetProfile": {
      "en": "SC students enrolled in Class 11+ with family income <= ₹2.5 Lakh.",
      "hi": "कक्षा 11+ में अध्ययनरत अनुसूचित जाति के छात्र।"
    },
    "primaryBenefit": {
      "en": "Full tuition fee reimbursement.",
      "hi": "पूर्ण शिक्षण शुल्क प्रतिपूर्ति।"
    },
    "citationVerified": false,
    "icon": "🎓",
    "clausesCount": 3,
    "officialUrl": "https://scholarships.gov.in",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"post-matric-sc\"\n)\nwhen {\n    principal.category == \"SC\" &&\n    principal.familyIncome <= 250000 &&\n    principal.class >= 11\n};",
    "schemeId": "post-matric-sc",
    "badge": "SC Scholarship",
    "targetAudience": {
      "en": "SC students enrolled in Class 11+ with family income <= ₹2.5 Lakh.",
      "hi": "कक्षा 11+ में अध्ययनरत अनुसूचित जाति के छात्र।"
    },
    "oneLiner": {
      "en": "Full tuition fee reimbursement.",
      "hi": "पूर्ण शिक्षण शुल्क प्रतिपूर्ति।"
    },
    "policyHash": "1611d1c46fb9c861b6698274ac41f8c3"
  },
  {
    "id": "post-matric-st",
    "name": {
      "en": "Post-Matric ST",
      "hi": "पोस्ट-मैट्रिक एसटी छात्रवृत्ति"
    },
    "fullName": {
      "en": "Post-Matric Scholarship Scheme for ST Students",
      "hi": "अनुसूचित जनजाति के छात्रों के लिए पोस्ट-मैट्रिक छात्रवृत्ति"
    },
    "category": "Education/Scholarships & Youth",
    "categoryTag": "ST Scholarship",
    "ministry": {
      "en": "Ministry of Tribal Affairs",
      "hi": "जनजातीय कार्य मंत्रालय"
    },
    "targetProfile": {
      "en": "ST students enrolled in Class 11+ with family income <= ₹2.5 Lakh.",
      "hi": "कक्षा 11+ में अध्ययनरत अनुसूचित जनजाति के छात्र।"
    },
    "primaryBenefit": {
      "en": "Full tuition fee reimbursement.",
      "hi": "पूर्ण शिक्षण शुल्क प्रतिपूर्ति।"
    },
    "citationVerified": false,
    "icon": "📜",
    "clausesCount": 3,
    "officialUrl": "https://scholarships.gov.in",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"post-matric-st\"\n)\nwhen {\n    principal.category == \"ST\" &&\n    principal.familyIncome <= 250000 &&\n    principal.class >= 11\n};",
    "schemeId": "post-matric-st",
    "badge": "ST Scholarship",
    "targetAudience": {
      "en": "ST students enrolled in Class 11+ with family income <= ₹2.5 Lakh.",
      "hi": "कक्षा 11+ में अध्ययनरत अनुसूचित जनजाति के छात्र।"
    },
    "oneLiner": {
      "en": "Full tuition fee reimbursement.",
      "hi": "पूर्ण शिक्षण शुल्क प्रतिपूर्ति।"
    },
    "policyHash": "f016bf5b3b20aaab21164ffa93b842fe"
  },
  {
    "id": "pm-yasasvi",
    "name": {
      "en": "PM YASASVI",
      "hi": "पीएम यशस्वी योजना"
    },
    "fullName": {
      "en": "PM Young Achievers Scholarship Award Scheme for Vibrant India",
      "hi": "पीएम यंग अचीवर्स स्कॉलरशिप अवार्ड स्कीम"
    },
    "category": "Education/Scholarships & Youth",
    "categoryTag": "OBC/EBC Scholarship",
    "ministry": {
      "en": "Ministry of Social Justice and Empowerment",
      "hi": "सामाजिक न्याय और अधिकारिता मंत्रालय"
    },
    "targetProfile": {
      "en": "OBC/EBC/DNT students in Class 9 or 11 with family income <= ₹2.5 Lakh.",
      "hi": "कक्षा 9 या 11 में OBC/EBC/DNT छात्र।"
    },
    "primaryBenefit": {
      "en": "Scholarship for higher education.",
      "hi": "उच्च शिक्षा के लिए छात्रवृत्ति।"
    },
    "citationVerified": false,
    "icon": "🌟",
    "clausesCount": 3,
    "officialUrl": "https://yet.nta.ac.in",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"pm-yasasvi\"\n)\nwhen {\n    (principal.category == \"OBC\" || principal.category == \"EBC\" || principal.category == \"DNT\") &&\n    [9, 11].contains(principal.class) &&\n    principal.familyIncome <= 250000\n};",
    "schemeId": "pm-yasasvi",
    "badge": "OBC/EBC Scholarship",
    "targetAudience": {
      "en": "OBC/EBC/DNT students in Class 9 or 11 with family income <= ₹2.5 Lakh.",
      "hi": "कक्षा 9 या 11 में OBC/EBC/DNT छात्र।"
    },
    "oneLiner": {
      "en": "Scholarship for higher education.",
      "hi": "उच्च शिक्षा के लिए छात्रवृत्ति।"
    },
    "policyHash": "70958948bf2e537bd9267e549f593f7a"
  },
  {
    "id": "pragati-scholarship",
    "name": {
      "en": "Pragati Scholarship",
      "hi": "प्रगति छात्रवृत्ति"
    },
    "fullName": {
      "en": "AICTE Pragati Scholarship for Girl Students",
      "hi": "छात्राओं के लिए एआईसीटीई प्रगति छात्रवृत्ति"
    },
    "category": "Education/Scholarships & Youth",
    "categoryTag": "Tech Scholarship",
    "ministry": {
      "en": "Ministry of Education (AICTE)",
      "hi": "शिक्षा मंत्रालय (एआईसीटीई)"
    },
    "targetProfile": {
      "en": "Female students admitted to 1st year technical diploma/degree.",
      "hi": "तकनीकी डिप्लोमा/डिग्री प्रथम वर्ष की छात्राएं।"
    },
    "primaryBenefit": {
      "en": "₹50,000 per annum for technical education.",
      "hi": "तकनीकी शिक्षा हेतु ₹50,000 प्रति वर्ष।"
    },
    "citationVerified": false,
    "icon": "👩‍💻",
    "clausesCount": 4,
    "officialUrl": "https://www.aicte-india.org",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"pragati-scholarship\"\n)\nwhen {\n    principal.gender == \"Female\" &&\n    principal.education == \"FirstYearDiplomaOrDegree\" &&\n    principal.familyIncome <= 800000 &&\n    principal.maxGirlsPerFamily <= 2\n};",
    "schemeId": "pragati-scholarship",
    "badge": "Tech Scholarship",
    "targetAudience": {
      "en": "Female students admitted to 1st year technical diploma/degree.",
      "hi": "तकनीकी डिप्लोमा/डिग्री प्रथम वर्ष की छात्राएं।"
    },
    "oneLiner": {
      "en": "₹50,000 per annum for technical education.",
      "hi": "तकनीकी शिक्षा हेतु ₹50,000 प्रति वर्ष।"
    },
    "policyHash": "8f708425615db63c4b0e7052bafd6462"
  },
  {
    "id": "saksham-scholarship",
    "name": {
      "en": "Saksham Scholarship",
      "hi": "सक्षम छात्रवृत्ति"
    },
    "fullName": {
      "en": "AICTE Saksham Scholarship for Specially-Abled",
      "hi": "दिव्यांग छात्रों के लिए एआईसीटीई सक्षम छात्रवृत्ति"
    },
    "category": "Education/Scholarships & Youth",
    "categoryTag": "Disability Support",
    "ministry": {
      "en": "Ministry of Education (AICTE)",
      "hi": "शिक्षा मंत्रालय (एआईसीटीई)"
    },
    "targetProfile": {
      "en": "Specially-abled students (disability >= 40%) in technical education.",
      "hi": "तकनीकी शिक्षा में 40%+ दिव्यांगता वाले छात्र।"
    },
    "primaryBenefit": {
      "en": "₹50,000 per annum for technical education.",
      "hi": "तकनीकी शिक्षा हेतु ₹50,000 प्रति वर्ष।"
    },
    "citationVerified": false,
    "icon": "♿",
    "clausesCount": 3,
    "officialUrl": "https://www.aicte-india.org",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"saksham-scholarship\"\n)\nwhen {\n    principal.disabilityPercentage >= 40 &&\n    principal.education == \"TechnicalDegreeOrDiploma\" &&\n    principal.familyIncome <= 800000\n};",
    "schemeId": "saksham-scholarship",
    "badge": "Disability Support",
    "targetAudience": {
      "en": "Specially-abled students (disability >= 40%) in technical education.",
      "hi": "तकनीकी शिक्षा में 40%+ दिव्यांगता वाले छात्र।"
    },
    "oneLiner": {
      "en": "₹50,000 per annum for technical education.",
      "hi": "तकनीकी शिक्षा हेतु ₹50,000 प्रति वर्ष।"
    },
    "policyHash": "0d0d5a7a8bab55a819c9d44c89d05fdc"
  },
  {
    "id": "begum-hazrat-mahal",
    "name": {
      "en": "Begum Hazrat Mahal",
      "hi": "बेगम हज़रत महल छात्रवृत्ति"
    },
    "fullName": {
      "en": "Begum Hazrat Mahal National Scholarship",
      "hi": "बेगम हज़रत महल राष्ट्रीय छात्रवृत्ति"
    },
    "category": "Education/Scholarships & Youth",
    "categoryTag": "Minority Girls",
    "ministry": {
      "en": "Ministry of Minority Affairs",
      "hi": "अल्पसंख्यक कार्य मंत्रालय"
    },
    "targetProfile": {
      "en": "Minority girl students in classes 9-12 with >=50% marks.",
      "hi": "कक्षा 9-12 में 50%+ अंकों वाली अल्पसंख्यक छात्राएं।"
    },
    "primaryBenefit": {
      "en": "₹5,000 to ₹6,000 per annum.",
      "hi": "₹5,000 से ₹6,000 प्रति वर्ष।"
    },
    "citationVerified": false,
    "icon": "📖",
    "clausesCount": 5,
    "officialUrl": "https://scholarships.gov.in",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"begum-hazrat-mahal\"\n)\nwhen {\n    principal.gender == \"Female\" &&\n    principal.category == \"Minority\" &&\n    [9, 10, 11, 12].contains(principal.class) &&\n    principal.familyIncome <= 200000 &&\n    principal.previousExamMarks >= 50\n};",
    "schemeId": "begum-hazrat-mahal",
    "badge": "Minority Girls",
    "targetAudience": {
      "en": "Minority girl students in classes 9-12 with >=50% marks.",
      "hi": "कक्षा 9-12 में 50%+ अंकों वाली अल्पसंख्यक छात्राएं।"
    },
    "oneLiner": {
      "en": "₹5,000 to ₹6,000 per annum.",
      "hi": "₹5,000 से ₹6,000 प्रति वर्ष।"
    },
    "policyHash": "9522482dfa7d5b9fa0ba07fc7020f303"
  },
  {
    "id": "pmrf",
    "name": {
      "en": "PMRF (Research)",
      "hi": "प्रधानमंत्री रिसर्च फेलोशिप (PMRF)"
    },
    "fullName": {
      "en": "Prime Minister's Research Fellows Scheme",
      "hi": "प्रधानमंत्री शोध अध्येता योजना"
    },
    "category": "Education/Scholarships & Youth",
    "categoryTag": "STEM Fellowship",
    "ministry": {
      "en": "Ministry of Education",
      "hi": "शिक्षा मंत्रालय"
    },
    "targetProfile": {
      "en": "PhD STEM researchers in recognized IITs/NITs/IISERs with CGPA >= 8.0.",
      "hi": "आईआईटी/एनआईटी में 8.0+ सीजीपीए वाले पीएचडी शोधार्थी।"
    },
    "primaryBenefit": {
      "en": "₹70,000 to ₹80,000 monthly fellowship.",
      "hi": "₹70,000 से ₹80,000 मासिक फेलोशिप।"
    },
    "citationVerified": false,
    "icon": "🔬",
    "clausesCount": 3,
    "officialUrl": "https://pmrf.in",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"pmrf\"\n)\nwhen {\n    principal.education == \"PhDPursuing\" &&\n    principal.institute == \"Recognized(IIT/NIT/IISER)\" &&\n    principal.CGPA >= 8.0\n};",
    "schemeId": "pmrf",
    "badge": "STEM Fellowship",
    "targetAudience": {
      "en": "PhD STEM researchers in recognized IITs/NITs/IISERs with CGPA >= 8.0.",
      "hi": "आईआईटी/एनआईटी में 8.0+ सीजीपीए वाले पीएचडी शोधार्थी।"
    },
    "oneLiner": {
      "en": "₹70,000 to ₹80,000 monthly fellowship.",
      "hi": "₹70,000 से ₹80,000 मासिक फेलोशिप।"
    },
    "policyHash": "2ef587dee093233190390b976c1964e0"
  },
  {
    "id": "national-overseas-scholarship",
    "name": {
      "en": "National Overseas (NOS)",
      "hi": "राष्ट्रीय विदेशी छात्रवृत्ति (NOS)"
    },
    "fullName": {
      "en": "National Overseas Scholarship Scheme",
      "hi": "राष्ट्रीय विदेशी छात्रवृत्ति योजना"
    },
    "category": "Education/Scholarships & Youth",
    "categoryTag": "Study Abroad",
    "ministry": {
      "en": "Ministry of Social Justice and Empowerment",
      "hi": "सामाजिक न्याय और अधिकारिता मंत्रालय"
    },
    "targetProfile": {
      "en": "SC/ST/Artisan students aged < 35 with >=60% marks and income <= ₹8 Lakh.",
      "hi": "विदेश में उच्च शिक्षा के इच्छुक एससी/एसटी छात्र।"
    },
    "primaryBenefit": {
      "en": "Full funding for Master's/Ph.D. abroad.",
      "hi": "विदेश में मास्टर/पीएचडी हेतु पूर्ण वित्तपोषण।"
    },
    "citationVerified": false,
    "icon": "✈️",
    "clausesCount": 4,
    "officialUrl": "https://nosmsje.gov.in",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"national-overseas-scholarship\"\n)\nwhen {\n    (principal.category == \"SC\" || principal.category == \"ST\") &&\n    principal.familyIncome <= 800000 &&\n    principal.age < 35 &&\n    principal.examMarks >= 60\n};",
    "schemeId": "national-overseas-scholarship",
    "badge": "Study Abroad",
    "targetAudience": {
      "en": "SC/ST/Artisan students aged < 35 with >=60% marks and income <= ₹8 Lakh.",
      "hi": "विदेश में उच्च शिक्षा के इच्छुक एससी/एसटी छात्र।"
    },
    "oneLiner": {
      "en": "Full funding for Master's/Ph.D. abroad.",
      "hi": "विदेश में मास्टर/पीएचडी हेतु पूर्ण वित्तपोषण।"
    },
    "policyHash": "7c1694c6f5c614493a44fd9c18b2b034"
  },
  {
    "id": "udaan-cbse",
    "name": {
      "en": "Udaan (CBSE)",
      "hi": "सीबीएसई उड़ान योजना"
    },
    "fullName": {
      "en": "CBSE Udaan Scheme for Girls",
      "hi": "छात्राओं के लिए सीबीएसई उड़ान योजना"
    },
    "category": "Education/Scholarships & Youth",
    "categoryTag": "Girl Coaching",
    "ministry": {
      "en": "Ministry of Education (CBSE)",
      "hi": "शिक्षा मंत्रालय (सीबीएसई)"
    },
    "targetProfile": {
      "en": "Female students in Class 11 PCM stream with family income <= ₹6 Lakh.",
      "hi": "कक्षा 11 (गणित/विज्ञान) की छात्राएं।"
    },
    "primaryBenefit": {
      "en": "Free preparation material for engineering entrance.",
      "hi": "इंजीनियरिंग प्रवेश परीक्षा हेतु मुफ्त तैयारी सामग्री।"
    },
    "citationVerified": false,
    "icon": "📐",
    "clausesCount": 4,
    "officialUrl": "https://cbseacademic.nic.in",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"udaan-cbse\"\n)\nwhen {\n    principal.gender == \"Female\" &&\n    principal.class == 11 &&\n    principal.physicsChemistryMath == true &&\n    principal.familyIncome <= 600000\n};",
    "schemeId": "udaan-cbse",
    "badge": "Girl Coaching",
    "targetAudience": {
      "en": "Female students in Class 11 PCM stream with family income <= ₹6 Lakh.",
      "hi": "कक्षा 11 (गणित/विज्ञान) की छात्राएं।"
    },
    "oneLiner": {
      "en": "Free preparation material for engineering entrance.",
      "hi": "इंजीनियरिंग प्रवेश परीक्षा हेतु मुफ्त तैयारी सामग्री।"
    },
    "policyHash": "0ed4392842134b161f0e9413d883bf9f"
  },
  {
    "id": "pmjdy",
    "name": {
      "en": "PMJDY (Jan Dhan)",
      "hi": "पीएम जन धन योजना"
    },
    "fullName": {
      "en": "Pradhan Mantri Jan Dhan Yojana",
      "hi": "प्रधानमंत्री जन धन योजना"
    },
    "category": "Pensions/Insurance & Social Security",
    "categoryTag": "Financial Inclusion",
    "ministry": {
      "en": "Ministry of Finance",
      "hi": "वित्त मंत्रालय"
    },
    "targetProfile": {
      "en": "Unbanked citizens aged 10 and above.",
      "hi": "बिना बैंक खाते वाले 10+ आयु के नागरिक।"
    },
    "primaryBenefit": {
      "en": "Zero-balance account, RuPay card, OD facility.",
      "hi": "जीरो-बैलेंस खाता, रूपे कार्ड, ओवरड्राफ्ट सुविधा।"
    },
    "citationVerified": false,
    "icon": "🏦",
    "clausesCount": 2,
    "officialUrl": "https://pmjdy.gov.in",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"pmjdy\"\n)\nwhen {\n    principal.age >= 10 &&\n    principal.hasBankAccount == false\n};",
    "schemeId": "pmjdy",
    "badge": "Financial Inclusion",
    "targetAudience": {
      "en": "Unbanked citizens aged 10 and above.",
      "hi": "बिना बैंक खाते वाले 10+ आयु के नागरिक।"
    },
    "oneLiner": {
      "en": "Zero-balance account, RuPay card, OD facility.",
      "hi": "जीरो-बैलेंस खाता, रूपे कार्ड, ओवरड्राफ्ट सुविधा।"
    },
    "policyHash": "cd84b47fba7683a78e75b3ecf94ad2e0"
  },
  {
    "id": "atal-pension-yojana",
    "name": {
      "en": "Atal Pension Yojana (APY)",
      "hi": "अटल पेंशन योजना"
    },
    "fullName": {
      "en": "Atal Pension Yojana",
      "hi": "अटल पेंशन योजना"
    },
    "category": "Pensions/Insurance & Social Security",
    "categoryTag": "Social Security",
    "ministry": {
      "en": "Ministry of Finance (PFRDA)",
      "hi": "वित्त मंत्रालय (पीएफआरडीए)"
    },
    "targetProfile": {
      "en": "Unorganized sector workers aged 18 to 40.",
      "hi": "18 से 40 वर्ष के असंगठित क्षेत्र के कामगार।"
    },
    "primaryBenefit": {
      "en": "Guaranteed pension (₹1,000 - ₹5,000) at age 60.",
      "hi": "60 वर्ष की आयु के बाद ₹1,000 से ₹5,000 गारंटीकृत पेंशन।"
    },
    "citationVerified": false,
    "icon": "🛡️",
    "clausesCount": 4,
    "officialUrl": "https://npscra.nsdl.co.in",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"atal-pension-yojana\"\n)\nwhen {\n    principal.age >= 18 &&\n    principal.age <= 40 &&\n    principal.hasBankAccount == true &&\n    principal.paysIncomeTax == false\n};",
    "schemeId": "atal-pension-yojana",
    "badge": "Social Security",
    "targetAudience": {
      "en": "Unorganized sector workers aged 18 to 40.",
      "hi": "18 से 40 वर्ष के असंगठित क्षेत्र के कामगार।"
    },
    "oneLiner": {
      "en": "Guaranteed pension (₹1,000 - ₹5,000) at age 60.",
      "hi": "60 वर्ष की आयु के बाद ₹1,000 से ₹5,000 गारंटीकृत पेंशन।"
    },
    "policyHash": "81a525927eab8bf1717d7b44847622fa"
  },
  {
    "id": "pm-sym",
    "name": {
      "en": "PM-SYM",
      "hi": "पीएम श्रम योगी मान-धन"
    },
    "fullName": {
      "en": "Pradhan Mantri Shram Yogi Maan-dhan",
      "hi": "प्रधानमंत्री श्रम योगी मान-धन योजना"
    },
    "category": "Pensions/Insurance & Social Security",
    "categoryTag": "Worker Pension",
    "ministry": {
      "en": "Ministry of Labour & Employment",
      "hi": "श्रम एवं रोजगार मंत्रालय"
    },
    "targetProfile": {
      "en": "Unorganized workers aged 18-40 with income <= ₹15,000.",
      "hi": "18-40 वर्ष के असंगठित कामगार (आय ₹15,000 तक)।"
    },
    "primaryBenefit": {
      "en": "₹3,000/month pension at age 60.",
      "hi": "60 वर्ष की आयु पर ₹3,000 प्रति माह पेंशन।"
    },
    "citationVerified": false,
    "icon": "🧰",
    "clausesCount": 5,
    "officialUrl": "https://maandhan.in",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"pm-sym\"\n)\nwhen {\n    principal.age >= 18 &&\n    principal.age <= 40 &&\n    principal.income <= 15000 &&\n    principal.hasEPFO == false &&\n    principal.hasNPS == false &&\n    principal.paysIncomeTax == false\n};",
    "schemeId": "pm-sym",
    "badge": "Worker Pension",
    "targetAudience": {
      "en": "Unorganized workers aged 18-40 with income <= ₹15,000.",
      "hi": "18-40 वर्ष के असंगठित कामगार (आय ₹15,000 तक)।"
    },
    "oneLiner": {
      "en": "₹3,000/month pension at age 60.",
      "hi": "60 वर्ष की आयु पर ₹3,000 प्रति माह पेंशन।"
    },
    "policyHash": "b3d714e211e77aab59803d6f8f2eeab2"
  },
  {
    "id": "pm-kmy",
    "name": {
      "en": "PM-KMY",
      "hi": "पीएम किसान मान-धन योजना"
    },
    "fullName": {
      "en": "Pradhan Mantri Kisan Maan-Dhan Yojana",
      "hi": "प्रधानमंत्री किसान मान-धन योजना"
    },
    "category": "Pensions/Insurance & Social Security",
    "categoryTag": "Farmer Pension",
    "ministry": {
      "en": "Ministry of Agriculture & Farmers Welfare",
      "hi": "कृषि एवं किसान कल्याण मंत्रालय"
    },
    "targetProfile": {
      "en": "Small/marginal farmers aged 18-40 with cultivable land <= 2 hectares.",
      "hi": "18-40 वर्ष के छोटे/सीमांत किसान (2 हेक्टेयर तक भूमि)।"
    },
    "primaryBenefit": {
      "en": "₹3,000/month pension at age 60.",
      "hi": "60 वर्ष की आयु पर ₹3,000 प्रति माह पेंशन।"
    },
    "citationVerified": false,
    "icon": "🚜",
    "clausesCount": 4,
    "officialUrl": "https://pmkmy.gov.in",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"pm-kmy\"\n)\nwhen {\n    principal.occupation == \"Farmer\" &&\n    principal.age >= 18 &&\n    principal.age <= 40 &&\n    principal.cultivableLand <= 2\n};",
    "schemeId": "pm-kmy",
    "badge": "Farmer Pension",
    "targetAudience": {
      "en": "Small/marginal farmers aged 18-40 with cultivable land <= 2 hectares.",
      "hi": "18-40 वर्ष के छोटे/सीमांत किसान (2 हेक्टेयर तक भूमि)।"
    },
    "oneLiner": {
      "en": "₹3,000/month pension at age 60.",
      "hi": "60 वर्ष की आयु पर ₹3,000 प्रति माह पेंशन।"
    },
    "policyHash": "a1443cce3a793531c1baca70f2f84e52"
  },
  {
    "id": "pmlvmy",
    "name": {
      "en": "PMLVMY",
      "hi": "पीएम लघु व्यापारी मान-धन"
    },
    "fullName": {
      "en": "National Pension Scheme for Traders and Self-Employed Persons",
      "hi": "व्यापारियों के लिए राष्ट्रीय पेंशन योजना"
    },
    "category": "Pensions/Insurance & Social Security",
    "categoryTag": "Trader Pension",
    "ministry": {
      "en": "Ministry of Labour & Employment",
      "hi": "श्रम एवं रोजगार मंत्रालय"
    },
    "targetProfile": {
      "en": "Small shopkeepers and retail traders aged 18-40.",
      "hi": "18-40 वर्ष के छोटे दुकानदार व व्यापारी।"
    },
    "primaryBenefit": {
      "en": "₹3,000/month pension at age 60.",
      "hi": "60 वर्ष की आयु पर ₹3,000 प्रति माह पेंशन।"
    },
    "citationVerified": false,
    "icon": "🏪",
    "clausesCount": 5,
    "officialUrl": "https://maandhan.in",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"pmlvmy\"\n)\nwhen {\n    principal.occupation == \"Trader\" &&\n    principal.age >= 18 &&\n    principal.age <= 40 &&\n    principal.annualTurnover <= 15000000 &&\n    principal.paysIncomeTax == false\n};",
    "schemeId": "pmlvmy",
    "badge": "Trader Pension",
    "targetAudience": {
      "en": "Small shopkeepers and retail traders aged 18-40.",
      "hi": "18-40 वर्ष के छोटे दुकानदार व व्यापारी।"
    },
    "oneLiner": {
      "en": "₹3,000/month pension at age 60.",
      "hi": "60 वर्ष की आयु पर ₹3,000 प्रति माह पेंशन।"
    },
    "policyHash": "22c26d935610d81353f172c9f3c8b753"
  },
  {
    "id": "ignoaps",
    "name": {
      "en": "IGNOAPS",
      "hi": "इंदिरा गांधी वृद्धावस्था पेंशन"
    },
    "fullName": {
      "en": "Indira Gandhi National Old Age Pension Scheme",
      "hi": "इंदिरा गांधी राष्ट्रीय वृद्धावस्था पेंशन योजना"
    },
    "category": "Pensions/Insurance & Social Security",
    "categoryTag": "Senior Pension",
    "ministry": {
      "en": "Ministry of Rural Development",
      "hi": "ग्रामीण विकास मंत्रालय"
    },
    "targetProfile": {
      "en": "Senior citizens aged 60+ living below the poverty line (BPL).",
      "hi": "60+ आयु के बीपीएल वरिष्ठ नागरिक।"
    },
    "primaryBenefit": {
      "en": "₹200-₹500/month old-age pension.",
      "hi": "₹200 से ₹500 प्रति माह वृद्धावस्था पेंशन।"
    },
    "citationVerified": false,
    "icon": "👴",
    "clausesCount": 2,
    "officialUrl": "https://nsap.nic.in",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"ignoaps\"\n)\nwhen {\n    principal.age >= 60 &&\n    principal.isBPL == true\n};",
    "schemeId": "ignoaps",
    "badge": "Senior Pension",
    "targetAudience": {
      "en": "Senior citizens aged 60+ living below the poverty line (BPL).",
      "hi": "60+ आयु के बीपीएल वरिष्ठ नागरिक।"
    },
    "oneLiner": {
      "en": "₹200-₹500/month old-age pension.",
      "hi": "₹200 से ₹500 प्रति माह वृद्धावस्था पेंशन।"
    },
    "policyHash": "81e1c6ed990f0bc70badf82a6af3a3a1"
  },
  {
    "id": "ignwps",
    "name": {
      "en": "IGNWPS",
      "hi": "इंदिरा गांधी विधवा पेंशन"
    },
    "fullName": {
      "en": "Indira Gandhi National Widow Pension Scheme",
      "hi": "इंदिरा गांधी राष्ट्रीय विधवा पेंशन योजना"
    },
    "category": "Pensions/Insurance & Social Security",
    "categoryTag": "Widow Pension",
    "ministry": {
      "en": "Ministry of Rural Development",
      "hi": "ग्रामीण विकास मंत्रालय"
    },
    "targetProfile": {
      "en": "BPL widows aged 40 and above.",
      "hi": "40+ आयु की बीपीएल विधवाएं।"
    },
    "primaryBenefit": {
      "en": "₹300/month widow pension.",
      "hi": "₹300 प्रति माह विधवा पेंशन।"
    },
    "citationVerified": false,
    "icon": "🧕",
    "clausesCount": 4,
    "officialUrl": "https://nsap.nic.in",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"ignwps\"\n)\nwhen {\n    principal.gender == \"Female\" &&\n    principal.maritalStatus == \"Widow\" &&\n    principal.age >= 40 &&\n    principal.isBPL == true\n};",
    "schemeId": "ignwps",
    "badge": "Widow Pension",
    "targetAudience": {
      "en": "BPL widows aged 40 and above.",
      "hi": "40+ आयु की बीपीएल विधवाएं।"
    },
    "oneLiner": {
      "en": "₹300/month widow pension.",
      "hi": "₹300 प्रति माह विधवा पेंशन।"
    },
    "policyHash": "5f6bb2c4df329e8cfa20dfb8e167a94a"
  },
  {
    "id": "igndps",
    "name": {
      "en": "IGNDPS",
      "hi": "इंदिरा गांधी दिव्यांग पेंशन"
    },
    "fullName": {
      "en": "Indira Gandhi National Disability Pension Scheme",
      "hi": "इंदिरा गांधी राष्ट्रीय दिव्यांग पेंशन योजना"
    },
    "category": "Pensions/Insurance & Social Security",
    "categoryTag": "Disability Pension",
    "ministry": {
      "en": "Ministry of Rural Development",
      "hi": "ग्रामीण विकास मंत्रालय"
    },
    "targetProfile": {
      "en": "Severely disabled persons (>=80%) aged 18+ living below poverty line.",
      "hi": "18+ आयु के गंभीर रूप से दिव्यांग (80%+) बीपीएल व्यक्ति।"
    },
    "primaryBenefit": {
      "en": "₹300/month disability pension.",
      "hi": "₹300 प्रति माह दिव्यांग पेंशन।"
    },
    "citationVerified": false,
    "icon": "♿",
    "clausesCount": 3,
    "officialUrl": "https://nsap.nic.in",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"igndps\"\n)\nwhen {\n    principal.disabilityPercentage >= 80 &&\n    principal.age >= 18 &&\n    principal.isBPL == true\n};",
    "schemeId": "igndps",
    "badge": "Disability Pension",
    "targetAudience": {
      "en": "Severely disabled persons (>=80%) aged 18+ living below poverty line.",
      "hi": "18+ आयु के गंभीर रूप से दिव्यांग (80%+) बीपीएल व्यक्ति।"
    },
    "oneLiner": {
      "en": "₹300/month disability pension.",
      "hi": "₹300 प्रति माह दिव्यांग पेंशन।"
    },
    "policyHash": "57cbfc02277c16c6b01abdac78b9a64e"
  },
  {
    "id": "pm-suraksha-bima",
    "name": {
      "en": "PM Suraksha Bima",
      "hi": "प्रधानमंत्री सुरक्षा बीमा योजना"
    },
    "fullName": {
      "en": "Pradhan Mantri Suraksha Bima Yojana",
      "hi": "प्रधानमंत्री सुरक्षा बीमा योजना"
    },
    "category": "Pensions/Insurance & Social Security",
    "categoryTag": "Accident Insurance",
    "ministry": {
      "en": "Ministry of Finance",
      "hi": "वित्त मंत्रालय"
    },
    "targetProfile": {
      "en": "Bank account holders aged 18 to 70.",
      "hi": "18 से 70 वर्ष के बैंक खाताधारक।"
    },
    "primaryBenefit": {
      "en": "Accidental death cover of ₹2 Lakhs (premium ₹20/yr).",
      "hi": "₹20/वर्ष पर ₹2 लाख का दुर्घटना बीमा।"
    },
    "citationVerified": false,
    "icon": "🛡️",
    "clausesCount": 2,
    "officialUrl": "https://jansuraksha.gov.in",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"pm-suraksha-bima\"\n)\nwhen {\n    principal.age >= 18 &&\n    principal.age <= 70 &&\n    principal.hasBankAccount == true\n};",
    "schemeId": "pm-suraksha-bima",
    "badge": "Accident Insurance",
    "targetAudience": {
      "en": "Bank account holders aged 18 to 70.",
      "hi": "18 से 70 वर्ष के बैंक खाताधारक।"
    },
    "oneLiner": {
      "en": "Accidental death cover of ₹2 Lakhs (premium ₹20/yr).",
      "hi": "₹20/वर्ष पर ₹2 लाख का दुर्घटना बीमा।"
    },
    "policyHash": "86de0b3e58616e24ba9a73aa89ff2dfb"
  },
  {
    "id": "pm-jeevan-jyoti",
    "name": {
      "en": "PM Jeevan Jyoti",
      "hi": "प्रधानमंत्री जीवन ज्योति बीमा"
    },
    "fullName": {
      "en": "Pradhan Mantri Jeevan Jyoti Bima Yojana",
      "hi": "प्रधानमंत्री जीवन ज्योति बीमा योजना"
    },
    "category": "Pensions/Insurance & Social Security",
    "categoryTag": "Life Insurance",
    "ministry": {
      "en": "Ministry of Finance",
      "hi": "वित्त मंत्रालय"
    },
    "targetProfile": {
      "en": "Bank account holders aged 18 to 50.",
      "hi": "18 से 50 वर्ष के बैंक खाताधारक।"
    },
    "primaryBenefit": {
      "en": "Life insurance cover of ₹2 Lakhs (premium ₹436/yr).",
      "hi": "₹436/वर्ष पर ₹2 लाख का जीवन बीमा।"
    },
    "citationVerified": false,
    "icon": "🩺",
    "clausesCount": 2,
    "officialUrl": "https://jansuraksha.gov.in",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"pm-jeevan-jyoti\"\n)\nwhen {\n    principal.age >= 18 &&\n    principal.age <= 50 &&\n    principal.hasBankAccount == true\n};",
    "schemeId": "pm-jeevan-jyoti",
    "badge": "Life Insurance",
    "targetAudience": {
      "en": "Bank account holders aged 18 to 50.",
      "hi": "18 से 50 वर्ष के बैंक खाताधारक।"
    },
    "oneLiner": {
      "en": "Life insurance cover of ₹2 Lakhs (premium ₹436/yr).",
      "hi": "₹436/वर्ष पर ₹2 लाख का जीवन बीमा।"
    },
    "policyHash": "abbc8c2b5eed42cceb8986455f5cd05f"
  },
  {
    "id": "ayushman-bharat",
    "name": {
      "en": "Ayushman Bharat (PM-JAY)",
      "hi": "आयुष्मान भारत (पीएम-जय)"
    },
    "fullName": {
      "en": "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana",
      "hi": "आयुष्मान भारत प्रधानमंत्री जन आरोग्य योजना"
    },
    "category": "Health/Women & Child Welfare",
    "categoryTag": "Healthcare",
    "ministry": {
      "en": "Ministry of Health & Family Welfare (NHA)",
      "hi": "स्वास्थ्य एवं परिवार कल्याण मंत्रालय"
    },
    "targetProfile": {
      "en": "SECC 2011 poor households, ration card holders, or all citizens aged 70+.",
      "hi": "SECC 2011, राशन कार्ड धारक, या 70+ आयु के वरिष्ठ नागरिक।"
    },
    "primaryBenefit": {
      "en": "₹5 Lakhs free health insurance per family/year.",
      "hi": "प्रति परिवार प्रति वर्ष ₹5 लाख का मुफ्त स्वास्थ्य बीमा।"
    },
    "citationVerified": false,
    "icon": "🏥",
    "clausesCount": 3,
    "officialUrl": "https://pmjay.gov.in",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"ayushman-bharat\"\n)\nwhen {\n    principal.listedInSECC2011 == true ||\n    principal.holdsRationCard == true ||\n    principal.age >= 70\n};",
    "schemeId": "ayushman-bharat",
    "badge": "Healthcare",
    "targetAudience": {
      "en": "SECC 2011 poor households, ration card holders, or all citizens aged 70+.",
      "hi": "SECC 2011, राशन कार्ड धारक, या 70+ आयु के वरिष्ठ नागरिक।"
    },
    "oneLiner": {
      "en": "₹5 Lakhs free health insurance per family/year.",
      "hi": "प्रति परिवार प्रति वर्ष ₹5 लाख का मुफ्त स्वास्थ्य बीमा।"
    },
    "policyHash": "12fb51b25fdf2019af4f80de9db522a2"
  },
  {
    "id": "pmmvy",
    "name": {
      "en": "PMMVY (Matru Vandana)",
      "hi": "पीएम मातृ वंदना योजना"
    },
    "fullName": {
      "en": "Pradhan Mantri Matru Vandana Yojana",
      "hi": "प्रधानमंत्री मातृ वंदना योजना"
    },
    "category": "Health/Women & Child Welfare",
    "categoryTag": "Maternity Support",
    "ministry": {
      "en": "Ministry of Women and Child Development",
      "hi": "महिला एवं बाल विकास मंत्रालय"
    },
    "targetProfile": {
      "en": "Pregnant women for their first living child (non-government employees).",
      "hi": "पहले बच्चे के लिए गर्भवती महिलाएं (गैर-सरकारी)।"
    },
    "primaryBenefit": {
      "en": "₹5,000 cash transfer for nutrition.",
      "hi": "पोषण सहायता हेतु ₹5,000 का प्रत्यक्ष नकद अंतरण।"
    },
    "citationVerified": false,
    "icon": "🤱",
    "clausesCount": 4,
    "officialUrl": "https://pmmvy.wcd.gov.in",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"pmmvy\"\n)\nwhen {\n    principal.gender == \"Female\" &&\n    principal.isPregnantOrLactating == true &&\n    principal.isFirstChild == true &&\n    principal.isGovernmentEmployee == false\n};",
    "schemeId": "pmmvy",
    "badge": "Maternity Support",
    "targetAudience": {
      "en": "Pregnant women for their first living child (non-government employees).",
      "hi": "पहले बच्चे के लिए गर्भवती महिलाएं (गैर-सरकारी)।"
    },
    "oneLiner": {
      "en": "₹5,000 cash transfer for nutrition.",
      "hi": "पोषण सहायता हेतु ₹5,000 का प्रत्यक्ष नकद अंतरण।"
    },
    "policyHash": "a2d34d6a39e9737119650777611cc8d2"
  },
  {
    "id": "sukanya-samriddhi",
    "name": {
      "en": "Sukanya Samriddhi",
      "hi": "सुकन्या समृद्धि योजना"
    },
    "fullName": {
      "en": "Sukanya Samriddhi Account Scheme",
      "hi": "सुकन्या समृद्धि खाता योजना"
    },
    "category": "Health/Women & Child Welfare",
    "categoryTag": "Girl Savings",
    "ministry": {
      "en": "Ministry of Finance",
      "hi": "वित्त मंत्रालय"
    },
    "targetProfile": {
      "en": "Parents of girl child aged 10 or younger (max 2 per family).",
      "hi": "10 वर्ष या उससे कम आयु की बालिकाओं के अभिभावक।"
    },
    "primaryBenefit": {
      "en": "High-interest tax-free savings account.",
      "hi": "उच्च ब्याज वाली कर-मुक्त बचत योजना।"
    },
    "citationVerified": false,
    "icon": "👧",
    "clausesCount": 3,
    "officialUrl": "https://www.indiapost.gov.in",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"sukanya-samriddhi\"\n)\nwhen {\n    principal.gender == \"Female\" &&\n    principal.age <= 10 &&\n    principal.maxAccountsPerFamily <= 2\n};",
    "schemeId": "sukanya-samriddhi",
    "badge": "Girl Savings",
    "targetAudience": {
      "en": "Parents of girl child aged 10 or younger (max 2 per family).",
      "hi": "10 वर्ष या उससे कम आयु की बालिकाओं के अभिभावक।"
    },
    "oneLiner": {
      "en": "High-interest tax-free savings account.",
      "hi": "उच्च ब्याज वाली कर-मुक्त बचत योजना।"
    },
    "policyHash": "597fa676afb3a8176de87b2e60a5531e"
  },
  {
    "id": "pm-ujjwala",
    "name": {
      "en": "PM Ujjwala Yojana",
      "hi": "प्रधानमंत्री उज्ज्वला योजना"
    },
    "fullName": {
      "en": "Pradhan Mantri Ujjwala Yojana",
      "hi": "प्रधानमंत्री उज्ज्वला योजना"
    },
    "category": "Health/Women & Child Welfare",
    "categoryTag": "Clean Cooking",
    "ministry": {
      "en": "Ministry of Petroleum & Natural Gas",
      "hi": "पेट्रोलियम एवं प्राकृतिक गैस मंत्रालय"
    },
    "targetProfile": {
      "en": "Adult women from BPL households having no existing LPG connection.",
      "hi": "बीपीएल परिवारों की 18+ आयु की महिलाएं।"
    },
    "primaryBenefit": {
      "en": "Free LPG gas connection.",
      "hi": "मुफ्त एलपीजी गैस कनेक्शन।"
    },
    "citationVerified": false,
    "icon": "🔥",
    "clausesCount": 4,
    "officialUrl": "https://www.pmuy.gov.in",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"pm-ujjwala\"\n)\nwhen {\n    principal.gender == \"Female\" &&\n    principal.age >= 18 &&\n    principal.isBPL == true &&\n    principal.hasExistingLPG == false\n};",
    "schemeId": "pm-ujjwala",
    "badge": "Clean Cooking",
    "targetAudience": {
      "en": "Adult women from BPL households having no existing LPG connection.",
      "hi": "बीपीएल परिवारों की 18+ आयु की महिलाएं।"
    },
    "oneLiner": {
      "en": "Free LPG gas connection.",
      "hi": "मुफ्त एलपीजी गैस कनेक्शन।"
    },
    "policyHash": "312ecd197aed6d42425a24346eda93b2"
  },
  {
    "id": "janani-suraksha",
    "name": {
      "en": "Janani Suraksha (JSY)",
      "hi": "जननी सुरक्षा योजना"
    },
    "fullName": {
      "en": "Janani Suraksha Yojana",
      "hi": "जननी सुरक्षा योजना"
    },
    "category": "Health/Women & Child Welfare",
    "categoryTag": "Institutional Delivery",
    "ministry": {
      "en": "Ministry of Health & Family Welfare",
      "hi": "स्वास्थ्य एवं परिवार कल्याण मंत्रालय"
    },
    "targetProfile": {
      "en": "Pregnant women in BPL households opting for institutional delivery.",
      "hi": "संस्थागत प्रसव कराने वाली बीपीएल गर्भवती महिलाएं।"
    },
    "primaryBenefit": {
      "en": "Cash assistance for institutional delivery.",
      "hi": "संस्थागत प्रसव हेतु नकद सहायता।"
    },
    "citationVerified": false,
    "icon": "🏥",
    "clausesCount": 4,
    "officialUrl": "https://nhm.gov.in",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"janani-suraksha\"\n)\nwhen {\n    principal.gender == \"Female\" &&\n    principal.isPregnant == true &&\n    principal.isBPL == true &&\n    principal.deliveryType == \"Institutional\"\n};",
    "schemeId": "janani-suraksha",
    "badge": "Institutional Delivery",
    "targetAudience": {
      "en": "Pregnant women in BPL households opting for institutional delivery.",
      "hi": "संस्थागत प्रसव कराने वाली बीपीएल गर्भवती महिलाएं।"
    },
    "oneLiner": {
      "en": "Cash assistance for institutional delivery.",
      "hi": "संस्थागत प्रसव हेतु नकद सहायता।"
    },
    "policyHash": "7aae1afc3f0d5012215111a438c6ff6f"
  },
  {
    "id": "poshan-abhiyaan",
    "name": {
      "en": "POSHAN Abhiyaan",
      "hi": "पोषण अभियान"
    },
    "fullName": {
      "en": "National Nutrition Mission",
      "hi": "राष्ट्रीय पोषण मिशन"
    },
    "category": "Health/Women & Child Welfare",
    "categoryTag": "Nutrition",
    "ministry": {
      "en": "Ministry of Women and Child Development",
      "hi": "महिला एवं बाल विकास मंत्रालय"
    },
    "targetProfile": {
      "en": "Children under 6, pregnant women, and lactating mothers.",
      "hi": "6 वर्ष तक के बच्चे, गर्भवती एवं धात्री महिलाएं।"
    },
    "primaryBenefit": {
      "en": "Nutritional support and monitoring.",
      "hi": "पोषण सहायता और नियमित स्वास्थ्य निगरानी।"
    },
    "citationVerified": false,
    "icon": "🥣",
    "clausesCount": 3,
    "officialUrl": "https://poshanabhiyaan.gov.in",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"poshan-abhiyaan\"\n)\nwhen {\n    (principal.age <= 6) ||\n    (principal.gender == \"Female\" && (principal.isPregnant == true || principal.isLactating == true || (principal.age >= 15 && principal.age <= 49)))\n};",
    "schemeId": "poshan-abhiyaan",
    "badge": "Nutrition",
    "targetAudience": {
      "en": "Children under 6, pregnant women, and lactating mothers.",
      "hi": "6 वर्ष तक के बच्चे, गर्भवती एवं धात्री महिलाएं।"
    },
    "oneLiner": {
      "en": "Nutritional support and monitoring.",
      "hi": "पोषण सहायता और नियमित स्वास्थ्य निगरानी।"
    },
    "policyHash": "3567ea6f9fc26c9e6fa2a974b08f5e11"
  },
  {
    "id": "nikshay-poshan",
    "name": {
      "en": "Nikshay Poshan",
      "hi": "निक्षय पोषण योजना"
    },
    "fullName": {
      "en": "Nikshay Poshan Yojana for TB Patients",
      "hi": "टीबी रोगियों के लिए निक्षय पोषण योजना"
    },
    "category": "Health/Women & Child Welfare",
    "categoryTag": "TB Support",
    "ministry": {
      "en": "Ministry of Health & Family Welfare",
      "hi": "स्वास्थ्य एवं परिवार कल्याण मंत्रालय"
    },
    "targetProfile": {
      "en": "Tuberculosis (TB) patients registered on Nikshay portal.",
      "hi": "निक्षय पोर्टल पर पंजीकृत टीबी रोगी।"
    },
    "primaryBenefit": {
      "en": "₹500/month nutritional support during treatment.",
      "hi": "उपचार के दौरान ₹500 प्रति माह पोषण सहायता।"
    },
    "citationVerified": false,
    "icon": "💊",
    "clausesCount": 2,
    "officialUrl": "https://nikshay.in",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"nikshay-poshan\"\n)\nwhen {\n    principal.diagnosedWithTB == true &&\n    principal.registeredOnNikshayPortal == true\n};",
    "schemeId": "nikshay-poshan",
    "badge": "TB Support",
    "targetAudience": {
      "en": "Tuberculosis (TB) patients registered on Nikshay portal.",
      "hi": "निक्षय पोर्टल पर पंजीकृत टीबी रोगी।"
    },
    "oneLiner": {
      "en": "₹500/month nutritional support during treatment.",
      "hi": "उपचार के दौरान ₹500 प्रति माह पोषण सहायता।"
    },
    "policyHash": "69cde83da2de13eca9af6cfe1b2e7761"
  },
  {
    "id": "mission-vatsalya",
    "name": {
      "en": "Mission Vatsalya",
      "hi": "मिशन वात्सल्य"
    },
    "fullName": {
      "en": "Mission Vatsalya Child Protection Scheme",
      "hi": "मिशन वात्सल्य बाल संरक्षण योजना"
    },
    "category": "Health/Women & Child Welfare",
    "categoryTag": "Child Protection",
    "ministry": {
      "en": "Ministry of Women and Child Development",
      "hi": "महिला एवं बाल विकास मंत्रालय"
    },
    "targetProfile": {
      "en": "Vulnerable children aged < 18 (orphans, abandoned, in conflict with law).",
      "hi": "18 वर्ष से कम आयु के अनाथ या संकटग्रस्त बच्चे।"
    },
    "primaryBenefit": {
      "en": "Non-institutional and institutional child care.",
      "hi": "संस्थागत एवं गैर-संस्थागत बाल देखभाल सहायता।"
    },
    "citationVerified": false,
    "icon": "🧸",
    "clausesCount": 2,
    "officialUrl": "https://wcd.nic.in",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"mission-vatsalya\"\n)\nwhen {\n    principal.age < 18 &&\n    (principal.isOrphan == true || principal.isAbandoned == true || principal.inConflictWithLaw == true)\n};",
    "schemeId": "mission-vatsalya",
    "badge": "Child Protection",
    "targetAudience": {
      "en": "Vulnerable children aged < 18 (orphans, abandoned, in conflict with law).",
      "hi": "18 वर्ष से कम आयु के अनाथ या संकटग्रस्त बच्चे।"
    },
    "oneLiner": {
      "en": "Non-institutional and institutional child care.",
      "hi": "संस्थागत एवं गैर-संस्थागत बाल देखभाल सहायता।"
    },
    "policyHash": "d0dd9332ce94493e58cfaeec975a90dd"
  },
  {
    "id": "mahila-samman-savings",
    "name": {
      "en": "Mahila Samman Savings",
      "hi": "महिला सम्मान बचत प्रमाण पत्र"
    },
    "fullName": {
      "en": "Mahila Samman Savings Certificate Scheme",
      "hi": "महिला सम्मान बचत प्रमाण पत्र योजना"
    },
    "category": "Health/Women & Child Welfare",
    "categoryTag": "Women Savings",
    "ministry": {
      "en": "Ministry of Finance",
      "hi": "वित्त मंत्रालय"
    },
    "targetProfile": {
      "en": "Women or girl children.",
      "hi": "महिलाएं अथवा बालिकाएं।"
    },
    "primaryBenefit": {
      "en": "High-interest (7.5%) 2-year fixed deposit.",
      "hi": "7.5% उच्च ब्याज दर वाला 2 वर्षीय सावधि जमा।"
    },
    "citationVerified": false,
    "icon": "🪙",
    "clausesCount": 1,
    "officialUrl": "https://indiapost.gov.in",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"mahila-samman-savings\"\n)\nwhen {\n    principal.gender == \"Female\"\n};",
    "schemeId": "mahila-samman-savings",
    "badge": "Women Savings",
    "targetAudience": {
      "en": "Women or girl children.",
      "hi": "महिलाएं अथवा बालिकाएं।"
    },
    "oneLiner": {
      "en": "High-interest (7.5%) 2-year fixed deposit.",
      "hi": "7.5% उच्च ब्याज दर वाला 2 वर्षीय सावधि जमा।"
    },
    "policyHash": "e8761768b02500ad759658f3f10422a2"
  },
  {
    "id": "pm-bjp-janaushadhi",
    "name": {
      "en": "PM-BJP (Janaushadhi)",
      "hi": "पीएम जनऔषधि परियोजना"
    },
    "fullName": {
      "en": "Pradhan Mantri Bhartiya Janaushadhi Pariyojana",
      "hi": "प्रधानमंत्री भारतीय जनऔषधि परियोजना"
    },
    "category": "Health/Women & Child Welfare",
    "categoryTag": "Affordable Medicine",
    "ministry": {
      "en": "Ministry of Chemicals and Fertilizers",
      "hi": "रसायन एवं उर्वरक मंत्रालय"
    },
    "targetProfile": {
      "en": "All Indian citizens.",
      "hi": "सभी भारतीय नागरिक।"
    },
    "primaryBenefit": {
      "en": "Generic medicines at 50-90% cheaper rates.",
      "hi": "50-90% कम दरों पर गुणवत्तापूर्ण जेनेरिक दवाएं।"
    },
    "citationVerified": false,
    "icon": "🩹",
    "clausesCount": 1,
    "officialUrl": "https://janaushadhi.gov.in",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"pm-bjp-janaushadhi\"\n)\nwhen {\n    principal.citizenship == \"Indian\"\n};",
    "schemeId": "pm-bjp-janaushadhi",
    "badge": "Affordable Medicine",
    "targetAudience": {
      "en": "All Indian citizens.",
      "hi": "सभी भारतीय नागरिक।"
    },
    "oneLiner": {
      "en": "Generic medicines at 50-90% cheaper rates.",
      "hi": "50-90% कम दरों पर गुणवत्तापूर्ण जेनेरिक दवाएं।"
    },
    "policyHash": "9538c04d98ad2d65051fd71fda234b33"
  },
  {
    "id": "pm-mudra",
    "name": {
      "en": "PM Mudra Yojana",
      "hi": "प्रधानमंत्री मुद्रा योजना"
    },
    "fullName": {
      "en": "Pradhan Mantri MUDRA Yojana",
      "hi": "प्रधानमंत्री मुद्रा योजना"
    },
    "category": "Entrepreneurship/Skilling & Urban Welfare",
    "categoryTag": "Micro Loans",
    "ministry": {
      "en": "Ministry of Finance",
      "hi": "वित्त मंत्रालय"
    },
    "targetProfile": {
      "en": "Non-corporate small business owners seeking loans up to ₹10 Lakhs.",
      "hi": "लघु व्यवसाय उद्यमी (ऋण ₹10 लाख तक)।"
    },
    "primaryBenefit": {
      "en": "Collateral-free business loans up to ₹10 Lakhs.",
      "hi": "₹10 लाख तक का संपार्श्विक-मुक्त व्यापार ऋण।"
    },
    "citationVerified": false,
    "icon": "💼",
    "clausesCount": 3,
    "officialUrl": "https://www.mudra.org.in",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"pm-mudra\"\n)\nwhen {\n    principal.entityType == \"NonCorporateSmallBusiness\" &&\n    principal.loanAmountRequested <= 1000000 &&\n    principal.isDefaulter == false\n};",
    "schemeId": "pm-mudra",
    "badge": "Micro Loans",
    "targetAudience": {
      "en": "Non-corporate small business owners seeking loans up to ₹10 Lakhs.",
      "hi": "लघु व्यवसाय उद्यमी (ऋण ₹10 लाख तक)।"
    },
    "oneLiner": {
      "en": "Collateral-free business loans up to ₹10 Lakhs.",
      "hi": "₹10 लाख तक का संपार्श्विक-मुक्त व्यापार ऋण।"
    },
    "policyHash": "a3f241e755cdb8109621759907853691"
  },
  {
    "id": "stand-up-india",
    "name": {
      "en": "Stand-Up India",
      "hi": "स्टैंड-अप इंडिया"
    },
    "fullName": {
      "en": "Stand-Up India Scheme for Greenfield Enterprises",
      "hi": "ग्रीनफील्ड उद्यमों के लिए स्टैंड-अप इंडिया"
    },
    "category": "Entrepreneurship/Skilling & Urban Welfare",
    "categoryTag": "SC/ST/Women Founders",
    "ministry": {
      "en": "Ministry of Finance",
      "hi": "वित्त मंत्रालय"
    },
    "targetProfile": {
      "en": "SC, ST, or female entrepreneurs starting greenfield ventures.",
      "hi": "एससी/एसटी या महिला उद्यमी जो नया उद्यम शुरू कर रहे हैं।"
    },
    "primaryBenefit": {
      "en": "Bank loans from ₹10 Lakhs to ₹1 Crore.",
      "hi": "₹10 लाख से ₹1 करोड़ तक का बैंक ऋण।"
    },
    "citationVerified": false,
    "icon": "🚀",
    "clausesCount": 3,
    "officialUrl": "https://www.standupmitra.in",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"stand-up-india\"\n)\nwhen {\n    (principal.category == \"SC\" || principal.category == \"ST\" || principal.gender == \"Female\") &&\n    principal.age >= 18 &&\n    principal.projectType == \"Greenfield\"\n};",
    "schemeId": "stand-up-india",
    "badge": "SC/ST/Women Founders",
    "targetAudience": {
      "en": "SC, ST, or female entrepreneurs starting greenfield ventures.",
      "hi": "एससी/एसटी या महिला उद्यमी जो नया उद्यम शुरू कर रहे हैं।"
    },
    "oneLiner": {
      "en": "Bank loans from ₹10 Lakhs to ₹1 Crore.",
      "hi": "₹10 लाख से ₹1 करोड़ तक का बैंक ऋण।"
    },
    "policyHash": "ee84649cf7272cf63b637cd579a3fca7"
  },
  {
    "id": "pm-svanidhi",
    "name": {
      "en": "PM SVANidhi",
      "hi": "पीएम स्वनिधि योजना"
    },
    "fullName": {
      "en": "PM Street Vendor's AtmaNirbhar Nidhi",
      "hi": "प्रधानमंत्री स्ट्रीट वेंडर्स आत्मनिर्भर निधि"
    },
    "category": "Entrepreneurship/Skilling & Urban Welfare",
    "categoryTag": "Street Vendors",
    "ministry": {
      "en": "Ministry of Housing and Urban Affairs",
      "hi": "आवासन एवं शहरी कार्य मंत्रालय"
    },
    "targetProfile": {
      "en": "Street vendors active before March 2020.",
      "hi": "मार्च 2020 से पूर्व सक्रिय रेहड़ी-पटरी विक्रेता।"
    },
    "primaryBenefit": {
      "en": "Collateral-free working capital loan of ₹10,000.",
      "hi": "₹10,000 का संपार्श्विक-मुक्त कार्यशील पूंजी ऋण।"
    },
    "citationVerified": false,
    "icon": "🛒",
    "clausesCount": 2,
    "officialUrl": "https://pmsvanidhi.mohua.gov.in",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"pm-svanidhi\"\n)\nwhen {\n    principal.occupation == \"StreetVendor\" &&\n    principal.vendingStartedBefore == \"March2020\"\n};",
    "schemeId": "pm-svanidhi",
    "badge": "Street Vendors",
    "targetAudience": {
      "en": "Street vendors active before March 2020.",
      "hi": "मार्च 2020 से पूर्व सक्रिय रेहड़ी-पटरी विक्रेता।"
    },
    "oneLiner": {
      "en": "Collateral-free working capital loan of ₹10,000.",
      "hi": "₹10,000 का संपार्श्विक-मुक्त कार्यशील पूंजी ऋण।"
    },
    "policyHash": "77684ba386711840f349f40ed7624b7d"
  },
  {
    "id": "pm-vishwakarma",
    "name": {
      "en": "PM Vishwakarma",
      "hi": "पीएम विश्वकर्मा"
    },
    "fullName": {
      "en": "PM Vishwakarma Scheme",
      "hi": "पीएम विश्वकर्मा योजना"
    },
    "category": "Entrepreneurship/Skilling & Urban Welfare",
    "categoryTag": "Artisans & Crafts",
    "ministry": {
      "en": "Ministry of Micro, Small and Medium Enterprises",
      "hi": "सूक्ष्म, लघु और मध्यम उद्यम मंत्रालय"
    },
    "targetProfile": {
      "en": "Traditional artisans working in recognized trades aged 18+.",
      "hi": "18 पारंपरिक शिल्पों में कार्यरत कारीगर।"
    },
    "primaryBenefit": {
      "en": "₹15,000 toolkit incentive, collateral-free credit.",
      "hi": "₹15,000 टूलकिट अनुदान, रियायती ऋण।"
    },
    "citationVerified": true,
    "icon": "✂️",
    "clausesCount": 5,
    "officialUrl": "https://pmvishwakarma.gov.in",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"pm-vishwakarma\"\n)\nwhen {\n    [\"Carpenter\", \"Blacksmith\", \"Potter\"].contains(principal.occupation) &&\n    principal.age >= 18 &&\n    principal.availedSimilarLoanInPast5Years == false\n};",
    "schemeId": "pm-vishwakarma",
    "badge": "Artisans & Crafts",
    "targetAudience": {
      "en": "Traditional artisans working in recognized trades aged 18+.",
      "hi": "18 पारंपरिक शिल्पों में कार्यरत कारीगर।"
    },
    "oneLiner": {
      "en": "₹15,000 toolkit incentive, collateral-free credit.",
      "hi": "₹15,000 टूलकिट अनुदान, रियायती ऋण।"
    },
    "policyHash": "2dfee6f0a1b5063273ca40807d480f6b"
  },
  {
    "id": "pmay-urban",
    "name": {
      "en": "PMAY-Urban",
      "hi": "पीएम आवास योजना - शहरी"
    },
    "fullName": {
      "en": "Pradhan Mantri Awas Yojana - Urban",
      "hi": "प्रधानमंत्री आवास योजना - शहरी"
    },
    "category": "Entrepreneurship/Skilling & Urban Welfare",
    "categoryTag": "Urban Housing",
    "ministry": {
      "en": "Ministry of Housing and Urban Affairs",
      "hi": "आवासन एवं शहरी कार्य मंत्रालय"
    },
    "targetProfile": {
      "en": "Urban homeless/poor households with family income <= ₹18 Lakh.",
      "hi": "बिना पक्के मकान वाले शहरी परिवार (पारिवारिक आय ₹18 लाख तक)।"
    },
    "primaryBenefit": {
      "en": "Credit-linked subsidy for home loans.",
      "hi": "होम लोन पर क्रेडिट-लिंक्ड ब्याज सब्सिडी।"
    },
    "citationVerified": false,
    "icon": "🏢",
    "clausesCount": 3,
    "officialUrl": "https://pmay-urban.gov.in",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"pmay-urban\"\n)\nwhen {\n    principal.residenceArea == \"Urban\" &&\n    principal.ownsPuccaHouse == false &&\n    principal.familyIncome <= 1800000\n};",
    "schemeId": "pmay-urban",
    "badge": "Urban Housing",
    "targetAudience": {
      "en": "Urban homeless/poor households with family income <= ₹18 Lakh.",
      "hi": "बिना पक्के मकान वाले शहरी परिवार (पारिवारिक आय ₹18 लाख तक)।"
    },
    "oneLiner": {
      "en": "Credit-linked subsidy for home loans.",
      "hi": "होम लोन पर क्रेडिट-लिंक्ड ब्याज सब्सिडी।"
    },
    "policyHash": "dd1715c5b29c28f53e27828f88b7eada"
  },
  {
    "id": "pmkvy",
    "name": {
      "en": "PMKVY (Kaushal Vikas)",
      "hi": "प्रधानमंत्री कौशल विकास योजना"
    },
    "fullName": {
      "en": "Pradhan Mantri Kaushal Vikas Yojana",
      "hi": "प्रधानमंत्री कौशल विकास योजना"
    },
    "category": "Entrepreneurship/Skilling & Urban Welfare",
    "categoryTag": "Skill Development",
    "ministry": {
      "en": "Ministry of Skill Development and Entrepreneurship",
      "hi": "कौशल विकास और उद्यमिता मंत्रालय"
    },
    "targetProfile": {
      "en": "Unemployed youth or dropouts aged 15 to 45 seeking skill training.",
      "hi": "15 से 45 वर्ष के युवा जो कौशल प्रशिक्षण चाहते हैं।"
    },
    "primaryBenefit": {
      "en": "Free industry-aligned skill certification.",
      "hi": "मुफ्त उद्योग-उन्मुख कौशल प्रमाणन।"
    },
    "citationVerified": false,
    "icon": "🏅",
    "clausesCount": 3,
    "officialUrl": "https://www.pmkvyofficial.org",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"pmkvy\"\n)\nwhen {\n    principal.age >= 15 &&\n    principal.age <= 45 &&\n    (principal.educationDropout == true || principal.seekingSkillTraining == true)\n};",
    "schemeId": "pmkvy",
    "badge": "Skill Development",
    "targetAudience": {
      "en": "Unemployed youth or dropouts aged 15 to 45 seeking skill training.",
      "hi": "15 से 45 वर्ष के युवा जो कौशल प्रशिक्षण चाहते हैं।"
    },
    "oneLiner": {
      "en": "Free industry-aligned skill certification.",
      "hi": "मुफ्त उद्योग-उन्मुख कौशल प्रमाणन।"
    },
    "policyHash": "082cac8954c64ef74d43c1ffcf51b4f3"
  },
  {
    "id": "naps",
    "name": {
      "en": "NAPS (Apprenticeship)",
      "hi": "राष्ट्रीय शिक्षुता प्रोत्साहन (NAPS)"
    },
    "fullName": {
      "en": "National Apprenticeship Promotion Scheme",
      "hi": "राष्ट्रीय शिक्षुता प्रोत्साहन योजना"
    },
    "category": "Entrepreneurship/Skilling & Urban Welfare",
    "categoryTag": "Apprenticeship",
    "ministry": {
      "en": "Ministry of Skill Development and Entrepreneurship",
      "hi": "कौशल विकास और उद्यमिता मंत्रालय"
    },
    "targetProfile": {
      "en": "Apprentices aged 14+ with Class 5 education registered on portal.",
      "hi": "14+ आयु के शिक्षु (कक्षा 5 उत्तीर्ण)।"
    },
    "primaryBenefit": {
      "en": "Stipend support during on-the-job training.",
      "hi": "प्रशिक्षण के दौरान वजीफा सहायता।"
    },
    "citationVerified": false,
    "icon": "🔧",
    "clausesCount": 3,
    "officialUrl": "https://www.apprenticeshipindia.gov.in",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"naps\"\n)\nwhen {\n    principal.age >= 14 &&\n    principal.education >= \"Class5\" &&\n    principal.isRegisteredOnApprenticeshipPortal == true\n};",
    "schemeId": "naps",
    "badge": "Apprenticeship",
    "targetAudience": {
      "en": "Apprentices aged 14+ with Class 5 education registered on portal.",
      "hi": "14+ आयु के शिक्षु (कक्षा 5 उत्तीर्ण)।"
    },
    "oneLiner": {
      "en": "Stipend support during on-the-job training.",
      "hi": "प्रशिक्षण के दौरान वजीफा सहायता।"
    },
    "policyHash": "92296808bbb771b25681692832ab099f"
  },
  {
    "id": "pmegp",
    "name": {
      "en": "PMEGP",
      "hi": "प्रधानमंत्री रोजगार सृजन कार्यक्रम"
    },
    "fullName": {
      "en": "Prime Minister's Employment Generation Programme",
      "hi": "प्रधानमंत्री रोजगार सृजन कार्यक्रम"
    },
    "category": "Entrepreneurship/Skilling & Urban Welfare",
    "categoryTag": "Self-Employment",
    "ministry": {
      "en": "Ministry of Micro, Small and Medium Enterprises",
      "hi": "सूक्ष्म, लघु और मध्यम उद्यम मंत्रालय"
    },
    "targetProfile": {
      "en": "Entrepreneurs aged 18+ setting up micro enterprises.",
      "hi": "18+ आयु के सूक्ष्म उद्यम स्थापित करने वाले नागरिक।"
    },
    "primaryBenefit": {
      "en": "Subsidy (up to 35%) on business projects.",
      "hi": "परियोजना लागत पर 35% तक सब्सिडी।"
    },
    "citationVerified": false,
    "icon": "🏭",
    "clausesCount": 3,
    "officialUrl": "https://www.kviconline.gov.in",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"pmegp\"\n)\nwhen {\n    principal.age >= 18 &&\n    principal.education >= \"Class8\" &&\n    (principal.projectCost <= 5000000 || principal.projectCost <= 2000000)\n};",
    "schemeId": "pmegp",
    "badge": "Self-Employment",
    "targetAudience": {
      "en": "Entrepreneurs aged 18+ setting up micro enterprises.",
      "hi": "18+ आयु के सूक्ष्म उद्यम स्थापित करने वाले नागरिक।"
    },
    "oneLiner": {
      "en": "Subsidy (up to 35%) on business projects.",
      "hi": "परियोजना लागत पर 35% तक सब्सिडी।"
    },
    "policyHash": "31747fed509b51a394bb5661e1749450"
  },
  {
    "id": "cgtmse",
    "name": {
      "en": "CGTMSE",
      "hi": "सीजीटीएमएसई क्रेडिट गारंटी"
    },
    "fullName": {
      "en": "Credit Guarantee Fund Trust for Micro and Small Enterprises",
      "hi": "सूक्ष्म एवं लघु उद्यम क्रेडिट गारंटी फंड ट्रस्ट"
    },
    "category": "Entrepreneurship/Skilling & Urban Welfare",
    "categoryTag": "MSME Credit",
    "ministry": {
      "en": "Ministry of Micro, Small and Medium Enterprises",
      "hi": "सूक्ष्म, लघु और मध्यम उद्यम मंत्रालय"
    },
    "targetProfile": {
      "en": "MSMEs holding Udyam registration seeking bank credit.",
      "hi": "उद्यम पंजीकृत सूक्ष्म एवं लघु उद्योग।"
    },
    "primaryBenefit": {
      "en": "Credit guarantee to banks for collateral-free MSME loans.",
      "hi": "संपार्श्विक-मुक्त एमएसएमई ऋणों के लिए बैंकों को गारंटी।"
    },
    "citationVerified": false,
    "icon": "🏭",
    "clausesCount": 3,
    "officialUrl": "https://www.cgtmse.in",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"cgtmse\"\n)\nwhen {\n    principal.entityType == \"MSME\" &&\n    principal.holdsUdyamRegistration == true &&\n    principal.loanAmount <= 50000000\n};",
    "schemeId": "cgtmse",
    "badge": "MSME Credit",
    "targetAudience": {
      "en": "MSMEs holding Udyam registration seeking bank credit.",
      "hi": "उद्यम पंजीकृत सूक्ष्म एवं लघु उद्योग।"
    },
    "oneLiner": {
      "en": "Credit guarantee to banks for collateral-free MSME loans.",
      "hi": "संपार्श्विक-मुक्त एमएसएमई ऋणों के लिए बैंकों को गारंटी।"
    },
    "policyHash": "ab296c5e7e54983b7b974488879db162"
  },
  {
    "id": "svamitva",
    "name": {
      "en": "SVAMITVA",
      "hi": "स्वामित्व योजना"
    },
    "fullName": {
      "en": "Survey of Villages and Mapping with Improvised Technology in Village Areas",
      "hi": "स्वामित्व योजना (ग्रामीण ड्रोन मैपिंग)"
    },
    "category": "Entrepreneurship/Skilling & Urban Welfare",
    "categoryTag": "Land Rights",
    "ministry": {
      "en": "Ministry of Panchayati Raj",
      "hi": "पंचायती राज मंत्रालय"
    },
    "targetProfile": {
      "en": "Rural property owners occupying inhabited village land.",
      "hi": "ग्रामीण आबादी भूमि पर बसे संपत्ति मालिक।"
    },
    "primaryBenefit": {
      "en": "Physical property cards (drones mapping land).",
      "hi": "ड्रोन मैपिंग द्वारा आधिकारिक संपत्ति कार्ड।"
    },
    "citationVerified": false,
    "icon": "🗺️",
    "clausesCount": 2,
    "officialUrl": "https://svamitva.nic.in",
    "cedarPolicy": "permit (\n    principal,\n    action == Action::\"Claim\",\n    resource == Scheme::\"svamitva\"\n)\nwhen {\n    principal.residenceArea == \"Rural\" &&\n    principal.occupiesVillageAbadiLand == true\n};",
    "schemeId": "svamitva",
    "badge": "Land Rights",
    "targetAudience": {
      "en": "Rural property owners occupying inhabited village land.",
      "hi": "ग्रामीण आबादी भूमि पर बसे संपत्ति मालिक।"
    },
    "oneLiner": {
      "en": "Physical property cards (drones mapping land).",
      "hi": "ड्रोन मैपिंग द्वारा आधिकारिक संपत्ति कार्ड।"
    },
    "policyHash": "f2c1bff75a132416bfe0b37c86e7587d"
  }
];

export default ONBOARDED_SCHEMES;
