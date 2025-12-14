# Script de test global pour Koundoul
# Exécute tous les tests (Frontend, Backend, Validation)

Write-Host "`n🧪 KOUNDOUL - Suite de Tests Complète" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Compteurs
$totalTests = 0
$passedTests = 0
$failedTests = 0

# Fonction pour afficher le résultat
function Print-Result {
    param($exitCode, $testName)
    
    $global:totalTests++
    
    if ($exitCode -eq 0) {
        Write-Host "✅ PASS - $testName" -ForegroundColor Green
        $global:passedTests++
    } else {
        Write-Host "❌ FAIL - $testName" -ForegroundColor Red
        $global:failedTests++
    }
}

# 1. Tests unitaires Frontend
Write-Host "📦 Tests unitaires Frontend..." -ForegroundColor Yellow
Set-Location -Path "frontend"
npm test -- --watchAll=false --passWithNoTests 2>&1 | Out-Null
$frontendExit = $LASTEXITCODE
Print-Result $frontendExit "Tests Frontend"
Set-Location -Path ".."
Write-Host ""

# 2. Tests Backend
Write-Host "🔧 Tests Backend..." -ForegroundColor Yellow
Set-Location -Path "backend"
npm test 2>&1 | Out-Null
$backendExit = $LASTEXITCODE
Print-Result $backendExit "Tests Backend"
Set-Location -Path ".."
Write-Host ""

# 3. Tests Validation (CRITIQUE)
Write-Host "⚠️  Tests Validation (Hors-cadre) - CRITIQUE..." -ForegroundColor Yellow
Set-Location -Path "backend"
npm test -- validation.test.js 2>&1 | Out-Null
$validationExit = $LASTEXITCODE
Print-Result $validationExit "Tests Validation"
Set-Location -Path ".."
Write-Host ""

# 4. Tests API (si backend démarré)
Write-Host "🌐 Tests API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -TimeoutSec 2 -ErrorAction Stop
    
    if ($response.StatusCode -eq 200) {
        Set-Location -Path "backend"
        & ".\test-validation.ps1" 2>&1 | Out-Null
        $apiExit = $LASTEXITCODE
        Print-Result $apiExit "Tests API"
        Set-Location -Path ".."
    } else {
        Write-Host "⚠️  SKIP - Backend non accessible" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  SKIP - Backend non démarré (démarrer avec: cd backend && npm start)" -ForegroundColor Yellow
}
Write-Host ""

# Résumé final
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "📊 RÉSUMÉ DES TESTS" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "Total:   $totalTests tests" -ForegroundColor White
Write-Host "Réussis: $passedTests" -ForegroundColor Green
Write-Host "Échoués: $failedTests" -ForegroundColor Red
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Détails par catégorie
Write-Host "Détails par catégorie:" -ForegroundColor White
if ($frontendExit -eq 0) {
    Write-Host "  Frontend:   ✅" -ForegroundColor Green
} else {
    Write-Host "  Frontend:   ❌" -ForegroundColor Red
}

if ($backendExit -eq 0) {
    Write-Host "  Backend:    ✅" -ForegroundColor Green
} else {
    Write-Host "  Backend:    ❌" -ForegroundColor Red
}

if ($validationExit -eq 0) {
    Write-Host "  Validation: ✅" -ForegroundColor Green
} else {
    Write-Host "  Validation: ❌" -ForegroundColor Red
}

Write-Host ""

# Exit code
if ($failedTests -gt 0) {
    Write-Host "❌ Des tests ont échoué" -ForegroundColor Red
    exit 1
} else {
    Write-Host "🎉 Tous les tests sont passés !" -ForegroundColor Green
    exit 0
}









