# Script de génération rapide de metadata pour toutes les leçons

$lessons = Get-ChildItem -Path . -Directory | Where-Object { $_.Name -ne 'derivee-expo' -and $_.Name -ne 'derivee-composee' -and $_.Name -ne 'derivee-somme-produit' -and $_.Name -ne 'discriminant-delta' -and $_.Name -ne 'fonction-ln-derivee' -and $_.Name -ne 'loi-binomiale' -and $_.Name -ne 'tangente-nombre-derive' }

Write-Output "Génération metadata pour $($lessons.Count) leçons..."

foreach($lesson in $lessons) {
    $lessonName = $lesson.Name
    $metadataPath = Join-Path $lesson.FullName "metadata.json"
    
    if(-not (Test-Path $metadataPath)) {
        $metadata = @{
            id = $lessonName
            title = $lessonName -replace '-', ' ' | ForEach-Object { (Get-Culture).TextInfo.ToTitleCase($_) }
            subject = "math"
            level = "premiere"
            chapter = "Chapitre"
            duration = 8
            prerequisites = @("Notions de base")
            objectives = @("Comprendre les concepts fondamentaux", "Appliquer les méthodes")
            difficulty = 3
            xpReward = 150
            realWorldApp = "Applications pratiques"
            keywords = @($lessonName -split '-')
        } | ConvertTo-Json -Depth 10
        
        $metadata | Set-Content -Path $metadataPath -Encoding UTF8
        Write-Output "✅ $lessonName - metadata créé"
    }
}

Write-Output "Terminé !"


