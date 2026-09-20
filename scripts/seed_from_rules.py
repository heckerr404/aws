#!/usr/bin/env python3
"""
seed_from_rules.py — Compile and publish all rules/*.rules.json directly to AVP + DynamoDB.

Bypasses Textract and Bedrock. Use this to seed the demo data and for CI.

Usage:
  python scripts/seed_from_rules.py --stack-name haqdaar
  python scripts/seed_from_rules.py --stack-name haqdaar --allow-unverified
  python scripts/seed_from_rules.py --stack-name haqdaar --scheme pm-kisan
"""
import argparse
import hashlib
import json
import os
import sys
from pathlib import Path

import boto3
import botocore.exceptions

# Add project root to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.common import cedar_compiler
from backend.common.errors import CompileError, NotVerifiedError

RULES_DIR = Path(__file__).parent.parent / "rules"
STORE_ID_FILE = Path(__file__).parent.parent / ".policy-store-id"


def get_stack_outputs(stack_name: str) -> dict:
    cf = boto3.client("cloudformation")
    resp = cf.describe_stacks(StackName=stack_name)
    outputs = resp["Stacks"][0].get("Outputs", [])
    return {o["OutputKey"]: o["OutputValue"] for o in outputs}


def load_store_id(args) -> str:
    if args.policy_store_id:
        return args.policy_store_id
    if STORE_ID_FILE.exists():
        sid = STORE_ID_FILE.read_text().strip()
        if sid:
            return sid
    print("Error: policy store id not found. Run bootstrap_avp.py first or pass --policy-store-id", file=sys.stderr)
    sys.exit(1)


def delete_scheme_policies(avp, policy_store_id: str, scheme_id: str) -> int:
    deleted = 0
    paginator = avp.get_paginator("list_policies")
    for page in paginator.paginate(policyStoreId=policy_store_id):
        for policy in page.get("policies", []):
            desc = policy.get("definition", {}).get("static", {}).get("description", "")
            if desc.startswith(f"{scheme_id}::"):
                try:
                    avp.delete_policy(policyStoreId=policy_store_id, policyId=policy["policyId"])
                    deleted += 1
                except botocore.exceptions.ClientError:
                    pass
    return deleted


def publish_scheme(rules: dict, policy_store_id: str, table_name: str, allow_unverified: bool) -> None:
    scheme_id = rules["schemeId"]

    if not allow_unverified:
        for cl in rules.get("clauses", []):
            v = cl.get("verified", {})
            if not v.get("by") or not v.get("at"):
                raise NotVerifiedError(
                    f"Clause {cl.get('clauseId')} is not verified. "
                    "Use --allow-unverified for demo seeding."
                )

    compiled = cedar_compiler.compile_scheme(rules)
    statements = sorted(c["cedarStatement"] for c in compiled)
    policy_hash = hashlib.sha256("\n".join(statements).encode()).hexdigest()

    avp = boto3.client("verifiedpermissions")
    dynamo = boto3.resource("dynamodb").Table(table_name)

    print(f"  Deleting old policies for {scheme_id}...")
    deleted = delete_scheme_policies(avp, policy_store_id, scheme_id)
    print(f"  Deleted {deleted} old policies")

    base_policy_id = None
    clause_policy_map: dict[str, str] = {}

    for entry in compiled:
        clause_id = entry["clauseId"]
        kind = entry["kind"]
        cedar = entry["cedarStatement"]
        desc = f"{scheme_id}::{clause_id}"
        resp = avp.create_policy(
            policyStoreId=policy_store_id,
            definition={"static": {"description": desc, "statement": cedar}},
        )
        pid = resp["policyId"]
        if kind == "base_permit":
            base_policy_id = pid
        else:
            clause_policy_map[clause_id] = pid

    from datetime import datetime, timezone
    now = datetime.now(timezone.utc).isoformat()

    dynamo.put_item(Item={
        "PK": f"SCHEME#{scheme_id}", "SK": "META",
        "GSI1PK": "CATALOG", "GSI1SK": f"SCHEME#{scheme_id}",
        "schemeId": scheme_id,
        "name": rules.get("name", {"en": scheme_id, "hi": scheme_id}),
        "ministry": rules.get("ministry", ""),
        "officialUrl": rules.get("officialUrl", ""),
        "status": "PUBLISHED",
        "policyHash": policy_hash,
        "publishedAt": now,
        "sourcePdfKey": rules.get("sourcePdfKey", ""),
        "clauseCount": len([c for c in compiled if c["kind"] != "base_permit"]),
    })

    if base_policy_id:
        base_stmt = next(c["cedarStatement"] for c in compiled if c["kind"] == "base_permit")
        dynamo.put_item(Item={
            "PK": f"SCHEME#{scheme_id}", "SK": "BASEPOLICY",
            "policyId": base_policy_id,
            "cedarStatement": base_stmt,
        })

    for cl in rules.get("clauses", []):
        clause_id = cl.get("clauseId")
        if not clause_id or cl.get("unsupported"):
            continue
        dynamo.put_item(Item={
            "PK": f"SCHEME#{scheme_id}", "SK": f"CLAUSE#{clause_id}",
            "clauseId": clause_id,
            "kind": cl.get("kind"),
            "attribute": cl.get("attribute"),
            "op": cl.get("op"),
            "value": cl.get("value"),
            "policyId": clause_policy_map.get(clause_id, ""),
            "citation": cl.get("citation", {}),
            "humanText": cl.get("humanText", {}),
            "remedy": cl.get("remedy", {}),
            "unsupported": cl.get("unsupported", False),
        })

    print(f"  Published {scheme_id}: {len(clause_policy_map)} clauses, hash={policy_hash[:12]}...")


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed Haqdaar schemes from rules/*.rules.json")
    parser.add_argument("--stack-name", default="haqdaar")
    parser.add_argument("--policy-store-id", default="")
    parser.add_argument("--table-name", default="")
    parser.add_argument("--allow-unverified", action="store_true", help="Skip verification check")
    parser.add_argument("--scheme", default="", help="Only seed one scheme by schemeId")
    args = parser.parse_args()

    policy_store_id = load_store_id(args)
    table_name = args.table_name
    if not table_name and args.stack_name:
        print(f"Reading stack outputs for {args.stack_name}...")
        try:
            outputs = get_stack_outputs(args.stack_name)
            table_name = outputs.get("TableName", "")
        except botocore.exceptions.ClientError as exc:
            print(f"Warning: could not read stack outputs: {exc}", file=sys.stderr)

    if not table_name:
        print("Error: table name not found. Pass --table-name or --stack-name", file=sys.stderr)
        sys.exit(1)

    rules_files = sorted(RULES_DIR.glob("*.rules.json"))
    if args.scheme:
        rules_files = [f for f in rules_files if f.stem.startswith(args.scheme)]

    if not rules_files:
        print("No rules files found.", file=sys.stderr)
        sys.exit(1)

    for rules_file in rules_files:
        print(f"\nProcessing {rules_file.name}...")
        rules = json.loads(rules_file.read_text())
        try:
            publish_scheme(rules, policy_store_id, table_name, args.allow_unverified)
        except (CompileError, NotVerifiedError) as exc:
            print(f"  FAILED: {exc}", file=sys.stderr)
            sys.exit(1)

    print("\nAll schemes seeded successfully.")


if __name__ == "__main__":
    main()
