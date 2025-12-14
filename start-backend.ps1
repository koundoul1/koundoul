Write-Host "Demarrage du Backend Koundoul..." -ForegroundColor Cyan

$env:DATABASE_URL = "postgresql://postgres:atsatsATS1.ATS@db.wnbkplyerizogmufatxb.supabase.co:5432/postgres"
$env:JWT_SECRET = "koundoul-super-secret-jwt-key-2024-change-in-production"
$env:PORT = "3001"
$env:NODE_ENV = "development"
$env:CORS_ORIGIN = "http://localhost:3000"

Write-Host "Variables configurees" -ForegroundColor Green

Set-Location backend

Write-Host "Demarrage du serveur sur le port 3001..." -ForegroundColor Yellow
Write-Host "(Appuyez sur Ctrl+C pour arreter)" -ForegroundColor Gray

node server.js
