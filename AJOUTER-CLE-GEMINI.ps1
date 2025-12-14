# Script pour ajouter la clé Gemini au .env

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AJOUT CLÉ GEMINI API" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$envPath = "backend\.env"

# Contenu complet avec la clé Gemini
$correctContent = @"
DATABASE_URL=postgresql://postgres.wnbkplyerizogmufatxb:atsatsATS1.ATS@aws-1-eu-north-1.pooler.supabase.com:6543/postgres
JWT_SECRET=koundoul-super-secret-jwt-key-2024-change-in-production
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:3002
GEMINI_API_KEY=AIzaSyBbb08KI0VHnlAOQmLHO2d-DO-E5MENcEk
GOOGLE_AI_API_KEY=AIzaSyBbb08KI0VHnlAOQmLHO2d-DO-E5MENcEk
"@

try {
    $correctContent | Out-File -FilePath $envPath -Encoding utf8 -Force
    
    Write-Host "✅ Clé Gemini ajoutée avec succès!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Configuration complète:" -ForegroundColor Yellow
    Write-Host "- Database: ✅ Configurée" -ForegroundColor White
    Write-Host "- JWT: ✅ Configuré" -ForegroundColor White
    Write-Host "- Port: ✅ 5000" -ForegroundColor White
    Write-Host "- Gemini API: ✅ Clé ajoutée" -ForegroundColor White
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  REDÉMARRAGE DU BACKEND" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    Set-Location backend
    
    Write-Host "Arrêt des processus Node existants..." -ForegroundColor Yellow
    Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    
    Write-Host "Démarrage du backend..." -ForegroundColor Yellow
    node server.js
    
} catch {
    Write-Host "❌ Erreur: $_" -ForegroundColor Red
}









