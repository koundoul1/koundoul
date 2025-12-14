# ===========================================
# SCRIPT DE PREPARATION DES REPOSITORIES GITHUB
# ===========================================

Write-Host "Preparation des repositories GitHub pour Koundoul" -ForegroundColor Cyan
Write-Host ""

# Verifier que Git est installe
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "ERREUR: Git n'est pas installe. Veuillez installer Git d'abord." -ForegroundColor Red
    exit 1
}

# Nom d'utilisateur GitHub
$githubUsername = "koundoul1"
Write-Host "Utilisation du nom d'utilisateur GitHub: $githubUsername" -ForegroundColor Cyan
Write-Host ""

# Backend
Write-Host "Preparation du BACKEND..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "backend"

if (Test-Path $backendPath) {
    Set-Location $backendPath
    
    if (Test-Path ".git") {
        Write-Host "ATTENTION: Repository Git existe deja dans backend/" -ForegroundColor Yellow
        $continue = Read-Host "Voulez-vous continuer ? (o/n)"
        if ($continue -ne "o" -and $continue -ne "O") {
            Write-Host "Operation annulee" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "   Initialisation du repository Git..." -ForegroundColor Gray
        git init | Out-Null
    }
    
    if (-not (Test-Path ".gitignore")) {
        Write-Host "   Creation du .gitignore..." -ForegroundColor Gray
        Copy-Item (Join-Path $PSScriptRoot ".gitignore") ".gitignore" -ErrorAction SilentlyContinue
    }
    
    Write-Host "   Ajout des fichiers..." -ForegroundColor Gray
    git add . 2>&1 | Out-Null
    
    Write-Host "   Creation du commit initial..." -ForegroundColor Gray
    git commit -m "Initial commit - Backend ready for Render deployment" 2>&1 | Out-Null
    
    Write-Host ""
    Write-Host "SUCCES: Backend prepare !" -ForegroundColor Green
    Write-Host ""
    Write-Host "Commandes a executer pour pousser sur GitHub :" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   cd backend" -ForegroundColor White
    Write-Host "   git remote add origin https://github.com/koundoul1/koundoul-backend.git" -ForegroundColor White
    Write-Host "   git branch -M main" -ForegroundColor White
    Write-Host "   git push -u origin main" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "ERREUR: Dossier backend/ non trouve" -ForegroundColor Red
}

# Frontend
Write-Host ""
Write-Host "Preparation du FRONTEND..." -ForegroundColor Yellow
$frontendPath = Join-Path $PSScriptRoot "frontend"

if (Test-Path $frontendPath) {
    Set-Location $frontendPath
    
    if (Test-Path ".git") {
        Write-Host "ATTENTION: Repository Git existe deja dans frontend/" -ForegroundColor Yellow
        $continue = Read-Host "Voulez-vous continuer ? (o/n)"
        if ($continue -ne "o" -and $continue -ne "O") {
            Write-Host "Operation annulee" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "   Initialisation du repository Git..." -ForegroundColor Gray
        git init | Out-Null
    }
    
    if (-not (Test-Path ".gitignore")) {
        Write-Host "   Creation du .gitignore..." -ForegroundColor Gray
        Copy-Item (Join-Path $PSScriptRoot ".gitignore") ".gitignore" -ErrorAction SilentlyContinue
    }
    
    Write-Host "   Ajout des fichiers..." -ForegroundColor Gray
    git add . 2>&1 | Out-Null
    
    Write-Host "   Creation du commit initial..." -ForegroundColor Gray
    git commit -m "Initial commit - Frontend ready for Vercel deployment" 2>&1 | Out-Null
    
    Write-Host ""
    Write-Host "SUCCES: Frontend prepare !" -ForegroundColor Green
    Write-Host ""
    Write-Host "Commandes a executer pour pousser sur GitHub :" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   cd frontend" -ForegroundColor White
    Write-Host "   git remote add origin https://github.com/koundoul1/koundoul-frontend.git" -ForegroundColor White
    Write-Host "   git branch -M main" -ForegroundColor White
    Write-Host "   git push -u origin main" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "ERREUR: Dossier frontend/ non trouve" -ForegroundColor Red
}

Write-Host ""
Write-Host "Preparation terminee !" -ForegroundColor Green
Write-Host ""
Write-Host "PROCHAINES ETAPES :" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Creer les repositories sur GitHub :" -ForegroundColor Yellow
Write-Host "   - https://github.com/new (nom: koundoul-backend)" -ForegroundColor White
Write-Host "   - https://github.com/new (nom: koundoul-frontend)" -ForegroundColor White
Write-Host ""
Write-Host "2. Pousser le code avec les commandes affichees ci-dessus" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Suivre le guide dans README_DEPLOIEMENT.md pour deployer" -ForegroundColor Yellow
Write-Host ""

Set-Location $PSScriptRoot
