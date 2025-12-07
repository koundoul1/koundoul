import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { BookOpen, Trophy, Clock, Target, Zap } from 'lucide-react'

export default function QuestionBanks() {
  const navigate = useNavigate()
  const [banks, setBanks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ subject: 'all', level: 'all', type: 'all' })

  useEffect(() => {
    fetchBanks()
  }, [filter])

  const fetchBanks = async () => {
    try {
      setLoading(true)
      const params = {}
      if (filter.subject !== 'all') params.subject = filter.subject
      if (filter.level !== 'all') params.level = filter.level
      if (filter.type !== 'all') params.type = filter.type
      
      const response = await api.questionBanks.list(params)
      setBanks(response.data || response || [])
    } catch (error) {
      console.error('Erreur chargement banques:', error)
    } finally {
      setLoading(false)
    }
  }

  const subjects = [
    { id: 'all', name: 'Toutes les matières' },
    { id: 'Mathématiques', name: 'Mathématiques' },
    { id: 'Physique', name: 'Physique' },
    { id: 'Chimie', name: 'Chimie' }
  ]

  const levels = [
    { id: 'all', name: 'Tous les niveaux' },
    { id: 'Seconde', name: 'Seconde' },
    { id: 'Première', name: 'Première' },
    { id: 'Terminale', name: 'Terminale' }
  ]

  const types = [
    { id: 'all', name: 'Tous les types' },
    { id: 'QCM', name: 'QCM' },
    { id: 'Exercices', name: 'Exercices' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="text-white text-xl">Chargement des banques de questions...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* En-tête */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-white mb-4">
            📚 Exercices
          </h1>
          <p className="text-xl text-blue-200">
            1800 QCM et Exercices pour Seconde, Première et Terminale
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Banques</p>
                <p className="text-4xl font-bold text-white">{banks.length}</p>
              </div>
              <BookOpen className="h-12 w-12 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm">Total QCM</p>
                <p className="text-4xl font-bold text-white">
                  {banks.filter(b => b.type === 'QCM').reduce((sum, b) => sum + (b.total_questions || 0), 0)}
                </p>
              </div>
              <Target className="h-12 w-12 text-green-400" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Exercices</p>
                <p className="text-4xl font-bold text-white">
                  {banks.filter(b => b.type === 'Exercices').reduce((sum, b) => sum + (b.total_questions || 0), 0)}
                </p>
              </div>
              <Zap className="h-12 w-12 text-purple-400" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-200 text-sm">Total</p>
                <p className="text-4xl font-bold text-white">
                  {banks.reduce((sum, b) => sum + (b.total_questions || 0), 0)}
                </p>
              </div>
              <Trophy className="h-12 w-12 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-8 border border-white/20">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">Matière</label>
              <select
                value={filter.subject}
                onChange={(e) => setFilter({ ...filter, subject: e.target.value })}
                className="w-full bg-slate-800/50 text-white border border-blue-500/30 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">Niveau</label>
              <select
                value={filter.level}
                onChange={(e) => setFilter({ ...filter, level: e.target.value })}
                className="w-full bg-slate-800/50 text-white border border-blue-500/30 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              >
                {levels.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">Type</label>
              <select
                value={filter.type}
                onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                className="w-full bg-slate-800/50 text-white border border-blue-500/30 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              >
                {types.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Liste des banques */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banks.map(bank => (
            <div
              key={bank.id}
              onClick={() => navigate(`/exercices/${bank.id}`)}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-blue-400 cursor-pointer transform hover:scale-105 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-white">{bank.title}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  bank.type === 'QCM' 
                    ? 'bg-green-500/20 text-green-300' 
                    : 'bg-purple-500/20 text-purple-300'
                }`}>
                  {bank.type}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-blue-200">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{bank.subject} • {bank.level}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span>{bank.total_questions} questions</span>
                </div>
              </div>
              
              {bank.chapters_covered && Array.isArray(bank.chapters_covered) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {bank.chapters_covered.slice(0, 3).map((chapter, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                      {chapter}
                    </span>
                  ))}
                  {bank.chapters_covered.length > 3 && (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                      +{bank.chapters_covered.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {banks.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">Aucune banque de questions disponible</p>
          </div>
        )}
      </div>
    </div>
  )
}

