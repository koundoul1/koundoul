/**
 * ✍️ Espace de Travail Élève - Koundoul
 * Zone pour que l'élève écrive sa démarche de résolution
 * Avec sauvegarde automatique et feedback pédagogique
 */

import React, { useState, useEffect } from 'react'
import { Save, Trash2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

const StudentWorkspace = ({ onSubmitAttempt, expectedAnswer }) => {
  const [workContent, setWorkContent] = useState('')
  const [savedDrafts, setSavedDrafts] = useState([])
  const [feedback, setFeedback] = useState(null)
  const [isChecking, setIsChecking] = useState(false)

  // Charger les brouillons depuis localStorage au montage
  useEffect(() => {
    const saved = localStorage.getItem('koundoul_solver_drafts')
    if (saved) {
      try {
        const drafts = JSON.parse(saved)
        setSavedDrafts(Array.isArray(drafts) ? drafts : [])
      } catch (error) {
        console.error('Erreur chargement brouillons:', error)
        setSavedDrafts([])
      }
    }
  }, [])

  /**
   * Affiche une notification toast temporaire
   */
  const showNotification = (message, type = 'success') => {
    const toast = document.createElement('div')
    toast.textContent = message
    toast.className = `fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg animate-bounce z-50 ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
    }`
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 2000)
  }

  /**
   * Sauvegarde manuelle d'un brouillon
   */
  const saveDraft = () => {
    if (!workContent.trim()) {
      setFeedback({
        type: 'warning',
        message: 'Écris quelque chose avant de sauvegarder !'
      })
      return
    }

    const draft = {
      id: Date.now(),
      content: workContent,
      timestamp: new Date().toISOString()
    }
    
    const newDrafts = [draft, ...savedDrafts].slice(0, 10) // Max 10 brouillons
    setSavedDrafts(newDrafts)
    localStorage.setItem('koundoul_solver_drafts', JSON.stringify(newDrafts))
    
    // Notification de confirmation
    showNotification('✅ Brouillon sauvegardé')
  }

  /**
   * Efface le contenu avec confirmation
   */
  const clearWorkspace = () => {
    if (workContent.trim() && !confirm('Effacer tout ton travail ?')) {
      return
    }
    setWorkContent('')
    setFeedback(null)
  }

  /**
   * Charge un brouillon depuis l'historique
   */
  const loadDraft = (draft) => {
    setWorkContent(draft.content)
    setFeedback(null)
    showNotification('📄 Brouillon chargé', 'success')
  }

  /**
   * Supprime un brouillon
   */
  const deleteDraft = (draftId, event) => {
    event.stopPropagation() // Empêcher le chargement du brouillon
    
    const newDrafts = savedDrafts.filter(d => d.id !== draftId)
    setSavedDrafts(newDrafts)
    localStorage.setItem('koundoul_solver_drafts', JSON.stringify(newDrafts))
  }

  /**
   * Vérifie la tentative de l'élève
   */
  const checkAttempt = async () => {
    if (!workContent.trim()) {
      setFeedback({
        type: 'warning',
        message: 'Écris d\'abord ta démarche avant de vérifier !'
      })
      return
    }

    setIsChecking(true)
    setFeedback(null)

    // Simulation de vérification (1.5 secondes)
    setTimeout(() => {
      // Vérification basique: cherche la réponse attendue dans le texte
      const hasAnswer = expectedAnswer && 
        workContent.toLowerCase().includes(expectedAnswer.toString().toLowerCase())
      
      setFeedback({
        type: hasAnswer ? 'success' : 'partial',
        message: hasAnswer
          ? '🎉 Excellent ! Ta démarche semble correcte !'
          : '🤔 C\'est un bon début, mais vérifie tes calculs.',
        suggestions: hasAnswer ? [] : [
          'Relis l\'énoncé attentivement',
          'Vérifie les signes (+/-)',
          'As-tu bien appliqué la méthode ?'
        ]
      })
      
      // Notifier le parent
      if (onSubmitAttempt) {
        onSubmitAttempt({ 
          content: workContent, 
          isCorrect: hasAnswer 
        })
      }
      
      setIsChecking(false)
    }, 1500)
  }

  return (
    <div className="student-workspace space-y-4">
      {/* Header avec boutons */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
          ✍️ Ton espace de travail
        </h3>
        <div className="flex gap-2">
          <button
            onClick={saveDraft}
            className="text-sm px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors flex items-center gap-1 font-medium"
            title="Sauvegarder le brouillon"
          >
            <Save className="h-4 w-4" />
            Sauvegarder
          </button>
          <button
            onClick={clearWorkspace}
            className="text-sm px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors flex items-center gap-1 font-medium"
            title="Effacer tout"
          >
            <Trash2 className="h-4 w-4" />
            Effacer
          </button>
        </div>
      </div>

      {/* Textarea principale */}
      <div>
        <textarea
          value={workContent}
          onChange={(e) => setWorkContent(e.target.value)}
          placeholder={`Écris ici ta démarche de résolution...

Exemple:
1. Je pose l'équation: 2x + 5 = 13
2. Je soustrais 5 des deux côtés: 2x = 13 - 5
3. Je calcule: 2x = 8
4. Je divise par 2: x = 4`}
          className="w-full h-64 p-4 bg-gray-800/50 border-2 border-gray-600 rounded-lg text-gray-200 focus:border-blue-400 focus:outline-none resize-none font-mono text-sm transition-colors"
          style={{ lineHeight: '1.8' }}
        />
        
        {/* Ligne info */}
        <div className="mt-2 text-xs text-gray-400 flex items-center justify-between">
          <span>{workContent.length} caractères</span>
          <span className="flex items-center gap-1">
            💡 <span>Astuce: Détaille bien chaque étape</span>
          </span>
        </div>
      </div>

      {/* Bouton Vérifier */}
      <button
        onClick={checkAttempt}
        disabled={isChecking || !workContent.trim()}
        className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
      >
        {isChecking ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Vérification en cours...
          </>
        ) : (
          <>
            <CheckCircle className="h-5 w-5" />
            Vérifier mon raisonnement
          </>
        )}
      </button>

      {/* Feedback */}
      {feedback && (
        <div
          className={`rounded-lg p-4 border-2 transition-all duration-300 ${
            feedback.type === 'success'
              ? 'bg-green-500/10 border-green-400/30'
              : feedback.type === 'partial'
              ? 'bg-yellow-500/10 border-yellow-400/30'
              : 'bg-red-500/10 border-red-400/30'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              {feedback.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-400" />
              ) : (
                <AlertCircle className={`h-5 w-5 ${
                  feedback.type === 'partial' ? 'text-yellow-400' : 'text-red-400'
                }`} />
              )}
            </div>
            <div className="flex-1">
              <p className={`font-medium mb-2 ${
                feedback.type === 'success' 
                  ? 'text-green-300' 
                  : feedback.type === 'partial'
                  ? 'text-yellow-300'
                  : 'text-red-300'
              }`}>
                {feedback.message}
              </p>
              
              {/* Suggestions si présentes */}
              {feedback.suggestions && feedback.suggestions.length > 0 && (
                <div className="mt-3 space-y-1">
                  <p className="text-sm font-medium text-gray-300">
                    💡 Suggestions:
                  </p>
                  <ul className="text-sm text-gray-400 space-y-1">
                    {feedback.suggestions.map((suggestion, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-yellow-400 flex-shrink-0">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Brouillons sauvegardés (section repliable) */}
      {savedDrafts.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-200 transition-colors font-medium">
            📁 Brouillons sauvegardés ({savedDrafts.length})
          </summary>
          <div className="mt-3 space-y-2">
            {savedDrafts.slice(0, 5).map((draft) => (
              <div
                key={draft.id}
                className="p-3 bg-gray-800/30 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer group"
                onClick={() => loadDraft(draft)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">
                    {new Date(draft.timestamp).toLocaleString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <button
                    onClick={(e) => deleteDraft(draft.id, e)}
                    className="text-xs text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Supprimer
                  </button>
                </div>
                <p className="text-sm text-gray-300 line-clamp-2">
                  {draft.content}
                </p>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}

export default StudentWorkspace









