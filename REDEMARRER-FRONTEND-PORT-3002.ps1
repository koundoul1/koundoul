# Script pour redémarrer le frontend sur le port 3002

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  REDEMARRAGE FRONTEND - PORT 3002" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Arrêter tous les processus Node (frontend Vite)
Write-Host "1. Arret des processus frontend..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {
    $_.Path -like "*vite*" -or (Get-WmiObject Win32_Process -Filter "ProcessId = $($_.Id)").CommandLine -like "*vite*"
} | Stop-Process -Force -ErrorAction SilentlyContinue

Start-Sleep -Seconds 2
Write-Host "   OK : Processus arretes" -ForegroundColor Green

# Démarrer le frontend sur le port 3002
Write-Host ""
Write-Host "2. Demarrage du frontend sur port 3002..." -ForegroundColor Yellow
Set-Location frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'FRONTEND KOUNDOUL - Port 3002' -ForegroundColor Cyan; Write-Host ''; npm run dev"
Set-Location ..

Start-Sleep -Seconds 4

Write-Host "   OK : Frontend demarre!" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  URL: http://localhost:3002" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Le frontend est accessible sur:" -ForegroundColor White
Write-Host "  http://localhost:3002" -ForegroundColor Cyan
Write-Host ""
Write-Host "Le backend doit tourner sur:" -ForegroundColor White
Write-Host "  http://localhost:5000" -ForegroundColor Cyan
Write-Host ""









