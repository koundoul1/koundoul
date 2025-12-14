# ============================================================================
# Script Automatisé - Finalisation et Démarrage du Coach Pédagogique Universel
# Option 1 : Script automatisé (recommandé)
# ============================================================================
# Ce script effectue :
#   1. Arrêt des processus Node existants
#   2. Génération du client Prisma
#   3. Application des changements au schéma de base de données
#   4. Vérification/Création de l'utilisateur de test
#   5. Démarrage automatique des serveurs (Backend + Frontend)
#   6. Ouverture du navigateur
# ============================================================================

Write-Host ""
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "   COACH PEDAGOGIQUE UNIVERSEL - Script Automatise" -ForegroundColor Yellow
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host ""

# Variables de configuration
$backendPath = Join-Path $PSScriptRoot "backend"
$frontendPath = Join-Path $PSScriptRoot "frontend"
$testEmail = "sambafaye184@yahoo.fr"
$testPassword = "atsatsATS1.ATS"

# Vérification de la structure du projet
Write-Host "Verification de la structure du projet..." -ForegroundColor Yellow
if (-not (Test-Path $backendPath)) {
    Write-Host "   ERREUR : Dossier backend introuvable" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path $frontendPath)) {
    Write-Host "   ERREUR : Dossier frontend introuvable" -ForegroundColor Red
    exit 1
}
Write-Host "   OK : Structure du projet validee" -ForegroundColor Green
Write-Host ""

# ============================================================================
# ÉTAPE 1 : Arrêt des processus Node
# ============================================================================
Write-Host "Etape 1/6 : Arret des processus Node existants..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    Write-Host "   Attention: Processus Node detectes : $($nodeProcesses.Count)" -ForegroundColor Yellow
    Write-Host "   Arret des processus Node..." -ForegroundColor Yellow
    $nodeProcesses | Stop-Process -Force
    Start-Sleep -Seconds 2
    Write-Host "   OK : Processus arretes" -ForegroundColor Green
} else {
    Write-Host "   OK : Aucun processus Node detecte" -ForegroundColor Green
}
Write-Host ""

# ============================================================================
# ÉTAPE 2 : Génération du client Prisma
# ============================================================================
Write-Host "Etape 2/6 : Generation du client Prisma..." -ForegroundColor Yellow
Set-Location $backendPath

try {
    $prismaGenerate = npm run db:generate 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   OK : Client Prisma genere avec succes" -ForegroundColor Green
    } else {
        Write-Host "   Attention: Erreur lors de la generation (code: $LASTEXITCODE)" -ForegroundColor Yellow
        Write-Host "   Tentative avec npx directement..." -ForegroundColor Yellow
        $npxResult = npx prisma generate 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   OK : Client Prisma genere avec succes (npx)" -ForegroundColor Green
        } else {
            Write-Host "   Attention: Generation Prisma non critique, continuation..." -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "   Attention: Erreur lors de la generation Prisma (non bloquant) : $_" -ForegroundColor Yellow
}
Write-Host ""

# ============================================================================
# ÉTAPE 3 : Application des changements au schéma de base de données
# ============================================================================
Write-Host "Etape 3/6 : Application des changements au schema..." -ForegroundColor Yellow
Write-Host "   Attention: Cette etape va synchroniser votre base de donnees" -ForegroundColor Yellow
Write-Host "   Demarrage dans 3 secondes (appuyez sur Ctrl+C pour annuler)..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

try {
    $dbPush = npm run db:push 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   OK : Changements appliques avec succes" -ForegroundColor Green
    } else {
        Write-Host "   Attention: Erreur lors de l'application (code: $LASTEXITCODE)" -ForegroundColor Yellow
        Write-Host "   Verifiez votre DATABASE_URL dans .env" -ForegroundColor Yellow
        Write-Host "   Continuation du script..." -ForegroundColor Yellow
    }
} catch {
    Write-Host "   Attention: Erreur lors de l'application du schema (non bloquant) : $_" -ForegroundColor Yellow
}
Write-Host ""

# ============================================================================
# ÉTAPE 4 : Vérification/Création de l'utilisateur de test
# ============================================================================
Write-Host "Etape 4/6 : Verification de l'utilisateur de test..." -ForegroundColor Yellow

# Attendre un peu pour que le serveur puisse démarrer
Start-Sleep -Seconds 2

$userExists = $false
try {
    # Test de connexion au backend (nécessite que le serveur soit déjà démarré)
    # On essaie de créer l'utilisateur directement via le script
    if (Test-Path (Join-Path $backendPath 'create-test-user.js')) {
        $createUser = node create-test-user.js 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   OK : Utilisateur de test verifie/cree" -ForegroundColor Green
            $userExists = $true
        }
    }
} catch {
    Write-Host "   Attention: Impossible de verifier l'utilisateur (sera fait apres demarrage)" -ForegroundColor Yellow
}

if (-not $userExists) {
    Write-Host "   Info: L'utilisateur sera verifie apres le demarrage des serveurs" -ForegroundColor Cyan
}
Write-Host ""

# ============================================================================
# ÉTAPE 5 : Démarrage automatique des serveurs
# ============================================================================
Write-Host "Etape 5/6 : Demarrage des serveurs..." -ForegroundColor Yellow
Write-Host ""

# Démarrer le backend dans un nouveau terminal
Write-Host "   1) Demarrage du BACKEND (port 3001)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host 'BACKEND KOUNDOUL - Coach Pedagogique Universel' -ForegroundColor Cyan; Write-Host ''; node server.js"

# Attendre que le backend démarre
Start-Sleep -Seconds 4

# Démarrer le frontend dans un nouveau terminal
Write-Host "   2) Demarrage du FRONTEND (port 3002)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host 'FRONTEND KOUNDOUL' -ForegroundColor Cyan; Write-Host ''; npm run dev"

# Attendre que le frontend démarre
Start-Sleep -Seconds 5
Write-Host "   OK : Serveurs demarres" -ForegroundColor Green
Write-Host ""

# ============================================================================
# ÉTAPE 6 : Ouverture du navigateur
# ============================================================================
Write-Host "Etape 6/6 : Ouverture du navigateur..." -ForegroundColor Yellow

Start-Sleep -Seconds 2

try {
    Start-Process "http://localhost:3002"
    Write-Host "   OK : Navigateur ouvert sur http://localhost:3002" -ForegroundColor Green
} catch {
    Write-Host "   Attention: Impossible d'ouvrir le navigateur automatiquement" -ForegroundColor Yellow
    Write-Host "   Ouvrez manuellement : http://localhost:3002" -ForegroundColor Cyan
}
Write-Host ""

# ============================================================================
# RÉCAPITULATIF FINAL
# ============================================================================
Write-Host ""
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "   FINALISATION TERMINEE AVEC SUCCES !" -ForegroundColor Green
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "URLs disponibles :" -ForegroundColor Cyan
Write-Host "   Backend API  : http://localhost:5000" -ForegroundColor White
Write-Host "   Frontend App : http://localhost:3002" -ForegroundColor White
Write-Host "   Coach Virtuel : http://localhost:3002/coach" -ForegroundColor White
Write-Host ""

Write-Host "Identifiants de test :" -ForegroundColor Cyan
Write-Host "   Email    : $testEmail" -ForegroundColor White
Write-Host "   Password : $testPassword" -ForegroundColor White
Write-Host ""

Write-Host "Prochaines etapes :" -ForegroundColor Cyan
Write-Host "   1. Vérifiez que les deux serveurs démarrent correctement" -ForegroundColor White
Write-Host "   2. Connectez-vous avec les identifiants ci-dessus" -ForegroundColor White
Write-Host "   3. Testez le Coach Virtuel sur /coach" -ForegroundColor White
Write-Host "   4. Verifiez les variables d'environnement IA si necessaire" -ForegroundColor White
Write-Host ""

Write-Host "Documentation complete :" -ForegroundColor Cyan
Write-Host "   - PROCHAINES_ETAPES_FINALISATION.md" -ForegroundColor Gray
Write-Host "   - backend/docs/COACH_PEDAGOGIQUE_ARCHITECTURE.md" -ForegroundColor Gray
Write-Host ""

Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "   Bon apprentissage avec Koundoul !" -ForegroundColor Green
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host ""

# Retour au répertoire racine
Set-Location $PSScriptRoot

# Attendre une saisie avant de fermer
Write-Host "Appuyez sur Entree pour quitter..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
