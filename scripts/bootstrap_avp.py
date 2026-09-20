#!/usr/bin/env python3
"""
bootstrap_avp.py — Create AVP policy store and upload Cedar schema.

Usage:
  python scripts/bootstrap_avp.py            # idempotent
  python scripts/bootstrap_avp.py --recreate # delete old store and create new one
"""
import argparse
import json
import os
import sys
from pathlib import Path

import boto3
import botocore.exceptions

STORE_ID_FILE = Path(__file__).parent.parent / ".policy-store-id"
SCHEMA_FILE = Path(__file__).parent.parent / "cedar" / "schema.cedarjson"


def read_store_id() -> str | None:
    if STORE_ID_FILE.exists():
        return STORE_ID_FILE.read_text().strip() or None
    return None


def write_store_id(store_id: str) -> None:
    STORE_ID_FILE.write_text(store_id)
    print(f"  Written to {STORE_ID_FILE}")


def put_schema(client, store_id: str) -> None:
    schema_str = SCHEMA_FILE.read_text()
    client.put_schema(
        policyStoreId=store_id,
        definition={"cedarJson": schema_str},
    )
    print(f"  Schema uploaded ({len(schema_str)} bytes)")


def create_store(client) -> str:
    resp = client.create_policy_store(
        validationSettings={"mode": "STRICT"},
        description="Haqdaar eligibility policies",
    )
    store_id = resp["policyStoreId"]
    arn = resp["arn"]
    print(f"  Created policy store: {store_id}")
    print(f"  ARN: {arn}")
    return store_id


def delete_store(client, store_id: str) -> None:
    try:
        client.delete_policy_store(policyStoreId=store_id)
        print(f"  Deleted policy store: {store_id}")
    except botocore.exceptions.ClientError as exc:
        print(f"  Warning: could not delete store {store_id}: {exc}", file=sys.stderr)


def main() -> None:
    parser = argparse.ArgumentParser(description="Bootstrap AVP policy store for Haqdaar")
    parser.add_argument("--recreate", action="store_true", help="Delete existing store and create new one")
    args = parser.parse_args()

    client = boto3.client("verifiedpermissions")

    existing = read_store_id()

    if args.recreate and existing:
        print(f"Deleting existing store: {existing}")
        delete_store(client, existing)
        existing = None
        STORE_ID_FILE.unlink(missing_ok=True)

    if existing:
        print(f"Using existing store: {existing}")
        store_id = existing
    else:
        print("Creating new policy store...")
        store_id = create_store(client)
        write_store_id(store_id)

    print("Uploading schema...")
    put_schema(client, store_id)
    print(f"\nDone. Policy store id: {store_id}")
    print(f"Add to samconfig.toml: PolicyStoreId={store_id}")


if __name__ == "__main__":
    main()
