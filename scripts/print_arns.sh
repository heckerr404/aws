#!/bin/bash
# print_arns.sh — Print ARNs for all Haqdaar resources
STACK=${1:-haqdaar}
REGION=$(aws configure get region)
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)

echo "=== Haqdaar ARNs (stack: $STACK, region: $REGION) ==="
aws cloudformation describe-stacks --stack-name "$STACK" \
  --query "Stacks[0].Outputs[*].[OutputKey,OutputValue]" \
  --output table
