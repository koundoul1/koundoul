/**
 * ⚠️ Feedback d'Erreur Pédagogique - Koundoul
 * Affiche les erreurs détectées de manière constructive et encourageante
 */

import React from 'react'
import { AlertCircle, Video, BookOpen, Target } from 'lucide-react'

const ErrorFeedback = ({ errors, onWatchVideo, onDoExercise, onReviewLesson }) => {
  if (!errors || errors.length === 0) return null

  return (
    <div className="error-feedback space-y-4">
      {errors.map((error, index) => (
        <div
          key={index}
          className="bg-yellow-500/10 border-2 border-yellow-400/30 rounded-lg p-5 transition-all duration-300"
        >
          {/* Header avec icône et titre */}
          <div className="flex items-start gap-3 mb-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center text-2xl">
              {error.icon}
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-yellow-300 mb-1">
                {error.type}
              </h4>
              <p className="text-sm text-gray-400">
                Erreur fréquente détectée
              </p>
            </div>
          </div>

          {/* Explications structurées */}
          <div className="space-y-3 mb-4">
            {/* Ce qui ne va pas */}
            <div className="bg-black/20 rounded-lg p-3">
              <p className="text-sm font-medium text-red-300 mb-2">
                ❌ Ce qui ne va pas:
              </p>
              <p className="text-gray-300 text-sm leading-relaxed">
                {error.explanation}
              </p>
            </div>

            {/* Ce qu'il faut faire */}
            <div className="bg-black/20 rounded-lg p-3">
              <p className="text-sm font-medium text-green-300 mb-2">
                ✅ Ce qu'il faut faire:
              </p>
              <p className="text-gray-300 text-sm leading-relaxed">
                {error.correction}
              </p>
            </div>

            {/* Exemple (si présent) */}
            {error.example && (
              <div className="bg-black/20 rounded-lg p-3">
                <p className="text-sm font-medium text-blue-300 mb-2">
                  💡 Exemple:
                </p>
                <code className="text-sm text-green-300 font-mono block bg-black/30 p-2 rounded">
                  {error.example}
                </code>
              </div>
            )}
          </div>

          {/* Boutons d'action */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {/* Bouton Vidéo */}
            {error.videoUrl && (
              <button
                onClick={() => onWatchVideo && onWatchVideo(error.videoUrl)}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 rounded-lg text-red-300 text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Video className="h-4 w-4" />
                Voir la vidéo (2min)
              </button>
            )}
            
            {/* Bouton Exercices */}
            {error.exerciceUrl && (
              <button
                onClick={() => onDoExercise && onDoExercise(error.exerciceUrl)}
                className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 rounded-lg text-green-300 text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Target className="h-4 w-4" />
                S'entraîner
              </button>
            )}
            
            {/* Bouton Leçon */}
            <button
              onClick={() => onReviewLesson && onReviewLesson(error.type)}
              className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 rounded-lg text-blue-300 text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Revoir la leçon
            </button>
          </div>
        </div>
      ))}

      {/* Message d'encouragement final */}
      <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4">
        <p className="text-sm text-blue-300 leading-relaxed">
          💪 <strong>Continue tes efforts !</strong> Identifier ses erreurs, c'est déjà faire un grand pas vers la compréhension. Tu vas y arriver !
        </p>
      </div>
    </div>
  )
}

export default ErrorFeedback









