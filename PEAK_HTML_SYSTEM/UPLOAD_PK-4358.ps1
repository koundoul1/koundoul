# Script PowerShell pour uploader PK-4358-DER-DESIGN.html vers Supabase
# Usage: .\UPLOAD_PK-4358.ps1

Write-Host "=== Upload PK-4358 vers Supabase Storage ===" -ForegroundColor Cyan
Write-Host ""

# Chemin du fichier
$filePath = "C:\Users\conta\peak-1000\Fichiers Html\PK-4358-DER-DESIGN.html"
$numeroDossier = "PK-4358"

# Vérifier que le fichier existe
if (-not (Test-Path $filePath)) {
    Write-Host "❌ Fichier non trouvé: $filePath" -ForegroundColor Red
    Write-Host ""
    Write-Host "Vérifiez le chemin du fichier" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Fichier trouvé: $filePath" -ForegroundColor Green
Write-Host ""

# Vérifier les variables d'environnement
$supabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL
$supabaseKey = $env:NEXT_PUBLIC_SUPABASE_ANON_KEY

if (-not $supabaseKey) {
    Write-Host "⚠️  Variable d'environnement NEXT_PUBLIC_SUPABASE_ANON_KEY non définie" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Pour définir la clé Supabase:" -ForegroundColor Cyan
    Write-Host "1. Allez sur https://supabase.com/dashboard" -ForegroundColor White
    Write-Host "2. Settings → API → Copiez 'anon public' key" -ForegroundColor White
    Write-Host "3. Exécutez:" -ForegroundColor White
    Write-Host "   `$env:NEXT_PUBLIC_SUPABASE_ANON_KEY='votre_cle_ici'" -ForegroundColor Gray
    Write-Host ""
    
    $key = Read-Host "Entrez votre clé Supabase anon (ou appuyez sur Entree pour annuler)"
    if ([string]::IsNullOrWhiteSpace($key)) {
        Write-Host "❌ Opération annulée" -ForegroundColor Red
        exit 1
    }
    $env:NEXT_PUBLIC_SUPABASE_ANON_KEY = $key
}

if (-not $supabaseUrl) {
    $env:NEXT_PUBLIC_SUPABASE_URL = "https://wnbkplyerizogmufatxb.supabase.co"
    Write-Host "✅ URL Supabase définie par défaut" -ForegroundColor Green
    Write-Host ""
}

# Exécuter le script Node.js
Write-Host "🚀 Lancement de l'upload..." -ForegroundColor Cyan
Write-Host ""

$scriptPath = Join-Path $PSScriptRoot "scripts\upload-file-direct.cjs"

if (-not (Test-Path $scriptPath)) {
    Write-Host "❌ Script non trouvé: $scriptPath" -ForegroundColor Red
    exit 1
}

# Vérifier que @supabase/supabase-js est installé
$nodeModulesPath = Join-Path $PSScriptRoot "..\node_modules\@supabase\supabase-js"
if (-not (Test-Path $nodeModulesPath)) {
    Write-Host "⚠️  @supabase/supabase-js non installé" -ForegroundColor Yellow
    Write-Host "Installation..." -ForegroundColor Cyan
    Set-Location (Split-Path $PSScriptRoot -Parent)
    npm install @supabase/supabase-js
    Set-Location $PSScriptRoot
}

# Exécuter le script
node $scriptPath $filePath $numeroDossier

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Upload terminé avec succès !" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Erreur lors de l'upload" -ForegroundColor Red
    Write-Host "Consultez les messages ci-dessus pour plus de détails" -ForegroundColor Yellow
}
