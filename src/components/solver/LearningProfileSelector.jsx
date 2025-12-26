/**
 * 🎓 Sélecteur de Profil d'Apprentissage - Koundoul
 * Permet à l'élève de choisir son style d'apprentissage préféré
 */

import React from 'react'
import { CheckCircle, Info } from 'lucide-react'
import { learningProfiles } from '../../utils/learningProfiles'

const LearningProfileSelector = ({ selectedProfile, onProfileChange }) => {
  /**
   * Mapping des classes CSS par couleur de profil
   */
  const getColorClasses = (color, isSelected) => {
    const colorMap = {
      blue: {
        border: 'border-blue-400',
        bg: 'bg-blue-500/10',
        shadow: 'shadow-blue-500/20',
        text: 'text-blue-400',
        tag: 'bg-blue-400/20 text-blue-300',
        check: 'text-blue-400'
      },
      purple: {
        border: 'border-purple-400',
        bg: 'bg-purple-500/10',
        shadow: 'shadow-purple-500/20',
        text: 'text-purple-400',
        tag: 'bg-purple-400/20 text-purple-300',
        check: 'text-purple-400'
      },
      green: {
        border: 'border-green-400',
        bg: 'bg-green-500/10',
        shadow: 'shadow-green-500/20',
        text: 'text-green-400',
        tag: 'bg-green-400/20 text-green-300',
        check: 'text-green-400'
      },
      gray: {
        border: 'border-gray-400',
        bg: 'bg-gray-500/10',
        shadow: 'shadow-gray-500/20',
        text: 'text-gray-400',
        tag: 'bg-gray-400/20 text-gray-300',
        check: 'text-gray-400'
      }
    }

    const colors = colorMap[color] || colorMap.gray

    if (isSelected) {
      return {
        card: `${colors.border} ${colors.bg} ${colors.shadow} shadow-lg`,
        tag: colors.tag,
        check: colors.check
      }
    } else {
      return {
        card: 'border-gray-600 bg-gray-800/50 hover:border-gray-500',
        tag: 'bg-gray-700 text-gray-400',
        check: ''
      }
    }
  }

  return (
    <div className="learning-profile-selector">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.values(learningProfiles).map((profile) => {
          const isSelected = selectedProfile === profile.id
          const colorClasses = getColorClasses(profile.color, isSelected)

          return (
            <button
              key={profile.id}
              onClick={() => onProfileChange(profile.id)}
              className={`
                relative p-6 rounded-xl border-2 transition-all duration-300
                hover:scale-102 hover:shadow-lg
                ${colorClasses.card}
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-${profile.color}-400
              `}
              aria-label={`Sélectionner le profil ${profile.name}`}
              aria-pressed={isSelected}
            >
              {/* Badge sélectionné */}
              {isSelected && (
                <div className="absolute top-2 right-2 animate-in fade-in zoom-in duration-300">
                  <CheckCircle className={`h-6 w-6 ${colorClasses.check}`} />
                </div>
              )}

              {/* Icône emoji large */}
              <div className="text-6xl mb-4 text-center">
                {profile.icon}
              </div>

              {/* Nom du profil */}
              <h4 className="text-xl font-bold text-center mb-2 text-gray-200">
                {profile.name}
              </h4>

              {/* Description */}
              <p className="text-sm text-center text-gray-400 mb-3 leading-relaxed">
                {profile.description}
              </p>

              {/* Tags des préférences */}
              <div className="flex flex-wrap gap-2 justify-center">
                {profile.preferences.map((pref, i) => (
                  <span
                    key={i}
                    className={`
                      text-xs px-2 py-1 rounded-full font-medium
                      ${colorClasses.tag}
                      transition-colors duration-300
                    `}
                  >
                    {pref}
                  </span>
                ))}
              </div>

              {/* Tooltip avec conseils (au hover) */}
              <div className="mt-4 pt-3 border-t border-gray-700 group relative">
                <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                  <Info className="h-3 w-3" />
                  <span>Survoler pour conseils</span>
                </div>

                {/* Tooltip conseils */}
                <div className="absolute hidden group-hover:block bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-72 p-3 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-10">
                  <p className="text-xs text-gray-300 mb-2 font-semibold">
                    💡 Conseils pour ce profil:
                  </p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    {profile.learningTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-gray-500 flex-shrink-0">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                  {/* Flèche du tooltip */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
                    <div className="border-4 border-transparent border-t-gray-700"></div>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Message d'aide général */}
      <div className="mt-4 bg-blue-500/10 border border-blue-400/30 rounded-lg p-3">
        <p className="text-sm text-blue-300 text-center">
          💡 <strong>Astuce:</strong> Choisis le style qui te correspond le mieux. 
          Les explications s'adapteront automatiquement à ta façon d'apprendre !
        </p>
      </div>
    </div>
  )
}

export default LearningProfileSelector









