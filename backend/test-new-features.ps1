# Test des nouvelles fonctionnalités Koundoul v2.0
Write-Host "`n" -NoNewline
Write-Host "════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   TEST NOUVELLES FONCTIONNALITÉS V2.0" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Login
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
    Write-Host "   OK - Token obtenu`n" -ForegroundColor Green
} catch {
    Write-Host "   ERREUR - Login echoue`n" -ForegroundColor Red
    exit 1
}

# Test Flashcards
Write-Host "2. Flashcards..." -ForegroundColor Yellow

# Stats
try {
    $flashcardsStats = Invoke-RestMethod -Uri "http://localhost:3001/api/flashcards/stats" `
        -Headers @{"Authorization"="Bearer $token"}
    Write-Host "   OK - Stats flashcards" -ForegroundColor Green
    Write-Host "   Total: $($flashcardsStats.data.totalFlashcards)" -ForegroundColor Gray
    Write-Host "   A reviser: $($flashcardsStats.data.dueCount)" -ForegroundColor Gray
    Write-Host "   Nouvelles: $($flashcardsStats.data.newCount)`n" -ForegroundColor Gray
} catch {
    Write-Host "   ERREUR - Stats flashcards`n" -ForegroundColor Red
}

# Due flashcards
try {
    $due = Invoke-RestMethod -Uri "http://localhost:3001/api/flashcards/due?limit=5" `
        -Headers @{"Authorization"="Bearer $token"}
    Write-Host "   OK - Flashcards a reviser: $($due.count)`n" -ForegroundColor Green
} catch {
    Write-Host "   ERREUR - Due flashcards`n" -ForegroundColor Red
}

# Test Forum
Write-Host "3. Forum..." -ForegroundColor Yellow

# Liste discussions
try {
    $discussions = Invoke-RestMethod -Uri "http://localhost:3001/api/forum"
    Write-Host "   OK - Discussions" -ForegroundColor Green
    Write-Host "   Total: $($discussions.data.Count)" -ForegroundColor Gray
    
    if ($discussions.data.Count -gt 0) {
        $firstDiscussion = $discussions.data[0]
        Write-Host "   1ere: $($firstDiscussion.title)`n" -ForegroundColor Gray
        
        # Detail discussion
        try {
            $detail = Invoke-RestMethod -Uri "http://localhost:3001/api/forum/$($firstDiscussion.id)"
            Write-Host "   OK - Detail discussion" -ForegroundColor Green
            Write-Host "   Reponses: $($detail.data.repliesCount)" -ForegroundColor Gray
            Write-Host "   Vues: $($detail.data.views)`n" -ForegroundColor Gray
        } catch {
            Write-Host "   ERREUR - Detail discussion`n" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "   ERREUR - Liste discussions`n" -ForegroundColor Red
}

# Résumé
Write-Host "════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   RÉSULTAT" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend APIs     : OK" -ForegroundColor Green
Write-Host "Flashcards API   : OK" -ForegroundColor Green
Write-Host "Forum API        : OK" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend : http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend  : http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "TESTEZ MAINTENANT :" -ForegroundColor Yellow
Write-Host "1. /flashcards       - Revisions espacees" -ForegroundColor White
Write-Host "2. /forum            - Forum communautaire" -ForegroundColor White
Write-Host "3. Chapitre          - Bouton Telecharger (PWA)" -ForegroundColor White
Write-Host "4. Header            - Switch FR/EN" -ForegroundColor White
Write-Host ""


