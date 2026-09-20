# Haqdaar

> "Everyone else built a chatbot that guesses. We built the only one that proves it, with a receipt."

Haqdaar tells an Indian citizen which government welfare schemes they qualify for — and **proves it**. Eligibility decisions come from Amazon Verified Permissions (Cedar), never from an LLM guess.

> **Demo data only.** This project uses self-declared eligibility fields. It is NOT connected to UIDAI or any government database.

## Quick start

```bash
make install        # create venv, install pytest
make test           # run unit tests (no AWS needed)
make bootstrap      # create AVP policy store + upload schema (needs AWS creds)
make build          # sam build
make deploy         # sam deploy (reads .policy-store-id)
make seed           # seed 4 schemes from rules/*.rules.json
make smoke          # smoke test against live API
make web            # run frontend dev server (needs VITE_API_BASE_URL)
```

## Stack

Amazon S3 · AWS Lambda (Python 3.12) · Amazon Textract · Amazon Bedrock · Amazon Verified Permissions · Amazon DynamoDB · Amazon API Gateway (HTTP API) · AWS Amplify Hosting · AWS SAM CLI · React + Vite

## Schemes covered

| Scheme | Ministry |
|---|---|
| PM-KISAN | Agriculture & Farmers Welfare |
| PM Vishwakarma | MSME |
| Atal Pension Yojana | Finance (PFRDA) |
| Central Sector Scholarship | Education |

> Rules are illustrative placeholders. Before the demo, verify each clause against the official PDF and fill in real page numbers.
