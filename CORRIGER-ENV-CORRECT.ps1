# Script avec la VRAIE URL du pooler Supabase

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CONFIGURATION CORRECTE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$envPath = "backend\.env"

# Contenu avec la VRAIE URL du pooler
$correctContent = @"
DATABASE_URL=postgresql://postgres.wnbkplyerizogmufatxb:atsatsATS1.ATS@aws-1-eu-north-1.pooler.supabase.com:6543/postgres
JWT_SECRET=koundoul-super-secret-jwt-key-2024-change-in-production
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:3002
"@

try {
    $correctContent | Out-File -FilePath $envPath -Encoding utf8 -Force
    
    Write-Host "✅ Fichier .env configuré avec la VRAIE URL!" -ForegroundColor Green
    Write-Host ""
    Write-Host "URL utilisée:" -ForegroundColor Yellow
    Write-Host "postgresql://postgres.wnbkplyerizogmufatxb:***@aws-1-eu-north-1.pooler.supabase.com:6543/postgres" -ForegroundColor White
    Write-Host ""
    
    Write-Host "Régénération de Prisma..." -ForegroundColor Yellow
    Set-Location backend
    npx prisma generate | Out-Null
    
    Write-Host "✅ Prisma régénéré!" -ForegroundColor Green
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  DÉMARRAGE DU BACKEND" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    node server.js
    
} catch {
    Write-Host "❌ Erreur: $_" -ForegroundColor Red
}









