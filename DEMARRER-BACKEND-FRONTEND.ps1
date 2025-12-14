# Script pour démarrer Backend + Frontend Koundoul

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DEMARRAGE KOUNDOUL COMPLET" -ForegroundColor Cyan
Write-Host "  Backend + Frontend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Arrêter les processus Node existants
Write-Host "1. Arret des processus existants..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    foreach ($proc in $nodeProcesses) {
        try {
            $procInfo = Get-WmiObject Win32_Process -Filter "ProcessId = $($proc.Id)" -ErrorAction Stop
            $cmdLine = $procInfo.CommandLine
            if ($cmdLine -like "*server.js*" -or $cmdLine -like "*backend*" -or $cmdLine -like "*vite*" -or $cmdLine -like "*frontend*") {
                Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
                Write-Host "   Processus arrete : $cmdLine" -ForegroundColor Gray
            }
        } catch {
            # Ignorer les erreurs
        }
    }
    Start-Sleep -Seconds 2
}
Write-Host "   OK : Nettoyage termine" -ForegroundColor Green
Write-Host ""

# Vérifier la configuration backend
Write-Host "2. Verification configuration backend..." -ForegroundColor Yellow
if (-not (Test-Path "backend\.env")) {
    Write-Host "   ⚠️  ATTENTION: backend\.env n'existe pas!" -ForegroundColor Red
    Write-Host "   Le backend ne demarrera pas correctement." -ForegroundColor Yellow
} else {
    Write-Host "   OK : Fichier .env trouve" -ForegroundColor Green
}
Write-Host ""

# Générer Prisma Client
Write-Host "3. Generation Prisma Client..." -ForegroundColor Yellow
Push-Location backend
npx prisma generate 2>&1 | Out-Null
Pop-Location
Write-Host "   OK : Prisma Client genere" -ForegroundColor Green
Write-Host ""

# Démarrer le BACKEND
Write-Host "4. Demarrage du BACKEND (port 5000)..." -ForegroundColor Yellow
$backendScript = @"
Write-Host '========================================' -ForegroundColor Cyan
Write-Host '  BACKEND KOUNDOUL' -ForegroundColor Cyan
Write-Host '  Port 5000' -ForegroundColor Cyan
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ''
cd '$PWD\backend'
node server.js
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript
Write-Host "   OK : Backend demarre dans une nouvelle fenetre" -ForegroundColor Green
Write-Host ""

# Attendre un peu pour que le backend démarre
Start-Sleep -Seconds 4

# Démarrer le FRONTEND
Write-Host "5. Demarrage du FRONTEND (port 3002)..." -ForegroundColor Yellow
$frontendScript = @"
Write-Host '========================================' -ForegroundColor Magenta
Write-Host '  FRONTEND KOUNDOUL' -ForegroundColor Magenta
Write-Host '  Port 3002' -ForegroundColor Magenta
Write-Host '========================================' -ForegroundColor Magenta
Write-Host ''
cd '$PWD\frontend'
npm run dev
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript
Write-Host "   OK : Frontend demarre dans une nouvelle fenetre" -ForegroundColor Green
Write-Host ""

# Attendre un peu
Start-Sleep -Seconds 3

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SERVEURS DEMARRES !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "URLs:" -ForegroundColor White
Write-Host ""
Write-Host "  Frontend : " -NoNewline
Write-Host "http://localhost:3002" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Backend  : " -NoNewline
Write-Host "http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "  API      : " -NoNewline
Write-Host "http://localhost:5000/api" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Les deux serveurs tournent dans des fenetres separees." -ForegroundColor Yellow
Write-Host "Fermez ces fenetres pour arreter les serveurs." -ForegroundColor Gray
Write-Host ""
Write-Host "Pour tester la page Quiz :" -ForegroundColor White
Write-Host "   1. Ouvrez http://localhost:3002" -ForegroundColor Gray
Write-Host "   2. Connectez-vous" -ForegroundColor Gray
Write-Host "   3. Allez sur /quiz" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

