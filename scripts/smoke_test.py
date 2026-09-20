#!/usr/bin/env python3
"""
smoke_test.py — Post golden profiles to the deployed API and verify decisions.

Usage:
  python scripts/smoke_test.py --stack-name haqdaar
  python scripts/smoke_test.py --api-url https://...execute-api.../v1
"""
import argparse
import json
import sys
from pathlib import Path
from urllib import error, request

import boto3
import botocore.exceptions

GOLDEN_DIR = Path(__file__).parent.parent / "backend" / "tests" / "golden"


def get_api_url(stack_name: str) -> str:
    cf = boto3.client("cloudformation")
    resp = cf.describe_stacks(StackName=stack_name)
    outputs = {o["OutputKey"]: o["OutputValue"] for o in resp["Stacks"][0].get("Outputs", [])}
    return outputs.get("ApiUrl", "")


def post_check(api_url: str, profile: dict, language: str = "en") -> tuple[dict, str]:
    payload = json.dumps({"profile": profile, "language": language, "explain": False}).encode()
    req = request.Request(
        f"{api_url}/check",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with request.urlopen(req, timeout=30) as resp:
            raw_text = resp.read().decode("utf-8")
            return json.loads(raw_text), raw_text
    except error.HTTPError as exc:
        body = exc.read().decode()
        print(f"HTTP {exc.code}: {body}", file=sys.stderr)
        raise


def main() -> None:
    parser = argparse.ArgumentParser(description="Smoke test the Haqdaar API")
    parser.add_argument("--stack-name", default="haqdaar")
    parser.add_argument("--api-url", default="")
    args = parser.parse_args()

    api_url = args.api_url
    if not api_url:
        print(f"Fetching API URL from stack {args.stack_name}...")
        try:
            api_url = get_api_url(args.stack_name)
        except botocore.exceptions.ClientError as exc:
            print(f"Error: {exc}", file=sys.stderr)
            sys.exit(1)

    if not api_url:
        print("Error: could not determine API URL", file=sys.stderr)
        sys.exit(1)

    print(f"Testing against: {api_url}")

    profiles = json.loads((GOLDEN_DIR / "profiles.json").read_text())
    expected = json.loads((GOLDEN_DIR / "expected.json").read_text())

    failures = 0
    for profile_name, profile in profiles.items():
        print(f"\n  Testing profile: {profile_name}...")
        resp, raw_text = post_check(api_url, profile)

        # Guardrail 1: dateOfBirth must NEVER be returned in response body
        if "dateOfBirth" in raw_text:
            print("    ✗ PRIVACY VIOLATION: dateOfBirth found in response body!")
            failures += 1
        else:
            print("    ✓ Privacy: dateOfBirth not leaked in response")

        # Guardrail 2: Determinism check (repeat call yields identical receipts)
        resp2, _ = post_check(api_url, profile)
        receipts1 = {
            r["schemeId"]: (r.get("receipt") or {}).get("receiptId")
            for r in resp.get("results", [])
        }
        receipts2 = {
            r["schemeId"]: (r.get("receipt") or {}).get("receiptId")
            for r in resp2.get("results", [])
        }
        if receipts1 == receipts2 and len(receipts1) > 0:
            print("    ✓ Determinism: repeat call produced identical receipts")
        else:
            print(f"    ✗ Non-deterministic receipts: {receipts1} != {receipts2}")
            failures += 1

        results = {r["schemeId"]: r["decision"] for r in resp.get("results", [])}

        exp = expected.get(profile_name, {})
        for scheme_id, exp_decision in exp.items():
            actual = results.get(scheme_id, "MISSING")
            ok = actual == exp_decision
            status = "✓" if ok else "✗"
            print(f"    {status} {scheme_id}: expected {exp_decision}, got {actual}")
            if not ok:
                failures += 1

    print(f"\n{'PASSED' if failures == 0 else 'FAILED'}: {failures} failures")
    sys.exit(0 if failures == 0 else 1)


if __name__ == "__main__":
    main()
