/**
 * 💡 Système de Hints Progressifs - Koundoul
 * Fournit des indices de difficulté croissante pour aider les élèves
 * Pénalité XP progressive pour encourager l'autonomie
 */

import React, { useState } from 'react'
import { Lightbulb, Lock, CheckCircle, AlertCircle } from 'lucide-react'

const HintSystem = ({ hints = [], onHintUsed, maxHints = 3 }) => {
  const [unlockedHints, setUnlockedHints] = useState([])
  const [penaltyApplied, setPenaltyApplied] = useState(false)

  /**
   * Détermine le niveau de difficulté d'un hint
   */
  const getHintDifficulty = (index) => {
    switch(index) {
      case 0: 
        return { 
          label: 'Facile', 
          color: 'green', 
          desc: 'Très guidant',
          bgClass: 'bg-green-500/20',
          textClass: 'text-green-300'
        }
      case 1: 
        return { 
          label: 'Moyen', 
          color: 'yellow', 
          desc: 'Direction générale',
          bgClass: 'bg-yellow-500/20',
          textClass: 'text-yellow-300'
        }
      case 2: 
        return { 
          label: 'Difficile', 
          color: 'orange', 
          desc: 'Question ouverte',
          bgClass: 'bg-orange-500/20',
          textClass: 'text-orange-300'
        }
      default: 
        return { 
          label: 'Info', 
          color: 'blue', 
          desc: '',
          bgClass: 'bg-blue-500/20',
          textClass: 'text-blue-300'
        }
    }
  }

  /**
   * Débloque le prochain indice dans la séquence
   */
  const unlockNextHint = () => {
    if (unlockedHints.length >= maxHints) return
    
    const nextIndex = unlockedHints.length
    setUnlockedHints([...unlockedHints, nextIndex])
    
    // Pénalité XP progressive: -2, -4, -6
    const penalty = (nextIndex + 1) * 2
    
    // Notifier le parent
    if (onHintUsed) {
      onHintUsed({ index: nextIndex, penalty })
    }
    
    // Afficher notification pénalité
    setPenaltyApplied(true)
    setTimeout(() => setPenaltyApplied(false), 2000)
  }

  return (
    <div className="hint-system space-y-4 max-w-3xl mx-auto">
      {/* Header avec compteur */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-400" />
          Indices disponibles
        </h3>
        <span className="text-sm text-gray-400 font-medium">
          {unlockedHints.length} / {maxHints} utilisés
        </span>
      </div>

      {/* Notification pénalité XP */}
      {penaltyApplied && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-center gap-2 animate-pulse">
          <AlertCircle className="h-4 w-4 text-yellow-400 flex-shrink-0" />
          <span className="text-sm text-yellow-300 font-medium">
            -{(unlockedHints.length) * 2} XP pour cet indice
          </span>
        </div>
      )}

      {/* Liste des hints */}
      <div className="space-y-3">
        {hints.map((hint, index) => {
          const isUnlocked = unlockedHints.includes(index)
          const isNext = index === unlockedHints.length
          const isLocked = index > unlockedHints.length
          const difficulty = getHintDifficulty(index)

          return (
            <div
              key={index}
              className={`relative rounded-lg border-2 p-4 transition-all duration-300 ${
                isUnlocked
                  ? 'border-green-400/30 bg-green-500/5'
                  : isNext
                  ? 'border-yellow-400/30 bg-yellow-500/5'
                  : 'border-gray-600/30 bg-gray-800/30 opacity-60'
              }`}
            >
              {/* Badge difficulté (top-right) */}
              <div className="absolute top-2 right-2">
                <span
                  className={`text-xs px-2 py-1 rounded-full font-semibold ${difficulty.bgClass} ${difficulty.textClass}`}
                >
                  {difficulty.label}
                </span>
              </div>

              <div className="flex items-start gap-3">
                {/* Icône gauche (rond 40px) */}
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isUnlocked
                      ? 'bg-green-500/20'
                      : 'bg-gray-700'
                  }`}
                >
                  {isUnlocked ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : (
                    <Lock className="h-5 w-5 text-gray-400" />
                  )}
                </div>

                {/* Contenu */}
                <div className="flex-1 pt-1">
                  <h4 className="font-medium text-gray-200 mb-1">
                    Indice niveau {index + 1}
                  </h4>
                  <p className="text-xs text-gray-400 mb-2">
                    {difficulty.desc}
                  </p>

                  {/* Contenu du hint si débloqué */}
                  {isUnlocked ? (
                    <div className="text-sm text-gray-300 bg-black/20 rounded-lg p-3 mt-2 leading-relaxed">
                      {hint}
                    </div>
                  ) : isNext ? (
                    /* Bouton débloquer pour le prochain */
                    <button
                      onClick={unlockNextHint}
                      className="mt-2 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/30 rounded-lg text-yellow-300 text-sm font-medium transition-all duration-200 flex items-center gap-2 hover:scale-102"
                    >
                      <Lightbulb className="h-4 w-4" />
                      Débloquer cet indice (-{(index + 1) * 2} XP)
                    </button>
                  ) : (
                    /* Message pour hints verrouillés */
                    <p className="text-xs text-gray-500 mt-2 italic">
                      Débloque les indices précédents d'abord
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Message pédagogique */}
      {unlockedHints.length > 0 && (
        <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4 text-sm">
          <p className="text-blue-300">
            💡 <strong>Astuce:</strong> Plus tu utilises d'indices, moins tu gagnes d'XP.
            Essaie de résoudre avec le minimum d'aide possible !
          </p>
        </div>
      )}

      {/* Encouragement si aucun hint utilisé */}
      {hints.length > 0 && unlockedHints.length === 0 && (
        <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-4 text-sm">
          <p className="text-green-300">
            🎯 <strong>Défi:</strong> Essaie de résoudre sans indices pour gagner le maximum d'XP !
          </p>
        </div>
      )}
    </div>
  )
}

export default HintSystem









