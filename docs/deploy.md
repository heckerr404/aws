# Deploy Guide

## Prerequisites

1. **AWS CLI** configured: `aws sts get-caller-identity` returns your account.
2. **SAM CLI** installed: `sam --version`.
3. **Bedrock model access**: In the Bedrock console → Model access, enable your model (e.g. `anthropic.claude-3-5-haiku-20241022-v1:0`).
4. Python 3.12 and Node.js 18+.

Export region once:
```bash
export AWS_REGION=ap-south-1  # use a region with AVP + Textract + Bedrock
```

---

## Step 1: Bootstrap AVP

```bash
make bootstrap
# Prints and saves the policy store id to .policy-store-id
```

---

## Step 2: Create samconfig.toml

```toml
version = 0.1
[default.deploy.parameters]
stack_name       = "haqdaar"
resolve_s3       = true
capabilities     = "CAPABILITY_IAM"
confirm_changeset = false
parameter_overrides = "PolicyStoreId=<from .policy-store-id> BedrockModelId=<your-model-id> AllowedOrigin=*"
```

Or use `make deploy` which reads `.policy-store-id` automatically.

---

## Step 3: Build & Deploy Backend

```bash
make install   # create venv
make build     # sam build
make deploy    # sam deploy (reads .policy-store-id)
```

Note the `ApiUrl` in the output.

---

## Step 4: Seed Schemes

```bash
make seed
# Uses --allow-unverified for demo. Remove this flag after verifying clauses.
```

---

## Step 5: Smoke Test

```bash
make smoke
# Should print: PASSED: 0 failures
```

---

## Step 6: Build & Deploy Frontend

```bash
export VITE_API_BASE_URL=<ApiUrl from step 3>
cd frontend
npm install
npm run build
cd dist
zip -r ../dist.zip .
cd ..
```

### Amplify Hosting (zip deploy, no Git required)

```bash
APP_ID=$(aws amplify create-app --name haqdaar --query 'app.appId' --output text)
aws amplify create-branch --app-id $APP_ID --branch-name main

read JOB ZIP <<< $(aws amplify create-deployment \
  --app-id $APP_ID --branch-name main \
  --query '[jobId,zipUploadUrl]' --output text)

curl -T dist.zip "$ZIP"
aws amplify start-deployment --app-id $APP_ID --branch-name main --job-id $JOB

echo "https://main.${APP_ID}.amplifyapp.com"
```

---

## Step 7: Tighten CORS & IAM

```bash
# Update AllowedOrigin in samconfig.toml to the Amplify URL, then:
make deploy

# Also narrow the Bedrock IAM resource in template.yaml to the exact model ARN, then redeploy.
```

---

## Step 8: Re-run Smoke Test

```bash
make smoke
```

Visit the Amplify URL on mobile data and on venue Wi-Fi.
