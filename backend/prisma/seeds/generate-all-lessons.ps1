# Script de génération rapide de lesson.md pour toutes les leçons

$lessons = Get-ChildItem -Path . -Directory | Where-Object { 
    $_.Name -ne 'derivee-expo' 
}

$lessonTemplate = @"
# {TITLE}

## Phase 1: Hook (90s)
Introduction accrocheuse avec question intrigante.

## Phase 2: Recall (2min)
Rappel des prérequis essentiels.

## Phase 3: Main Course (15min)
Explication détaillée avec exemples.

## Phase 4: Method/Tip (2min)
Méthode pratique à retenir.

## Phase 5: Guided Exercise (8min)
Exercice guidé étape par étape.

## Phase 6: Quiz (5min)
5 questions de validation.

## Phase 7: Closure (1min30)
Synthèse et rappels clés.

## Phase 8: Real-World Application (2min)
Applications concrètes.

---

**Durée totale : ~36 minutes**  
**XP disponible : 150**  
**Difficulté : Moyenne**

"@

Write-Output "Génération lesson.md pour $($lessons.Count) leçons..."

foreach($lesson in $lessons) {
    $lessonName = $lesson.Name
    $lessonPath = Join-Path $lesson.FullName "lesson.md"
    
    if(-not (Test-Path $lessonPath)) {
        $title = $lessonName -replace '-', ' ' | ForEach-Object { (Get-Culture).TextInfo.ToTitleCase($_) }
        $content = $lessonTemplate -replace '\{TITLE\}', $title
        $content | Set-Content -Path $lessonPath -Encoding UTF8
        Write-Output "✅ $lessonName - lesson.md créé"
    }
}

Write-Output "Terminé !"


