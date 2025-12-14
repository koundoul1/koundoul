# Test Login
Write-Host "1. TEST LOGIN" -ForegroundColor Cyan
$loginBody = @{
    email = "sambafaye184@yahoo.fr"
    password = "atsatsATS1.ATS"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $loginBody
    
    $token = $loginResponse.data.token
    Write-Host "✅ Login réussi" -ForegroundColor Green
    Write-Host "Token: $($token.Substring(0, 20))..." -ForegroundColor Gray

    # Test Subjects
    Write-Host "`n2. TEST SUBJECTS" -ForegroundColor Cyan
    $subjectsResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/content/subjects" `
        -Method GET `
        -Headers @{"Content-Type"="application/json"}
    
    Write-Host "✅ Subjects récupérés: $($subjectsResponse.data.Count)" -ForegroundColor Green
    foreach ($subject in $subjectsResponse.data) {
        Write-Host "   $($subject.icon) $($subject.name)" -ForegroundColor White
    }

    # Test Dashboard
    Write-Host "`n3. TEST DASHBOARD" -ForegroundColor Cyan
    $dashboardResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/dashboard" `
        -Method GET `
        -Headers @{
            "Content-Type"="application/json"
            "Authorization"="Bearer $token"
        }
    
    Write-Host "✅ Dashboard récupéré" -ForegroundColor Green
    Write-Host "   Niveau: $($dashboardResponse.data.profile.level)" -ForegroundColor White
    Write-Host "   XP: $($dashboardResponse.data.profile.xp)" -ForegroundColor White
    Write-Host "   Leçons: $($dashboardResponse.data.stats.lessonsCompleted)" -ForegroundColor White
    Write-Host "   Taux réussite: $($dashboardResponse.data.stats.successRate)%" -ForegroundColor White

    Write-Host "`n✅ TOUS LES TESTS PASSÉS !" -ForegroundColor Green

} catch {
    Write-Host "❌ ERREUR: $_" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}


