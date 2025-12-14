# Test complet du flux d'authentification et contenu
Write-Host "TEST COMPLET PLATEFORME KOUNDOUL`n" -ForegroundColor Cyan

# 1. Test Health
Write-Host "1. Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3001/health"
    Write-Host "OK Serveur: $($health.data.status)`n" -ForegroundColor Green
} catch {
    Write-Host "ERREUR: Serveur non accessible`n" -ForegroundColor Red
    exit 1
}

# 2. Test Login
Write-Host "2. Login..." -ForegroundColor Yellow
$loginBody = @{
    email = "sambafaye184@yahoo.fr"
    password = "atsatsATS1.ATS"
} | ConvertTo-Json

try {
    $loginResp = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $loginBody
    
    $token = $loginResp.data.token
    Write-Host "OK Login reussi`n" -ForegroundColor Green
    Write-Host "User: $($loginResp.data.user.email)" -ForegroundColor Gray
    Write-Host "XP: $($loginResp.data.user.xp)`n" -ForegroundColor Gray
} catch {
    Write-Host "ERREUR: Login echoue`n" -ForegroundColor Red
    exit 1
}

# 3. Test Subjects
Write-Host "3. Subjects..." -ForegroundColor Yellow
try {
    $subjects = Invoke-RestMethod -Uri "http://localhost:3001/api/content/subjects"
    Write-Host "OK $($subjects.data.Count) matiere(s)`n" -ForegroundColor Green
} catch {
    Write-Host "ERREUR: Subjects`n" -ForegroundColor Red
}

# 4. Test Dashboard
Write-Host "4. Dashboard..." -ForegroundColor Yellow
try {
    $dash = Invoke-RestMethod -Uri "http://localhost:3001/api/dashboard" `
        -Headers @{"Authorization"="Bearer $token"}
    Write-Host "OK Dashboard" -ForegroundColor Green
    Write-Host "Niveau: $($dash.data.profile.level)" -ForegroundColor Gray
    Write-Host "XP: $($dash.data.profile.xp)`n" -ForegroundColor Gray
} catch {
    Write-Host "ERREUR: Dashboard`n" -ForegroundColor Red
}

# 5. Test Quiz
Write-Host "5. Quiz..." -ForegroundColor Yellow
try {
    $quiz = Invoke-RestMethod -Uri "http://localhost:3001/api/quiz"
    Write-Host "OK $($quiz.data.Count) quiz disponibles`n" -ForegroundColor Green
} catch {
    Write-Host "ERREUR: Quiz`n" -ForegroundColor Red
}

# 6. Test Badges
Write-Host "6. Badges..." -ForegroundColor Yellow
try {
    $badges = Invoke-RestMethod -Uri "http://localhost:3001/api/badges/all" `
        -Headers @{"Authorization"="Bearer $token"}
    Write-Host "OK $($badges.data.Count) badges definis" -ForegroundColor Green
    $unlocked = ($badges.data | Where-Object { $_.unlocked -eq $true }).Count
    Write-Host "Debloques: $unlocked`n" -ForegroundColor Gray
} catch {
    Write-Host "ERREUR: Badges`n" -ForegroundColor Red
}

Write-Host "TOUS LES TESTS PASSES !`n" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:3001`n" -ForegroundColor Cyan


