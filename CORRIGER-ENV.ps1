# Script pour corriger automatiquement le fichier .env

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CORRECTION FICHIER .env" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$envPath = "backend\.env"

# Contenu correct
$correctContent = @"
DATABASE_URL=postgresql://postgres.wnbkplyerizogmufatxb:atsatsATS1.ATS@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
JWT_SECRET=koundoul-super-secret-jwt-key-2024-change-in-production
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:3002
"@

try {
    # Écrire le contenu correct
    $correctContent | Out-File -FilePath $envPath -Encoding utf8 -Force
    
    Write-Host "✅ Fichier .env corrigé avec succès!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Contenu appliqué:" -ForegroundColor Yellow
    Write-Host $correctContent -ForegroundColor Gray
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









