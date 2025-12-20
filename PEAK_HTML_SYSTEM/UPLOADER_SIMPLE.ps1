# Script simple pour uploader PK-4358-DER-DESIGN.html vers Supabase
# Ce script demande la cle Supabase si necessaire

Write-Host "=== Upload PK-4358 vers Supabase ===" -ForegroundColor Cyan
Write-Host ""

# Chemin du fichier
$filePath = "C:\Users\conta\peak-1000\Fichiers Html\PK-4358-DER-DESIGN.html"
$numeroDossier = "PK-4358"

# Verifier que le fichier existe
if (-not (Test-Path $filePath)) {
    Write-Host "Fichier non trouve: $filePath" -ForegroundColor Red
    exit 1
}

Write-Host "Fichier trouve" -ForegroundColor Green
Write-Host "   $filePath" -ForegroundColor Gray
Write-Host ""

# Demander la cle Supabase si necessaire
$supabaseKey = $env:NEXT_PUBLIC_SUPABASE_ANON_KEY

if (-not $supabaseKey) {
    Write-Host "Cle Supabase requise" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Pour obtenir la cle:" -ForegroundColor Cyan
    Write-Host "1. Allez sur https://supabase.com/dashboard/project/wnbkplyerizogmufatxb/settings/api" -ForegroundColor White
    Write-Host "2. Copiez la cle 'anon public'" -ForegroundColor White
    Write-Host ""
    $supabaseKey = Read-Host "Collez votre cle Supabase anon"
    
    if ([string]::IsNullOrWhiteSpace($supabaseKey)) {
        Write-Host "Cle requise pour continuer" -ForegroundColor Red
        exit 1
    }
    
    $env:NEXT_PUBLIC_SUPABASE_ANON_KEY = $supabaseKey
}

$env:NEXT_PUBLIC_SUPABASE_URL = "https://wnbkplyerizogmufatxb.supabase.co"

Write-Host ""
Write-Host "Lancement de l'upload..." -ForegroundColor Cyan
Write-Host ""

# Executer le script Node.js
$scriptPath = Join-Path $PSScriptRoot "scripts\upload-file-direct.cjs"
node $scriptPath $filePath $numeroDossier

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Upload reussi !" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Erreur lors de l'upload" -ForegroundColor Red
}
