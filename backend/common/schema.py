"""
Single source of truth for citizen attribute names, types, and enum constraints.

CITIZEN_ATTRS maps attribute name → type string used in Cedar ("long", "string", "boolean").
ENUMS maps constrained string attributes → allowed slug values.
ARTISAN_TRADES is the full list for artisanTrade (excluding "none" which is always valid).
"""

NAMESPACE = "Haqdaar"
ACTION_ID = "CheckEligibility"

# 15 attributes — must match cedar/schema.cedarjson exactly.
CITIZEN_ATTRS: dict[str, str] = {
    "age": "long",
    "familyIncomeInr": "long",
    "state": "string",
    "gender": "string",
    "socialCategory": "string",
    "occupation": "string",
    "artisanTrade": "string",
    "hasCultivableLand": "boolean",
    "isInstitutionalLandHolder": "boolean",
    "isIncomeTaxPayer": "boolean",
    "isGovtEmployee": "boolean",
    "hasBankAccount": "boolean",
    "isEnrolledInHigherEd": "boolean",
    "class12Percentile": "long",
    "hasAvailedSimilarCreditScheme5y": "boolean",
}

ARTISAN_TRADES: list[str] = [
    "carpenter",
    "boat_maker",
    "armourer",
    "blacksmith",
    "hammer_toolkit_maker",
    "locksmith",
    "goldsmith",
    "potter",
    "sculptor",
    "cobbler",
    "mason",
    "basket_weaver",
    "doll_toy_maker",
    "barber",
    "garland_maker",
    "washerman",
    "tailor",
    "fishing_net_maker",
]

ENUMS: dict[str, list[str]] = {
    "gender": ["male", "female", "other"],
    "socialCategory": ["general", "obc", "sc", "st", "ews"],
    "occupation": ["farmer", "artisan", "student", "salaried", "self_employed", "unemployed", "other"],
    "state": [
        "an", "ap", "ar", "as", "br", "ch", "ct", "dd", "dh", "dl", "ga", "gj",
        "hp", "hr", "jh", "jk", "ka", "kl", "la", "ld", "mh", "ml", "mn", "mp",
        "mz", "nl", "or", "pb", "py", "rj", "sk", "tg", "tn", "tr", "up", "ut",
        "wb",
    ],
    "artisanTrade": ["none"] + ARTISAN_TRADES,
}
