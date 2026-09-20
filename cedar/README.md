# Cedar schema — Amazon Verified Permissions

This directory contains the Cedar JSON schema (`schema.cedarjson`) used by Amazon Verified Permissions.

## Entities

- **`Haqdaar::Citizen`** — The principal. Attributes mirror the 15 fields in `backend/common/schema.py`.
- **`Haqdaar::Scheme`** — The resource. Has a single `schemeId` string attribute.

## Actions

- **`Haqdaar::Action::"CheckEligibility"`** — The single action evaluated for every request.

## Policy pattern

```
permit (
  principal is Haqdaar::Citizen,
  action == Haqdaar::Action::"CheckEligibility",
  resource == Haqdaar::Scheme::"<scheme-id>"
);

forbid (
  principal is Haqdaar::Citizen,
  action == Haqdaar::Action::"CheckEligibility",
  resource == Haqdaar::Scheme::"<scheme-id>"
) unless {
  principal.occupation == "farmer"   // requirement clause
};

forbid (
  ...
) when {
  principal.isIncomeTaxPayer == true   // exclusion clause
};
```

## Updating the schema

If you add an attribute:
1. Add it to `backend/common/schema.py` → `CITIZEN_ATTRS`.
2. Update `cedar/schema.cedarjson`.
3. Re-run `make bootstrap` (calls `put_schema`).
4. Re-compile and re-seed all schemes (`make seed`).
5. The unit test `test_cedar_schema_sync` will catch any mismatches.
