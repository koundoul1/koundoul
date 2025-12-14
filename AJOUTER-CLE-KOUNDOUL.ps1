# Script pour ajouter la clé Gemini "koundoul" au .env

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AJOUT CLÉ GEMINI API KOUNDOUL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$envPath = "backend\.env"

# Contenu complet avec la clé Gemini koundoul
$correctContent = @"
DATABASE_URL=postgresql://postgres.wnbkplyerizogmufatxb:atsatsATS1.ATS@aws-1-eu-north-1.pooler.supabase.com:6543/postgres
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
    
    Write-Host "✅ Clé Gemini 'koundoul' ajoutée avec succès!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Configuration complète:" -ForegroundColor Yellow
    Write-Host "- Database: ✅ aws-1-eu-north-1.pooler.supabase.com:6543" -ForegroundColor White
    Write-Host "- JWT: ✅ Configuré" -ForegroundColor White
    Write-Host "- Port: ✅ 5000" -ForegroundColor White
    Write-Host "- Gemini API: ✅ AIzaSyDVod...YZFk (koundoul)" -ForegroundColor White
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  REDÉMARRAGE DU BACKEND" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Arrêt des processus Node existants..." -ForegroundColor Yellow
    Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    
    Write-Host "Démarrage du backend..." -ForegroundColor Yellow
    Set-Location backend
    node server.js
    
} catch {
    Write-Host "❌ Erreur: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Essayez manuellement:" -ForegroundColor Yellow
    Write-Host "1. Ouvrez backend\.env" -ForegroundColor White
    Write-Host "2. Ajoutez: GEMINI_API_KEY=AIzaSyDVodrl0dbcOxJOcO2n9zhUQyjA1flYZFk" -ForegroundColor White
    Write-Host "3. Redémarrez: cd backend && node server.js" -ForegroundColor White
}









