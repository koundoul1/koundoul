import { getSupabasePool } from '../../database/supabasePg.js'

class ExercisesService {
  async getExercisesFromMicrolessons({ level, subject, difficulty, limit = 50 }) {
    const supa = getSupabasePool()
    if (!supa) {
      throw new Error('Supabase pool not available')
    }

    // Construire la requête SQL
    const clauses = []
    const params = []
    let idx = 1

    if (level) { 
      clauses.push(`m.level = $${idx++}`)
      params.push(level)
    }
    if (subject) { 
      clauses.push(`m.subject = $${idx++}`)
      params.push(subject)
    }
    if (difficulty) { 
      clauses.push(`m.difficulty = $${idx++}`)
      params.push(parseInt(difficulty))
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''

    const sql = `
      SELECT 
        m.id as lesson_id,
        m.title as lesson_title,
        m.subject,
        m.level,
        m.difficulty,
        m.chapter,
        m.content_sections
      FROM public.microlessons m
      ${where}
      AND m.content_sections IS NOT NULL
      LIMIT $${idx}
    `
    params.push(limit)

    const { rows } = await supa.query(sql, params)
    
    // Transformer les données pour extraire les exercices
    const exercises = []
    
    for (const row of rows) {
      const contentSections = row.content_sections
      
      if (!contentSections) continue

      // Support du format array (nouveau format)
      if (Array.isArray(contentSections)) {
        // Chercher les sections contenant des exercices
        for (const section of contentSections) {
          if (section.title && section.items && Array.isArray(section.items)) {
            // Créer un exercice pour chaque item
            section.items.forEach((exerciseText, idx) => {
              exercises.push(this.transformToSmartExercise({
                ...row,
                exerciseText,
                exerciseIndex: idx,
                type: this.guessExerciseType(exerciseText)
              }))
            })
          }
        }
      }
      
      // Support du format object (ancien format)
      else if (typeof contentSections === 'object') {
        // PRIORITÉ 1: Extraire guided_example qui a une vraie correction
        // Note: Dans les données importées, c'est stocké sous "example" et non "guided_example"
        const guidedExample = contentSections.guided_example || contentSections.example
        if (guidedExample && guidedExample.statement) {
          exercises.push(this.transformGuidedExample({
            ...row,
            guidedExample: guidedExample,
            exerciseIndex: 0
          }))
        }
        
        // PRIORITÉ 2: Extraire les quick_exercises ou exercises (sans correction détaillée)
        const exercisesData = contentSections.quick_exercises || contentSections.exercises
        
        if (Array.isArray(exercisesData)) {
          exercisesData.forEach((exerciseText, idx) => {
            // Ne pas ajouter guided_example deux fois
            const guidedExample = contentSections.guided_example || contentSections.example
            if (!guidedExample || idx > 0 || exerciseText !== guidedExample.statement) {
              exercises.push(this.transformToSmartExercise({
                ...row,
                exerciseText,
                exerciseIndex: idx + (guidedExample ? 1 : 0),
                type: this.guessExerciseType(exerciseText)
              }))
            }
          })
        }
      }
    }

    return exercises
  }

  transformGuidedExample({ lesson_id, lesson_title, subject, level, difficulty, chapter, guidedExample, exerciseIndex }) {
    // Mapper les difficultés
    const smartDifficulty = difficulty <= 2 ? 'easy' : difficulty <= 3 ? 'medium' : 'hard'
    
    // Mapper les matières
    const subjectMap = {
      'Mathématiques': 'mathematics',
      'Physique': 'physics',
      'Chimie': 'chemistry'
    }
    
    return {
      id: `${lesson_id}-guided-ex${exerciseIndex}`,
      question: guidedExample.statement,
      type: this.guessExerciseType(guidedExample.statement),
      subject: subjectMap[subject] || subject.toLowerCase(),
      level: level.toLowerCase(),
      difficulty: smartDifficulty,
      chapter,
      lessonId: lesson_id,
      lessonTitle: lesson_title,
      // Utiliser les vraies solutions depuis guided_example
      explanation: `Solution détaillée de l'exercice issu de "${lesson_title}"`,
      steps: Array.isArray(guidedExample.solution_steps) ? guidedExample.solution_steps : 
             Array.isArray(guidedExample.solution) ? guidedExample.solution : [
        'Analyser l\'énoncé',
        'Identifier la méthode appropriée',
        'Appliquer les règles du cours',
        'Vérifier le résultat'
      ],
      hints: [
        'Relisez attentivement l\'énoncé',
        'Utilisez les méthodes vues dans la leçon',
        'Vérifiez les unités'
      ],
      estimatedTime: difficulty * 60,
      // Marquer comme exercice corrigé
      isCorrected: true
    }
  }

  transformToSmartExercise({ lesson_id, lesson_title, subject, level, difficulty, chapter, exerciseText, exerciseIndex, type }) {
    // Mapper les difficultés
    const smartDifficulty = difficulty <= 2 ? 'easy' : difficulty <= 3 ? 'medium' : 'hard'
    
    // Mapper les matières
    const subjectMap = {
      'Mathématiques': 'mathematics',
      'Physique': 'physics',
      'Chimie': 'chemistry'
    }
    
    return {
      id: `${lesson_id}-ex${exerciseIndex}`,
      question: exerciseText,
      type: type,
      subject: subjectMap[subject] || subject.toLowerCase(),
      level: level.toLowerCase(),
      difficulty: smartDifficulty,
      chapter,
      lessonId: lesson_id,
      lessonTitle: lesson_title,
      // On va générer une solution et des étapes basiques
      // Plus tard, on pourra enrichir avec l'IA
      explanation: `Solution de l'exercice issu de "${lesson_title}"`,
      steps: [
        'Analyser l\'énoncé',
        'Identifier la méthode appropriée',
        'Appliquer les règles du cours',
        'Vérifier le résultat'
      ],
      hints: [
        'Relisez attentivement l\'énoncé',
        'Utilisez les méthodes vues dans la leçon',
        'Vérifiez les unités'
      ],
      estimatedTime: difficulty * 60, // 1-5 minutes selon difficulté
      // Marquer comme exercice non complètement corrigé
      isCorrected: false
    }
  }

  guessExerciseType(text) {
    const lowerText = text.toLowerCase()
    
    if (lowerText.includes('calculer') || lowerText.includes('calcule')) return 'calculation'
    if (lowerText.includes('résoudre') || lowerText.includes('résous')) return 'algebra'
    if (lowerText.includes('démontrer') || lowerText.includes('montrer')) return 'proof'
    if (lowerText.includes('tracer') || lowerText.includes('représenter')) return 'geometry'
    if (lowerText.includes('identifier') || lowerText.includes('déterminer')) return 'identification'
    
    return 'general'
  }
}

const exercisesService = new ExercisesService()
export default exercisesService

