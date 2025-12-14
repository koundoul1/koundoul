# Script pour corriger le problème PgBouncer prepared statements

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CORRECTION PGBOUNCER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$envPath = "backend\.env"

# Contenu avec pgbouncer=true et pool_timeout
$correctContent = @"
DATABASE_URL=postgresql://postgres.wnbkplyerizogmufatxb:atsatsATS1.ATS@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
JWT_SECRET=koundoul-super-secret-jwt-key-2024-change-in-production
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:3002
GEMINI_API_KEY=AIzaSyDVodrl0dbcOxJOcO2n9zhUQyjA1flYZFk
GOOGLE_AI_API_KEY=AIzaSyDVodrl0dbcOxJOcO2n9zhUQyjA1flYZFk
"@

try {
    $correctContent | Out-File -FilePath $envPath -Encoding utf8 -Force
    
    Write-Host "✅ Configuration PgBouncer corrigée!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Ajout du paramètre: connection_limit=1" -ForegroundColor Yellow
    Write-Host "Cela résout le problème 'prepared statement already exists'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  REDÉMARRAGE COMPLET" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Arrêt de tous les processus Node..." -ForegroundColor Yellow
    Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 3
    
    Write-Host "Régénération de Prisma..." -ForegroundColor Yellow
    Set-Location backend
    npx prisma generate | Out-Null
    
    Write-Host "✅ Prisma régénéré!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Démarrage du backend..." -ForegroundColor Yellow
    node server.js
    
} catch {
    Write-Host "❌ Erreur: $_" -ForegroundColor Red
}









