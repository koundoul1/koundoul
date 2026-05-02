import { useState, useEffect, useCallback } from 'react'
import { Star, Trophy, TrendingUp, X } from 'lucide-react'

let addToastGlobal = null

export function showGamificationToast(toast) {
  if (addToastGlobal) addToastGlobal(toast)
}

export default function GamificationToastContainer() {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { ...toast, id }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  useEffect(() => {
    addToastGlobal = addToast
    return () => { addToastGlobal = null }
  }, [addToast])

  const dismiss = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="pointer-events-auto animate-slide-in-right bg-gray-900/95 border border-white/10 rounded-xl px-4 py-3 shadow-2xl backdrop-blur-sm flex items-center gap-3 min-w-[280px] max-w-[360px]"
        >
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
            toast.type === 'xp' ? 'bg-yellow-500/20 text-yellow-400' :
            toast.type === 'badge' ? 'bg-purple-500/20 text-purple-400' :
            toast.type === 'levelup' ? 'bg-emerald-500/20 text-emerald-400' :
            'bg-blue-500/20 text-blue-400'
          }`}>
            {toast.type === 'xp' && <Star className="w-5 h-5" />}
            {toast.type === 'badge' && <Trophy className="w-5 h-5" />}
            {toast.type === 'levelup' && <TrendingUp className="w-5 h-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm text-white truncate">{toast.title}</div>
            {toast.message && <div className="text-xs text-gray-400 truncate">{toast.message}</div>}
          </div>
          <button onClick={() => dismiss(toast.id)} className="text-gray-500 hover:text-white flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
