# Script de démarrage complet Koundoul
Write-Host "`n" -NoNewline
Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   KOUNDOUL - Démarrage Automatique" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Vérifier si user existe, sinon le créer
Write-Host "ETAPE 1/4 : Verification utilisateur..." -ForegroundColor Yellow
Write-Host ""

$userExists = $false
try {
    $loginBody = @{
        email = "sambafaye184@yahoo.fr"
        password = "atsatsATS1.ATS"
    } | ConvertTo-Json

    $loginTest = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $loginBody `
        -ErrorAction SilentlyContinue

    $userExists = $true
    Write-Host "Utilisateur existe deja" -ForegroundColor Green
} catch {
    Write-Host "Utilisateur n'existe pas - Creation..." -ForegroundColor Yellow
}

if (-not $userExists) {
    try {
        Set-Location backend
        node create-test-user.js
        Set-Location ..
        Write-Host "Utilisateur cree avec succes !" -ForegroundColor Green
    } catch {
        Write-Host "Erreur creation utilisateur" -ForegroundColor Red
    }
}

Write-Host ""

# Test rapide des APIs
Write-Host "ETAPE 2/4 : Test APIs..." -ForegroundColor Yellow
Write-Host ""

try {
    Set-Location backend
    $testResult = node test-login.js 2>&1
    if ($testResult -match "Login reussi") {
        Write-Host "Backend OK - Login fonctionne !" -ForegroundColor Green
    } else {
        Write-Host "Backend OK mais login echoue" -ForegroundColor Yellow
    }
    Set-Location ..
} catch {
    Write-Host "Erreur test backend" -ForegroundColor Red
}

Write-Host ""

# Afficher les infos de connexion
Write-Host "ETAPE 3/4 : Informations de connexion" -ForegroundColor Yellow
Write-Host ""
Write-Host "Email    : " -NoNewline -ForegroundColor Gray
Write-Host "sambafaye184@yahoo.fr" -ForegroundColor White
Write-Host "Password : " -NoNewline -ForegroundColor Gray
Write-Host "atsatsATS1.ATS" -ForegroundColor White
Write-Host ""

# Ouvrir le navigateur
Write-Host "ETAPE 4/4 : Ouverture navigateur..." -ForegroundColor Yellow
Write-Host ""

Start-Sleep -Seconds 2

try {
    Start-Process "http://localhost:3000"
    Write-Host "Navigateur ouvert sur http://localhost:3000" -ForegroundColor Green
} catch {
    Write-Host "Impossible d'ouvrir le navigateur" -ForegroundColor Yellow
    Write-Host "Ouvrez manuellement : http://localhost:3000" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   SERVEURS ACTIFS" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend  : " -NoNewline -ForegroundColor Gray
Write-Host "http://localhost:3001" -ForegroundColor Green
Write-Host "Frontend : " -NoNewline -ForegroundColor Gray
Write-Host "http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Connexion : sambafaye184@yahoo.fr" -ForegroundColor Cyan
Write-Host "            atsatsATS1.ATS" -ForegroundColor Cyan
Write-Host ""
Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "Appuyez sur une touche pour quitter..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")


