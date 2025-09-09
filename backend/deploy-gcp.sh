#!/bin/bash
# Google Cloud Run deployment script

# Set your project ID
PROJECT_ID="your-project-id"
SERVICE_NAME="welldoc-backend"
REGION="us-central1"

# Build and deploy
echo "🚀 Deploying to Google Cloud Run..."

# Build container
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME

# Deploy to Cloud Run
gcloud run deploy $SERVICE_NAME \
    --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --memory 1Gi \
    --cpu 1 \
    --port 8000 \
    --set-env-vars "PYTHONUNBUFFERED=1,ENVIRONMENT=production" \
    --min-instances 0 \
    --max-instances 10

echo "✅ Deployment complete!"
echo "🌐 Service URL: $(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')"
