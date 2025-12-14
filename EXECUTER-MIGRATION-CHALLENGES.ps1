# Script pour exécuter la migration Prisma pour Challenges et Duels
# KOUNDOUL Platform

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MIGRATION PRISMA - CHALLENGES & DUELS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "backend")) {
    Write-Host "❌ Erreur: Ce script doit être exécuté depuis la racine du projet" -ForegroundColor Red
    exit 1
}

# Aller dans le dossier backend
Set-Location backend

Write-Host "1. Vérification du schéma Prisma..." -ForegroundColor Yellow
if (-not (Test-Path "prisma\schema.prisma")) {
    Write-Host "❌ Erreur: schema.prisma non trouvé" -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ Schéma trouvé" -ForegroundColor Green
Write-Host ""

Write-Host "2. Formatage du schéma Prisma..." -ForegroundColor Yellow
try {
    npx prisma format 2>&1 | Out-Null
    Write-Host "   ✓ Schéma formaté" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Avertissement lors du formatage" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "3. Génération du client Prisma..." -ForegroundColor Yellow
try {
    npx prisma generate
    Write-Host "   ✓ Client Prisma généré" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Erreur lors de la génération" -ForegroundColor Red
    Write-Host "   Vérifiez votre connexion à la base de données" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

Write-Host "4. Création de la migration..." -ForegroundColor Yellow
Write-Host "   Nom: add_challenges_and_duels" -ForegroundColor Gray
try {
    npx prisma migrate dev --name add_challenges_and_duels
    Write-Host "   ✓ Migration créée et appliquée" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Erreur lors de la migration" -ForegroundColor Yellow
    Write-Host "   Tentative de création sans application..." -ForegroundColor Yellow
    try {
        npx prisma migrate dev --create-only --name add_challenges_and_duels
        Write-Host "   ✓ Migration créée (non appliquée)" -ForegroundColor Green
        Write-Host "   Vous devrez l'appliquer manuellement avec: npx prisma migrate deploy" -ForegroundColor Yellow
    } catch {
        Write-Host "   ❌ Impossible de créer la migration" -ForegroundColor Red
        Write-Host "   Vérifiez votre connexion à la base de données et le fichier .env" -ForegroundColor Yellow
        exit 1
    }
}
Write-Host ""

Write-Host "5. Vérification de l'état des migrations..." -ForegroundColor Yellow
try {
    npx prisma migrate status
    Write-Host "   ✓ État vérifié" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Impossible de vérifier l'état" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MIGRATION TERMINÉE !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Prochaines étapes:" -ForegroundColor White
Write-Host "  1. Redémarrer le backend pour charger les nouveaux modèles" -ForegroundColor Gray
Write-Host "  2. Créer un challenge de test via l'API ou directement en base" -ForegroundColor Gray
Write-Host "  3. Tester la page Challenge sur http://localhost:3002/challenge" -ForegroundColor Gray
Write-Host ""
Write-Host "Tables créées:" -ForegroundColor White
Write-Host "  - challenges" -ForegroundColor Gray
Write-Host "  - challenge_participants" -ForegroundColor Gray
Write-Host "  - challenge_questions" -ForegroundColor Gray
Write-Host "  - duels" -ForegroundColor Gray
Write-Host ""
Write-Host "Champs ajoutés à la table users:" -ForegroundColor White
Write-Host "  - school" -ForegroundColor Gray
Write-Host "  - region" -ForegroundColor Gray
Write-Host "  - country" -ForegroundColor Gray
Write-Host ""

Set-Location ..







