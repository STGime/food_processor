#!/bin/bash
set -e

PROJECT_ID="gifted-palace-464208-n2"
REGION="us-east1"
SERVICE_NAME="foodprocessor-landing"
IMAGE="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "Building Docker image..."
docker build -t ${IMAGE} .

echo "Pushing to Container Registry..."
docker push ${IMAGE}

echo "Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE} \
  --platform managed \
  --region ${REGION} \
  --project ${PROJECT_ID} \
  --allow-unauthenticated \
  --memory 256Mi \
  --max-instances 2 \
  --port 8080

echo "Deployment complete!"
gcloud run services describe ${SERVICE_NAME} \
  --platform managed \
  --region ${REGION} \
  --project ${PROJECT_ID} \
  --format "value(status.url)"
