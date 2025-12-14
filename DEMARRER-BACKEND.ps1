# Script pour démarrer le backend Koundoul

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DEMARRAGE BACKEND KOUNDOUL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Arrêter les processus Node existants (backend)
Write-Host "1. Arret des processus backend existants..." -ForegroundColor Yellow
$backendProcesses = Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {
    try {
        $proc = Get-WmiObject Win32_Process -Filter "ProcessId = $($_.Id)" -ErrorAction Stop
        $cmdLine = $proc.CommandLine
        $cmdLine -like "*server.js*" -or $cmdLine -like "*backend*"
    } catch {
        $false
    }
}
if ($backendProcesses) {
    $backendProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "   OK : Processus arretes" -ForegroundColor Green
} else {
    Write-Host "   OK : Aucun processus backend trouve" -ForegroundColor Gray
}

Start-Sleep -Seconds 2
Write-Host ""

# Vérifier que le fichier .env existe
Write-Host "2. Verification de la configuration..." -ForegroundColor Yellow
if (-not (Test-Path "backend\.env")) {
    Write-Host "   ⚠️  ATTENTION: backend\.env n'existe pas!" -ForegroundColor Red
    Write-Host "   Créez le fichier .env dans le dossier backend avec:" -ForegroundColor Yellow
    Write-Host "   - DATABASE_URL" -ForegroundColor Gray
    Write-Host "   - JWT_SECRET" -ForegroundColor Gray
    Write-Host "   - PORT=5000" -ForegroundColor Gray
    Write-Host "   - GEMINI_API_KEY" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "   OK : Fichier .env trouve" -ForegroundColor Green
}
Write-Host ""

# Générer Prisma Client (si nécessaire)
Write-Host "3. Generation Prisma Client..." -ForegroundColor Yellow
Set-Location backend
npx prisma generate 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK : Prisma Client genere" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Avertissement: Erreur lors de la generation Prisma" -ForegroundColor Yellow
}
Write-Host ""

# Démarrer le backend
Write-Host "4. Demarrage du backend sur port 5000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'BACKEND KOUNDOUL - Port 5000' -ForegroundColor Cyan; Write-Host ''; node server.js"
Set-Location ..

Start-Sleep -Seconds 3

Write-Host "   OK : Backend demarre!" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BACKEND DEMARRE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Le backend est accessible sur:" -ForegroundColor White
Write-Host "  http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "API Endpoints:" -ForegroundColor White
Write-Host "  - http://localhost:5000/api/auth/login" -ForegroundColor Gray
Write-Host "  - http://localhost:5000/api/auth/profile" -ForegroundColor Gray
Write-Host "  - http://localhost:5000/api/solver" -ForegroundColor Gray
Write-Host "  - http://localhost:5000/api/microlessons" -ForegroundColor Gray
Write-Host ""
Write-Host "Le frontend doit etre lance sur:" -ForegroundColor White
Write-Host "  http://localhost:3002" -ForegroundColor Cyan
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

