import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { ArrowLeft, CheckCircle, XCircle, Lightbulb, Trophy, Timer, Target, Filter } from 'lucide-react'

export default function QuestionBankDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [bank, setBank] = useState(null)
  const [allQuestions, setAllQuestions] = useState([])
  const [questions, setQuestions] = useState([])
  const [chapters, setChapters] = useState([])
  const [selectedChapters, setSelectedChapters] = useState([])
  const [showChapterFilter, setShowChapterFilter] = useState(true)
  const [quizStarted, setQuizStarted] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState([])
  const [loading, setLoading] = useState(true)
  const [timer, setTimer] = useState(0)
  const [timerInterval, setTimerInterval] = useState(null)

  useEffect(() => {
    fetchBankData()
    return () => {
      if (timerInterval) clearInterval(timerInterval)
    }
  }, [id])

  useEffect(() => {
    // Démarrer le timer
    const interval = setInterval(() => {
      setTimer(prev => prev + 1)
    }, 1000)
    setTimerInterval(interval)
    
    return () => clearInterval(interval)
  }, [])

  const fetchBankData = async () => {
    try {
      setLoading(true)
      const bankRes = await api.questionBanks.get(id)
      setBank(bankRes.data || bankRes)
      
      // Charger les questions selon le type
      let loadedQuestions = []
      if (bankRes.data?.type === 'QCM' || id.includes('QCM')) {
        const qcmRes = await api.questionBanks.getQCM(id, { limit: 1000 })
        loadedQuestions = qcmRes.data || qcmRes || []
      } else {
        const exRes = await api.questionBanks.getExercises(id, { limit: 1000 })
        loadedQuestions = exRes.data || exRes || []
      }
      
      setAllQuestions(loadedQuestions)
      
      // Extraire les chapitres uniques
      const uniqueChapters = [...new Set(loadedQuestions.map(q => q.chapter).filter(Boolean))]
      setChapters(uniqueChapters)
      
      // Par défaut, sélectionner tous les chapitres
      setSelectedChapters(uniqueChapters)
      setQuestions(loadedQuestions)
      
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const toggleChapter = (chapter) => {
    setSelectedChapters(prev => {
      if (prev.includes(chapter)) {
        return prev.filter(c => c !== chapter)
      } else {
        return [...prev, chapter]
      }
    })
  }
  
  const selectAllChapters = () => {
    setSelectedChapters(chapters)
  }
  
  const deselectAllChapters = () => {
    setSelectedChapters([])
  }
  
  const startQuiz = () => {
    // Filtrer les questions selon les chapitres sélectionnés
    const filtered = selectedChapters.length > 0
      ? allQuestions.filter(q => selectedChapters.includes(q.chapter))
      : allQuestions
    
    setQuestions(filtered)
    setQuizStarted(true)
    setShowChapterFilter(false)
    setCurrentIndex(0)
    setScore(0)
    setAnswered([])
    setTimer(0)
  }

  const handleAnswer = (optionId) => {
    if (answered.includes(currentIndex)) return
    
    setSelectedAnswer(optionId)
    setShowExplanation(true)
    
    const question = questions[currentIndex]
    
    // Gérer les deux formats d'options
    let isCorrect = false
    if (question.options && question.options.length > 0) {
      if (typeof question.options[0] === 'object' && question.options[0].is_correct !== undefined) {
        // Format objet: {id, text, is_correct}
        const correctOption = question.options.find(opt => opt.is_correct)
        isCorrect = optionId === correctOption?.id
      } else {
        // Format simple: array de strings avec correct_answer numérique
        // optionId est une lettre (A, B, C, D), on doit le convertir en index
        const selectedIndex = optionId.charCodeAt(0) - 65 // A=0, B=1, C=2, D=3
        isCorrect = selectedIndex === question.correct_answer
      }
    }
    
    if (isCorrect) {
      setScore(score + (question.points || 10))
    }
    
    setAnswered([...answered, currentIndex])
  }

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
      setShowSolution(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    )
  }

  // Écran de sélection des chapitres
  if (showChapterFilter && !quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12">
        <div className="max-w-4xl mx-auto px-4">
          
          {/* En-tête */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate('/exercices')}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
              Retour
            </button>
          </div>

          {/* Informations banque */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 mb-8 border border-white/20">
            <h1 className="text-4xl font-extrabold text-white mb-4">{bank?.title || 'Banque de Questions'}</h1>
            <p className="text-gray-300 text-lg mb-6">
              {bank?.subject} • {bank?.level} • {allQuestions.length} questions disponibles
            </p>
            
            {/* Sélection des chapitres */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Filter className="h-6 w-6" />
                  Sélectionner les chapitres
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={selectAllChapters}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    Tous
                  </button>
                  <button
                    onClick={deselectAllChapters}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    Aucun
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {chapters.map(chapter => {
                  const isSelected = selectedChapters.includes(chapter)
                  const count = allQuestions.filter(q => q.chapter === chapter).length
                  
                  return (
                    <button
                      key={chapter}
                      onClick={() => toggleChapter(chapter)}
                      className={`text-left p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'bg-blue-500/20 border-blue-500 text-white'
                          : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-semibold">{chapter}</div>
                          <div className="text-sm opacity-70">{count} questions</div>
                        </div>
                        {isSelected && <CheckCircle className="h-5 w-5 text-blue-400" />}
                      </div>
                    </button>
                  )
                })}
              </div>
              
              <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-300 text-center">
                  <strong>{selectedChapters.length}</strong> chapitre(s) sélectionné(s) • 
                  <strong className="ml-2">
                    {selectedChapters.length > 0
                      ? allQuestions.filter(q => selectedChapters.includes(q.chapter)).length
                      : 0}
                  </strong> questions
                </p>
              </div>
              
              <button
                onClick={startQuiz}
                disabled={selectedChapters.length === 0}
                className="w-full mt-6 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Commencer ({selectedChapters.length > 0 ? allQuestions.filter(q => selectedChapters.includes(q.chapter)).length : 0} questions)
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Aucune question disponible</p>
          <button
            onClick={() => navigate('/exercices')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retour
          </button>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100
  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 10), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* En-tête */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/exercices')}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
            Retour
          </button>
          
          <div className="flex items-center gap-4 text-white">
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              <span className="font-mono">{formatTime(timer)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              <span className="font-bold">{score} pts</span>
            </div>
          </div>
        </div>

        {/* Titre de la banque */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-2">{bank?.title}</h2>
          <div className="flex items-center gap-4 text-sm text-blue-200">
            <span>{bank?.subject} • {bank?.level}</span>
            <span>•</span>
            <span>Question {currentIndex + 1}/{questions.length}</span>
          </div>
          
          {/* Barre de progression */}
          <div className="mt-4 w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question actuelle */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
          <div className="flex items-start justify-between mb-6">
            <h3 className="text-xl font-semibold text-white flex-1">
              {currentQuestion.question || currentQuestion.problem || currentQuestion.statement}
            </h3>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-bold">
                {currentQuestion.points || 10} pts
              </span>
              {currentQuestion.time_limit_seconds && (
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm">
                  <Clock className="h-3 w-3 inline mr-1" />
                  {currentQuestion.time_limit_seconds}s
                </span>
              )}
            </div>
          </div>

          {/* Options (QCM only) */}
          {currentQuestion.options && currentQuestion.options.length > 0 && (
          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((option, index) => {
              // Gérer les deux formats
              const optionId = option.id || String.fromCharCode(65 + index) // A, B, C, D
              const optionText = option.text || option || 'Option manquante'
              
              // Vérifier si c'est la bonne réponse
              const optionIsCorrect = option.is_correct !== undefined 
                ? option.is_correct 
                : (currentQuestion.correct_answer === index) // Comparer avec l'index, pas l'ID
              
              const isSelected = selectedAnswer === optionId
              const showCorrect = showExplanation && optionIsCorrect
              const showWrong = showExplanation && isSelected && !optionIsCorrect
              
              return (
                <button
                  key={optionId}
                  onClick={() => handleAnswer(optionId)}
                  disabled={answered.includes(currentIndex)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    showCorrect
                      ? 'bg-green-500/20 border-green-500 text-green-100'
                      : showWrong
                      ? 'bg-red-500/20 border-red-500 text-red-100'
                      : isSelected
                      ? 'bg-blue-500/20 border-blue-500 text-white'
                      : 'bg-white/5 border-white/20 text-gray-200 hover:bg-white/10 hover:border-blue-400'
                  } ${answered.includes(currentIndex) ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex-1">
                      <span className="font-bold mr-2">{optionId}.</span>
                      {optionText}
                    </span>
                    {showCorrect && <CheckCircle className="h-5 w-5 text-green-400" />}
                    {showWrong && <XCircle className="h-5 w-5 text-red-400" />}
                  </div>
                </button>
              )
            })}
          </div>
          )}

          {/* Bouton voir solution (Exercices only) */}
          {currentQuestion.solution && !currentQuestion.options && (
            <div className="mb-6">
              <button
                onClick={() => setShowSolution(!showSolution)}
                className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-2"
              >
                <Lightbulb className="h-5 w-5" />
                {showSolution ? 'Masquer la solution' : 'Voir la solution'}
              </button>
            </div>
          )}

          {/* Solution (Exercices only) */}
          {currentQuestion.solution && showSolution && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 mb-6">
              <h4 className="font-semibold text-green-300 mb-4 flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Solution détaillée
              </h4>
              {currentQuestion.solution.steps && Array.isArray(currentQuestion.solution.steps) && (
                <ol className="list-decimal list-inside space-y-2 text-gray-200 mb-4">
                  {currentQuestion.solution.steps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              )}
              {currentQuestion.solution.final_answer && (
                <div className="mt-4 p-4 bg-blue-500/20 rounded-lg">
                  <p className="text-blue-200">
                    <strong>Réponse finale :</strong> {currentQuestion.solution.final_answer}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Hints (Exercices only - toujours visible) */}
          {currentQuestion.hints && Array.isArray(currentQuestion.hints) && currentQuestion.hints.length > 0 && !currentQuestion.options && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-yellow-300 mb-2">💡 Indices</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-200">
                {currentQuestion.hints.map((hint, idx) => (
                  <li key={idx}>{hint}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Explication */}
          {showExplanation && currentQuestion.explanation && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-300 mb-2">Explication</h4>
                  <p className="text-gray-200">{currentQuestion.explanation}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                if (currentIndex > 0) {
                  setCurrentIndex(currentIndex - 1)
                  setSelectedAnswer(null)
                  setShowExplanation(false)
                  setShowSolution(false)
                }
              }}
              disabled={currentIndex === 0}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Précédent
            </button>
            
            {currentIndex < questions.length - 1 ? (
              <button
                onClick={nextQuestion}
                disabled={currentQuestion.options && !answered.includes(currentIndex)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant →
              </button>
            ) : (
              <button
                onClick={() => {
                  if (timerInterval) clearInterval(timerInterval)
                  alert(`Quiz terminé !\n\nScore: ${score}/${totalPoints} points\nTemps: ${formatTime(timer)}\nRéponses: ${answered.length}/${questions.length}`)
                  navigate('/exercices')
                }}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold"
              >
                Terminer 🎉
              </button>
            )}
          </div>
        </div>

        {/* Indicateurs de progression */}
        <div className="mt-6 flex justify-center gap-2">
          {questions.map((_, idx) => (
            <div
              key={idx}
              className={`w-3 h-3 rounded-full ${
                answered.includes(idx)
                  ? 'bg-green-500'
                  : idx === currentIndex
                  ? 'bg-blue-500'
                  : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

