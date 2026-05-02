import { useAuth } from '../context/AuthContext'
import { showGamificationToast } from '../components/GamificationToast'

/**
 * Hook to process gamification results from backend action responses.
 * Call processActionResult(response.gamification) after any mutation
 * that returns a gamification object.
 */
export function useGamification() {
  const { updateUserStats } = useAuth()

  const processActionResult = (gamification) => {
    if (!gamification) return

    // Update context state so TopBar/Dashboard reflect new values
    updateUserStats(gamification)

    // XP toast
    if (gamification.xpGained > 0) {
      showGamificationToast({
        type: 'xp',
        title: `+${gamification.xpGained} XP`,
        message: `Total: ${gamification.totalXp} XP`
      })
    }

    // Level up toast
    if (gamification.leveledUp) {
      showGamificationToast({
        type: 'levelup',
        title: `Niveau ${gamification.newLevel} !`,
        message: 'Bravo, tu montes de niveau !'
      })
    }

    // Badge toasts — show bonus XP if badge awards points
    if (gamification.newBadges && gamification.newBadges.length > 0) {
      for (const badge of gamification.newBadges) {
        const bonusText = badge.points > 0 ? ` (+${badge.points} XP bonus)` : ''
        showGamificationToast({
          type: 'badge',
          title: `${badge.icon} ${badge.name}`,
          message: `${badge.description}${bonusText}`
        })
      }
    }
  }

  return { processActionResult }
}
