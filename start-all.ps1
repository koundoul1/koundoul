# Script de démarrage Koundoul
Write-Host "🚀 DÉMARRAGE DE LA PLATEFORME KOUNDOUL" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════`n" -ForegroundColor Gray

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    Write-Host "❌ Erreur: Ce script doit être exécuté depuis la racine du projet Koundoul" -ForegroundColor Red
    exit 1
}

# Arrêter tous les processus Node existants
Write-Host "🛑 Arrêt des processus Node existants..." -ForegroundColor Yellow
try {
    taskkill /F /IM node.exe 2>$null
} catch {
    # Pas de processus à arrêter
}

Write-Host "`n"

# Démarrer le backend dans un nouveau terminal
Write-Host "1️⃣ Démarrage du BACKEND (port 3001)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; Write-Host '🚀 BACKEND KOUNDOUL' -ForegroundColor Cyan; node server.js"

# Attendre 3 secondes
Start-Sleep -Seconds 3

# Démarrer le frontend dans un nouveau terminal
Write-Host "2️⃣ Démarrage du FRONTEND (port 3002)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; Write-Host '🎨 FRONTEND KOUNDOUL' -ForegroundColor Cyan; npm run dev"

# Attendre 5 secondes
Start-Sleep -Seconds 5

Write-Host "`n═══════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host "✅ PLATEFORME KOUNDOUL DÉMARRÉE !`n" -ForegroundColor Green

Write-Host "📍 URLs :" -ForegroundColor Cyan
Write-Host "   Backend API  : http://localhost:3001" -ForegroundColor White
Write-Host "   Frontend App : http://localhost:3002`n" -ForegroundColor White

Write-Host "🔐 Identifiants de test :" -ForegroundColor Cyan
Write-Host "   Email    : sambafaye184@yahoo.fr" -ForegroundColor White
Write-Host "   Password : atsatsATS1.ATS`n" -ForegroundColor White

Write-Host "💡 Commandes utiles :" -ForegroundColor Cyan
Write-Host "   - Voir les processus Node : Get-Process node" -ForegroundColor Gray
Write-Host "   - Arrêter tout : taskkill /F /IM node.exe" -ForegroundColor Gray
Write-Host "   - Tester l'API : cd backend; node quick-test.js`n" -ForegroundColor Gray

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host "Bon apprentissage !" -ForegroundColor Green
