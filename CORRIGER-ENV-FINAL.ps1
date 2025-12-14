# Script final pour corriger le .env avec connexion pooler

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CONFIGURATION POOLER SUPABASE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$envPath = "backend\.env"

# Essayer avec le format pooler standard
$correctContent = @"
DATABASE_URL=postgresql://postgres:atsatsATS1.ATS@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
JWT_SECRET=koundoul-super-secret-jwt-key-2024-change-in-production
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:3002
"@

try {
    $correctContent | Out-File -FilePath $envPath -Encoding utf8 -Force
    
    Write-Host "✅ Configuration appliquée!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Format utilisé: postgres (sans suffixe)" -ForegroundColor Yellow
    Write-Host "Port: 6543 (pooler)" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "Régénération de Prisma..." -ForegroundColor Yellow
    Set-Location backend
    npx prisma generate
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  DÉMARRAGE DU BACKEND" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    node server.js
    
} catch {
    Write-Host "❌ Erreur: $_" -ForegroundColor Red
}









