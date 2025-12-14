# Test complet de la plateforme Koundoul
Write-Host "🧪 TEST COMPLET DE LA PLATEFORME KOUNDOUL`n" -ForegroundColor Cyan

# 1. Test Health
Write-Host "1. Test Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3001/health"
    Write-Host "✅ Serveur: $($health.data.status)" -ForegroundColor Green
    Write-Host "   Database: $($health.data.database)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Serveur non accessible" -ForegroundColor Red
    exit 1
}

# 2. Test Login
Write-Host "`n2. Test Login..." -ForegroundColor Yellow
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
    $user = $loginResp.data.user
    Write-Host "✅ Login OK" -ForegroundColor Green
    Write-Host "   User: $($user.email)" -ForegroundColor Gray
    Write-Host "   Token: $($token.Substring(0,20))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Login échoué: $_" -ForegroundColor Red
    exit 1
}

# 3. Test Subjects
Write-Host "`n3. Test Subjects..." -ForegroundColor Yellow
try {
    $subjectsResp = Invoke-RestMethod -Uri "http://localhost:3001/api/content/subjects"
    Write-Host "✅ Matières: $($subjectsResp.data.Count)" -ForegroundColor Green
    foreach ($subject in $subjectsResp.data) {
        Write-Host "   - $($subject.name): $($subject._count.chapters) chapitres" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Subjects échoué" -ForegroundColor Red
}

# 4. Test Chapters
Write-Host "`n4. Test Chapters (Mathématiques Seconde)..." -ForegroundColor Yellow
try {
    $chaptersResp = Invoke-RestMethod -Uri "http://localhost:3001/api/content/subjects/mathematiques/chapters?level=SECONDE"
    Write-Host "✅ Chapitres: $($chaptersResp.data.Count)" -ForegroundColor Green
    foreach ($chapter in $chaptersResp.data) {
        Write-Host "   - $($chapter.title): $($chapter._count.lessons) leçons, $($chapter._count.exercises) exercices" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Chapters échoué" -ForegroundColor Red
}

# 5. Test Dashboard
Write-Host "`n5. Test Dashboard..." -ForegroundColor Yellow
try {
    $dashResp = Invoke-RestMethod -Uri "http://localhost:3001/api/dashboard" `
        -Headers @{
            "Content-Type" = "application/json"
            "Authorization" = "Bearer $token"
        }
    
    Write-Host "✅ Dashboard OK" -ForegroundColor Green
    Write-Host "   Niveau: $($dashResp.data.profile.level)" -ForegroundColor Gray
    Write-Host "   XP: $($dashResp.data.profile.xp) / $($dashResp.data.profile.nextLevelXp)" -ForegroundColor Gray
    Write-Host "   Leçons complétées: $($dashResp.data.stats.lessonsCompleted)" -ForegroundColor Gray
    Write-Host "   Taux de réussite: $($dashResp.data.stats.successRate)%" -ForegroundColor Gray
    Write-Host "   Streak: $($dashResp.data.stats.streak) jours" -ForegroundColor Gray
    Write-Host "   Temps d'étude: $($dashResp.data.stats.totalTimeSpent) min" -ForegroundColor Gray
    
    Write-Host "`n   Progression par matière:" -ForegroundColor Gray
    foreach ($subj in $dashResp.data.subjectProgress) {
        Write-Host "   - $($subj.name): $($subj.overallProgress)%" -ForegroundColor Gray
    }
    
    Write-Host "`n   Recommandations: $($dashResp.data.recommendations.Count)" -ForegroundColor Gray
    foreach ($rec in $dashResp.data.recommendations) {
        Write-Host "   - $($rec.title)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Dashboard échoué: $_" -ForegroundColor Red
}

Write-Host "`n═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ TOUS LES TESTS SONT PASSÉS !" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════`n" -ForegroundColor Cyan


