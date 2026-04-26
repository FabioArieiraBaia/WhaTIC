# WhaTIC GCP Deployment Script

$PROJECT_ID = "gen-lang-client-0297704847"
$REGION = "us-central1"
$REPO = "whatic"

# Supabase Config
$DB_HOST = "db.qhbwdgtskghtjwpilnnu.supabase.co"
$DB_USER = "postgres"
$DB_PASS = 't3r3z422F@.Ç'
$DB_NAME = "postgres"

Write-Host "--- Implantando BACKEND no Cloud Run ---" -ForegroundColor Cyan
gcloud run deploy whatic-api `
    --source ./backend `
    --platform managed `
    --region $REGION `
    --allow-unauthenticated `
    --set-env-vars "NODE_ENV=production,PORT=8080,DB_DIALECT=postgres,DB_HOST=$DB_HOST,DB_USER=$DB_USER,DB_PASS=$DB_PASS,DB_NAME=$DB_NAME,DB_PORT=5432" `
    --project $PROJECT_ID

# Pegar a URL do Backend
$BACKEND_URL = $(gcloud run services describe whatic-api --platform managed --region $REGION --format 'value(status.url)' --project $PROJECT_ID)
Write-Host "Backend URL: $BACKEND_URL" -ForegroundColor Green

Write-Host "--- Implantando FRONTEND no Cloud Run ---" -ForegroundColor Cyan
gcloud run deploy whatic-app `
    --source ./frontend `
    --platform managed `
    --region $REGION `
    --allow-unauthenticated `
    --set-env-vars "REACT_APP_BACKEND_URL=$BACKEND_URL" `
    --project $PROJECT_ID

Write-Host "--- Deploy Concluído com Sucesso! ---" -ForegroundColor Green
Write-Host "Acesse o sistema em: " -NoNewline
gcloud run services describe whatic-app --platform managed --region $REGION --format 'value(status.url)' --project $PROJECT_ID

