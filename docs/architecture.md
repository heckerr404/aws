# Haqdaar Architecture

## Overview

Haqdaar uses two separate paths — an offline **authoring path** (admin only) and an online **decision path** (user-facing).

## Decision Path (user-facing, deterministic)

```
React (Amplify)
  └─ POST /v1/check ─► API Gateway HTTP API
                            └─► [check_eligibility Lambda]
                                  ├─ validate profile (DOB→age, discard DOB)
                                  ├─ DynamoDB: load published scheme catalog
                                  ├─ AVP batch_is_authorized (1 citizen × N schemes)
                                  ├─ AVP batch_is_authorized (counterfactuals)
                                  ├─ Bedrock invoke_model (rephrase only, guarded)
                                  └─ Return: decision + clauses + receipt + explanation
```

**No LLM is in the decision path. AVP evaluates Cedar policies deterministically.**

## Authoring Path (admin, offline)

```
Official PDF → S3 raw/ → [ingest_scheme] → Textract → S3 extracted/
                              └─ Bedrock draft → S3 drafts/
                    Human review → S3 approved/
                              └─ [compile_publish] → Cedar → AVP + DynamoDB
```

## DynamoDB Single-Table Layout

| Item type | PK | SK | Key attributes |
|---|---|---|---|
| Scheme META | SCHEME#pm-kisan | META | schemeId, name, ministry, status, policyHash, clauseCount |
| Clause | SCHEME#pm-kisan | CLAUSE#PMK-R-01 | clauseId, kind, attribute, op, value, policyId, citation, humanText, remedy |
| Base policy | SCHEME#pm-kisan | BASEPOLICY | policyId, cedarStatement |

GSI1: GSI1PK=CATALOG → lists all published schemes.

## IAM Matrix

| Function | Action | Resource |
|---|---|---|
| CheckEligibility | verifiedpermissions:IsAuthorized, BatchIsAuthorized | Policy store ARN |
| CheckEligibility | dynamodb:Query, GetItem | Table + GSI1 |
| CheckEligibility | bedrock:InvokeModel | Foundation model + inference profile |
| GetSchemes | dynamodb:Query | Table + GSI1 |
| IngestScheme | s3:GetObject, PutObject | Bucket/* |
| IngestScheme | textract:Start/GetDocumentTextDetection | * |
| IngestScheme | bedrock:InvokeModel | Foundation model + inference profile |
| IngestScheme | dynamodb:PutItem | Table |
| CompilePublish | s3:GetObject | Bucket/approved/* |
| CompilePublish | verifiedpermissions:CreatePolicy, DeletePolicy, ListPolicies | Policy store ARN |
| CompilePublish | dynamodb:PutItem, Query, DeleteItem | Table + GSI1 |
