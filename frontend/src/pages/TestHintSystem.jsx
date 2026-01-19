/**
 * 🧪 Page de Test - HintSystem
 * Pour tester le composant HintSystem en isolation
 */

import React, { useState, useEffect } from 'react'
import HintSystem from '../components/solver/HintSystem'
import StudentWorkspace from '../components/solver/StudentWorkspace'
import ErrorFeedback from '../components/solver/ErrorFeedback'
import InteractiveGraph from '../components/solver/InteractiveGraph'
import LearningProfileSelector from '../components/solver/LearningProfileSelector'
import { analyzeStudentAttempt } from '../utils/errorAnalyzer'
import { loadProfileFromStorage, saveProfileToStorage, formatProfileForDisplay } from '../utils/learningProfiles'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function TestHintSystem() {
  const [totalXP, setTotalXP] = useState(100)
  const [hintsUsedLog, setHintsUsedLog] = useState([])
  const [studentAttempts, setStudentAttempts] = useState([])
  const [detectedErrors, setDetectedErrors] = useState([])
  const [learningProfile, setLearningProfile] = useState('balanced')

  // Charger le profil depuis localStorage au montage
  useEffect(() => {
    const savedProfile = loadProfileFromStorage()
    setLearningProfile(savedProfile)
  }, [])

  // Hints de test (3 niveaux)
  const mockHints = [
    "Indice niveau 1 (Facile): Commence par identifier toutes les données du problème. Quelles sont les grandeurs connues ? Quelles sont les grandeurs à trouver ?",
    "Indice niveau 2 (Moyen): Quelle formule mathématique ou physique peux-tu utiliser pour relier ces grandeurs ? Pense aux lois fondamentales du chapitre.",
    "Indice niveau 3 (Difficile): Réfléchis à la méthode de résolution. Dois-tu isoler une variable ? Faire une substitution ? Résoudre un système ?"
  ]

  const handleHintUsed = (hintData) => {
    // Appliquer la pénalité XP
    setTotalXP(totalXP - hintData.penalty)
    
    // Logger l'utilisation
    const log = {
      index: hintData.index,
      penalty: hintData.penalty,
      timestamp: new Date().toLocaleTimeString()
    }
    setHintsUsedLog([...hintsUsedLog, log])
    
    console.log('💡 Hint utilisé:', hintData)
  }

  const handleStudentAttempt = (attemptData) => {
    const attempt = {
      ...attemptData,
      timestamp: new Date().toLocaleTimeString()
    }
    setStudentAttempts([...studentAttempts, attempt])
    
    // Analyser les erreurs si incorrect
    if (!attemptData.isCorrect) {
      const errors = analyzeStudentAttempt(
        attemptData.content,
        "x = 2 ou x = 3",
        'math'
      )
      setDetectedErrors(errors)
      console.log('🔍 Erreurs détectées:', errors)
    } else {
      setDetectedErrors([])
    }
    
    // Bonus XP si correct du premier coup
    if (attemptData.isCorrect && studentAttempts.length === 0) {
      setTotalXP(totalXP + 5)
      console.log('🎉 Bonus +5 XP pour résolution du premier coup !')
    }
    
    console.log('✍️ Tentative élève:', attemptData)
  }

  const resetTest = () => {
    setTotalXP(100)
    setHintsUsedLog([])
    setStudentAttempts([])
    setDetectedErrors([])
    // Force re-render du HintSystem
    window.location.reload()
  }

  // Fonction de test pour le graphique
  const testFunction = (x) => {
    // Fonction quadratique: f(x) = x² - 5x + 6
    return x * x - 5 * x + 6
  }

  // Handler pour changement de profil
  const handleProfileChange = (profileId) => {
    setLearningProfile(profileId)
    saveProfileToStorage(profileId)
    console.log('🎓 Profil changé:', profileId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-950 py-12">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/solver"
            className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au Résolveur
          </Link>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            🧪 Test du Système de Hints
          </h1>
          <p className="text-gray-300">
            Page de test pour valider le composant HintSystem en isolation
          </p>
        </div>

        {/* Stats de test */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-8 border border-white/20">
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div>
              <div className="text-3xl font-bold text-blue-400">{totalXP}</div>
              <div className="text-sm text-gray-400">XP Restants</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-400">{hintsUsedLog.length}</div>
              <div className="text-sm text-gray-400">Hints Utilisés</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-400">
                -{hintsUsedLog.reduce((sum, log) => sum + log.penalty, 0)}
              </div>
              <div className="text-sm text-gray-400">XP Perdus</div>
            </div>
          </div>

          {/* Affichage profil actuel */}
          <div className="flex items-center justify-center gap-2 text-sm mb-4 p-2 bg-black/20 rounded-lg">
            <span className="text-gray-400">Profil actuel:</span>
            <span className="px-2 py-1 bg-gray-700 rounded text-gray-300 font-medium">
              {formatProfileForDisplay(learningProfile).icon} {formatProfileForDisplay(learningProfile).name}
            </span>
          </div>
          
          <button
            onClick={resetTest}
            className="mt-2 w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            🔄 Réinitialiser le test
          </button>
        </div>

        {/* Sélecteur de Profil d'Apprentissage */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-8 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">
            🎓 Profil d'Apprentissage
          </h3>
          <LearningProfileSelector
            selectedProfile={learningProfile}
            onProfileChange={handleProfileChange}
          />
        </div>

        {/* Problème fictif */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-8 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-3">
            📝 Problème de test
          </h2>
          <p className="text-gray-300 text-lg">
            Résoudre l'équation du second degré : <code className="bg-black/30 px-2 py-1 rounded">x² - 5x + 6 = 0</code>
          </p>
          <div className="mt-4 text-sm text-gray-400">
            <p>Domaine: Mathématiques</p>
            <p>Difficulté: Moyen</p>
            <p>XP de base: 10 points</p>
          </div>
        </div>

        {/* Composant HintSystem */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-8 border border-white/20">
          <HintSystem 
            hints={mockHints}
            onHintUsed={handleHintUsed}
            maxHints={3}
          />
        </div>

        {/* Composant StudentWorkspace */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-8 border border-white/20">
          <StudentWorkspace 
            onSubmitAttempt={handleStudentAttempt}
            expectedAnswer="x = 2 ou x = 3"
          />
        </div>

        {/* Composant ErrorFeedback */}
        {detectedErrors.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-8 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">
              🔍 Analyse des Erreurs
            </h3>
            <ErrorFeedback 
              errors={detectedErrors}
              onWatchVideo={(url) => {
                console.log('📺 Ouvrir vidéo:', url)
                alert(`Vidéo: ${url}\n(Fonctionnalité à implémenter)`)
              }}
              onDoExercise={(url) => {
                console.log('🎯 Ouvrir exercice:', url)
                alert(`Exercice: ${url}\n(Fonctionnalité à implémenter)`)
              }}
              onReviewLesson={(type) => {
                console.log('📚 Revoir leçon:', type)
                alert(`Leçon sur: ${type}\n(Fonctionnalité à implémenter)`)
              }}
            />
          </div>
        )}

        {/* Composant InteractiveGraph */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-8 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">
            📊 Graphique Interactif
          </h3>
          <InteractiveGraph 
            func={testFunction}
            domain={[-2, 7]}
            title="f(x) = x² - 5x + 6"
            showDerivative={false}
          />
        </div>

        {/* Log des tentatives élève */}
        {studentAttempts.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-8 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">
              ✍️ Tentatives de l'élève
            </h3>
            <div className="space-y-2">
              {studentAttempts.map((attempt, i) => (
                <div 
                  key={i}
                  className={`p-3 rounded-lg border ${
                    attempt.isCorrect 
                      ? 'bg-green-500/10 border-green-400/30' 
                      : 'bg-yellow-500/10 border-yellow-400/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-semibold ${
                      attempt.isCorrect ? 'text-green-300' : 'text-yellow-300'
                    }`}>
                      Tentative #{i + 1} - {attempt.isCorrect ? '✅ Correcte' : '🤔 À améliorer'}
                    </span>
                    <span className="text-xs text-gray-400">{attempt.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-300 line-clamp-3 bg-black/20 rounded p-2">
                    {attempt.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Log des hints utilisés */}
        {hintsUsedLog.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">
              📊 Historique des hints
            </h3>
            <div className="space-y-2">
              {hintsUsedLog.map((log, i) => (
                <div 
                  key={i}
                  className="flex items-center justify-between p-3 bg-black/20 rounded-lg"
                >
                  <span className="text-gray-300">
                    Indice niveau {log.index + 1} débloqué
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-400">{log.timestamp}</span>
                    <span className="text-red-400 font-medium">-{log.penalty} XP</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-400/30 rounded-lg">
              <p className="text-sm text-blue-300">
                <strong>XP Final:</strong> {totalXP} points 
                {totalXP === 100 && <span className="ml-2">🏆 Parfait ! Aucun indice utilisé !</span>}
                {totalXP >= 94 && totalXP < 100 && <span className="ml-2">⭐ Excellent ! Très peu d'aide nécessaire</span>}
                {totalXP >= 88 && totalXP < 94 && <span className="ml-2">👍 Bien ! Tu as utilisé quelques indices</span>}
                {totalXP < 88 && <span className="ml-2">💪 Continue ! Essaie d'utiliser moins d'indices la prochaine fois</span>}
              </p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-purple-500/10 border border-purple-400/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-purple-300 mb-3">
            📖 Instructions de test
          </h3>
          <ol className="space-y-2 text-gray-300 text-sm">
            <li>1. Essaie de résoudre le problème mentalement</li>
            <li>2. Si tu es bloqué, débloque le premier indice</li>
            <li>3. Observe la pénalité XP (-2 points)</li>
            <li>4. Continue avec les indices suivants si nécessaire</li>
            <li>5. Vérifie que les pénalités sont progressives (-2, -4, -6)</li>
            <li>6. Teste qu'on ne peut pas skip les indices (ordre séquentiel)</li>
            <li>7. Clique sur "Réinitialiser" pour recommencer</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

