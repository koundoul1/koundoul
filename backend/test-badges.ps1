# Test du système de badges
Write-Host "🏆 TEST SYSTÈME DE BADGES`n" -ForegroundColor Cyan

# 1. Login
Write-Host "1. Login..." -ForegroundColor Yellow
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
    Write-Host "✅ Login OK`n" -ForegroundColor Green

    # 2. Stats Badges
    Write-Host "2. Stats Badges..." -ForegroundColor Yellow
    $statsResp = Invoke-RestMethod -Uri "http://localhost:3001/api/badges/stats" `
        -Headers @{"Authorization"="Bearer $token"}
    
    Write-Host "✅ Badges débloqués: $($statsResp.data.unlocked) / $($statsResp.data.total)" -ForegroundColor Green
    Write-Host "   Progression: $($statsResp.data.percentage)%`n" -ForegroundColor Gray

    # 3. Tous les badges
    Write-Host "3. Liste des Badges..." -ForegroundColor Yellow
    $badgesResp = Invoke-RestMethod -Uri "http://localhost:3001/api/badges/all" `
        -Headers @{"Authorization"="Bearer $token"}
    
    $unlocked = $badgesResp.data | Where-Object { $_.unlocked -eq $true }
    $locked = $badgesResp.data | Where-Object { $_.unlocked -ne $true }
    
    Write-Host "✅ Badges débloqués: $($unlocked.Count)" -ForegroundColor Green
    foreach ($badge in $unlocked) {
        Write-Host "   $($badge.icon) $($badge.name) - $($badge.description)" -ForegroundColor Green
    }
    
    Write-Host "`nBadges verrouilles: $($locked.Count)" -ForegroundColor Gray
    foreach ($badge in $locked | Select-Object -First 5) {
        Write-Host "   $($badge.icon) $($badge.name) - $($badge.description)" -ForegroundColor Gray
    }

    # 4. Vérifier nouveaux badges
    Write-Host "`n4. Vérifier Nouveaux Badges..." -ForegroundColor Yellow
    $checkResp = Invoke-RestMethod -Uri "http://localhost:3001/api/badges/check" `
        -Method POST `
        -Headers @{"Authorization"="Bearer $token"}
    
    if ($checkResp.data.Count -gt 0) {
        Write-Host "✅ Nouveaux badges débloqués: $($checkResp.data.Count)" -ForegroundColor Green
        foreach ($badge in $checkResp.data) {
            Write-Host "   🎉 $($badge.icon) $($badge.name) - +50 XP !" -ForegroundColor Cyan
        }
    } else {
        Write-Host "ℹ️  Aucun nouveau badge pour le moment" -ForegroundColor Gray
    }

    Write-Host "`n✅ TESTS BADGES RÉUSSIS !`n" -ForegroundColor Green

} catch {
    Write-Host "Erreur: $_" -ForegroundColor Red
}
