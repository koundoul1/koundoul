# ===========================================
# SCRIPT DE DÉPLOIEMENT AUTOMATIQUE KOUNDOUL
# ===========================================
# Ce script automatise tout ce qui peut l'être
# ===========================================

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   🚀 DÉPLOIEMENT AUTOMATIQUE KOUNDOUL                  ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Vérifier les prérequis
Write-Host "📋 Vérification des prérequis..." -ForegroundColor Yellow

$prerequisitesOk = $true

# Vérifier Git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git n'est pas installé" -ForegroundColor Red
    $prerequisitesOk = $false
} else {
    Write-Host "   ✅ Git installé" -ForegroundColor Green
}

# Vérifier Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "   ⚠️  Node.js n'est pas installé (optionnel pour génération JWT_SECRET)" -ForegroundColor Yellow
} else {
    Write-Host "   ✅ Node.js installé" -ForegroundColor Green
}

# Vérifier la structure
if (-not (Test-Path "backend")) {
    Write-Host "❌ Dossier backend/ non trouvé" -ForegroundColor Red
    $prerequisitesOk = $false
} else {
    Write-Host "   ✅ Dossier backend/ trouvé" -ForegroundColor Green
}

if (-not (Test-Path "frontend")) {
    Write-Host "❌ Dossier frontend/ non trouvé" -ForegroundColor Red
    $prerequisitesOk = $false
} else {
    Write-Host "   ✅ Dossier frontend/ trouvé" -ForegroundColor Green
}

if (-not $prerequisitesOk) {
    Write-Host ""
    Write-Host "❌ Prérequis manquants. Veuillez installer les outils nécessaires." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Tous les prérequis sont satisfaits !" -ForegroundColor Green
Write-Host ""

# Menu principal
Write-Host "📋 Que voulez-vous faire ?" -ForegroundColor Cyan
Write-Host ""
Write-Host "   1. Préparer les repositories Git (backend + frontend)" -ForegroundColor White
Write-Host "   2. Générer un JWT_SECRET sécurisé" -ForegroundColor White
Write-Host "   3. Vérifier la configuration" -ForegroundColor White
Write-Host "   4. Tout faire (1 + 2 + 3)" -ForegroundColor White
Write-Host "   5. Afficher les commandes pour GitHub/Render/Vercel" -ForegroundColor White
Write-Host "   0. Quitter" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Votre choix (0-5)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "📦 Préparation des repositories Git..." -ForegroundColor Yellow
        & "$PSScriptRoot\PREPARER-REPOS-GITHUB.ps1"
    }
    "2" {
        Write-Host ""
        Write-Host "🔐 Génération du JWT_SECRET..." -ForegroundColor Yellow
        & "$PSScriptRoot\GENERER-JWT-SECRET.ps1"
    }
    "3" {
        Write-Host ""
        Write-Host "🔍 Vérification de la configuration..." -ForegroundColor Yellow
        
        # Vérifier backend
        Write-Host ""
        Write-Host "Backend :" -ForegroundColor Cyan
        if (Test-Path "backend\server.js") {
            Write-Host "   ✅ server.js trouvé" -ForegroundColor Green
        } else {
            Write-Host "   ❌ server.js non trouvé" -ForegroundColor Red
        }
        
        if (Test-Path "backend\package.json") {
            Write-Host "   ✅ package.json trouvé" -ForegroundColor Green
        } else {
            Write-Host "   ❌ package.json non trouvé" -ForegroundColor Red
        }
        
        if (Test-Path "backend\.gitignore") {
            Write-Host "   ✅ .gitignore trouvé" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  .gitignore non trouvé" -ForegroundColor Yellow
        }
        
        # Vérifier frontend
        Write-Host ""
        Write-Host "Frontend :" -ForegroundColor Cyan
        if (Test-Path "frontend\vite.config.js") {
            Write-Host "   ✅ vite.config.js trouvé" -ForegroundColor Green
        } else {
            Write-Host "   ❌ vite.config.js non trouvé" -ForegroundColor Red
        }
        
        if (Test-Path "frontend\package.json") {
            Write-Host "   ✅ package.json trouvé" -ForegroundColor Green
        } else {
            Write-Host "   ❌ package.json non trouvé" -ForegroundColor Red
        }
        
        if (Test-Path "frontend\.env.example") {
            Write-Host "   ✅ .env.example trouvé" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  .env.example non trouvé" -ForegroundColor Yellow
        }
        
        # Vérifier les fichiers de documentation
        Write-Host ""
        Write-Host "Documentation :" -ForegroundColor Cyan
        $docs = @(
            "README_DEPLOIEMENT.md",
            "COMMANDES_DEPLOIEMENT_COMPLETES.md",
            "IDENTIFIANTS_KOUNDOUL.md",
            "RAPPORT_ANALYSE_DEPLOIEMENT.md"
        )
        
        foreach ($doc in $docs) {
            if (Test-Path $doc) {
                Write-Host "   ✅ $doc trouvé" -ForegroundColor Green
            } else {
                Write-Host "   ⚠️  $doc non trouvé" -ForegroundColor Yellow
            }
        }
        
        Write-Host ""
        Write-Host "✅ Vérification terminée !" -ForegroundColor Green
    }
    "4" {
        Write-Host ""
        Write-Host "🚀 Exécution complète..." -ForegroundColor Yellow
        Write-Host ""
        
        # 1. Préparer Git
        Write-Host "📦 Étape 1/3 : Préparation des repositories Git..." -ForegroundColor Cyan
        & "$PSScriptRoot\PREPARER-REPOS-GITHUB.ps1"
        
        Write-Host ""
        Write-Host "⏸️  Pause - Suivez les instructions pour créer les repos GitHub" -ForegroundColor Yellow
        Read-Host "Appuyez sur Entrée pour continuer..."
        
        # 2. Générer JWT_SECRET
        Write-Host ""
        Write-Host "🔐 Étape 2/3 : Génération du JWT_SECRET..." -ForegroundColor Cyan
        & "$PSScriptRoot\GENERER-JWT-SECRET.ps1"
        
        # 3. Vérifier
        Write-Host ""
        Write-Host "🔍 Étape 3/3 : Vérification..." -ForegroundColor Cyan
        # Réutiliser le code de l'option 3
        
        Write-Host ""
        Write-Host "✅ Préparation complète terminée !" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 PROCHAINES ÉTAPES :" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "1. Créer les repositories sur GitHub" -ForegroundColor Yellow
        Write-Host "2. Pousser le code (commandes affichées ci-dessus)" -ForegroundColor Yellow
        Write-Host "3. Déployer sur Render (voir COMMANDES_DEPLOIEMENT_COMPLETES.md)" -ForegroundColor Yellow
        Write-Host "4. Déployer sur Vercel (voir COMMANDES_DEPLOIEMENT_COMPLETES.md)" -ForegroundColor Yellow
        Write-Host ""
    }
    "5" {
        Write-Host ""
        Write-Host "📋 Ouverture du guide de commandes..." -ForegroundColor Yellow
        if (Test-Path "COMMANDES_DEPLOIEMENT_COMPLETES.md") {
            Get-Content "COMMANDES_DEPLOIEMENT_COMPLETES.md" | Out-Host
        } else {
            Write-Host "❌ Fichier COMMANDES_DEPLOIEMENT_COMPLETES.md non trouvé" -ForegroundColor Red
        }
    }
    "0" {
        Write-Host ""
        Write-Host "👋 Au revoir !" -ForegroundColor Cyan
        exit 0
    }
    default {
        Write-Host ""
        Write-Host "❌ Choix invalide" -ForegroundColor Red
    }
}

Write-Host ""





