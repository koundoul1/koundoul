# ===========================================
# GENERATEUR DE JWT_SECRET SECURISE
# ===========================================

Write-Host "Generation d'un JWT_SECRET securise" -ForegroundColor Cyan
Write-Host ""

# Essayer avec Node.js d'abord
if (Get-Command node -ErrorAction SilentlyContinue) {
    Write-Host "Utilisation de Node.js pour generer le secret..." -ForegroundColor Gray
    $secret = node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
} else {
    Write-Host "Node.js non trouve, utilisation de PowerShell..." -ForegroundColor Yellow
    # Generation alternative avec PowerShell
    $bytes = New-Object byte[] 32
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    $secret = [System.BitConverter]::ToString($bytes).Replace("-", "").ToLower()
}

if ([string]::IsNullOrWhiteSpace($secret)) {
    Write-Host "ERREUR: Impossible de generer le secret" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "SUCCES: JWT_SECRET genere :" -ForegroundColor Green
Write-Host ""
Write-Host "   $secret" -ForegroundColor White
Write-Host ""
Write-Host "Copiez cette valeur dans les variables d'environnement Render :" -ForegroundColor Cyan
Write-Host ""
Write-Host "   JWT_SECRET=$secret" -ForegroundColor White
Write-Host ""
Write-Host "IMPORTANT: Gardez ce secret en securite et ne le partagez jamais !" -ForegroundColor Yellow
Write-Host ""
