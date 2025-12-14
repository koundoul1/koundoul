# Script pour utiliser la connexion DIRECTE (port 5432)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CONNEXION DIRECTE (PORT 5432)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$envPath = "backend\.env"

# Contenu avec connexion directe
$correctContent = @"
DATABASE_URL=postgresql://postgres:atsatsATS1.ATS@db.wnbkplyerizogmufatxb.supabase.co:5432/postgres
JWT_SECRET=koundoul-super-secret-jwt-key-2024-change-in-production
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:3002
"@

try {
    $correctContent | Out-File -FilePath $envPath -Encoding utf8 -Force
    
    Write-Host "✅ Fichier .env configuré pour connexion DIRECTE!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Configuration:" -ForegroundColor Yellow
    Write-Host "- Port: 5432 (connexion directe)" -ForegroundColor White
    Write-Host "- URL: db.wnbkplyerizogmufatxb.supabase.co" -ForegroundColor White
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  PROCHAINES ÉTAPES" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Régénérer Prisma:" -ForegroundColor Yellow
    Write-Host "   cd backend" -ForegroundColor White
    Write-Host "   npx prisma generate" -ForegroundColor White
    Write-Host ""
    Write-Host "2. Démarrer le backend:" -ForegroundColor Yellow
    Write-Host "   node server.js" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host "❌ Erreur: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")









