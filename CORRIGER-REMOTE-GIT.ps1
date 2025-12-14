# Script pour corriger le remote Git et pousser vers GitHub
# Ce script supprime l'ancien remote et configure le nouveau

Write-Host "=== Correction du remote Git ===" -ForegroundColor Cyan
Write-Host ""

# Supprimer l'ancien remote s'il existe
$remoteExists = git remote -v 2>&1
if ($remoteExists -match "origin") {
    Write-Host "Suppression de l'ancien remote 'origin'..." -ForegroundColor Yellow
    git remote remove origin
    Write-Host "Ancien remote supprime" -ForegroundColor Green
    Write-Host ""
}

# Demander la nouvelle URL
Write-Host "Entrez l'URL de votre depot GitHub:" -ForegroundColor Yellow
Write-Host "   Exemple: https://github.com/VOTRE_USERNAME/koundoul.git" -ForegroundColor Gray
Write-Host ""
$repoUrl = Read-Host "URL du depot"

if ([string]::IsNullOrWhiteSpace($repoUrl)) {
    Write-Host "URL vide, operation annulee" -ForegroundColor Red
    exit
}

# Nettoyer l'URL (enlever le slash final s'il existe)
$repoUrl = $repoUrl.TrimEnd('/')

# Ajouter le nouveau remote
Write-Host ""
Write-Host "Ajout du nouveau remote: $repoUrl" -ForegroundColor Cyan
git remote add origin $repoUrl

# Verifier la configuration
Write-Host ""
Write-Host "Configuration actuelle:" -ForegroundColor Cyan
git remote -v
Write-Host ""

# Demander confirmation pour push
Write-Host "Voulez-vous pousser le code maintenant? (o/n)" -ForegroundColor Yellow
$confirm = Read-Host

if ($confirm -eq "o" -or $confirm -eq "O") {
    Write-Host ""
    Write-Host "Push vers GitHub..." -ForegroundColor Cyan
    git push -u origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "=== SUCCES! ===" -ForegroundColor Green
        Write-Host "Le code a ete pousse vers GitHub avec succes!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "=== ERREUR ===" -ForegroundColor Red
        Write-Host "Le push a echoue. Verifiez:" -ForegroundColor Red
        Write-Host "   - Le depot GitHub existe a l'URL: $repoUrl" -ForegroundColor Yellow
        Write-Host "   - Vous avez les permissions d'ecriture" -ForegroundColor Yellow
        Write-Host "   - Votre authentification GitHub est configuree" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "Remote configure. Pour pousser plus tard, utilisez:" -ForegroundColor Cyan
    Write-Host "   git push -u origin main" -ForegroundColor White
}
