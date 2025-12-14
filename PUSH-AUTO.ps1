# Script automatique pour pousser vers GitHub
# Ce script essaie de detecter l'URL GitHub automatiquement

Write-Host "=== Configuration automatique Git pour Koundoul ===" -ForegroundColor Cyan
Write-Host ""

# Verifier si un remote existe deja
$remoteExists = git remote -v 2>&1
if ($remoteExists -match "origin") {
    Write-Host "Remote 'origin' trouve:" -ForegroundColor Green
    git remote -v
    Write-Host ""
    Write-Host "Push vers GitHub..." -ForegroundColor Cyan
    git push -u origin main
    exit
}

# Essayer de detecter l'utilisateur GitHub
$gitUser = git config user.name
$gitEmail = git config user.email

Write-Host "Utilisateur Git detecte: $gitUser ($gitEmail)" -ForegroundColor Yellow
Write-Host ""

# Proposer une URL par defaut
if ($gitEmail -match "@") {
    $possibleUsername = $gitEmail.Split("@")[0]
    $defaultUrl = "https://github.com/$possibleUsername/koundoul.git"
    Write-Host "URL GitHub proposee: $defaultUrl" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Si cette URL est correcte, appuyez sur Entree" -ForegroundColor Yellow
    Write-Host "Sinon, entrez l'URL de votre depot GitHub:" -ForegroundColor Yellow
    $repoUrl = Read-Host "URL du depot"
    
    if ([string]::IsNullOrWhiteSpace($repoUrl)) {
        $repoUrl = $defaultUrl
        Write-Host "Utilisation de l'URL par defaut: $repoUrl" -ForegroundColor Green
    }
} else {
    Write-Host "Entrez l'URL de votre depot GitHub:" -ForegroundColor Yellow
    Write-Host "   Exemple: https://github.com/VOTRE_USERNAME/koundoul.git" -ForegroundColor Gray
    $repoUrl = Read-Host "URL du depot"
}

if ([string]::IsNullOrWhiteSpace($repoUrl)) {
    Write-Host "URL vide, operation annulee" -ForegroundColor Red
    exit
}

# Ajouter le remote
Write-Host ""
Write-Host "Ajout du remote: $repoUrl" -ForegroundColor Cyan
git remote add origin $repoUrl

# Verifier la branche
$currentBranch = git branch --show-current
if ($currentBranch -ne "main") {
    Write-Host "Renommage de la branche en 'main'..." -ForegroundColor Cyan
    git branch -M main
}

# Push automatique
Write-Host ""
Write-Host "Push vers GitHub..." -ForegroundColor Cyan
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=== SUCCES! ===" -ForegroundColor Green
    Write-Host "Le code a ete pousse vers GitHub avec succes!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Prochaines etapes:" -ForegroundColor Cyan
    Write-Host "   1. Configurez Vercel pour le frontend (dossier: frontend)" -ForegroundColor White
    Write-Host "   2. Configurez Render pour le backend (dossier: backend)" -ForegroundColor White
    Write-Host "   3. Voir DEPLOIEMENT_ACCES_LIBRE.md pour les details" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "=== ERREUR ===" -ForegroundColor Red
    Write-Host "Le push a echoue. Verifiez:" -ForegroundColor Red
    Write-Host "   - Le depot GitHub existe et est accessible" -ForegroundColor Yellow
    Write-Host "   - Vous avez les permissions d'ecriture" -ForegroundColor Yellow
    Write-Host "   - Votre authentification GitHub est configuree" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Pour configurer l'authentification GitHub:" -ForegroundColor Cyan
    Write-Host "   git config --global credential.helper manager-core" -ForegroundColor White
}
