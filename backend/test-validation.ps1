# Script de test de validation du backend
# Teste les 5 scénarios critiques

Write-Host "`n🧪 TESTS DE VALIDATION BACKEND - KOUNDOUL`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:3001/api/solver/solve"

# Test 1: Question Mathématiques Valide
Write-Host "Test 1: Question Mathématiques Valide" -ForegroundColor Yellow
$body1 = @{
    input = "Résoudre x^2 - 4 = 0"
    domain = "math"
    level = "medium"
    guidedMode = $true
} | ConvertTo-Json

try {
    $response1 = Invoke-RestMethod -Uri $baseUrl -Method Post -Body $body1 -ContentType "application/json"
    if ($response1.success) {
        Write-Host "✅ SUCCÈS: Question mathématiques acceptée" -ForegroundColor Green
        Write-Host "   Domaine utilisé: $($response1.data.domainUsed)" -ForegroundColor Gray
    } else {
        Write-Host "❌ ÉCHEC: $($response1.error.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ ERREUR: $($_.Exception.Message)" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# Test 2: Question Hors Cadre (CRITIQUE)
Write-Host "`nTest 2: Question Hors Cadre (CRITIQUE)" -ForegroundColor Yellow
$body2 = @{
    input = "Qui a gagné la coupe du monde?"
    domain = "general"
    level = "easy"
} | ConvertTo-Json

try {
    $response2 = Invoke-RestMethod -Uri $baseUrl -Method Post -Body $body2 -ContentType "application/json" -ErrorAction Stop
    Write-Host "❌ ÉCHEC: Question hors cadre acceptée (devrait être refusée)" -ForegroundColor Red
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    if ($errorResponse.error.code -eq "OUT_OF_SCOPE") {
        Write-Host "✅ SUCCÈS: Question hors cadre refusée correctement" -ForegroundColor Green
        Write-Host "   Message: $($errorResponse.error.message.Substring(0, 80))..." -ForegroundColor Gray
    } else {
        Write-Host "❌ ÉCHEC: Erreur inattendue - $($errorResponse.error.code)" -ForegroundColor Red
    }
}

Start-Sleep -Seconds 1

# Test 3: Détection Automatique du Domaine
Write-Host "`nTest 3: Détection Automatique du Domaine" -ForegroundColor Yellow
$body3 = @{
    input = "Calculer la force avec masse 5kg et accélération 2m/s²"
    domain = "general"
    level = "medium"
} | ConvertTo-Json

try {
    $response3 = Invoke-RestMethod -Uri $baseUrl -Method Post -Body $body3 -ContentType "application/json"
    if ($response3.success -and $response3.data.domainUsed -eq "physics") {
        Write-Host "✅ SUCCÈS: Domaine 'physics' détecté automatiquement" -ForegroundColor Green
    } else {
        Write-Host "⚠️  PARTIEL: Accepté mais domaine = $($response3.data.domainUsed)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ ERREUR: $($_.Exception.Message)" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# Test 4: Input Trop Court
Write-Host "`nTest 4: Input Trop Court" -ForegroundColor Yellow
$body4 = @{
    input = "x=2"
    domain = "math"
    level = "easy"
} | ConvertTo-Json

try {
    $response4 = Invoke-RestMethod -Uri $baseUrl -Method Post -Body $body4 -ContentType "application/json" -ErrorAction Stop
    Write-Host "❌ ÉCHEC: Input trop court accepté (devrait être refusé)" -ForegroundColor Red
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    if ($errorResponse.error.code -eq "VALIDATION_ERROR") {
        Write-Host "✅ SUCCÈS: Input trop court refusé correctement" -ForegroundColor Green
        Write-Host "   Message: $($errorResponse.error.message)" -ForegroundColor Gray
    } else {
        Write-Host "❌ ÉCHEC: Erreur inattendue - $($errorResponse.error.code)" -ForegroundColor Red
    }
}

Start-Sleep -Seconds 1

# Test 5: Mode Guidé avec Profil Visuel
Write-Host "`nTest 5: Mode Guidé avec Profil Visuel" -ForegroundColor Yellow
$body5 = @{
    input = "Calculer la dérivée de x³"
    domain = "math"
    level = "medium"
    guidedMode = $true
    learningProfile = "visual"
} | ConvertTo-Json

try {
    $response5 = Invoke-RestMethod -Uri $baseUrl -Method Post -Body $body5 -ContentType "application/json"
    if ($response5.success) {
        Write-Host "✅ SUCCÈS: Mode guidé avec profil visuel accepté" -ForegroundColor Green
        Write-Host "   Solution générée avec prompt personnalisé" -ForegroundColor Gray
    } else {
        Write-Host "❌ ÉCHEC: $($response5.error.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ ERREUR: $($_.Exception.Message)" -ForegroundColor Red
}

# Résumé
Write-Host "`n📊 RÉSUMÉ DES TESTS`n" -ForegroundColor Cyan
Write-Host "Tests critiques pour la validation backend" -ForegroundColor White
Write-Host "Vérifier que tous les tests ✅ sont verts`n" -ForegroundColor White









