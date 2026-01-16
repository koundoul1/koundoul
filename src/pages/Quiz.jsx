import React, { useState, useEffect } from 'react'
import { BookOpen, Trophy, Play, Filter, Target, ArrowLeft, CheckCircle, XCircle, Timer, Clock, Settings, BarChart3, Star, Zap, Users, TrendingUp, AlertCircle, Eye } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import api from '../services/api'

const Quiz = () => {
  const { t } = useTranslation()
  const [questionBanks, setQuestionBanks] = useState([])
  const [filteredBanks, setFilteredBanks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    subject: t('quiz.allSubjects'),
    level: t('quiz.allLevels')
  })

  // État pour le quiz en cours
  const [selectedBank, setSelectedBank] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState([])
  const [allAnswers, setAllAnswers] = useState({}) // { questionIndex: optionIndex }
  const [quizLoading, setQuizLoading] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)
  const [timer, setTimer] = useState(0) // Timer ascendant (mode pratique) ou temps écoulé depuis début
  const [timeRemaining, setTimeRemaining] = useState(0) // Timer descendant (mode examen)
  const [totalTime, setTotalTime] = useState(0) // Temps total alloué (mode examen)
  const [quizComplete, setQuizComplete] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [quizSettings, setQuizSettings] = useState({
    questionCount: 20,
    difficulty: 'all',
    mode: 'practice', // 'practice' ou 'exam'
    shuffle: true,
    timePerQuestion: 60 // Secondes par question en mode examen
  })
  const [allQuestions, setAllQuestions] = useState([])
  const [correctAnswers, setCorrectAnswers] = useState([])

  // Charger UNIQUEMENT les banques QCM
  useEffect(() => {
    const fetchQCMBanks = async () => {
    try {
      setLoading(true)
        const response = await api.questionBanks.list({ type: 'QCM' })
        const banks = response.data || response || []
        setQuestionBanks(banks)
        setFilteredBanks(banks)
    } catch (error) {
        console.error('Erreur lors du chargement des banques QCM:', error)
    } finally {
      setLoading(false)
    }
  }

    fetchQCMBanks()
  }, [])

  // Appliquer les filtres
  useEffect(() => {
    let filtered = [...questionBanks]
    
    if (filters.subject !== 'Toutes les matières') {
      filtered = filtered.filter(bank => bank.subject === filters.subject)
    }
    
    if (filters.level !== 'Tous les niveaux') {
      filtered = filtered.filter(bank => bank.level === filters.level)
    }
    
    setFilteredBanks(filtered)
  }, [questionBanks, filters])

  // Terminer l'examen (temps écoulé ou toutes les questions répondues)
  const finishExam = () => {
    console.log('🎯 Fin de l\'examen en mode examen')
    console.log('📊 Questions:', questions.length)
    console.log('💾 Réponses:', allAnswers)
    console.log('📝 Questions array:', questions)
    
    if (questions.length === 0) {
      console.error('❌ Aucune question dans l\'examen!')
      alert('Erreur: Aucune question dans cet examen.')
      return
    }
    
    // Calculer le score final avec toutes les réponses
    let finalScore = 0
    const answers = []
    
    questions.forEach((question, index) => {
      const answerIndex = allAnswers[index]
      let isCorrect = false
      
      console.log(`Question ${index}:`, {
        question,
        answerIndex,
        options: question.options
      })
      
      if (answerIndex !== undefined && question.options && question.options.length > 0) {
        if (typeof question.options[0] === 'object' && question.options[0].is_correct !== undefined) {
          isCorrect = question.options[answerIndex]?.is_correct === true
        } else {
          isCorrect = answerIndex === question.correct_answer
        }
      }
      
      answers.push(isCorrect)
      if (isCorrect) {
        finalScore += (question.points || 10)
      }
      
      console.log(`Question ${index}: ${isCorrect ? 'CORRECT' : 'INCORRECT'}`)
    })
    
    console.log('✅ Réponses calculées:', answers)
    console.log('🏆 Score final:', finalScore)
    
    setCorrectAnswers(answers)
    setScore(finalScore)
    setShowExplanation(true) // Afficher les explications maintenant
    setQuizStarted(false)
    setQuizComplete(true)
    
    console.log('🎉 Examen terminé, quizComplete = true')
    console.log('📊 État final:', {
      quizComplete: true,
      score: finalScore,
      correctAnswers: answers,
      questionsLength: questions.length
    })
  }

  // Timer (ascendant pour pratique, descendant pour examen)
  useEffect(() => {
    let interval = null
    if (quizStarted && !quizComplete) {
      if (quizSettings.mode === 'exam') {
        // Mode examen : timer descendant
        interval = setInterval(() => {
          setTimeRemaining(prev => {
            if (prev <= 1) {
              // Temps écoulé, terminer automatiquement
              setTimeout(() => finishExam(), 0)
              return 0
            }
            return prev - 1
          })
          setTimer(prev => prev + 1) // Garder aussi le temps total
        }, 1000)
      } else {
        // Mode pratique : timer ascendant
        interval = setInterval(() => {
          setTimer(prev => prev + 1)
        }, 1000)
      }
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [quizStarted, quizComplete, quizSettings.mode, questions, allAnswers])

  // Charger les questions d'une banque
  const loadBankQuestions = async (bank) => {
    try {
      console.log('📥 Chargement des questions pour la banque:', bank.id, bank.title)
      setQuizLoading(true)
      setSelectedBank(bank)
      
      // Charger les QCM de cette banque
      const response = await api.questionBanks.getQCM(bank.id, { limit: 1000 })
      console.log('📦 Réponse API:', response)
      
      const loaded = response.data || response || []
      console.log('✅ Questions chargées:', loaded.length)
      
      if (loaded.length === 0) {
        console.warn('⚠️ Aucune question trouvée pour cette banque!')
        alert('Aucune question trouvée pour cette banque. Veuillez choisir une autre banque.')
      }
      
      setAllQuestions(loaded)
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des questions:', error)
      setAllQuestions([])
      alert(`Erreur lors du chargement des questions: ${error.message || error}`)
    } finally {
      setQuizLoading(false)
    }
  }

  // Démarrer le quiz avec les paramètres
  const startQuiz = () => {
    console.log('🚀 Démarrage du quiz...')
    console.log('📦 Questions disponibles:', allQuestions.length)
    console.log('⚙️ Paramètres:', quizSettings)
    
    if (allQuestions.length === 0) {
      console.error('❌ Aucune question disponible!')
      alert('Erreur : Aucune question disponible pour cette banque.')
      return
    }

    // Filtrer par difficulté
    let filtered = [...allQuestions]
    console.log('🔍 Avant filtrage difficulté:', filtered.length)
    
    if (quizSettings.difficulty !== 'all') {
      filtered = filtered.filter(q => {
        const diff = q.difficulty || 3
        if (quizSettings.difficulty === 'easy') return diff <= 2
        if (quizSettings.difficulty === 'medium') return diff === 3
        if (quizSettings.difficulty === 'hard') return diff >= 4
        return true
      })
      console.log('🔍 Après filtrage difficulté:', filtered.length)
    }

    // Limiter le nombre de questions
    let selected = [...filtered]
    if (quizSettings.shuffle) {
      selected = selected.sort(() => Math.random() - 0.5)
    }
    const count = Math.min(quizSettings.questionCount, selected.length)
    selected = selected.slice(0, count)
    
    console.log('✅ Questions sélectionnées:', selected.length)
    
    if (selected.length === 0) {
      console.error('❌ Aucune question après filtrage!')
      alert(`Erreur : Aucune question ne correspond aux critères sélectionnés (difficulté: ${quizSettings.difficulty}). Veuillez changer les paramètres.`)
      return
    }

    setQuestions(selected)
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setShowExplanation(false)
    setScore(0)
    setAnswered([])
    setAllAnswers({})
    setCorrectAnswers([])
    setTimer(0)
    
    // Initialiser le timer en mode examen
    if (quizSettings.mode === 'exam') {
      const totalTimeAllocated = selected.length * quizSettings.timePerQuestion // 60 secondes par question par défaut
      setTotalTime(totalTimeAllocated)
      setTimeRemaining(totalTimeAllocated)
      console.log('⏱️ Timer examen initialisé:', totalTimeAllocated, 'secondes')
    } else {
      setTotalTime(0)
      setTimeRemaining(0)
    }
    
    setQuizStarted(true)
    setQuizComplete(false)
    setShowSettings(false)
    
    console.log('✅ Quiz démarré avec', selected.length, 'questions')
  }

  // Retour à la liste
  const backToList = () => {
    setSelectedBank(null)
    setQuestions([])
    setAllQuestions([])
    setQuizStarted(false)
    setQuizComplete(false)
    setShowSettings(false)
    setCurrentIndex(0)
    setScore(0)
    setAnswered([])
    setCorrectAnswers([])
    setTimer(0)
  }

  // Gérer la réponse
  const handleAnswer = (optionIndex) => {
    // En mode pratique : empêcher de changer de réponse
    if (quizSettings.mode === 'practice' && answered.includes(currentIndex)) return
    
    const question = questions[currentIndex]
    setSelectedAnswer(optionIndex)
    
    // Enregistrer la réponse (peut être modifiée en mode examen)
    setAllAnswers(prev => ({ ...prev, [currentIndex]: optionIndex }))
    
    // En mode pratique : marquer comme répondu et afficher l'explication
    if (quizSettings.mode === 'practice' && !answered.includes(currentIndex)) {
      setAnswered([...answered, currentIndex])
      setShowExplanation(true)
      
      // Vérifier si la réponse est correcte
      let isCorrect = false
      if (question.options && question.options.length > 0) {
        if (typeof question.options[0] === 'object' && question.options[0].is_correct !== undefined) {
          isCorrect = question.options[optionIndex]?.is_correct === true
        } else {
          isCorrect = optionIndex === question.correct_answer
        }
      }
      
      setCorrectAnswers(prev => [...prev, isCorrect])
      
      if (isCorrect) {
        setScore(score + (question.points || 10))
      }
    } else if (quizSettings.mode === 'exam') {
      // En mode examen : marquer comme répondu si ce n'est pas déjà le cas
      if (!answered.includes(currentIndex)) {
        setAnswered([...answered, currentIndex])
      }
      // Pas de feedback visuel ni de calcul de score pendant le quiz
    }
  }

  // Terminer le quiz (mode pratique)
  const finishPracticeQuiz = () => {
    console.log('🎯 Fin du quiz en mode pratique')
    console.log('📊 Questions:', questions.length)
    console.log('💾 Réponses:', allAnswers)
    console.log('📝 Questions array:', questions)
    
    if (questions.length === 0) {
      console.error('❌ Aucune question dans le quiz!')
      alert('Erreur: Aucune question dans ce quiz.')
      return
    }
    
    // Calculer les résultats finaux pour toutes les questions
    let finalScore = 0
    const answers = []
    
    questions.forEach((question, index) => {
      const answerIndex = allAnswers[index]
      let isCorrect = false
      
      console.log(`Question ${index}:`, {
        question,
        answerIndex,
        options: question.options
      })
      
      if (answerIndex !== undefined && question.options && question.options.length > 0) {
        if (typeof question.options[0] === 'object' && question.options[0].is_correct !== undefined) {
          isCorrect = question.options[answerIndex]?.is_correct === true
        } else {
          isCorrect = answerIndex === question.correct_answer
        }
      }
      
      answers.push(isCorrect)
      if (isCorrect) {
        finalScore += (question.points || 10)
      }
      
      console.log(`Question ${index}: ${isCorrect ? 'CORRECT' : 'INCORRECT'}`)
    })
    
    console.log('✅ Réponses calculées:', answers)
    console.log('🏆 Score final:', finalScore)
    
    // Mettre à jour avec les résultats finaux
    setCorrectAnswers(answers)
    setScore(finalScore)
    setShowExplanation(true)
    setQuizStarted(false)
    setQuizComplete(true)
    
    console.log('🎉 Quiz terminé, quizComplete = true')
    console.log('📊 État final:', {
      quizComplete: true,
      score: finalScore,
      correctAnswers: answers,
      questionsLength: questions.length
    })
  }

  // Question suivante
  const nextQuestion = () => {
    if (quizSettings.mode === 'practice') {
      // Mode pratique : navigation normale
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setSelectedAnswer(null)
        setShowExplanation(false)
      } else {
        // Dernière question : terminer le quiz et calculer les résultats
        finishPracticeQuiz()
      }
    } else {
      // Mode examen : navigation manuelle
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setSelectedAnswer(allAnswers[currentIndex + 1] || null)
        setShowExplanation(false)
      } else {
        // Dernière question : terminer l'examen
        finishExam()
      }
    }
  }

  // Naviguer vers une question spécifique (uniquement en mode pratique)
  const goToQuestion = (index) => {
    if (quizSettings.mode === 'practice' && index >= 0 && index < questions.length) {
      setCurrentIndex(index)
      setSelectedAnswer(allAnswers[index] || null)
      setShowExplanation(answered.includes(index))
    }
  }

  // Recommencer
  const restartQuiz = () => {
    startQuiz()
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatTimeRemaining = (seconds) => {
    if (seconds <= 0) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const totalQCM = questionBanks.reduce((sum, bank) => sum + (bank.total_questions || 0), 0)
  const subjectsCount = new Set(questionBanks.map(b => b.subject)).size
  const correctCount = correctAnswers.filter(a => a === true).length
  const incorrectCount = correctAnswers.filter(a => a === false).length

  // Debug: Afficher l'état actuel
  console.log('🔍 État du composant:', {
    quizComplete,
    quizStarted,
    questionsLength: questions.length,
    correctAnswersLength: correctAnswers.length,
    score,
    correctCount
  })

  // Écran de chargement
  if (loading || quizLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">
            {quizLoading ? t('quiz.loadingQuestions') : t('quiz.loadingBanks')}
          </p>
        </div>
      </div>
    )
  }

  // Écran de quiz terminé - PRIORITAIRE (doit être avant l'écran du quiz en cours)
  if (quizComplete) {
    console.log('📊 ========== AFFICHAGE DES RÉSULTATS ==========')
    console.log('✅ quizComplete:', quizComplete)
    console.log('📝 Questions.length:', questions.length)
    console.log('💯 Score:', score)
    console.log('✅ CorrectAnswers:', correctAnswers)
    console.log('✅ CorrectAnswers.length:', correctAnswers.length)
    console.log('💾 AllAnswers:', allAnswers)
    
    // Si pas de questions, ne pas afficher
    if (questions.length === 0) {
      console.error('❌ Aucune question - retour à la liste')
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800 flex items-center justify-center">
          <div className="text-center">
            <p className="text-white text-xl mb-4">{t('quiz.noQuestionInQuiz')}</p>
            <button
              onClick={backToList}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition-all"
            >
              {t('quiz.backToQuizzes')}
            </button>
          </div>
        </div>
      )
    }
    
    // Calculer les résultats finaux si nécessaire (sans setState pour éviter les boucles)
    let finalCorrectAnswers = correctAnswers && correctAnswers.length === questions.length ? correctAnswers : []
    let finalScoreValue = score || 0
    let finalCorrectCount = 0
    
    // Si les résultats ne sont pas encore calculés ou incomplets, les calculer maintenant
    if (!correctAnswers || correctAnswers.length !== questions.length) {
      console.log('⚠️ Recalcul des résultats dans le rendu...')
      const calculatedAnswers = []
      let calculatedScore = 0
      
      questions.forEach((question, index) => {
        const answerIndex = allAnswers[index]
        let isCorrect = false
        
        console.log(`Calcul Question ${index}:`, {
          answerIndex,
          options: question.options,
          correctAnswer: question.correct_answer
        })
        
        if (answerIndex !== undefined && question.options && question.options.length > 0) {
          if (typeof question.options[0] === 'object' && question.options[0].is_correct !== undefined) {
            isCorrect = question.options[answerIndex]?.is_correct === true
          } else {
            isCorrect = answerIndex === question.correct_answer
          }
        }
        
        calculatedAnswers.push(isCorrect)
        if (isCorrect) {
          calculatedScore += (question.points || 10)
        }
        
        console.log(`Question ${index}: ${isCorrect ? 'CORRECT' : 'INCORRECT'}`)
      })
      
      finalCorrectAnswers = calculatedAnswers
      finalScoreValue = calculatedScore
      finalCorrectCount = calculatedAnswers.filter(a => a === true).length
      
      console.log('✅ Recalcul terminé:', {
        answers: calculatedAnswers,
        score: calculatedScore,
        correctCount: finalCorrectCount
      })
      
      // Mettre à jour l'état une seule fois
      setTimeout(() => {
        setCorrectAnswers(calculatedAnswers)
        setScore(calculatedScore)
      }, 0)
    } else {
      finalCorrectCount = correctAnswers.filter(a => a === true).length
    }
    
    const percentage = questions.length > 0 ? Math.round((finalCorrectCount / questions.length) * 100) : 0
    const avgTime = questions.length > 0 && timer > 0 ? Math.round(timer / questions.length) : 0
    
    console.log('📈 Pourcentage:', percentage)
    console.log('⏱️ Temps moyen:', avgTime)
    console.log('✅ Utilisation de finalCorrectAnswers:', finalCorrectAnswers)
    console.log('💯 Utilisation de finalScoreValue:', finalScoreValue)
    console.log('🎯 FinalCorrectCount:', finalCorrectCount)
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center ${
                percentage >= 80 ? 'bg-green-500/20' : percentage >= 60 ? 'bg-yellow-500/20' : 'bg-red-500/20'
              }`}>
                <Trophy className={`w-12 h-12 ${
                  percentage >= 80 ? 'text-green-400' : percentage >= 60 ? 'text-yellow-400' : 'text-red-400'
                }`} />
              </div>
              <h2 className="text-4xl font-bold text-white mb-2">{t('quiz.quizCompleted')}</h2>
              <p className="text-blue-100 text-lg">{selectedBank?.title || t('quiz.quizResults')}</p>
            </div>

            {/* Statistiques principales */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                <p className="text-blue-200 text-sm mb-1">{t('quiz.score')}</p>
                <p className="text-2xl font-bold text-white">{finalScoreValue || score || 0} pts</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                <p className="text-blue-200 text-sm mb-1">{t('quiz.success')}</p>
                <p className={`text-2xl font-bold ${
                  percentage >= 80 ? 'text-green-400' : percentage >= 60 ? 'text-yellow-400' : 'text-red-400'
                }`}>{percentage}%</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                <p className="text-blue-200 text-sm mb-1">{t('quiz.goodAnswers')}</p>
                <p className="text-2xl font-bold text-green-400">{finalCorrectCount || 0}/{questions.length}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                <p className="text-blue-200 text-sm mb-1">{t('quiz.avgTime')}</p>
                <p className="text-2xl font-bold text-white">{formatTime(avgTime)}</p>
              </div>
            </div>

            {/* Détails */}
            <div className="bg-white/10 rounded-xl p-6 mb-8 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">{t('quiz.answerDetails')}</h3>
              <div className="space-y-2">
                {questions.length > 0 ? (
                  questions.map((q, index) => {
                    const isCorrect = finalCorrectAnswers[index] === true
                    const isAnswered = allAnswers[index] !== undefined
                    
                    // Afficher aussi les explications si disponibles
                    const userAnswer = allAnswers[index]
                    const correctAnswerIndex = typeof q.options?.[0] === 'object' && q.options?.[0]?.is_correct !== undefined
                      ? q.options.findIndex(opt => opt.is_correct)
                      : q.correct_answer
                    
                    return (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          isAnswered 
                            ? (isCorrect ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30')
                            : 'bg-gray-500/10 border border-gray-500/30'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {isAnswered ? (
                            isCorrect ? (
                              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                            )
                          ) : (
                            <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          )}
                          <div className="flex flex-col flex-1">
                            <span className="text-white font-semibold">{t('quiz.question')} {index + 1}</span>
                            {q.question && (
                              <span className="text-gray-300 text-xs mt-1">
                                {typeof q.question === 'string' ? q.question.substring(0, 80) + (q.question.length > 80 ? '...' : '') : q.statement?.substring(0, 80) + (q.statement?.length > 80 ? '...' : '')}
                              </span>
                            )}
                            {isAnswered && q.explanation && (
                              <div className="mt-2 p-2 bg-blue-500/10 rounded text-xs text-blue-200">
                                {q.explanation.substring(0, 100)}{q.explanation.length > 100 ? '...' : ''}
                              </div>
                            )}
                            {isAnswered && !isCorrect && correctAnswerIndex !== undefined && (
                              <span className="text-xs text-yellow-300 mt-1">
                                {t('quiz.correctAnswer')} {String.fromCharCode(65 + correctAnswerIndex)}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className={`font-semibold whitespace-nowrap ml-4 ${
                          isAnswered
                            ? (isCorrect ? 'text-green-400' : 'text-red-400')
                            : 'text-gray-400'
                        }`}>
                          {isAnswered ? (isCorrect ? `✓ ${t('quiz.correct')}` : `✗ ${t('quiz.incorrect')}`) : t('quiz.notAnswered')}
                        </span>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-white text-center py-4">{t('quiz.noQuestionToShow')}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={backToList}
                className="flex-1 px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all border border-white/20 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                {t('quiz.backToQuizzes')}
              </button>
              <button
                onClick={restartQuiz}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                {t('quiz.restart')}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Écran de configuration du quiz
  if (selectedBank && !quizStarted && allQuestions.length > 0 && !quizComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={backToList}
            className="flex items-center gap-2 text-white hover:text-blue-200 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            {t('quiz.backToList')}
          </button>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{selectedBank.title}</h2>
                <p className="text-blue-100">{selectedBank.subject} • {selectedBank.level}</p>
              </div>
                <div className="text-right">
                <p className="text-blue-200 text-sm">Questions disponibles</p>
                <p className="text-white text-2xl font-bold">{allQuestions.length}</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Nombre de questions */}
              <div>
                <label className="block text-white font-semibold mb-3">
                  Nombre de questions
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {[10, 20, 30, 50].map((count) => (
                    <button
                      key={count}
                      onClick={() => setQuizSettings({...quizSettings, questionCount: Math.min(count, allQuestions.length)})}
                      className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                        quizSettings.questionCount === count
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                  <button
                    onClick={() => setQuizSettings({...quizSettings, questionCount: allQuestions.length})}
                    className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                      quizSettings.questionCount === allQuestions.length
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    Toutes ({allQuestions.length})
                  </button>
          </div>
        </div>

              {/* Difficulté */}
              <div>
                <label className="block text-white font-semibold mb-3">
                  Niveau de difficulté
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {['all', 'easy', 'medium', 'hard'].map((diff) => {
                    const labels = { all: 'Tous', easy: 'Facile', medium: 'Moyen', hard: 'Difficile' }
                    const colors = { all: 'blue', easy: 'green', medium: 'yellow', hard: 'red' }
                    return (
                <button
                        key={diff}
                        onClick={() => setQuizSettings({...quizSettings, difficulty: diff})}
                        className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                          quizSettings.difficulty === diff
                            ? `bg-gradient-to-r from-${colors[diff]}-600 to-${colors[diff]}-700 text-white`
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        {labels[diff]}
                      </button>
                    )
                  })}
                  </div>
            </div>

              {/* Mode */}
              <div>
                <label className="block text-white font-semibold mb-3">
                  Mode de quiz
                </label>
                <div className="grid grid-cols-2 gap-3">
              <button
                    onClick={() => setQuizSettings({...quizSettings, mode: 'practice'})}
                    className={`px-6 py-4 rounded-lg font-semibold transition-all ${
                      quizSettings.mode === 'practice'
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <Zap className="w-5 h-5 inline mr-2" />
                    Mode Pratique
                    <p className="text-xs mt-1 opacity-75">Feedback immédiat, pas de limite de temps</p>
              </button>
                  <button
                    onClick={() => setQuizSettings({...quizSettings, mode: 'exam'})}
                    className={`px-6 py-4 rounded-lg font-semibold transition-all ${
                      quizSettings.mode === 'exam'
                        ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <Timer className="w-5 h-5 inline mr-2" />
                    Mode Examen
                    <p className="text-xs mt-1 opacity-75">Timer strict, résultats à la fin</p>
                  </button>
                </div>
              </div>

              {/* Options */}
              <div>
                <label className="flex items-center gap-2 text-white font-semibold mb-3">
                  <input
                    type="checkbox"
                    checked={quizSettings.shuffle}
                    onChange={(e) => setQuizSettings({...quizSettings, shuffle: e.target.checked})}
                    className="w-4 h-4 rounded"
                  />
                  Mélanger les questions
                </label>
              </div>

              {/* Bouton démarrer */}
                <button
                onClick={startQuiz}
                disabled={allQuestions.length === 0}
                className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold text-xl hover:opacity-90 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                <Play className="w-6 h-6 inline mr-2" />
                Commencer le quiz ({Math.min(quizSettings.questionCount, allQuestions.length)} questions)
                </button>
            </div>
          </div>
        </div>
      </div>
    )
  }


  // Écran du quiz en cours
  if (quizStarted && questions.length > 0) {
    const question = questions[currentIndex]
    const progress = ((currentIndex + 1) / questions.length) * 100
    const isAnswered = answered.includes(currentIndex)

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800">
        <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={backToList}
                className="flex items-center gap-2 text-white hover:text-blue-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Retour
              </button>
              <div className="flex items-center gap-6">
                {quizSettings.mode === 'exam' ? (
                  <>
                    <div className="text-right">
                      <p className="text-blue-200 text-sm">Temps restant</p>
                      <p className={`text-white text-xl font-bold ${timeRemaining < 60 ? 'text-red-400 animate-pulse' : ''}`}>
                        {formatTimeRemaining(timeRemaining)}
            </p>
          </div>
                    <div className="text-right">
                      <p className="text-blue-200 text-sm">Questions répondues</p>
                      <p className="text-white text-xl font-bold">{answered.length}/{questions.length}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-right">
                      <p className="text-blue-200 text-sm">Score</p>
                      <p className="text-white text-xl font-bold">{score} pts</p>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-200 text-sm">Temps</p>
                      <p className="text-white text-xl font-bold">{formatTime(timer)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-200 text-sm">Progression</p>
                      <p className="text-white text-xl font-bold">{correctCount}/{answered.length}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Barre de progression */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-blue-200 mb-2">
                <span>Question {currentIndex + 1} sur {questions.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
        </div>
      </div>

            {/* Mini-map des questions (uniquement en mode pratique) */}
            {quizSettings.mode === 'practice' && (
              <div className="flex flex-wrap gap-2 mt-4">
                {questions.map((q, index) => {
                  const isAnswered = answered.includes(index)
                  const isCorrect = correctAnswers[index]
                  const isCurrent = index === currentIndex
                  
                  return (
                    <button
                      key={index}
                      onClick={() => goToQuestion(index)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                        isCurrent
                          ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                          : isAnswered
                          ? isCorrect
                            ? 'bg-green-500/30 text-green-200 border border-green-400/50'
                            : 'bg-red-500/30 text-red-200 border border-red-400/50'
                          : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                      }`}
                    >
                      {index + 1}
                    </button>
                  )
                })}
          </div>
        )}

            {/* Avertissement mode examen */}
            {quizSettings.mode === 'exam' && (
              <div className="mt-4 bg-red-500/20 border border-red-400/30 rounded-lg p-3">
                <div className="flex items-center gap-2 text-red-200">
                  <Timer className="w-5 h-5" />
                  <span className="text-sm font-semibold">Mode Examen - Les résultats s'afficheront à la fin</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">{question?.question || question?.statement}</h2>

            {question?.options && (
              <div className="space-y-4 mb-6">
                {question.options.map((option, index) => {
                  const optionText = typeof option === 'object' ? option.text : option
                  const isSelected = selectedAnswer === index || allAnswers[currentIndex] === index
                  const isCorrect = typeof option === 'object' 
                    ? option.is_correct 
                    : index === question.correct_answer
                  
                  // En mode examen : pas de feedback visuel pendant le quiz
                  // En mode pratique : feedback immédiat
                  let bgColor = 'bg-white/5 hover:bg-white/10'
                  if (quizSettings.mode === 'practice' && showExplanation) {
                    if (isSelected) {
                      bgColor = isCorrect ? 'bg-green-500/30 border-green-400' : 'bg-red-500/30 border-red-400'
                    } else if (isCorrect) {
                      bgColor = 'bg-green-500/20 border-green-400/50'
                    }
                  } else if (quizSettings.mode === 'exam' && isSelected) {
                    bgColor = 'bg-blue-500/20 border-blue-400'
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      disabled={quizSettings.mode === 'practice' && isAnswered}
                      className={`w-full p-4 text-left border-2 border-white/20 rounded-lg transition-all ${bgColor} ${
                        (quizSettings.mode === 'practice' && isAnswered) ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                          isSelected 
                            ? (quizSettings.mode === 'practice' && showExplanation)
                              ? (isCorrect 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-red-500 text-white')
                              : 'bg-blue-500 text-white'
                            : 'bg-white/10 text-white'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="text-white text-lg">{optionText}</span>
                        {quizSettings.mode === 'practice' && showExplanation && isCorrect && (
                          <CheckCircle className="w-5 h-5 text-green-400 ml-auto" />
                        )}
                        {quizSettings.mode === 'practice' && showExplanation && isSelected && !isCorrect && (
                          <XCircle className="w-5 h-5 text-red-400 ml-auto" />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Explication (uniquement en mode pratique ou à la fin) */}
            {quizSettings.mode === 'practice' && showExplanation && question?.explanation && (
              <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-300 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-200 mb-2">Explication</h4>
                    <p className="text-blue-100">{question.explanation}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Message toutes questions répondues */}
            {answered.length === questions.length && questions.length > 0 && !quizComplete && (
              <div className="mb-4 bg-green-500/20 border border-green-400/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-200">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Toutes les questions ont été répondues ! Cliquez sur "Voir les résultats" pour afficher votre score.</span>
                </div>
              </div>
            )}

            {/* Bouton navigation */}
            {quizSettings.mode === 'practice' && isAnswered && (
              <div className="flex gap-4">
                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={nextQuestion}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition-all"
                  >
                    Question suivante →
                  </button>
                ) : (
                  <button
                    onClick={finishPracticeQuiz}
                    className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 text-lg"
                  >
                    <Trophy className="w-6 h-6" />
                    Voir les résultats
                  </button>
                )}
              </div>
            )}
            
            {quizSettings.mode === 'exam' && (
              <div className="flex gap-4">
                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={nextQuestion}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition-all"
                  >
                    Question suivante →
                  </button>
                ) : (
                  <button
                    onClick={finishExam}
                    className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 text-lg"
                  >
                    <Trophy className="w-6 h-6" />
                    Voir les résultats
                  </button>
                )}
              </div>
            )}
            
            {/* Bouton pour voir les résultats même si pas toutes les questions sont répondues */}
            {answered.length < questions.length && questions.length > 0 && !quizComplete && (
              <div className="mt-4">
                <button
                  onClick={() => {
                    if (quizSettings.mode === 'practice') {
                      finishPracticeQuiz()
                    } else {
                      finishExam()
                    }
                  }}
                  className="w-full px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <Eye className="w-5 h-5" />
                  Voir les résultats maintenant ({answered.length}/{questions.length} répondues)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Écran de liste des banques QCM
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800">
      
      {/* Header avec titre et stats */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center mb-2">
                <BookOpen className="h-10 w-10 mr-4" />
                📚 Quiz & QCM
              </h1>
              <p className="text-blue-100 text-lg">
                900 QCM pour Seconde, Première et Terminale
              </p>
            </div>
            <div className="flex items-center gap-2 text-white">
              <BarChart3 className="w-5 h-5" />
              <span className="text-sm">Testez vos connaissances</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Statistiques améliorées */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-blue-400/60 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 mb-1">Banques QCM</p>
                <p className="text-3xl font-bold text-white">{questionBanks.length}</p>
              </div>
              <BookOpen className="h-12 w-12 text-blue-400 opacity-50" />
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-blue-400/60 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 mb-1">Total QCM</p>
                <p className="text-3xl font-bold text-white">{totalQCM}</p>
              </div>
              <Target className="h-12 w-12 text-green-400 opacity-50" />
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-blue-400/60 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 mb-1">Matières</p>
                <p className="text-3xl font-bold text-white">{subjectsCount}</p>
              </div>
              <Star className="h-12 w-12 text-yellow-400 opacity-50" />
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-blue-400/60 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 mb-1">Niveaux</p>
                <p className="text-3xl font-bold text-white">3</p>
              </div>
              <TrendingUp className="h-12 w-12 text-purple-400 opacity-50" />
            </div>
          </div>
        </div>

        {/* Filtres améliorés */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtres
            </h3>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <select 
              value={filters.subject}
              onChange={(e) => setFilters({...filters, subject: e.target.value})}
              className="bg-gray-800 text-white border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem'
              }}
            >
              <option value="Toutes les matières" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>Toutes les matières</option>
              <option value="Mathématiques" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>Mathématiques</option>
              <option value="Physique" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>Physique</option>
              <option value="Chimie" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>Chimie</option>
            </select>
            <select 
              value={filters.level}
              onChange={(e) => setFilters({...filters, level: e.target.value})}
              className="bg-gray-800 text-white border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem'
              }}
            >
              <option value="Tous les niveaux" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>Tous les niveaux</option>
              <option value="Seconde" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>Seconde</option>
              <option value="Première" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>Première</option>
              <option value="Terminale" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>Terminale</option>
            </select>
          </div>
        </div>

        {/* Grille des banques QCM améliorée */}
        {filteredBanks.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBanks.map((bank) => {
              const difficultyColors = {
                easy: 'bg-green-500/20 text-green-300 border-green-400/30',
                medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
                hard: 'bg-red-500/20 text-red-300 border-red-400/30'
              }

              return (
                <div 
                  key={bank.id} 
                  className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-blue-400/60 hover:shadow-2xl transition-all transform hover:scale-105"
                >
                  
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">
                        {bank.subject === 'Mathématiques' ? '📐' : 
                         bank.subject === 'Physique' ? '⚡' : '🧪'}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{bank.title}</h3>
                        <p className="text-sm text-blue-100">{bank.subject} • {bank.level}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-200 border border-blue-400/30">
                      QCM
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-6 text-sm text-blue-100">
                      <span className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        {bank.total_questions || 0} questions
                      </span>
                      {bank.difficulty_distribution && (
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          {bank.difficulty_distribution.facile || 0} facile
                        </span>
                      )}
                    </div>
                    {bank.chapters_covered && bank.chapters_covered.length > 0 && (
                      <div className="text-xs text-blue-200">
                        {bank.chapters_covered.slice(0, 2).join(', ')}
                        {bank.chapters_covered.length > 2 && ` +${bank.chapters_covered.length - 2} autres`}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => loadBankQuestions(bank)}
                    className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:opacity-95 transition-all shadow-xl border border-white/10 hover:shadow-2xl"
                  >
                    <Settings className="w-5 h-5" />
                    Configurer le quiz
                  </button>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
            <Trophy className="w-16 h-16 text-blue-300 mx-auto mb-4" />
            <p className="text-white text-lg">Aucun QCM disponible pour ces filtres</p>
            <p className="text-blue-200 text-sm mt-2">Essayez de changer les filtres pour voir plus de résultats</p>
          </div>
        )}

      </div>
    </div>
  )
}

export default Quiz
