#!/usr/bin/env python3
"""upload_pdf.py — Upload a scheme PDF to S3 raw/ prefix."""
import argparse
import sys
from pathlib import Path

import boto3

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("scheme_id", help="Scheme id (e.g. pm-kisan)")
    parser.add_argument("local_pdf", help="Path to local PDF file")
    parser.add_argument("--bucket", default="", help="S3 bucket name (or set BUCKET_NAME env)")
    args = parser.parse_args()

    import os
    bucket = args.bucket or os.environ.get("BUCKET_NAME", "")
    if not bucket:
        print("Error: bucket name required (--bucket or BUCKET_NAME env)", file=sys.stderr)
        sys.exit(1)

    pdf_path = Path(args.local_pdf)
    if not pdf_path.exists():
        print(f"Error: file not found: {pdf_path}", file=sys.stderr)
        sys.exit(1)

    key = f"raw/{args.scheme_id}.pdf"
    s3 = boto3.client("s3")
    s3.upload_file(str(pdf_path), bucket, key)
    print(f"Uploaded {pdf_path} → s3://{bucket}/{key}")

if __name__ == "__main__":
    main()
