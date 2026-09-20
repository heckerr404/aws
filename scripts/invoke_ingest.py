#!/usr/bin/env python3
"""invoke_ingest.py — Invoke the ingest_scheme Lambda for a given scheme."""
import argparse
import json
import sys

import boto3
import botocore.exceptions


def main():
    parser = argparse.ArgumentParser(description="Invoke the ingest_scheme Lambda")
    parser.add_argument("scheme_id", help="Scheme id (e.g. pm-kisan)")
    parser.add_argument("--function-name", default="", help="Lambda function name (defaults to stack output)")
    parser.add_argument("--stack-name", default="haqdaar")
    parser.add_argument("--sync", action="store_true", help="Synchronous invoke (for short PDFs)")
    args = parser.parse_args()

    function_name = args.function_name
    if not function_name:
        cf = boto3.client("cloudformation")
        outputs = {o["OutputKey"]: o["OutputValue"]
                   for o in cf.describe_stacks(StackName=args.stack_name)["Stacks"][0].get("Outputs", [])}
        function_name = outputs.get("IngestFunctionName", "")

    if not function_name:
        print("Error: could not find function name", file=sys.stderr)
        sys.exit(1)

    invocation_type = "RequestResponse" if args.sync else "Event"
    payload = json.dumps({"schemeId": args.scheme_id}).encode()

    lam = boto3.client("lambda")
    resp = lam.invoke(
        FunctionName=function_name,
        InvocationType=invocation_type,
        Payload=payload,
    )

    status = resp["StatusCode"]
    print(f"Invoke status: {status}")
    if args.sync:
        result = json.loads(resp["Payload"].read())
        print(json.dumps(result, indent=2))
    else:
        log_group = f"/aws/lambda/{function_name}"
        print(f"Running async. Check logs: {log_group}")


if __name__ == "__main__":
    main()
