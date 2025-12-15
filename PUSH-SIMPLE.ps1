# Script ultra-simple pour pousser vers GitHub
# Fait tout automatiquement

Write-Host "=== Push vers GitHub - Koundoul ===" -ForegroundColor Cyan
Write-Host ""

# Votre nom d'utilisateur GitHub
$username = "koundoul1"
$repoName = "koundoul"
$repoUrl = "https://github.com/$username/$repoName.git"

Write-Host "Depot GitHub: $repoUrl" -ForegroundColor Yellow
Write-Host ""

# Verifier si remote existe deja
$remoteExists = git remote -v 2>&1
if ($remoteExists -match "origin") {
    Write-Host "Remote 'origin' existe deja" -ForegroundColor Yellow
    git remote -v
    Write-Host ""
    Write-Host "Suppression de l'ancien remote..." -ForegroundColor Yellow
    git remote remove origin
}

# Ajouter le remote
Write-Host "Configuration du remote..." -ForegroundColor Cyan
git remote add origin $repoUrl

Write-Host ""
Write-Host "Remote configure: $repoUrl" -ForegroundColor Green
Write-Host ""

# Push
Write-Host "Envoi du code vers GitHub..." -ForegroundColor Cyan
Write-Host "(Cela peut prendre quelques minutes)" -ForegroundColor Gray
Write-Host ""

git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=== SUCCES! ===" -ForegroundColor Green
    Write-Host "Votre code a ete envoye vers GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Vous pouvez voir votre code ici:" -ForegroundColor Cyan
    Write-Host "https://github.com/$username/$repoName" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "=== ERREUR ===" -ForegroundColor Red
    Write-Host ""
    Write-Host "Le push a echoue. Essayez avec --force:" -ForegroundColor Yellow
    Write-Host "git push -u origin main --force" -ForegroundColor White
    Write-Host ""
    Write-Host "OU si le depot n'existe pas, creez-le sur GitHub d'abord:" -ForegroundColor Yellow
    Write-Host "https://github.com/new" -ForegroundColor White
}
