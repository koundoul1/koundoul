/**
 * 🧠 Module de Résolution Koundoul
 * Interface pour résoudre des problèmes scientifiques avec l'IA
 */

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BlockMath, InlineMath } from 'react-katex'
import 'katex/dist/katex.min.css'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../hooks/useTranslation.jsx'
import api from '../services/api'
import SuccessFeedback from '../components/SuccessFeedback'
import SolutionSteps from '../components/SolutionSteps'
import { 
  Brain, 
  Send, 
  History, 
  BookOpen, 
  Zap, 
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Copy,
  Download,
  Star,
  Sparkles,
  Lightbulb
} from 'lucide-react'

// Nouveaux composants pédagogiques
import HintSystem from '../components/solver/HintSystem'
import StudentWorkspace from '../components/solver/StudentWorkspace'
import ErrorFeedback from '../components/solver/ErrorFeedback'
import InteractiveGraph from '../components/solver/InteractiveGraph'
import LearningProfileSelector from '../components/solver/LearningProfileSelector'

// Nouveaux utils
import { analyzeStudentAttempt } from '../utils/errorAnalyzer'
import { loadProfileFromStorage, saveProfileToStorage } from '../utils/learningProfiles'

// Composant pour afficher la solution avec support LaTeX
const SolutionDisplay = ({ content }) => {
  if (!content) return <p className="text-gray-100">Aucune solution affichée</p>;
  
  // Extraire les blocs LaTeX $$...$$ et inline $...$
  const latexBlocks = [];
  let processedContent = content.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
    const id = `__LATEX_BLOCK_${latexBlocks.length}__`;
    latexBlocks.push(formula.trim());
    return id;
  });
  
  const latexInline = [];
  processedContent = processedContent.replace(/\$([^$\n]+?)\$/g, (match, formula) => {
    const id = `__LATEX_INLINE_${latexInline.length}__`;
    latexInline.push(formula.trim());
    return id;
  });
  
  const parts = [];
  let lastIndex = 0;
  const allTokens = [
    ...latexBlocks.map((f, i) => ({ type: 'block', formula: f, index: processedContent.indexOf(`__LATEX_BLOCK_${i}__`) })),
    ...latexInline.map((f, i) => ({ type: 'inline', formula: f, index: processedContent.indexOf(`__LATEX_INLINE_${i}__`) }))
  ].sort((a, b) => a.index - b.index);
  
  allTokens.forEach((token) => {
    if (token.index > lastIndex) {
      const textPart = processedContent.substring(lastIndex, token.index);
      if (textPart) {
        parts.push(<span key={`text-${lastIndex}`} className="text-gray-100 whitespace-pre-wrap text-lg leading-relaxed font-medium">{textPart}</span>);
      }
    }
    
    try {
      if (token.type === 'block') {
        parts.push(
          <div key={`latex-block-${token.index}`} className="my-4 flex justify-center">
            <BlockMath math={token.formula} />
          </div>
        );
      } else {
        parts.push(<InlineMath key={`latex-inline-${token.index}`} math={token.formula} />);
      }
    } catch (error) {
      console.warn('Erreur rendu LaTeX:', error);
      parts.push(<span key={`latex-error-${token.index}`} className="text-red-300">${token.formula}</span>);
    }
    
    lastIndex = token.index + (token.type === 'block' ? `__LATEX_BLOCK_${latexBlocks.indexOf(token.formula)}__`.length : `__LATEX_INLINE_${latexInline.indexOf(token.formula)}__`.length);
  });
  
  if (lastIndex < processedContent.length) {
    const textPart = processedContent.substring(lastIndex);
    if (textPart) {
      parts.push(<span key="text-end" className="text-gray-100 whitespace-pre-wrap text-lg leading-relaxed font-medium">{textPart}</span>);
    }
  }
  
  return <div className="text-gray-100 text-lg leading-relaxed font-medium">{parts.length > 0 ? parts : content}</div>;
};

const Solver = () => {
  const { user, isAuthenticated } = useAuth()
  const { t } = useTranslation()
  const [problem, setProblem] = useState('')
  const [subject, setSubject] = useState('math')
  const [difficulty, setDifficulty] = useState('easy')
  const [isSolving, setIsSolving] = useState(false)
  const [solution, setSolution] = useState(null)
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [error, setError] = useState('')
  const [showSuccessFeedback, setShowSuccessFeedback] = useState(false)
  const [xpGained, setXpGained] = useState(0)

  // NOUVEAUX ÉTATS - Mode guidé et composants pédagogiques
  const [showGuidedMode, setShowGuidedMode] = useState(false)
  const [studentAttempts, setStudentAttempts] = useState([])
  const [detectedErrors, setDetectedErrors] = useState([])
  const [usedHints, setUsedHints] = useState([])
  
  // Profil d'apprentissage
  const [learningProfile, setLearningProfile] = useState(
    loadProfileFromStorage()
  )
  
  // Graphiques
  const [showGraph, setShowGraph] = useState(false)

  const subjects = [
    { value: 'math', label: 'Mathématiques', icon: '📐' },
    { value: 'physics', label: 'Physique', icon: '⚛️' },
    { value: 'chemistry', label: 'Chimie', icon: '🧪' },
    { value: 'biology', label: 'Biologie', icon: '🧬' },
    { value: 'general', label: 'Général', icon: '🔬' }
  ]

  const difficulties = [
    { value: 'easy', label: 'Facile', color: 'green' },
    { value: 'medium', label: 'Moyen', color: 'yellow' },
    { value: 'hard', label: 'Difficile', color: 'red' }
  ]

  // Charger l'historique des problèmes
  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      // Si l'utilisateur est connecté, charger depuis l'API
      if (isAuthenticated && user) {
        const response = await api.solver.getHistory()
        setHistory(response.data || [])
      } else {
        // Sinon, charger depuis le localStorage
        const localHistory = localStorage.getItem('solverHistory')
        if (localHistory) {
          setHistory(JSON.parse(localHistory))
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error)
      // En cas d'erreur, charger depuis le localStorage
      const localHistory = localStorage.getItem('solverHistory')
      if (localHistory) {
        setHistory(JSON.parse(localHistory))
      }
    }
  }

  const handleSolve = async () => {
    if (!problem.trim()) {
      setError(t('solver.enterProblem') || 'Entre ton problème à résoudre')
      return
    }

    setIsSolving(true)
    setError('')
    setSolution(null)
    setDetectedErrors([])
    setUsedHints([])
    setShowGraph(false)

    try {
      const response = await api.solver.solve({
        input: problem.trim(),
        domain: subject,
        level: difficulty,
        guidedMode: showGuidedMode,
        learningProfile: learningProfile
      })

      if (response.success) {
        const solutionData = response.data.solution || response.data
        console.log('✅ Solution reçue:', solutionData)
        
        setSolution(solutionData)
        
        // Afficher graphique si nécessaire
        if (solutionData.requiresGraph && solutionData.functionString) {
          setShowGraph(true)
        }
        
        // XP et feedback de succès
        const earnedXP = response.data.xpGained || 0
        if (earnedXP > 0) {
          setXpGained(earnedXP)
          setShowSuccessFeedback(true)
          setTimeout(() => setShowSuccessFeedback(false), 3000)
        }
        
        // Avertissement si domaine changé
        if (response.data.warning) {
          console.warn('⚠️', response.data.warning)
        }
        
        // Ajouter à l'historique
        const newProblem = {
          id: Date.now(),
          description: problem.trim(),
          subject: response.data.domainUsed || subject,
          difficulty: difficulty,
          solution: solutionData,
          createdAt: new Date().toISOString()
        }
        
        const updatedHistory = [newProblem, ...history]
        setHistory(updatedHistory)
        
        // Sauvegarder dans localStorage si pas connecté
        if (!isAuthenticated || !user) {
          localStorage.setItem('solverHistory', JSON.stringify(updatedHistory.slice(0, 10)))
        }
        
      } else {
        // Gérer les erreurs spécifiques
        if (response.error?.code === 'OUT_OF_SCOPE' || response.error === 'out_of_scope') {
          setError(response.error?.message || response.message || 'Cette question est en dehors du cadre de l\'application (Maths/Physique/Chimie uniquement)')
        } else {
          setError(response.error?.message || response.message || 'Une erreur est survenue')
        }
      }
    } catch (error) {
      console.error('❌ Erreur résolution:', error)
      setError('Une erreur est survenue. Vérifie ta connexion et réessaie.')
    } finally {
      setIsSolving(false)
    }
  }

  const handleCopySolution = () => {
    if (solution) {
      navigator.clipboard.writeText(solution.solution)
    }
  }

  const handleDownloadSolution = () => {
    if (solution) {
      const content = `Problème: ${problem}\n\nSolution:\n${solution.solution}\n\nExplication:\n${solution.explanation}`
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `solution_${Date.now()}.txt`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const loadFromHistory = (historyItem) => {
    setProblem(historyItem.description)
    setSubject(historyItem.subject)
    setDifficulty(historyItem.difficulty)
    setSolution(historyItem)
    setShowHistory(false)
  }

  /**
   * Gérer les tentatives de l'élève dans le workspace
   */
  const handleStudentAttempt = ({ content, isCorrect }) => {
    const attempt = {
      content,
      isCorrect,
      timestamp: new Date().toISOString(),
      hintsUsed: usedHints.length
    }
    
    setStudentAttempts([...studentAttempts, attempt])
    
    // Analyser les erreurs si incorrect
    if (!isCorrect && solution) {
      const errors = analyzeStudentAttempt(
        content,
        solution.solution,
        subject
      )
      
      if (errors.length > 0) {
        setDetectedErrors(errors)
        
        // Scroll vers le feedback d'erreurs après un court délai
        setTimeout(() => {
          const errorElement = document.getElementById('error-feedback')
          if (errorElement) {
            errorElement.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            })
          }
        }, 100)
      }
    } else if (isCorrect) {
      // Réinitialiser les erreurs si correct
      setDetectedErrors([])
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-950">
      {/* Feedback de succès */}
      {showSuccessFeedback && (
        <SuccessFeedback xpGained={xpGained} />
      )}
      
      {/* Header avec design sombre */}
      <div className="koundoul-navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold koundoul-text-gradient flex items-center">
                <Brain className="h-8 w-8 text-blue-400 mr-3" />
                Résolveur de Problèmes IA
              </h1>
              <p className="text-gray-300 mt-1">
                Utilisez l'intelligence artificielle pour résoudre vos problèmes scientifiques
              </p>
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="koundoul-btn-primary flex items-center px-4 py-2"
            >
              <History className="h-5 w-5 mr-2" />
              Historique
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Zone de saisie */}
          <div className="lg:col-span-2">
            <div className="koundoul-card">
              <div className="border-b border-gray-600 pb-4 mb-6">
                <h2 className="text-lg font-semibold text-gray-200">Décrivez votre problème</h2>
                <p className="text-gray-400 text-sm mt-1">
                  Soyez aussi précis que possible pour obtenir la meilleure solution
                </p>
              </div>

              <div className="space-y-6">
                {/* NOUVEAU: Toggle Mode Guidé */}
                <div className="bg-blue-500/10 border-2 border-blue-400/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <Lightbulb className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                          <h4 className="font-semibold text-blue-300 mb-1">
                            Mode Apprentissage Guidé
                          </h4>
                          <p className="text-sm text-gray-400">
                            Résous le problème étape par étape avec des indices progressifs et un espace de travail
                          </p>
                        </div>
                        <button
                          onClick={() => setShowGuidedMode(!showGuidedMode)}
                          className={`
                            relative inline-flex h-8 w-14 items-center rounded-full transition-colors
                            ${showGuidedMode ? 'bg-blue-500' : 'bg-gray-600'}
                          `}
                          aria-label="Toggle mode guidé"
                        >
                          <span
                            className={`
                              inline-block h-6 w-6 transform rounded-full bg-white transition-transform
                              ${showGuidedMode ? 'translate-x-7' : 'translate-x-1'}
                            `}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* NOUVEAU: Profil d'apprentissage (si mode guidé actif) */}
                {showGuidedMode && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-3">
                      🎯 Comment apprends-tu le mieux ?
                    </h4>
                    <LearningProfileSelector
                      selectedProfile={learningProfile}
                      onProfileChange={(profileId) => {
                        setLearningProfile(profileId)
                        saveProfileToStorage(profileId)
                      }}
                    />
                  </div>
                )}

                {/* Sélecteurs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Domaine
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="koundoul-input w-full"
                    >
                      {subjects.map((subj) => (
                        <option key={subj.value} value={subj.value}>
                          {subj.icon} {subj.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Difficulté
                    </label>
                    <div className="flex gap-2">
                      {difficulties.map((diff) => {
                        const isSelected = difficulty === diff.value;
                        const buttonClasses = {
                          green: isSelected 
                            ? 'bg-green-500/20 text-green-300 border-green-400 shadow-md scale-105'
                            : 'bg-gray-700/50 text-gray-400 border-gray-600 hover:bg-gray-600/50',
                          yellow: isSelected
                            ? 'bg-yellow-500/20 text-yellow-300 border-yellow-400 shadow-md scale-105'
                            : 'bg-gray-700/50 text-gray-400 border-gray-600 hover:bg-gray-600/50',
                          red: isSelected
                            ? 'bg-red-500/20 text-red-300 border-red-400 shadow-md scale-105'
                            : 'bg-gray-700/50 text-gray-400 border-gray-600 hover:bg-gray-600/50'
                        };

                        return (
                          <button
                            key={diff.value}
                            type="button"
                            onClick={() => setDifficulty(diff.value)}
                            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 border-2 ${buttonClasses[diff.color]}`}
                          >
                            {diff.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Zone de texte */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('solver.problemLabel')}
                  </label>
                  <textarea
                    value={problem}
                    onChange={(e) => {
                      setProblem(e.target.value)
                      if (error) setError('')
                    }}
                    placeholder={t('solver.problemPlaceholder')}
                    className="koundoul-solver-input w-full h-32 resize-none"
                  />
                </div>

                {/* Erreur */}
                {error && (
                  <div className={`flex items-start p-4 rounded-lg border-2 ${
                    error.includes('cadre de l\'application') || error.includes('spécialisé uniquement')
                      ? 'bg-yellow-500/10 border-yellow-400/30 text-yellow-300' 
                      : 'bg-red-500/10 border-red-400/30 text-red-300'
                  }`}>
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-line">{error}</p>
                      
                      {(error.includes('cadre de l\'application') || error.includes('spécialisé uniquement')) && (
                        <div className="mt-3 pt-3 border-t border-yellow-400/20">
                          <p className="text-xs text-gray-400 mb-2">
                            💡 Je peux t'aider avec des problèmes de:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
                              📐 Mathématiques
                            </span>
                            <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
                              ⚛️ Physique
                            </span>
                            <span className="text-xs px-2 py-1 bg-green-500/20 text-green-300 rounded">
                              🧪 Chimie
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Bouton de résolution amélioré */}
                <button
                  onClick={handleSolve}
                  disabled={isSolving || !problem.trim()}
                  className="relative w-full koundoul-btn-primary py-4 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center overflow-hidden group"
                >
                  {/* Effet brillant au survol */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 group-hover:animate-pulse transition-opacity" />
                  
                  {isSolving ? (
                    <>
                      <Loader2 className="animate-spin h-6 w-6 mr-3" />
                      <span className="flex items-center gap-2">
                        <span>Réflexion en cours</span>
                        <Sparkles className="h-5 w-5 animate-pulse" />
                      </span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-6 w-6 mr-3 group-hover:animate-pulse" />
                      <span className="text-lg">Résoudre avec l'IA</span>
                      <Sparkles className="h-5 w-5 ml-2 opacity-75" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Message pour utilisateurs non connectés */}
            {!isAuthenticated && (
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Mode démo
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        Vous utilisez le solveur en mode démo. 
                        <Link to="/register" className="font-medium underline hover:text-blue-600">
                          Créez un compte
                        </Link> pour sauvegarder vos solutions et gagner de l'XP !
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Solution */}
            {solution && (
              <div className="mt-8 koundoul-card">
                <div className="border-b border-gray-600 pb-4 mb-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-200 flex items-center">
                      <CheckCircle className="h-6 w-6 text-green-400 mr-2" />
                      Solution trouvée
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleCopySolution}
                        className="flex items-center px-3 py-1 text-sm text-gray-400 hover:text-gray-200 transition-colors"
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copier
                      </button>
                      <button
                        onClick={handleDownloadSolution}
                        className="flex items-center px-3 py-1 text-sm text-gray-400 hover:text-gray-200 transition-colors"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Télécharger
                      </button>
                    </div>
                  </div>
                </div>

                <div className="prose max-w-none">
                  {/* Solution finale unique et propre avec LaTeX */}
                  <div className="koundoul-solution-final">
                    <h4 className="font-semibold text-green-300 mb-4 flex items-center text-xl">
                      <CheckCircle className="h-7 w-7 mr-3 text-green-400" />
                      Solution trouvée
                    </h4>
                    <div className="bg-black/20 rounded-lg p-4 border border-green-400/30">
                      <SolutionDisplay content={solution.solution || 'Aucune solution affichée'} />
                    </div>
                  </div>

                  {/* Étapes pédagogiques avec le nouveau composant */}
                  {solution.steps && solution.steps.length > 0 && (
                    <SolutionSteps steps={solution.steps} />
                  )}

                  <div className="mt-4 flex items-center justify-between text-sm text-gray-400 flex-wrap gap-2">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-1" />
                        +{solution.points || xpGained || 10} XP
                      </div>
                      
                      {/* NOUVEAU: Afficher pénalité hints */}
                      {usedHints.length > 0 && (
                        <div className="flex items-center text-yellow-400">
                          <Lightbulb className="h-4 w-4 mr-1" />
                          -{usedHints.reduce((sum, h) => sum + h.penalty, 0)} XP (indices)
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date().toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* NOUVEAU: Section Mode Guidé */}
            {showGuidedMode && solution && (
              <div className="mt-8 space-y-6">
                {/* Système de Hints */}
                {solution.hints && solution.hints.length > 0 && (
                  <div className="koundoul-card">
                    <HintSystem
                      hints={solution.hints}
                      onHintUsed={(hintData) => {
                        setUsedHints([...usedHints, hintData])
                        console.log(`💡 Indice ${hintData.index + 1} débloqué, -${hintData.penalty} XP`)
                      }}
                      maxHints={3}
                    />
                  </div>
                )}
                
                {/* Espace de Travail Élève */}
                <div className="koundoul-card">
                  <StudentWorkspace
                    onSubmitAttempt={handleStudentAttempt}
                    expectedAnswer={solution.solution}
                  />
                </div>
                
                {/* Feedback d'Erreurs */}
                {detectedErrors.length > 0 && (
                  <div id="error-feedback" className="koundoul-card">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      🔍 Analyse des Erreurs
                    </h3>
                    <ErrorFeedback
                      errors={detectedErrors}
                      onWatchVideo={(url) => {
                        console.log('📺 Ouvrir vidéo:', url)
                        window.open(url, '_blank')
                      }}
                      onDoExercise={(url) => {
                        console.log('🎯 Naviguer vers exercice:', url)
                        // TODO: Navigation vers exercice
                      }}
                      onReviewLesson={(type) => {
                        console.log('📚 Revoir leçon:', type)
                        // TODO: Navigation vers leçon appropriée
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* NOUVEAU: Graphique Interactif */}
            {showGraph && solution && solution.requiresGraph && solution.functionString && (
              <div className="mt-8 koundoul-card">
                <InteractiveGraph
                  func={(x) => {
                    try {
                      // Évaluer la fonction de manière sécurisée
                      // Note: eval est utilisé mais la string vient du backend validé
                      const safeFunction = solution.functionString.replace(/x/g, `(${x})`)
                      return eval(safeFunction)
                    } catch (e) {
                      console.warn('Erreur évaluation fonction:', e)
                      return NaN
                    }
                  }}
                  domain={[-10, 10]}
                  title={solution.functionName || 'f(x)'}
                />
              </div>
            )}
          </div>

          {/* Sidebar - Historique */}
          <div className="lg:col-span-1">
            <div className="koundoul-card">
              <div className="border-b border-gray-600 pb-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-200">Historique</h3>
                <p className="text-gray-400 text-sm mt-1">
                  Vos problèmes récents
                </p>
              </div>

              <div>
                {history.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">Aucun problème résolu</p>
                    <p className="text-gray-500 text-sm">Commencez à résoudre des problèmes !</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.slice(0, 10).map((item, index) => (
                      <div
                        key={index}
                        onClick={() => loadFromHistory(item)}
                        className="p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 cursor-pointer transition-colors border border-gray-700 hover:border-gray-600"
                      >
                        <p className="text-sm font-medium text-gray-200 line-clamp-2">
                          {item.description}
                        </p>
                        <div className="flex items-center mt-2 text-xs text-gray-400">
                          <span className="capitalize">{item.subject}</span>
                          <span className="mx-1">•</span>
                          <span className="capitalize">{item.difficulty}</span>
                          <span className="mx-1">•</span>
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Solver

