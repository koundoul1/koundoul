# Script de génération rapide de quiz pour toutes les leçons

$lessons = Get-ChildItem -Path . -Directory | Where-Object { 
    $_.Name -ne 'derivee-expo' 
}

Write-Output "Génération quiz pour $($lessons.Count) leçons..."

foreach($lesson in $lessons) {
    $lessonName = $lesson.Name
    $quizPath = Join-Path $lesson.FullName "quiz.json"
    
    if(-not (Test-Path $quizPath)) {
        $quiz = @{
            questions = @(
                @{
                    id = "q1"
                    question = "Quelle est la notion principale de cette leçon ?"
                    options = @("Option A", "Option B", "Option C", "Option D")
                    correctAnswer = 0
                    explanation = "L'explication de la réponse correcte."
                    difficulty = "FACILE"
                    xpReward = 10
                }
            ) * 5
        }
        
        # Numéroter les questions
        for($i = 0; $i -lt 5; $i++) {
            $quiz.questions[$i].id = "q$($i+1)"
            $quiz.questions[$i].difficulty = if($i -lt 2) { "FACILE" } elseif($i -lt 4) { "MOYEN" } else { "DIFFICILE" }
            $quiz.questions[$i].xpReward = ($i + 1) * 10
        }
        
        $quiz | ConvertTo-Json -Depth 10 | Set-Content -Path $quizPath -Encoding UTF8
        Write-Output "✅ $lessonName - quiz créé"
    }
}

Write-Output "Terminé !"


