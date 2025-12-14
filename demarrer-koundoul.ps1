Write-Host "=== DEMARRAGE KOUNDOUL ===" -ForegroundColor Cyan

# Arreter tous les processus Node
Write-Host "`n1. Arret des processus..." -ForegroundColor Yellow
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "   OK" -ForegroundColor Green

# Demarrer Backend
Write-Host "`n2. Demarrage Backend..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD\backend
    $env:DATABASE_URL = "postgresql://postgres:atsatsATS1.ATS@db.wnbkplyerizogmufatxb.supabase.co:5432/postgres"
    $env:JWT_SECRET = "koundoul-jwt-secret"
    $env:PORT = "3001"
    npm start
}
Start-Sleep -Seconds 8
Write-Host "   Backend demarre (Job ID: $($backendJob.Id))" -ForegroundColor Green

# Demarrer Frontend
Write-Host "`n3. Demarrage Frontend..." -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD\frontend
    npm run dev
}
Start-Sleep -Seconds 5
Write-Host "   Frontend demarre (Job ID: $($frontendJob.Id))" -ForegroundColor Green

# Ouvrir navigateur
Write-Host "`n4. Ouverture navigateur..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Start-Process "http://localhost:3002/login"
Write-Host "   OK" -ForegroundColor Green

Write-Host "`n=== TERMINE ===" -ForegroundColor Green
Write-Host "`nIdentifiants :" -ForegroundColor Yellow
Write-Host "  Email : sambafaye184@yahoo.fr" -ForegroundColor Cyan
Write-Host "  Pass : atsatsATS1.ATS" -ForegroundColor Cyan
Write-Host "`nPour arreter : Stop-Job -Id $($backendJob.Id),$($frontendJob.Id)`n" -ForegroundColor Gray

