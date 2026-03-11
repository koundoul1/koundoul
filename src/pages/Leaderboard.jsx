import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../hooks/useTranslation'
import api from '../services/api'
import {
  Trophy, Medal, Globe, Flag, Building2, School,
  ChevronLeft, ChevronRight, Loader2, Flame, Award,
  Calendar, BookOpen, GraduationCap, Search
} from 'lucide-react'

const AFRICAN_COUNTRIES = [
  'Afrique du Sud', 'Algérie', 'Angola', 'Bénin', 'Botswana', 'Burkina Faso',
  'Burundi', 'Cabo Verde', 'Cameroun', 'Centrafrique', 'Comores', 'Congo',
  "Côte d'Ivoire", 'Djibouti', 'Égypte', 'Érythrée', 'Éswatini', 'Éthiopie',
  'Gabon', 'Gambie', 'Ghana', 'Guinée', 'Guinée-Bissau', 'Guinée équatoriale',
  'Kenya', 'Lesotho', 'Libéria', 'Libye', 'Madagascar', 'Malawi', 'Mali',
  'Maroc', 'Maurice', 'Mauritanie', 'Mozambique', 'Namibie', 'Niger', 'Nigeria',
  'Ouganda', 'Rwanda', 'São Tomé-et-Príncipe', 'Sénégal', 'Seychelles',
  'Sierra Leone', 'Somalie', 'Soudan', 'Soudan du Sud', 'Tanzanie', 'Tchad',
  'Togo', 'Tunisie', 'Zambie', 'Zimbabwe'
]

// Country code to name mapping for common codes
const COUNTRY_CODE_MAP = {
  SN: 'Sénégal', CI: "Côte d'Ivoire", CM: 'Cameroun', ML: 'Mali',
  BF: 'Burkina Faso', GN: 'Guinée', TG: 'Togo', BJ: 'Bénin',
  NE: 'Niger', TD: 'Tchad', GA: 'Gabon', CG: 'Congo',
  MR: 'Mauritanie', DZ: 'Algérie', MA: 'Maroc', TN: 'Tunisie',
  EG: 'Égypte', NG: 'Nigeria', GH: 'Ghana', KE: 'Kenya',
  ZA: 'Afrique du Sud', ET: 'Éthiopie', TZ: 'Tanzanie',
  UG: 'Ouganda', RW: 'Rwanda', MG: 'Madagascar', CD: 'RD Congo'
}

const SENEGAL_REGIONS = [
  'Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor', 'Diourbel', 'Louga',
  'Fatick', 'Kaolack', 'Kolda', 'Tambacounda', 'Kaffrine', 'Kédougou',
  'Matam', 'Sédhiou'
]

const PERIODS = [
  { key: 'week', label: 'Cette semaine', icon: Calendar },
  { key: 'month', label: 'Ce mois', icon: Calendar },
  { key: 'alltime', label: 'Tout le temps', icon: Trophy }
]

const SCOPES = [
  { key: 'global', label: 'Mondial', icon: Globe, emoji: '🌍' },
  { key: 'country', label: 'Pays', icon: Flag, emoji: '🏴' },
  { key: 'region', label: 'Région', icon: Building2, emoji: '🏙️' },
  { key: 'school', label: 'École', icon: School, emoji: '🏫' }
]

const Leaderboard = () => {
  const { user } = useAuth()
  const { t } = useTranslation()

  const [leaderboard, setLeaderboard] = useState([])
  const [myRank, setMyRank] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Filters
  const [period, setPeriod] = useState('alltime')
  const [scope, setScope] = useState('global')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('')
  const [schoolSearch, setSchoolSearch] = useState('')

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true)
    try {
      const params = { period, page, limit: 20 }

      if (scope === 'country' && selectedCountry) {
        params.type = 'country'
        params.country = selectedCountry
      } else if (scope === 'region' && selectedRegion) {
        params.type = 'region'
        params.region = selectedRegion
      } else if (scope === 'school' && schoolSearch) {
        params.type = 'school'
        params.school = schoolSearch
      } else {
        params.type = 'global'
      }

      const res = await api.leaderboard.get(params)
      const data = res.data || res
      setLeaderboard(data.leaderboard || [])
      setTotalPages(data.pagination?.totalPages || 1)
      setTotal(data.pagination?.total || 0)
    } catch (err) {
      console.error('Erreur chargement classement:', err)
      setLeaderboard([])
    } finally {
      setLoading(false)
    }
  }, [period, scope, selectedCountry, selectedRegion, schoolSearch, page])

  const fetchMyRank = useCallback(async () => {
    try {
      const res = await api.leaderboard.getMyRank()
      setMyRank(res.data || res)
    } catch (err) {
      console.error('Erreur chargement rang:', err)
    }
  }, [])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  useEffect(() => {
    fetchMyRank()
  }, [fetchMyRank])

  useEffect(() => {
    setPage(1)
  }, [period, scope, selectedCountry, selectedRegion, schoolSearch])

  const getMedalEmoji = (rank) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return null
  }

  const isCurrentUser = (entry) => user && entry.id === user.id

  return (
    <div className="min-h-screen text-white pb-20 lg:pb-0">
      {/* Header */}
      <div className="border-b border-white/8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold flex items-center">
            <Trophy className="h-7 w-7 text-yellow-400 mr-3" />
            Classement
          </h1>
          <p className="text-gray-400 mt-1">
            Compare-toi aux meilleurs élèves d'Afrique
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* My Rank Summary */}
        {myRank && (
          <div className="k-card p-5">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Ton classement</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Mondial', value: myRank.ranks?.global, icon: '🌍' },
                { label: myRank.user?.country ? (COUNTRY_CODE_MAP[myRank.user.country] || myRank.user.country) : 'Pays', value: myRank.ranks?.country, icon: '🏴' },
                { label: myRank.user?.region || 'Région', value: myRank.ranks?.region, icon: '🏙️' },
                { label: myRank.user?.school || 'École', value: myRank.ranks?.school, icon: '🏫' }
              ].map((r, i) => (
                <div key={i} className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="text-lg mb-1">{r.icon}</div>
                  <div className="text-xl font-black text-white">
                    {r.value ? `#${r.value}` : '-'}
                  </div>
                  <div className="text-[10px] text-gray-500 truncate">{r.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="space-y-4">
          {/* Period filter */}
          <div className="flex flex-wrap gap-2">
            {PERIODS.map(p => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  period === p.key
                    ? 'bg-kprimary text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Scope tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {SCOPES.map(s => (
              <button
                key={s.key}
                onClick={() => setScope(s.key)}
                className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  scope === s.key
                    ? 'bg-kprimary/20 text-kprimary border border-kprimary/40'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5'
                }`}
              >
                <span className="mr-2">{s.emoji}</span>
                {s.label}
              </button>
            ))}
          </div>

          {/* Conditional sub-filters */}
          {scope === 'country' && (
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full sm:w-64 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-kprimary"
            >
              <option value="">Tous les pays</option>
              {AFRICAN_COUNTRIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}

          {scope === 'region' && (
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full sm:w-64 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-kprimary"
            >
              <option value="">Toutes les régions</option>
              {SENEGAL_REGIONS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          )}

          {scope === 'school' && (
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                value={schoolSearch}
                onChange={(e) => setSchoolSearch(e.target.value)}
                placeholder="Nom de l'établissement..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-kprimary"
              />
            </div>
          )}
        </div>

        {/* Total count */}
        <div className="text-sm text-gray-500">
          {total} participants
        </div>

        {/* Podium — top 3 */}
        {page === 1 && !loading && leaderboard.length >= 3 && (
          <div className="flex items-end justify-center gap-3 sm:gap-6 py-4">
            {/* 2nd place */}
            <PodiumCard entry={leaderboard[1]} rank={2} isMe={isCurrentUser(leaderboard[1])} />
            {/* 1st place */}
            <PodiumCard entry={leaderboard[0]} rank={1} isMe={isCurrentUser(leaderboard[0])} />
            {/* 3rd place */}
            <PodiumCard entry={leaderboard[2]} rank={3} isMe={isCurrentUser(leaderboard[2])} />
          </div>
        )}

        {/* Leaderboard list */}
        <div className="k-card overflow-hidden">
          {loading ? (
            <div className="space-y-0">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex items-center px-5 py-4 border-b border-white/5 animate-pulse">
                  <div className="w-8 h-5 bg-white/5 rounded mr-4"></div>
                  <div className="w-10 h-10 bg-white/5 rounded-full mr-4"></div>
                  <div className="flex-1 space-y-2">
                    <div className="w-32 h-4 bg-white/5 rounded"></div>
                    <div className="w-20 h-3 bg-white/5 rounded"></div>
                  </div>
                  <div className="w-16 h-5 bg-white/5 rounded"></div>
                </div>
              ))}
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="p-12 text-center">
              <Trophy className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 font-medium">Aucun participant trouvé</p>
              <p className="text-gray-600 text-sm mt-1">Modifie tes filtres pour voir plus de résultats</p>
            </div>
          ) : (
            <div>
              {leaderboard.map((entry) => {
                const medal = getMedalEmoji(entry.rank)
                const isMe = isCurrentUser(entry)
                return (
                  <div
                    key={entry.id}
                    className={`flex items-center px-5 py-3.5 border-b border-white/5 transition-colors ${
                      isMe
                        ? 'bg-kprimary/10 border-l-4 border-l-kprimary'
                        : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    {/* Rank */}
                    <div className="w-10 text-center mr-3">
                      {medal ? (
                        <span className="text-xl">{medal}</span>
                      ) : (
                        <span className="text-sm font-bold text-gray-400">#{entry.rank}</span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4 ${
                      entry.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                      entry.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                      entry.rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                      'bg-gradient-to-br from-kprimary/60 to-kprimary'
                    }`}>
                      {entry.firstName?.charAt(0) || entry.username?.charAt(0) || 'U'}
                    </div>

                    {/* Name & School */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold truncate ${isMe ? 'text-kprimary' : 'text-white'}`}>
                          {entry.firstName || ''} {entry.lastName || entry.username}
                        </span>
                        {isMe && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-kprimary/20 text-kprimary rounded-full font-bold">
                            TOI
                          </span>
                        )}
                      </div>
                      {entry.school && (
                        <p className="text-xs text-gray-500 truncate">{entry.school}</p>
                      )}
                    </div>

                    {/* XP */}
                    <div className="text-right ml-3">
                      <div className="font-bold text-white text-sm">{(entry.xp || 0).toLocaleString()} XP</div>
                      <div className="flex items-center justify-end gap-2 text-[10px] text-gray-500">
                        {entry.streak > 0 && (
                          <span className="flex items-center">
                            <Flame className="h-3 w-3 text-orange-400 mr-0.5" />
                            {entry.streak}j
                          </span>
                        )}
                        {entry.badgesCount > 0 && (
                          <span className="flex items-center">
                            <Award className="h-3 w-3 text-yellow-400 mr-0.5" />
                            {entry.badgesCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Current user highlight if not in list */}
              {myRank && !leaderboard.find(e => e.id === user?.id) && (
                <div className="flex items-center px-5 py-3.5 bg-kprimary/10 border-l-4 border-l-kprimary border-t-2 border-t-white/10">
                  <div className="w-10 text-center mr-3">
                    <span className="text-sm font-bold text-kprimary">#{myRank.ranks?.global || '?'}</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-kprimary/60 to-kprimary flex items-center justify-center text-white font-bold text-sm mr-4">
                    {myRank.user?.firstName?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-kprimary truncate">
                        {myRank.user?.firstName || ''} {myRank.user?.lastName || myRank.user?.username}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-kprimary/20 text-kprimary rounded-full font-bold">
                        TOI
                      </span>
                    </div>
                    {myRank.user?.school && (
                      <p className="text-xs text-gray-500 truncate">{myRank.user.school}</p>
                    )}
                  </div>
                  <div className="text-right ml-3">
                    <div className="font-bold text-white text-sm">{(myRank.user?.xp || 0).toLocaleString()} XP</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-white/5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center px-3 py-2 text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Précédent
              </button>
              <span className="text-sm text-gray-500">
                Page {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center px-3 py-2 text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Suivant
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Podium card component for top 3
const PodiumCard = ({ entry, rank, isMe }) => {
  const heights = { 1: 'h-28', 2: 'h-20', 3: 'h-16' }
  const sizes = { 1: 'w-16 h-16 text-lg', 2: 'w-12 h-12 text-sm', 3: 'w-12 h-12 text-sm' }
  const medals = { 1: '🥇', 2: '🥈', 3: '🥉' }
  const colors = {
    1: 'from-yellow-400 to-yellow-600',
    2: 'from-gray-300 to-gray-500',
    3: 'from-orange-400 to-orange-600'
  }

  return (
    <div className={`flex flex-col items-center ${rank === 1 ? 'order-2' : rank === 2 ? 'order-1' : 'order-3'}`}>
      {/* Avatar */}
      <div className={`relative mb-2 ${rank === 1 ? 'animate-bounce' : ''}`} style={rank === 1 ? { animationDuration: '3s' } : {}}>
        <div className={`${sizes[rank]} rounded-full bg-gradient-to-br ${colors[rank]} flex items-center justify-center text-white font-bold ${
          isMe ? 'ring-2 ring-kprimary ring-offset-2 ring-offset-gray-900' : ''
        }`}>
          {entry.firstName?.charAt(0) || entry.username?.charAt(0) || 'U'}
        </div>
        <span className="absolute -top-2 -right-2 text-xl">{medals[rank]}</span>
      </div>

      {/* Name */}
      <p className={`text-xs font-semibold truncate max-w-[80px] text-center ${isMe ? 'text-kprimary' : 'text-white'}`}>
        {entry.firstName || entry.username}
      </p>
      <p className="text-[10px] text-gray-500 font-bold">{(entry.xp || 0).toLocaleString()} XP</p>

      {/* Podium bar */}
      <div className={`${heights[rank]} w-20 sm:w-24 mt-2 rounded-t-xl bg-gradient-to-t ${
        rank === 1 ? 'from-yellow-600/30 to-yellow-400/10' :
        rank === 2 ? 'from-gray-500/30 to-gray-300/10' :
        'from-orange-600/30 to-orange-400/10'
      } border border-white/5 flex items-center justify-center`}>
        <span className="text-2xl font-black text-white/20">{rank}</span>
      </div>
    </div>
  )
}

export default Leaderboard
