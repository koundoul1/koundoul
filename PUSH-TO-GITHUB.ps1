# Script pour pousser vers GitHub
# Usage: .\PUSH-TO-GITHUB.ps1

Write-Host "Configuration Git pour Koundoul" -ForegroundColor Cyan
Write-Host ""

# Verifier si un remote existe deja
$remoteExists = git remote -v 2>&1
if ($remoteExists -match "origin") {
    Write-Host "Un remote 'origin' existe deja" -ForegroundColor Yellow
    git remote -v
    $continue = Read-Host "Voulez-vous le remplacer? (o/n)"
    if ($continue -eq "o" -or $continue -eq "O") {
        git remote remove origin
    } else {
        Write-Host "Operation annulee" -ForegroundColor Red
        exit
    }
}

# Demander l'URL du depot GitHub
Write-Host ""
Write-Host "Entrez l'URL de votre depot GitHub:" -ForegroundColor Yellow
Write-Host "   Exemple: https://github.com/VOTRE_USERNAME/koundoul.git" -ForegroundColor Gray
$repoUrl = Read-Host "URL du depot"

if ([string]::IsNullOrWhiteSpace($repoUrl)) {
    Write-Host "URL vide, operation annulee" -ForegroundColor Red
    exit
}

# Ajouter le remote
Write-Host ""
Write-Host "Ajout du remote..." -ForegroundColor Cyan
git remote add origin $repoUrl

# Verifier la branche actuelle
$currentBranch = git branch --show-current
Write-Host "Branche actuelle: $currentBranch" -ForegroundColor Cyan

# Renommer en main si necessaire
if ($currentBranch -ne "main") {
    Write-Host "Renommage de la branche en main..." -ForegroundColor Cyan
    git branch -M main
}

# Afficher le statut
Write-Host ""
Write-Host "Statut Git:" -ForegroundColor Cyan
git status --short | Select-Object -First 10

# Demander confirmation pour push
Write-Host ""
Write-Host "Vous etes sur le point de pousser vers GitHub" -ForegroundColor Yellow
$confirm = Read-Host "Continuer? (o/n)"

if ($confirm -eq "o" -or $confirm -eq "O") {
    Write-Host ""
    Write-Host "Push vers GitHub..." -ForegroundColor Cyan
    git push -u origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Push reussi!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Prochaines etapes:" -ForegroundColor Cyan
        Write-Host "   1. Configurez Vercel pour le frontend" -ForegroundColor White
        Write-Host "   2. Configurez Render pour le backend" -ForegroundColor White
        Write-Host "   3. Voir DEPLOIEMENT_ACCES_LIBRE.md pour les details" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "Erreur lors du push" -ForegroundColor Red
        Write-Host "   Verifiez que le depot GitHub existe et que vous avez les permissions" -ForegroundColor Yellow
    }
} else {
    Write-Host "Operation annulee" -ForegroundColor Red
}
