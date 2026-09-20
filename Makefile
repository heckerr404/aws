.PHONY: install test build deploy bootstrap seed smoke web clean

VENV       := .venv
PYTHON     := $(VENV)/bin/python
PIP        := $(VENV)/bin/pip
PYTEST     := $(VENV)/bin/pytest
STACK      ?= haqdaar
STORE_ID   := $(shell cat .policy-store-id 2>/dev/null || echo "")

## Create virtual environment and install dev dependencies
install:
	python3 -m venv $(VENV)
	$(PIP) install --upgrade pip
	$(PIP) install pytest boto3

## Run all unit tests
test:
	PYTHONPATH=. $(PYTEST) backend/tests -q

## Build SAM application
build:
	sam build

## Bootstrap AVP policy store and upload Cedar schema
bootstrap:
	$(PYTHON) scripts/bootstrap_avp.py

## Deploy SAM stack (reads .policy-store-id automatically)
deploy:
	@if [ -z "$(STORE_ID)" ]; then \
	  echo "Error: .policy-store-id not found. Run 'make bootstrap' first."; exit 1; \
	fi
	sam build
	sam deploy \
	  --parameter-overrides "PolicyStoreId=$(STORE_ID)" \
	  --no-confirm-changeset

## Seed schemes from rules/*.rules.json (use --allow-unverified before verification)
seed:
	$(PYTHON) scripts/seed_from_rules.py --stack-name $(STACK) --allow-unverified

## Run smoke test against deployed API
smoke:
	$(PYTHON) scripts/smoke_test.py --stack-name $(STACK)

## Run the frontend dev server
web:
	cd frontend && npm run dev

## Remove build artifacts and virtual environment
clean:
	rm -rf .aws-sam $(VENV) frontend/dist frontend/node_modules
