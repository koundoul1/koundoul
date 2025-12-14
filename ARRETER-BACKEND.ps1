# Script pour arrêter tous les processus backend Koundoul

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ARRET BACKEND KOUNDOUL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Trouver les processus Node qui tournent server.js
Write-Host "1. Recherche des processus backend..." -ForegroundColor Yellow
$backendProcesses = Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {
    try {
        $proc = Get-WmiObject Win32_Process -Filter "ProcessId = $($_.Id)" -ErrorAction Stop
        $cmdLine = $proc.CommandLine
        ($cmdLine -like "*server.js*") -or ($cmdLine -like "*backend*" -and $cmdLine -like "*node.exe*")
    } catch {
        $false
    }
}

if ($backendProcesses) {
    Write-Host "   Trouve $($backendProcesses.Count) processus backend" -ForegroundColor Yellow
    $backendProcesses | ForEach-Object {
        Write-Host "   - PID $($_.Id): $(($_.CommandLine -split ' ')[-1])" -ForegroundColor Gray
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
    Write-Host "   OK : Tous les processus backend arretes" -ForegroundColor Green
} else {
    Write-Host "   OK : Aucun processus backend trouve" -ForegroundColor Gray
}

Start-Sleep -Seconds 2

# Vérifier que le port 5000 est libéré
Write-Host ""
Write-Host "2. Verification du port 5000..." -ForegroundColor Yellow
$port5000 = netstat -ano | findstr :5000
if ($port5000) {
    Write-Host "   ATTENTION: Le port 5000 est encore utilise" -ForegroundColor Red
    Write-Host "   Executez: netstat -ano | findstr :5000" -ForegroundColor Yellow
} else {
    Write-Host "   OK : Le port 5000 est libre" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BACKEND ARRETE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pour redemarrer le backend:" -ForegroundColor White
Write-Host "  .\DEMARRER-BACKEND.ps1" -ForegroundColor Cyan
Write-Host ""









