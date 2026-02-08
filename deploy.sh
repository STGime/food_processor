#!/usr/bin/env bash
set -euo pipefail

PROJECT="gifted-palace-464208-n2"
REGION="us-east1"
SERVICE="food-processor"

# Read env vars from .env, skip comments and blank lines
ENV_VARS=""
while IFS= read -r line; do
  # Skip empty lines and comments
  [[ -z "$line" || "$line" =~ ^# ]] && continue
  # Trim trailing whitespace
  line="${line%%[[:space:]]}"
  if [ -n "$ENV_VARS" ]; then
    ENV_VARS="${ENV_VARS},${line}"
  else
    ENV_VARS="${line}"
  fi
done < .env

echo "Deploying ${SERVICE} to Cloud Run (${REGION})..."

gcloud run deploy "$SERVICE" \
  --source . \
  --project "$PROJECT" \
  --region "$REGION" \
  --set-env-vars "$ENV_VARS" \
  --memory 1Gi \
  --timeout 300 \
  --max-instances 4 \
  --allow-unauthenticated

echo ""
echo "Deployed. Fetching service URL..."

URL=$(gcloud run services describe "$SERVICE" \
  --project "$PROJECT" \
  --region "$REGION" \
  --format "value(status.url)")

echo "Service URL: ${URL}"
echo "Health check: curl ${URL}/api/health"
