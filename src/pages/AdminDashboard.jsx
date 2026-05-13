import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Wallet,
  BookOpen,
  HeadphonesIcon,
  ChevronLeft,
  Search,
  Download,
  Plus,
  Edit3,
  Trash2,
  ShieldCheck,
  ShieldOff,
  UserX,
  UserCheck,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Loader2,
  X,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  DollarSign,
  Activity,
  Award,
  Layers,
  HelpCircle,
  CalendarDays,
  Bell,
  Send,
  Zap,
  Sword,
  BarChart3,
  Cpu,
  MessageSquare,
  Eye,
  ScrollText,
  UserPlus,
  Link2,
  Unlink,
  Ticket,
  ArrowRightLeft,
  CircleDollarSign,
  MessageCircle,
} from 'lucide-react'

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatCFA = (amount) => {
  if (amount == null) return '0 FCFA'
  return Number(amount).toLocaleString('fr-FR') + ' FCFA'
}

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const statusColors = {
  active: 'bg-green-500/20 text-green-400',
  inactive: 'bg-gray-500/20 text-gray-400',
  expired: 'bg-yellow-500/20 text-yellow-400',
  cancelled: 'bg-red-500/20 text-red-400',
  completed: 'bg-green-500/20 text-green-400',
  pending: 'bg-yellow-500/20 text-yellow-400',
  failed: 'bg-red-500/20 text-red-400',
}

const statusLabel = (s) => {
  if (!s) return 'N/A'
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// ─── Toast ──────────────────────────────────────────────────────────────────

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])

  const bg = type === 'error' ? 'bg-red-600' : type === 'success' ? 'bg-green-600' : 'bg-blue-600'
  return (
    <div className={`fixed top-4 right-4 z-[100] ${bg} text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-2 animate-slideIn`}>
      {type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
      <span className="text-sm">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70"><X size={14} /></button>
    </div>
  )
}

// ─── Destructive Confirm Modal (type SUPPRIMER) ────────────────────────────

const DestructiveConfirmModal = ({ title, message, onConfirm, onCancel, loading }) => {
  const [typed, setTyped] = useState('')
  const confirmed = typed === 'SUPPRIMER'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-[#12122A] border border-gray-700 rounded-xl p-6 max-w-md w-full">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="text-red-500" size={24} />
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <p className="text-gray-300 text-sm mb-4">{message}</p>
        <p className="text-xs text-gray-400 mb-2">Tapez <span className="text-red-400 font-bold">SUPPRIMER</span> pour confirmer :</p>
        <input
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder="SUPPRIMER"
          className="w-full px-3 py-2 text-sm bg-[#0A0A15] border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-red-500 mb-4"
          autoFocus
        />
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} disabled={loading} className="px-4 py-2 text-sm rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50">
            Annuler
          </button>
          <button onClick={onConfirm} disabled={loading || !confirmed} className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            {loading && <Loader2 size={14} className="animate-spin" />}
            Confirmer
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Pagination ─────────────────────────────────────────────────────────────

const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null
  const pages = []
  const start = Math.max(1, page - 2)
  const end = Math.min(totalPages, page + 2)
  for (let i = start; i <= end; i++) pages.push(i)

  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-1.5 text-xs rounded bg-gray-800 text-gray-400 hover:bg-gray-700 disabled:opacity-30"
      >
        Prec.
      </button>
      {start > 1 && <span className="text-gray-500 text-xs px-1">...</span>}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-3 py-1.5 text-xs rounded ${p === page ? 'bg-[#FF4757] text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
        >
          {p}
        </button>
      ))}
      {end < totalPages && <span className="text-gray-500 text-xs px-1">...</span>}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="px-3 py-1.5 text-xs rounded bg-gray-800 text-gray-400 hover:bg-gray-700 disabled:opacity-30"
      >
        Suiv.
      </button>
    </div>
  )
}

// ─── Spinner ────────────────────────────────────────────────────────────────

const Spinner = () => (
  <div className="flex items-center justify-center py-20">
    <Loader2 size={32} className="animate-spin text-[#FF4757]" />
  </div>
)

const ErrorBlock = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-4">
    <AlertTriangle size={32} className="text-red-500" />
    <p className="text-gray-400 text-sm text-center">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="flex items-center gap-2 px-4 py-2 bg-[#FF4757] text-white text-sm rounded-lg hover:bg-red-600">
        <RefreshCw size={14} /> Reessayer
      </button>
    )}
  </div>
)

// ─── SIDEBAR ITEMS ──────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'overview', label: 'Tableau de Bord', icon: LayoutDashboard },
  { id: 'users', label: 'Utilisateurs', icon: Users },
  { id: 'subscriptions', label: 'Abonnements', icon: CreditCard },
  { id: 'payments', label: 'Paiements', icon: Wallet },
  { id: 'content', label: 'Contenu', icon: BookOpen },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'promos', label: 'Codes Promo', icon: Award },
  { id: 'support', label: 'Support', icon: HeadphonesIcon },
  { id: 'families', label: 'Familles', icon: Link2 },
  { id: 'refunds', label: 'Remboursements', icon: ArrowRightLeft },
  { id: 'tickets', label: 'Tickets', icon: Ticket },
]

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const AdminDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  // ── Global state ──
  const [activeSection, setActiveSection] = useState('overview')
  const [toast, setToast] = useState(null)
  const [confirmModal, setConfirmModal] = useState(null)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // ── Admin check ──
  useEffect(() => {
    if (user && !user.is_admin) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
  }, [])

  const showConfirm = useCallback((title, message, onConfirm) => {
    setConfirmModal({ title, message, onConfirm })
  }, [])

  const handleConfirm = async () => {
    if (!confirmModal) return
    setConfirmLoading(true)
    try {
      await confirmModal.onConfirm()
    } finally {
      setConfirmLoading(false)
      setConfirmModal(null)
    }
  }

  if (!user?.is_admin) return null

  return (
    <div className="flex h-screen bg-[#0D0D1A] text-white overflow-hidden">
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Destructive Confirm Modal */}
      {confirmModal && (
        <DestructiveConfirmModal
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmModal(null)}
          loading={confirmLoading}
        />
      )}

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`fixed lg:static z-40 top-0 left-0 h-full w-64 bg-[#0A0A15] border-r border-gray-800 flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo / Title */}
        <div className="p-5 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white">Panel Admin</h1>
          <p className="text-xs text-gray-500 mt-1">{user.name || user.email}</p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setActiveSection(id); setSidebarOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                activeSection === id
                  ? 'bg-[#FF4757]/15 text-[#FF4757]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        {/* Back button */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ChevronLeft size={18} />
            Retour a l&apos;app
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-800 bg-[#0A0A15]">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-white">
            <Layers size={20} />
          </button>
          <h1 className="text-sm font-semibold">Panel Admin</h1>
          <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white text-xs">
            Retour
          </button>
        </div>

        <div className="p-4 md:p-6 lg:p-8">
          {activeSection === 'overview' && <OverviewSection showToast={showToast} />}
          {activeSection === 'users' && <UsersSection showToast={showToast} showConfirm={showConfirm} />}
          {activeSection === 'subscriptions' && <SubscriptionsSection showToast={showToast} showConfirm={showConfirm} />}
          {activeSection === 'payments' && <PaymentsSection showToast={showToast} />}
          {activeSection === 'content' && <ContentSection showToast={showToast} showConfirm={showConfirm} />}
          {activeSection === 'notifications' && <NotificationsSection showToast={showToast} />}
          {activeSection === 'promos' && <PromoCodesSection showToast={showToast} />}
          {activeSection === 'support' && <SupportSection showToast={showToast} showConfirm={showConfirm} />}
          {activeSection === 'families' && <FamiliesSection showToast={showToast} showConfirm={showConfirm} />}
          {activeSection === 'refunds' && <RefundsSection showToast={showToast} showConfirm={showConfirm} />}
          {activeSection === 'tickets' && <TicketsSection showToast={showToast} showConfirm={showConfirm} />}
        </div>
      </main>
    </div>
  )
}

// =============================================================================
// 1. OVERVIEW SECTION
// =============================================================================

const OverviewSection = ({ showToast }) => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.admin.getDashboard()
      setStats(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])

  if (loading) return <Spinner />
  if (error) return <ErrorBlock message={error} onRetry={fetchStats} />

  const signups = stats?.recentSignups || []
  const maxSignup = Math.max(...signups.map((s) => s.count || 0), 1)
  const recentActivity = stats?.recentActivity || []
  const top10 = stats?.top10Users || []

  const StatCard = ({ label, value, icon: Icon, color, sub }) => (
    <div className="bg-[#12122A] border border-gray-800 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-2">
        <Icon size={18} className={color} />
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <p className="text-xl font-bold">{value}</p>
      {sub && <p className="text-[11px] text-gray-500 mt-1">{sub}</p>}
    </div>
  )

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Tableau de Bord</h2>

      {/* Level 1 — Basics */}
      <h3 className="text-xs uppercase text-gray-500 mb-3 tracking-wide">Utilisateurs</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Inscrits" value={stats?.totalUsers ?? 0} icon={Users} color="text-blue-400" />
        <StatCard label="DAU (Aujourd'hui)" value={stats?.dau ?? 0} icon={Activity} color="text-green-400" />
        <StatCard label="MAU (30 jours)" value={stats?.mau ?? 0} icon={TrendingUp} color="text-cyan-400" />
      </div>

      {/* Level 2 — Engagement */}
      <h3 className="text-xs uppercase text-gray-500 mb-3 tracking-wide">Engagement</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="XP Total Distribue" value={(stats?.totalXpDistributed ?? 0).toLocaleString('fr-FR')} icon={Zap} color="text-yellow-400" />
        <StatCard label="Appels IA Aujourd'hui" value={stats?.aiCallsToday ?? 0} icon={Cpu} color="text-purple-400" />
        <StatCard label="Duels cette Semaine" value={stats?.duelsThisWeek ?? 0} icon={Sword} color="text-orange-400" />
        <StatCard label="Abonnements Actifs" value={stats?.activeSubscriptions ?? 0} icon={CreditCard} color="text-emerald-400" />
      </div>

      {/* Level 3 — Revenue */}
      <h3 className="text-xs uppercase text-gray-500 mb-3 tracking-wide">Revenus</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="MRR (ce mois)" value={formatCFA(stats?.monthlyRevenue)} icon={DollarSign} color="text-green-400" />
        <StatCard label="Utilisateurs Gratuits" value={stats?.freeUsers ?? 0} icon={Users} color="text-gray-400" />
        <StatCard label="Taux Conversion" value={`${stats?.conversionRate ?? 0}%`} icon={BarChart3} color="text-blue-400" sub="30 derniers jours" />
        <StatCard label="Cout Gemini Estime" value={formatCFA(stats?.geminiCostFCFA)} icon={Cpu} color="text-red-400" sub="ce mois" />
      </div>

      {/* Subs by plan */}
      {stats?.subsByPlan?.length > 0 && (
        <div className="bg-[#12122A] border border-gray-800 rounded-xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Abonnements par Plan</h3>
          <div className="flex flex-wrap gap-3">
            {stats.subsByPlan.map((sp, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-lg">
                <span className="text-sm text-gray-300">{sp.planName}</span>
                <span className="text-sm font-bold text-[#FF4757]">{sp.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Signups chart */}
        <div className="bg-[#12122A] border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Inscriptions (30j)</h3>
          {signups.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucune donnee</p>
          ) : (
            <div className="flex items-end gap-1 h-32">
              {signups.slice(-15).map((s, i) => {
                const pct = ((s.count || 0) / maxSignup) * 100
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] text-gray-500">{s.count || 0}</span>
                    <div className="w-full bg-[#FF4757] rounded-t" style={{ height: `${Math.max(pct, 4)}%` }} />
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Top 10 XP */}
        <div className="bg-[#12122A] border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Top 10 XP</h3>
          {top10.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucune donnee</p>
          ) : (
            <ul className="space-y-1.5">
              {top10.map((u, i) => (
                <li key={u.id} className="flex items-center gap-2 text-sm">
                  <span className={`w-5 text-center text-xs font-bold ${i < 3 ? 'text-yellow-400' : 'text-gray-500'}`}>{i + 1}</span>
                  <span className="text-gray-300 flex-1 truncate">{u.firstName || u.username || '?'}</span>
                  <span className="text-xs text-yellow-400 font-medium">{(u.xp || 0).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent activity */}
        <div className="bg-[#12122A] border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Activite Recente</h3>
          {recentActivity.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucune activite</p>
          ) : (
            <ul className="space-y-1.5 max-h-48 overflow-y-auto">
              {recentActivity.slice(0, 10).map((act, i) => (
                <li key={i} className="flex items-start gap-2 text-sm py-1 border-b border-gray-800/50 last:border-0">
                  <Activity size={12} className="text-gray-500 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-gray-300 text-xs block truncate">{act.userName || 'User'} — {act.type === 'login' ? 'connexion' : act.lessonTitle || 'lecon terminee'}</span>
                    <span className="text-[10px] text-gray-500">{formatDate(act.timestamp)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// 2. USERS SECTION
// =============================================================================

const UsersSection = ({ showToast, showConfirm }) => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [expandedUser, setExpandedUser] = useState(null)
  const perPage = 50
  const searchTimeout = useRef(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, limit: perPage }
      if (search) params.search = search
      if (filter !== 'all') params.status = filter
      const data = await api.admin.getUsers(params)
      setUsers(data.users || data.data || [])
      setTotalPages(data.pagination?.totalPages || data.totalPages || Math.ceil((data.total || 0) / perPage) || 1)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [page, search, filter])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleSearchChange = (val) => {
    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      setSearch(val)
      setPage(1)
    }, 400)
  }

  const toggleAdmin = async (u) => {
    try {
      await api.admin.updateUser(u.id, { is_admin: !u.is_admin })
      showToast(`${u.firstName || u.email} ${u.is_admin ? 'n\'est plus' : 'est maintenant'} admin`)
      fetchUsers()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const [suspendReason, setSuspendReason] = useState('')
  const [showSuspendInput, setShowSuspendInput] = useState(null)

  const toggleActive = async (u) => {
    const newActive = !(u.isActive !== false)
    try {
      const data = { isActive: newActive }
      if (!newActive && suspendReason) data.suspendedReason = suspendReason
      await api.admin.updateUser(u.id, data)
      showToast(newActive ? 'Utilisateur reactive' : 'Utilisateur suspendu')
      setShowSuspendInput(null)
      setSuspendReason('')
      fetchUsers()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const deleteUser = (u) => {
    showConfirm(
      'Supprimer l\'utilisateur',
      `Voulez-vous vraiment supprimer ${u.firstName || u.email} ? Cette action est irreversible. Toutes les donnees seront perdues.`,
      async () => {
        try {
          await api.admin.deleteUser(u.id)
          showToast('Utilisateur supprime')
          fetchUsers()
        } catch (err) {
          showToast(err.message, 'error')
        }
      }
    )
  }

  const exportCSV = () => {
    if (!users.length) return
    const headers = ['Nom', 'Email', 'Niveau', 'XP', 'Streak', 'Abonnement', 'Date Inscription', 'Statut']
    const rows = users.map((u) => [
      `${u.firstName || ''} ${u.lastName || ''}`.trim(),
      u.email || '',
      u.level || '',
      u.xp ?? '',
      u.streak ?? '',
      u.subscriptions?.length > 0 ? (u.subscriptions[0].plan?.displayName || 'Premium') : 'Gratuit',
      u.createdAt || '',
      u.isActive !== false ? 'Actif' : 'Suspendu',
    ])
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `utilisateurs_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Export CSV telecharge')
  }

  const filters = [
    { id: 'all', label: 'Tous' },
    { id: 'active', label: 'Actifs' },
    { id: 'inactive', label: 'Inactifs' },
    { id: 'admin', label: 'Admins' },
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold">Gestion Utilisateurs</h2>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-sm rounded-lg">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Rechercher par nom, email, telephone, ID..."
            defaultValue={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-[#12122A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FF4757]"
          />
        </div>
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => { setFilter(f.id); setPage(1) }}
              className={`px-3 py-2 text-xs rounded-lg ${filter === f.id ? 'bg-[#FF4757] text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? <Spinner /> : error ? <ErrorBlock message={error} onRetry={fetchUsers} /> : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left text-gray-500 text-xs uppercase">
                  <th className="py-3 px-3">Nom</th>
                  <th className="py-3 px-3">Email</th>
                  <th className="py-3 px-3 hidden md:table-cell">Niveau</th>
                  <th className="py-3 px-3 hidden md:table-cell">XP</th>
                  <th className="py-3 px-3 hidden lg:table-cell">Streak</th>
                  <th className="py-3 px-3 hidden lg:table-cell">Abo.</th>
                  <th className="py-3 px-3 hidden xl:table-cell">Inscription</th>
                  <th className="py-3 px-3">Statut</th>
                  <th className="py-3 px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-8 text-gray-500">Aucun utilisateur trouve</td></tr>
                ) : users.map((u) => (
                  <React.Fragment key={u.id}>
                    <tr className="border-b border-gray-800/50 hover:bg-white/[0.02]">
                      <td className="py-3 px-3 text-white font-medium">{`${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || u.email?.split('@')[0] || '—'}</td>
                      <td className="py-3 px-3 text-gray-400">{u.email}</td>
                      <td className="py-3 px-3 hidden md:table-cell text-gray-400">{u.level || '—'}</td>
                      <td className="py-3 px-3 hidden md:table-cell text-gray-400">{u.xp ?? 0}</td>
                      <td className="py-3 px-3 hidden lg:table-cell text-gray-400">{u.streak ?? 0}</td>
                      <td className="py-3 px-3 hidden lg:table-cell">
                        <span className={`px-2 py-0.5 rounded text-xs ${u.subscriptions?.length > 0 ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                          {u.subscriptions?.length > 0 ? (u.subscriptions[0].plan?.displayName || 'Premium') : 'Gratuit'}
                        </span>
                      </td>
                      <td className="py-3 px-3 hidden xl:table-cell text-gray-500 text-xs">{formatDate(u.createdAt)}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-xs ${u.isActive !== false ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {u.isActive !== false ? 'Actif' : 'Suspendu'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setExpandedUser(expandedUser === u.id ? null : u.id)} title="Details" className="p-1.5 rounded hover:bg-gray-800 text-gray-400 hover:text-white">
                            {expandedUser === u.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                          <button onClick={() => toggleAdmin(u)} title={u.is_admin ? 'Retirer admin' : 'Rendre admin'} className="p-1.5 rounded hover:bg-gray-800 text-gray-400 hover:text-yellow-400">
                            {u.is_admin ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                          </button>
                          <button onClick={() => { u.isActive !== false ? setShowSuspendInput(u.id) : toggleActive(u) }} title={u.isActive !== false ? 'Suspendre' : 'Reactiver'} className="p-1.5 rounded hover:bg-gray-800 text-gray-400 hover:text-blue-400">
                            {u.isActive !== false ? <UserX size={14} /> : <UserCheck size={14} />}
                          </button>
                          <button onClick={() => deleteUser(u)} title="Supprimer" className="p-1.5 rounded hover:bg-gray-800 text-gray-400 hover:text-red-400">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        {showSuspendInput === u.id && (
                          <div className="mt-2 flex gap-2">
                            <input value={suspendReason} onChange={e => setSuspendReason(e.target.value)} placeholder="Raison (optionnel)" className="flex-1 px-2 py-1 text-xs bg-[#0A0A15] border border-gray-700 rounded text-white" />
                            <button onClick={() => toggleActive(u)} className="px-2 py-1 text-xs bg-red-600 text-white rounded">Suspendre</button>
                            <button onClick={() => setShowSuspendInput(null)} className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded">X</button>
                          </div>
                        )}
                      </td>
                    </tr>
                    {expandedUser === u.id && (
                      <tr className="bg-[#0A0A15]">
                        <td colSpan={9} className="p-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div><span className="text-gray-500 block text-xs">ID</span><span className="text-[11px] break-all">{u.id}</span></div>
                            <div><span className="text-gray-500 block text-xs">Nom complet</span>{`${u.firstName || ''} ${u.lastName || ''}`.trim() || '—'}</div>
                            <div><span className="text-gray-500 block text-xs">Email</span>{u.email}</div>
                            <div><span className="text-gray-500 block text-xs">Telephone</span>{u.phoneNumber || '—'}</div>
                            <div><span className="text-gray-500 block text-xs">Niveau</span>{u.level || '—'}</div>
                            <div><span className="text-gray-500 block text-xs">XP</span>{u.xp ?? 0}</div>
                            <div><span className="text-gray-500 block text-xs">Streak</span>{u.streak ?? 0} jours</div>
                            <div><span className="text-gray-500 block text-xs">Admin</span>{u.is_admin ? 'Oui' : 'Non'}</div>
                            <div><span className="text-gray-500 block text-xs">Inscription</span>{formatDate(u.createdAt)}</div>
                            <div><span className="text-gray-500 block text-xs">Dernier login</span>{formatDate(u.lastLoginAt)}</div>
                            {u.subscriptions?.length > 0 && (
                              <div>
                                <span className="text-gray-500 block text-xs">Plan actif</span>
                                <span className="text-green-400 font-medium">{u.subscriptions[0].plan?.displayName || u.subscriptions[0].plan?.name}</span>
                              </div>
                            )}
                            {u.subscriptions?.length > 0 && (
                              <div>
                                <span className="text-gray-500 block text-xs">Source</span>
                                <span className="text-gray-300">
                                  {u.promoCodeUses?.length > 0
                                    ? 'Code promo: ' + u.promoCodeUses[0].promoCode?.code
                                    : u.payments?.length > 0
                                      ? (u.payments[0].paymentMethod || 'Paiement').replace('_', ' ')
                                      : 'Admin'}
                                </span>
                              </div>
                            )}
                            {u.suspendedReason && <div><span className="text-gray-500 block text-xs">Raison suspension</span><span className="text-red-400">{u.suspendedReason}</span></div>}
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-800 flex items-center gap-3">
                            <span className="text-xs text-gray-500">Assigner un plan :</span>
                            <select
                              defaultValue=""
                              onChange={async (e) => {
                                if (!e.target.value) return;
                                try {
                                  await api.admin.assignPlan(u.id, e.target.value);
                                  showToast('Plan assigne avec succes');
                                  fetchUsers();
                                } catch (err) {
                                  showToast(err.message, 'error');
                                }
                                e.target.value = '';
                              }}
                              className="px-3 py-1.5 text-xs bg-gray-800 border border-gray-700 rounded-lg text-white"
                            >
                              <option value="">Choisir...</option>
                              <option value="plan-free">Gratuit</option>
                              <option value="plan-premium">Premium (50 IA/j)</option>
                              <option value="plan-premium-max">Premium Max (300 IA/j)</option>
                              <option value="plan-family">Famille (100 IA/j)</option>
                              <option value="plan-premium-daily">Premium 24h</option>
                              <option value="plan-premium-max-daily">Premium Max 24h</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}

// =============================================================================
// 3. SUBSCRIPTIONS SECTION
// =============================================================================

const SubscriptionsSection = ({ showToast, showConfirm }) => {
  const [subs, setSubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [summaryStats, setSummaryStats] = useState({ mrr: 0, totalActive: 0, churnEstimate: 0 })
  const perPage = 20

  const fetchSubs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, limit: perPage }
      if (filter !== 'all') params.status = filter
      const data = await api.admin.getSubscriptions(params)
      setSubs(data.subscriptions || data.data || [])
      setTotalPages(data.totalPages || Math.ceil((data.total || 0) / perPage) || 1)
      if (data.summary) setSummaryStats(data.summary)
      else if (data.mrr != null) setSummaryStats({ mrr: data.mrr, totalActive: data.totalActive || 0, churnEstimate: data.churnEstimate || 0 })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [page, filter])

  useEffect(() => { fetchSubs() }, [fetchSubs])

  const extendSub = async (sub) => {
    try {
      const newEnd = new Date(sub.end_date || sub.endDate)
      newEnd.setDate(newEnd.getDate() + 30)
      await api.admin.updateSubscription(sub.id, { end_date: newEnd.toISOString() })
      showToast('Abonnement prolonge de 30 jours')
      fetchSubs()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const cancelSub = (sub) => {
    showConfirm(
      'Annuler l\'abonnement',
      `Voulez-vous vraiment annuler l'abonnement de ${sub.user?.firstName || sub.user?.email || 'cet utilisateur'} ?`,
      async () => {
        try {
          await api.admin.updateSubscription(sub.id, { status: 'cancelled' })
          showToast('Abonnement annule')
          fetchSubs()
        } catch (err) {
          showToast(err.message, 'error')
        }
      }
    )
  }

  const filterButtons = [
    { id: 'all', label: 'Tous' },
    { id: 'active', label: 'Actifs' },
    { id: 'expired', label: 'Expires' },
    { id: 'cancelled', label: 'Annules' },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Abonnements</h2>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#12122A] border border-gray-800 rounded-xl p-4">
          <span className="text-xs text-gray-500">MRR</span>
          <p className="text-lg font-bold text-green-400">{formatCFA(summaryStats.mrr)}</p>
        </div>
        <div className="bg-[#12122A] border border-gray-800 rounded-xl p-4">
          <span className="text-xs text-gray-500">Abonnements Actifs</span>
          <p className="text-lg font-bold">{summaryStats.totalActive}</p>
        </div>
        <div className="bg-[#12122A] border border-gray-800 rounded-xl p-4">
          <span className="text-xs text-gray-500">Estimation Churn</span>
          <p className="text-lg font-bold text-yellow-400">{summaryStats.churnEstimate}%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {filterButtons.map((f) => (
          <button
            key={f.id}
            onClick={() => { setFilter(f.id); setPage(1) }}
            className={`px-3 py-2 text-xs rounded-lg ${filter === f.id ? 'bg-[#FF4757] text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : error ? <ErrorBlock message={error} onRetry={fetchSubs} /> : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left text-gray-500 text-xs uppercase">
                  <th className="py-3 px-3">Utilisateur</th>
                  <th className="py-3 px-3">Plan</th>
                  <th className="py-3 px-3 hidden md:table-cell">Debut</th>
                  <th className="py-3 px-3 hidden md:table-cell">Fin</th>
                  <th className="py-3 px-3">Montant</th>
                  <th className="py-3 px-3">Statut</th>
                  <th className="py-3 px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subs.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-gray-500">Aucun abonnement</td></tr>
                ) : subs.map((s) => (
                  <tr key={s.id} className="border-b border-gray-800/50 hover:bg-white/[0.02]">
                    <td className="py-3 px-3 text-white">{s.user ? `${s.user.firstName || ''} ${s.user.lastName || ''}`.trim() || s.user.email : '—'}</td>
                    <td className="py-3 px-3 text-gray-400">{s.plan?.displayName || s.plan?.name || '—'}</td>
                    <td className="py-3 px-3 hidden md:table-cell text-gray-500 text-xs">{formatDate(s.start_date || s.startDate)}</td>
                    <td className="py-3 px-3 hidden md:table-cell text-gray-500 text-xs">{formatDate(s.end_date || s.endDate)}</td>
                    <td className="py-3 px-3 text-gray-300">{formatCFA(s.amount || s.price)}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${statusColors[s.status] || 'bg-gray-700 text-gray-400'}`}>
                        {statusLabel(s.status)}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => extendSub(s)} title="Prolonger 30j" className="p-1.5 rounded hover:bg-gray-800 text-gray-400 hover:text-green-400">
                          <CalendarDays size={14} />
                        </button>
                        <button onClick={() => cancelSub(s)} title="Annuler" className="p-1.5 rounded hover:bg-gray-800 text-gray-400 hover:text-red-400">
                          <X size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}

// =============================================================================
// 4. PAYMENTS SECTION
// =============================================================================

const PaymentsSection = ({ showToast }) => {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [methodFilter, setMethodFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [monthFilter, setMonthFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const perPage = 20

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, limit: perPage }
      if (methodFilter !== 'all') params.method = methodFilter
      if (statusFilter !== 'all') params.status = statusFilter
      if (monthFilter) params.month = monthFilter
      const data = await api.admin.getPayments(params)
      setPayments(data.payments || data.data || [])
      setTotalPages(data.totalPages || Math.ceil((data.total || 0) / perPage) || 1)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [page, methodFilter, statusFilter, monthFilter])

  useEffect(() => { fetchPayments() }, [fetchPayments])

  const exportCSV = () => {
    if (!payments.length) return
    const headers = ['Utilisateur', 'Montant', 'Date', 'Methode', 'Statut']
    const rows = payments.map((p) => [
      p.user ? `${p.user.firstName || ''} ${p.user.lastName || ''}`.trim() || p.user.email : '',
      p.amount || '',
      p.createdAt || '',
      p.paymentMethod || '',
      p.status || '',
    ])
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `paiements_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Export paiements telecharge')
  }

  const methods = [
    { id: 'all', label: 'Tous' },
    { id: 'wave', label: 'Wave' },
    { id: 'orange_money', label: 'Orange Money' },
    { id: 'stripe', label: 'Stripe/CB' },
  ]

  const statuses = [
    { id: 'all', label: 'Tous' },
    { id: 'completed', label: 'Termine' },
    { id: 'pending', label: 'En attente' },
    { id: 'failed', label: 'Echoue' },
  ]

  // Generate month options (last 12 months)
  const monthOptions = []
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    monthOptions.push({ value: val, label })
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold">Paiements</h2>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-sm rounded-lg">
          <Download size={14} /> Export Comptable
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex gap-1">
          {methods.map((m) => (
            <button
              key={m.id}
              onClick={() => { setMethodFilter(m.id); setPage(1) }}
              className={`px-3 py-1.5 text-xs rounded-lg ${methodFilter === m.id ? 'bg-[#FF4757] text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {statuses.map((s) => (
            <button
              key={s.id}
              onClick={() => { setStatusFilter(s.id); setPage(1) }}
              className={`px-3 py-1.5 text-xs rounded-lg ${statusFilter === s.id ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <select
          value={monthFilter}
          onChange={(e) => { setMonthFilter(e.target.value); setPage(1) }}
          className="px-3 py-1.5 text-xs rounded-lg bg-gray-800 text-gray-400 border border-gray-700 focus:outline-none focus:border-[#FF4757]"
        >
          <option value="">Tous les mois</option>
          {monthOptions.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      {loading ? <Spinner /> : error ? <ErrorBlock message={error} onRetry={fetchPayments} /> : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left text-gray-500 text-xs uppercase">
                  <th className="py-3 px-3">Utilisateur</th>
                  <th className="py-3 px-3">Montant</th>
                  <th className="py-3 px-3 hidden md:table-cell">Date</th>
                  <th className="py-3 px-3">Methode</th>
                  <th className="py-3 px-3">Statut</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-500">Aucun paiement</td></tr>
                ) : payments.map((p) => (
                  <tr key={p.id} className="border-b border-gray-800/50 hover:bg-white/[0.02]">
                    <td className="py-3 px-3 text-white">{p.user ? `${p.user.firstName || ''} ${p.user.lastName || ''}`.trim() || p.user.email : '—'}</td>
                    <td className="py-3 px-3 text-gray-300 font-medium">{formatCFA(p.amount)}</td>
                    <td className="py-3 px-3 hidden md:table-cell text-gray-500 text-xs">{formatDate(p.created_at || p.createdAt || p.date)}</td>
                    <td className="py-3 px-3 text-gray-400 capitalize">{(p.paymentMethod || '—').replace('_', ' ')}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${statusColors[p.status] || 'bg-gray-700 text-gray-400'}`}>
                        {statusLabel(p.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}

// =============================================================================
// 5. CONTENT SECTION
// =============================================================================

const ContentSection = ({ showToast, showConfirm }) => {
  const [contentStats, setContentStats] = useState(null)
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [planForm, setPlanForm] = useState({ name: '', description: '', price: 0, duration: 30, isActive: true })
  const [savingPlan, setSavingPlan] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [statsData, plansData] = await Promise.all([
        api.admin.getContentStats().catch(() => null),
        api.admin.getPlans().catch(() => ({ plans: [] })),
      ])
      setContentStats(statsData)
      const allPlans = plansData?.plans || plansData || []
      // Sort: active first, then by sortOrder
      allPlans.sort((a, b) => {
        const aActive = a.isActive ?? a.is_active ?? false
        const bActive = b.isActive ?? b.is_active ?? false
        if (aActive !== bActive) return bActive ? 1 : -1
        return (a.sortOrder || 99) - (b.sortOrder || 99)
      })
      setPlans(allPlans)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const openPlanModal = (plan = null) => {
    if (plan) {
      setEditingPlan(plan)
      setPlanForm({
        name: plan.name || '',
        description: plan.description || '',
        price: plan.price || 0,
        duration: plan.duration || 30,
        isActive: plan.isActive ?? plan.is_active ?? true,
      })
    } else {
      setEditingPlan(null)
      setPlanForm({ name: '', description: '', price: 0, duration: 30, isActive: true })
    }
    setShowPlanModal(true)
  }

  const savePlan = async () => {
    if (!planForm.name.trim()) {
      showToast('Le nom du plan est requis', 'error')
      return
    }
    setSavingPlan(true)
    try {
      if (editingPlan) {
        await api.admin.updatePlan(editingPlan.id, planForm)
        showToast('Plan mis a jour')
      } else {
        await api.admin.createPlan(planForm)
        showToast('Plan cree')
      }
      setShowPlanModal(false)
      fetchData()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setSavingPlan(false)
    }
  }

  const deletePlan = (plan) => {
    showConfirm(
      'Supprimer le plan',
      `Voulez-vous supprimer le plan "${plan.name}" ? Les abonnements existants ne seront pas affectes.`,
      async () => {
        try {
          await api.admin.deletePlan(plan.id)
          showToast('Plan supprime')
          fetchData()
        } catch (err) {
          showToast(err.message, 'error')
        }
      }
    )
  }

  const statsGrid = [
    { label: 'Micro-lecons', value: contentStats?.microlessonsCount ?? contentStats?.microlessons ?? '—', icon: BookOpen },
    { label: 'Lecons', value: contentStats?.lessonsCount ?? contentStats?.lessons ?? '—', icon: Layers },
    { label: 'Exercices', value: contentStats?.exercisesCount ?? contentStats?.exercises ?? '—', icon: Edit3 },
    { label: 'Quiz', value: contentStats?.quizzesCount ?? contentStats?.quizzes ?? '—', icon: HelpCircle },
    { label: 'Badges', value: contentStats?.badgesCount ?? contentStats?.badges ?? '—', icon: Award },
    { label: 'Flashcards', value: contentStats?.flashcardsCount ?? contentStats?.flashcards ?? '—', icon: CreditCard },
  ]

  if (loading) return <Spinner />
  if (error) return <ErrorBlock message={error} onRetry={fetchData} />

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Contenu</h2>

      {/* Content stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statsGrid.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-[#12122A] border border-gray-800 rounded-xl p-4 text-center">
            <Icon size={20} className="text-[#FF4757] mx-auto mb-2" />
            <p className="text-xl font-bold">{value}</p>
            <span className="text-xs text-gray-500">{label}</span>
          </div>
        ))}
      </div>

      {/* Plans management */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Plans d&apos;abonnement</h3>
        <div className="flex gap-2">
          {plans.some(p => !(p.isActive ?? p.is_active)) && (
            <button
              onClick={() => {
                const inactiveIds = plans.filter(p => !(p.isActive ?? p.is_active)).map(p => p.id)
                showConfirm(
                  'Supprimer les plans inactifs',
                  `${inactiveIds.length} plan(s) inactif(s) seront supprimes. Les plans avec abonnements actifs seront preserves.`,
                  async () => {
                    let deleted = 0
                    for (const id of inactiveIds) {
                      try { await api.admin.deletePlan(id); deleted++ } catch (e) { /* has active subs */ }
                    }
                    showToast(`${deleted} plan(s) inactif(s) supprime(s)`)
                    fetchData()
                  }
                )
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-sm rounded-lg text-gray-400"
            >
              <Trash2 size={14} /> Nettoyer inactifs
            </button>
          )}
          <button onClick={() => openPlanModal()} className="flex items-center gap-2 px-4 py-2 bg-[#FF4757] hover:bg-red-600 text-sm rounded-lg">
            <Plus size={14} /> Nouveau Plan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.length === 0 ? (
          <p className="text-gray-500 text-sm col-span-full text-center py-8">Aucun plan</p>
        ) : plans.map((plan) => (
          <div key={plan.id} className={`bg-[#12122A] border rounded-xl p-5 ${(plan.isActive ?? plan.is_active) ? 'border-gray-800' : 'border-gray-800/50 opacity-50'}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-white">{plan.name}</h4>
                <p className="text-xs text-gray-500 mt-1">{plan.description || 'Pas de description'}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs ${(plan.isActive ?? plan.is_active) ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                {(plan.isActive ?? plan.is_active) ? 'Actif' : 'Inactif'}
              </span>
            </div>
            <p className="text-2xl font-bold text-[#FF4757] mb-1">{formatCFA(plan.price)}</p>
            <p className="text-xs text-gray-500 mb-4">{plan.duration || 30} jours</p>
            <div className="flex gap-2">
              <button onClick={() => openPlanModal(plan)} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300">
                <Edit3 size={12} /> Modifier
              </button>
              <button onClick={() => deletePlan(plan)} className="px-3 py-2 text-xs bg-gray-800 hover:bg-red-900/30 rounded-lg text-red-400">
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Plan modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#12122A] border border-gray-700 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold">{editingPlan ? 'Modifier le plan' : 'Nouveau plan'}</h3>
              <button onClick={() => setShowPlanModal(false)} className="text-gray-400 hover:text-white"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Nom</label>
                <input
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-[#0A0A15] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#FF4757]"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Description</label>
                <textarea
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 text-sm bg-[#0A0A15] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#FF4757] resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Prix (FCFA)</label>
                  <input
                    type="number"
                    value={planForm.price}
                    onChange={(e) => setPlanForm({ ...planForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm bg-[#0A0A15] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#FF4757]"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Duree (jours)</label>
                  <input
                    type="number"
                    value={planForm.duration}
                    onChange={(e) => setPlanForm({ ...planForm, duration: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm bg-[#0A0A15] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#FF4757]"
                  />
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setPlanForm({ ...planForm, isActive: !planForm.isActive })}
                  className={`w-10 h-5 rounded-full relative transition-colors ${planForm.isActive ? 'bg-[#FF4757]' : 'bg-gray-700'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${planForm.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-sm text-gray-300">Plan actif</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowPlanModal(false)} className="px-4 py-2 text-sm bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600">
                Annuler
              </button>
              <button onClick={savePlan} disabled={savingPlan} className="px-4 py-2 text-sm bg-[#FF4757] text-white rounded-lg hover:bg-red-600 disabled:opacity-50 flex items-center gap-2">
                {savingPlan && <Loader2 size={14} className="animate-spin" />}
                {editingPlan ? 'Mettre a jour' : 'Creer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// =============================================================================
// 6. NOTIFICATIONS BROADCAST SECTION
// =============================================================================

const NotificationsSection = ({ showToast }) => {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [link, setLink] = useState('')
  const [sending, setSending] = useState(false)
  const [lastResult, setLastResult] = useState(null)

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      showToast('Titre et message requis', 'error')
      return
    }
    setSending(true)
    try {
      const data = { title: title.trim(), message: message.trim() }
      if (link.trim()) data.link = link.trim()
      const result = await api.admin.broadcast(data)
      setLastResult(result)
      showToast(`Notification envoyee a ${result.sent} utilisateurs`)
      setTitle('')
      setMessage('')
      setLink('')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Notifications Globales</h2>

      <div className="max-w-2xl">
        <div className="bg-[#12122A] border border-gray-800 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Envoyer une notification a tous les utilisateurs</h3>
          <p className="text-xs text-gray-500 mb-5">
            Cette notification sera envoyee a tous les utilisateurs actifs avec les notifications activees.
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Titre *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Nouveaute sur Koundoul !"
                maxLength={100}
                className="w-full px-3 py-2 text-sm bg-[#0A0A15] border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-[#FF4757]"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Message *</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ex: De nouveaux challenges hebdomadaires sont disponibles. Viens tester tes connaissances !"
                rows={3}
                maxLength={500}
                className="w-full px-3 py-2 text-sm bg-[#0A0A15] border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-[#FF4757] resize-none"
              />
              <span className="text-[10px] text-gray-600 mt-1 block">{message.length}/500</span>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Lien (optionnel)</label>
              <input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="Ex: /subscriptions"
                className="w-full px-3 py-2 text-sm bg-[#0A0A15] border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-[#FF4757]"
              />
            </div>
          </div>

          {/* Preview */}
          {(title || message) && (
            <div className="mt-5 p-4 bg-[#0A0A15] border border-gray-700/50 rounded-lg">
              <p className="text-[10px] text-gray-500 uppercase mb-2">Apercu</p>
              <div className="flex items-start gap-3">
                <span className="text-xl">📢</span>
                <div>
                  <p className="text-sm font-semibold text-white">{title || 'Titre...'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{message || 'Message...'}</p>
                  {link && <p className="text-[10px] text-[#FF4757] mt-1">→ {link}</p>}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-6">
            <div>
              {lastResult && (
                <span className="text-xs text-green-400">Dernier envoi : {lastResult.sent} destinataires</span>
              )}
            </div>
            <button
              onClick={handleSend}
              disabled={sending || !title.trim() || !message.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#FF4757] text-white text-sm font-medium rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Envoyer a tous
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// 7. SUPPORT SECTION — Forum Moderation + Coach Sessions + Admin Logs
// =============================================================================

const SupportSection = ({ showToast, showConfirm }) => {
  const [tab, setTab] = useState('forum')

  const tabs = [
    { id: 'forum', label: 'Forum', icon: MessageSquare },
    { id: 'coach', label: 'Sessions Coach', icon: HeadphonesIcon },
    { id: 'logs', label: 'Historique Actions', icon: ScrollText },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Support & Moderation</h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-800 pb-3">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
              tab === id ? 'bg-[#FF4757] text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {tab === 'forum' && <ForumModerationTab showToast={showToast} showConfirm={showConfirm} />}
      {tab === 'coach' && <CoachSessionsTab showToast={showToast} />}
      {tab === 'logs' && <AdminLogsTab />}
    </div>
  )
}

// ─── Forum Moderation Tab ──────────────────────────────────────────────

const ForumModerationTab = ({ showToast, showConfirm }) => {
  const [discussions, setDiscussions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [expandedDisc, setExpandedDisc] = useState(null)
  const searchTimeout = useRef(null)

  const fetchDiscussions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, limit: 20 }
      if (search) params.search = search
      const data = await api.admin.getForumDiscussions(params)
      setDiscussions(data.discussions || [])
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { fetchDiscussions() }, [fetchDiscussions])

  const handleSearchChange = (val) => {
    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => { setSearch(val); setPage(1) }, 400)
  }

  const deleteDiscussion = (disc) => {
    showConfirm(
      'Supprimer la discussion',
      `Supprimer "${disc.title}" et toutes ses reponses ? Cette action est irreversible.`,
      async () => {
        try {
          await api.admin.deleteDiscussion(disc.id)
          showToast('Discussion supprimee')
          fetchDiscussions()
        } catch (err) {
          showToast(err.message, 'error')
        }
      }
    )
  }

  return (
    <div>
      {/* Search */}
      <div className="relative max-w-md mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Rechercher dans le forum..."
          defaultValue={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm bg-[#12122A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FF4757]"
        />
      </div>

      {loading ? <Spinner /> : error ? <ErrorBlock message={error} onRetry={fetchDiscussions} /> : (
        <>
          {discussions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare size={32} className="mx-auto mb-3 text-gray-600" />
              <p className="text-sm">Aucune discussion</p>
            </div>
          ) : (
            <div className="space-y-3">
              {discussions.map((disc) => (
                <div key={disc.id} className="bg-[#12122A] border border-gray-800 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-[10px] rounded ${disc.category === 'QUESTION' ? 'bg-blue-500/20 text-blue-400' : disc.category === 'DISCUSSION' ? 'bg-purple-500/20 text-purple-400' : 'bg-green-500/20 text-green-400'}`}>
                          {disc.category}
                        </span>
                        {disc.solved && <span className="px-2 py-0.5 text-[10px] rounded bg-green-500/20 text-green-400">Resolu</span>}
                        {disc.isPinned && <span className="px-2 py-0.5 text-[10px] rounded bg-yellow-500/20 text-yellow-400">Epingle</span>}
                      </div>
                      <h4 className="text-sm font-semibold text-white">{disc.title}</h4>
                      <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500">
                        <span>{disc.user?.firstName || disc.user?.username || disc.user?.email || '?'}</span>
                        <span>{formatDate(disc.createdAt)}</span>
                        <span className="flex items-center gap-1"><MessageSquare size={10} />{disc._count?.replies || 0}</span>
                        <span className="flex items-center gap-1"><Eye size={10} />{disc.views || 0}</span>
                        <span>{disc.votes || 0} votes</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => setExpandedDisc(expandedDisc === disc.id ? null : disc.id)} title="Voir contenu" className="p-1.5 rounded hover:bg-gray-800 text-gray-400 hover:text-white">
                        {expandedDisc === disc.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                      <button onClick={() => deleteDiscussion(disc)} title="Supprimer" className="p-1.5 rounded hover:bg-gray-800 text-gray-400 hover:text-red-400">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {expandedDisc === disc.id && (
                    <div className="mt-3 pt-3 border-t border-gray-800">
                      <p className="text-sm text-gray-300 whitespace-pre-wrap max-h-40 overflow-y-auto">{disc.content}</p>
                      <p className="text-[10px] text-gray-600 mt-2">ID: {disc.id}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}

// ─── Coach Sessions Tab ────────────────────────────────────────────────

const CoachSessionsTab = ({ showToast }) => {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [viewingConv, setViewingConv] = useState(null)
  const [convDetail, setConvDetail] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const fetchConversations = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.admin.getCoachConversations({ page, limit: 20 })
      setConversations(data.conversations || [])
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { fetchConversations() }, [fetchConversations])

  const viewConversation = async (conv) => {
    if (viewingConv === conv.id) {
      setViewingConv(null)
      setConvDetail(null)
      return
    }
    setViewingConv(conv.id)
    setLoadingDetail(true)
    try {
      const data = await api.admin.getCoachConversation(conv.id)
      setConvDetail(data)
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setLoadingDetail(false)
    }
  }

  return (
    <div>
      {loading ? <Spinner /> : error ? <ErrorBlock message={error} onRetry={fetchConversations} /> : (
        <>
          {conversations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <HeadphonesIcon size={32} className="mx-auto mb-3 text-gray-600" />
              <p className="text-sm">Aucune session Coach</p>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conv) => (
                <div key={conv.id} className="bg-[#12122A] border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-white truncate">{conv.title || 'Sans titre'}</h4>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span>{conv.user?.firstName || conv.user?.username || conv.user?.email || '?'}</span>
                        <span>{conv.messageCount || 0} messages</span>
                        <span>{formatDate(conv.updatedAt)}</span>
                      </div>
                    </div>
                    <button onClick={() => viewConversation(conv)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white">
                      <Eye size={12} />
                      {viewingConv === conv.id ? 'Fermer' : 'Voir'}
                    </button>
                  </div>

                  {viewingConv === conv.id && (
                    <div className="mt-3 pt-3 border-t border-gray-800">
                      {loadingDetail ? (
                        <div className="flex justify-center py-4"><Loader2 size={18} className="animate-spin text-gray-500" /></div>
                      ) : convDetail?.messages ? (
                        <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                          {(Array.isArray(convDetail.messages) ? convDetail.messages : []).map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[80%] px-3 py-2 rounded-lg text-xs ${
                                msg.role === 'user' ? 'bg-[#FF4757]/20 text-gray-200' : 'bg-gray-800 text-gray-300'
                              }`}>
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                {msg.timestamp && <span className="text-[9px] text-gray-500 mt-1 block">{new Date(msg.timestamp).toLocaleString('fr-FR')}</span>}
                              </div>
                            </div>
                          ))}
                          {convDetail.messages.length === 0 && <p className="text-xs text-gray-500 text-center py-2">Aucun message</p>}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">Impossible de charger les messages</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}

// ─── Admin Logs Tab ────────────────────────────────────────────────────

const AdminLogsTab = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.admin.getLogs({ page, limit: 50 })
      setLogs(data.logs || [])
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const actionColors = {
    UPDATE_USER: 'text-blue-400',
    DELETE_USER: 'text-red-400',
    UPDATE_SUBSCRIPTION: 'text-purple-400',
    CREATE_PLAN: 'text-green-400',
    UPDATE_PLAN: 'text-yellow-400',
    DELETE_PLAN: 'text-red-400',
    CREATE_STUDENT: 'text-cyan-400',
    BROADCAST_NOTIFICATION: 'text-orange-400',
    DELETE_DISCUSSION: 'text-red-400',
    DELETE_REPLY: 'text-red-400',
  }

  const actionLabels = {
    UPDATE_USER: 'Modifier user',
    DELETE_USER: 'Supprimer user',
    UPDATE_SUBSCRIPTION: 'Modifier abo',
    CREATE_PLAN: 'Creer plan',
    UPDATE_PLAN: 'Modifier plan',
    DELETE_PLAN: 'Supprimer plan',
    CREATE_STUDENT: 'Creer eleve',
    BROADCAST_NOTIFICATION: 'Broadcast',
    DELETE_DISCUSSION: 'Suppr. discussion',
    DELETE_REPLY: 'Suppr. reponse',
  }

  return (
    <div>
      {loading ? <Spinner /> : error ? <ErrorBlock message={error} onRetry={fetchLogs} /> : (
        <>
          {logs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ScrollText size={32} className="mx-auto mb-3 text-gray-600" />
              <p className="text-sm">Aucun log</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-left text-gray-500 text-xs uppercase">
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Admin</th>
                    <th className="py-3 px-3">Action</th>
                    <th className="py-3 px-3">Cible</th>
                    <th className="py-3 px-3 hidden md:table-cell">Details</th>
                    <th className="py-3 px-3 hidden lg:table-cell">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-gray-800/50 hover:bg-white/[0.02]">
                      <td className="py-2.5 px-3 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-2.5 px-3 text-gray-300 text-xs">
                        {log.admin?.firstName || log.admin?.email || log.adminId}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`text-xs font-medium ${actionColors[log.action] || 'text-gray-400'}`}>
                          {actionLabels[log.action] || log.action}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-gray-400 text-xs">
                        {log.target && <span>{log.target}</span>}
                        {log.targetId && <span className="text-gray-600 ml-1 text-[10px]">({log.targetId.slice(0, 8)}...)</span>}
                      </td>
                      <td className="py-2.5 px-3 hidden md:table-cell text-gray-500 text-[11px] max-w-[200px] truncate">
                        {log.details ? JSON.stringify(log.details).slice(0, 80) : '—'}
                      </td>
                      <td className="py-2.5 px-3 hidden lg:table-cell text-gray-600 text-[10px]">
                        {log.ip || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}

// =============================================================================
// PROMO CODES SECTION
// =============================================================================

const PromoCodesSection = ({ showToast }) => {
  const [promos, setPromos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ code: '', planId: 'plan-premium', durationDays: 30, maxUses: 100, description: '' })
  const [creating, setCreating] = useState(false)

  const fetchPromos = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.promo.adminList()
      setPromos(res.data || [])
    } catch (e) { /* ignore */ }
    setLoading(false)
  }, [])

  useEffect(() => { fetchPromos() }, [fetchPromos])

  const createPromo = async () => {
    if (!form.code.trim()) { showToast('Code requis', 'error'); return }
    setCreating(true)
    try {
      await api.promo.adminCreate({ ...form, code: form.code.trim().toUpperCase() })
      showToast('Code promo cree')
      setShowForm(false)
      setForm({ code: '', planId: 'plan-premium', durationDays: 30, maxUses: 100, description: '' })
      fetchPromos()
    } catch (err) {
      showToast(err.message, 'error')
    }
    setCreating(false)
  }

  const deletePromo = async (id) => {
    try {
      await api.promo.adminDelete(id)
      showToast('Code supprime')
      fetchPromos()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Codes Promo</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-[#FF4757] hover:bg-red-600 text-sm rounded-lg">
          <Plus size={14} /> Nouveau Code
        </button>
      </div>

      {showForm && (
        <div className="bg-[#12122A] border border-gray-800 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Code *</label>
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="PROMO2026" className="w-full px-3 py-2 text-sm bg-[#0A0A15] border border-gray-700 rounded-lg text-white font-mono uppercase" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Plan a offrir *</label>
              <select value={form.planId} onChange={(e) => setForm({ ...form, planId: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A15] border border-gray-700 rounded-lg text-white">
                <option value="plan-premium">Premium (50 IA/j)</option>
                <option value="plan-premium-max">Premium Max (300 IA/j)</option>
                <option value="plan-family">Famille</option>
                <option value="plan-premium-daily">Premium 24h</option>
                <option value="plan-premium-max-daily">Premium Max 24h</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Duree (jours)</label>
              <input type="number" value={form.durationDays} onChange={(e) => setForm({ ...form, durationDays: parseInt(e.target.value) || 30 })} className="w-full px-3 py-2 text-sm bg-[#0A0A15] border border-gray-700 rounded-lg text-white" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Utilisations max</label>
              <input type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: parseInt(e.target.value) || 100 })} className="w-full px-3 py-2 text-sm bg-[#0A0A15] border border-gray-700 rounded-lg text-white" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-400 block mb-1">Description</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ex: Promo lancement mai 2026" className="w-full px-3 py-2 text-sm bg-[#0A0A15] border border-gray-700 rounded-lg text-white" />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm bg-gray-700 text-gray-300 rounded-lg">Annuler</button>
            <button onClick={createPromo} disabled={creating} className="px-4 py-2 text-sm bg-[#FF4757] text-white rounded-lg disabled:opacity-50">
              {creating ? <Loader2 size={14} className="animate-spin" /> : 'Creer'}
            </button>
          </div>
        </div>
      )}

      {loading ? <Spinner /> : (
        <div className="space-y-3">
          {promos.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Award size={32} className="mx-auto mb-3 text-gray-600" />
              <p className="text-sm">Aucun code promo</p>
            </div>
          ) : promos.map((p) => (
            <div key={p.id} className="bg-[#12122A] border border-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <code className="text-lg font-mono font-bold text-yellow-400">{p.code}</code>
                  <span className={`px-2 py-0.5 text-[10px] rounded ${p.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {p.isActive ? 'Actif' : 'Inactif'}
                  </span>
                  {p.expiresAt && new Date(p.expiresAt) < new Date() && (
                    <span className="px-2 py-0.5 text-[10px] rounded bg-red-500/20 text-red-400">Expire</span>
                  )}
                  {p.currentUses >= p.maxUses && (
                    <span className="px-2 py-0.5 text-[10px] rounded bg-orange-500/20 text-orange-400">Epuise</span>
                  )}
                </div>
                <button onClick={() => deletePromo(p.id)} className="p-2 text-gray-500 hover:text-red-400">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-2">
                <span>Plan: <strong className="text-gray-300">{p.plan?.displayName || p.plan?.name}</strong></span>
                <span>{p.durationDays} jours</span>
                <span className="text-kprimary font-bold">{p.currentUses}/{p.maxUses} utilise(s)</span>
                {p.expiresAt && <span>Expire: {formatDate(p.expiresAt)}</span>}
                {p.description && <span className="text-gray-400">{p.description}</span>}
              </div>
              {p.uses && p.uses.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-800">
                  <p className="text-[10px] text-gray-500 mb-1">Utilise par :</p>
                  <div className="flex flex-wrap gap-2">
                    {p.uses.map((u) => (
                      <span key={u.id} className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-gray-400">
                        {u.user?.firstName || u.user?.email} — {new Date(u.usedAt).toLocaleDateString('fr-FR')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// =============================================================================
// 9. FAMILIES SECTION
// =============================================================================

const FamiliesSection = ({ showToast, showConfirm }) => {
  const [families, setFamilies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({})
  const [showLinkForm, setShowLinkForm] = useState(false)
  const [parentEmail, setParentEmail] = useState('')
  const [childEmail, setChildEmail] = useState('')
  const [linkLoading, setLinkLoading] = useState(false)
  const searchTimeout = useRef(null)

  const fetchFamilies = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.admin.getFamilies({ page, limit: 20, search })
      setFamilies(data.families || [])
      setStats(data.stats || {})
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { fetchFamilies() }, [fetchFamilies])

  const handleSearch = (val) => {
    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => { setSearch(val); setPage(1) }, 400)
  }

  const unlinkFamily = (id, parentName, childName) => {
    showConfirm('Supprimer le lien familial',
      `Supprimer le lien entre ${parentName} et ${childName} ?`,
      async () => {
        try {
          await api.admin.deleteFamilyLink(id)
          showToast('Lien supprimé')
          fetchFamilies()
        } catch (err) { showToast(err.message, 'error') }
      })
  }

  const handleLink = async (e) => {
    e.preventDefault()
    setLinkLoading(true)
    try {
      await api.admin.createFamilyLink({ parentEmail, childEmail })
      showToast('Lien familial créé')
      setShowLinkForm(false)
      setParentEmail('')
      setChildEmail('')
      fetchFamilies()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setLinkLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Link2 size={24} className="text-[#FF4757]" /> Gestion des Familles
      </h2>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/5 rounded-xl p-4">
          <p className="text-xs text-gray-500">Total liens</p>
          <p className="text-2xl font-bold text-white">{stats.totalLinks || 0}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4">
          <p className="text-xs text-gray-500">Parents inscrits</p>
          <p className="text-2xl font-bold text-blue-400">{stats.parentCount || 0}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4">
          <p className="text-xs text-gray-500">Enfants liés</p>
          <p className="text-2xl font-bold text-green-400">{stats.childCount || 0}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input onChange={(e) => handleSearch(e.target.value)} placeholder="Rechercher parent ou enfant..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-gray-800 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#FF4757]" />
        </div>
        <button onClick={() => setShowLinkForm(!showLinkForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#FF4757] text-white rounded-lg text-sm hover:bg-[#FF4757]/80">
          <UserPlus size={16} /> Lier manuellement
        </button>
      </div>

      {/* Link Form */}
      {showLinkForm && (
        <form onSubmit={handleLink} className="bg-white/5 rounded-xl p-4 mb-6 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Email du parent</label>
              <input value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} required type="email"
                className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#FF4757]" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Email enfant</label>
              <input value={childEmail} onChange={(e) => setChildEmail(e.target.value)} required type="email"
                className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#FF4757]" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={linkLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-500 disabled:opacity-50">
              {linkLoading ? <Loader2 size={16} className="animate-spin" /> : 'Créer le lien'}
            </button>
            <button type="button" onClick={() => setShowLinkForm(false)}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-600">Annuler</button>
          </div>
        </form>
      )}

      {loading && <Spinner />}
      {error && <ErrorBlock message={error} onRetry={fetchFamilies} />}

      {!loading && !error && (
        <div className="space-y-3">
          {families.length === 0 && <p className="text-gray-500 text-center py-8">Aucun lien familial trouvé</p>}
          {families.map((f) => (
            <div key={f.id} className="bg-white/5 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] rounded font-medium">PARENT</span>
                  <span className="text-sm text-white font-medium truncate">
                    {f.parent?.firstName} {f.parent?.lastName}
                  </span>
                  <span className="text-xs text-gray-500">{f.parent?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] rounded font-medium">ENFANT</span>
                  <span className="text-sm text-white font-medium truncate">
                    {f.child?.firstName} {f.child?.lastName}
                  </span>
                  <span className="text-xs text-gray-500">{f.child?.email || f.child?.username}</span>
                  {f.child?.level && <span className="text-xs text-gray-600">Niv.{f.child.level} — {f.child.xp} XP</span>}
                </div>
                <div className="text-[10px] text-gray-600 mt-1">
                  Lié le {new Date(f.createdAt).toLocaleDateString('fr-FR')}
                  {f.approved === false && <span className="ml-2 text-yellow-500">⏳ En attente</span>}
                </div>
              </div>
              <button onClick={() => unlinkFamily(f.id, f.parent?.firstName || '?', f.child?.firstName || '?')}
                className="p-2 text-gray-500 hover:text-red-400" title="Supprimer le lien">
                <Unlink size={16} />
              </button>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 pt-4">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1 text-xs bg-white/5 rounded disabled:opacity-30 text-gray-400 hover:text-white">Précédent</button>
              <span className="text-xs text-gray-500">{page}/{totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1 text-xs bg-white/5 rounded disabled:opacity-30 text-gray-400 hover:text-white">Suivant</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// =============================================================================
// 10. REFUNDS / INVOICES SECTION
// =============================================================================

const RefundsSection = ({ showToast, showConfirm }) => {
  const [tab, setTab] = useState('summary')
  const tabs = [
    { id: 'summary', label: 'Vue Financière', icon: CircleDollarSign },
    { id: 'refunds', label: 'Remboursements', icon: ArrowRightLeft },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <CircleDollarSign size={24} className="text-[#FF4757]" /> Remboursements & Finances
      </h2>
      <div className="flex gap-2 mb-6">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${tab === t.id ? 'bg-[#FF4757]/15 text-[#FF4757]' : 'bg-white/5 text-gray-400 hover:text-white'}`}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>
      {tab === 'summary' && <FinanceSummaryTab showToast={showToast} />}
      {tab === 'refunds' && <RefundsTab showToast={showToast} showConfirm={showConfirm} />}
    </div>
  )
}

const FinanceSummaryTab = ({ showToast }) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const d = await api.admin.getFinanceSummary()
        setData(d)
      } catch (err) { showToast(err.message, 'error') }
      finally { setLoading(false) }
    })()
  }, [showToast])

  if (loading) return <Spinner />
  if (!data) return <p className="text-gray-500 text-center py-8">Impossible de charger le résumé</p>

  const growthColor = data.revenueGrowth >= 0 ? 'text-green-400' : 'text-red-400'
  const growthIcon = data.revenueGrowth >= 0 ? '↑' : '↓'

  return (
    <div className="space-y-6">
      {/* Revenue cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 rounded-xl p-4">
          <p className="text-xs text-gray-500">Revenu total</p>
          <p className="text-2xl font-bold text-white">{formatCFA(data.totalRevenue)}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4">
          <p className="text-xs text-gray-500">Ce mois</p>
          <p className="text-2xl font-bold text-green-400">{formatCFA(data.monthRevenue)}</p>
          <p className={`text-xs ${growthColor}`}>{growthIcon} {Math.abs(data.revenueGrowth)}% vs mois dernier</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4">
          <p className="text-xs text-gray-500">Total remboursé</p>
          <p className="text-2xl font-bold text-orange-400">{formatCFA(data.totalRefunded)}</p>
          <p className="text-xs text-gray-500">{data.totalRefundCount} remboursements</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4">
          <p className="text-xs text-gray-500">Remb. en attente</p>
          <p className="text-2xl font-bold text-yellow-400">{data.pendingRefunds}</p>
        </div>
      </div>

      {/* Payment methods breakdown */}
      <div className="bg-white/5 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Répartition par méthode de paiement</h3>
        <div className="space-y-2">
          {(data.paymentsByMethod || []).map((m) => {
            const methodLabels = { wave: 'Wave', orange_money: 'Orange Money', STRIPE: 'Carte bancaire' }
            return (
              <div key={m.method} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                <span className="text-sm text-white">{methodLabels[m.method] || m.method}</span>
                <div className="text-right">
                  <span className="text-sm font-bold text-white">{formatCFA(m.total)}</span>
                  <span className="text-xs text-gray-500 ml-2">({m.count} tx)</span>
                </div>
              </div>
            )
          })}
          {(!data.paymentsByMethod || data.paymentsByMethod.length === 0) && (
            <p className="text-gray-500 text-xs text-center">Aucun paiement</p>
          )}
        </div>
      </div>

      {/* Recent payments */}
      <div className="bg-white/5 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Derniers paiements</h3>
        <div className="space-y-2">
          {(data.recentPayments || []).map((p) => (
            <div key={p.id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
              <div>
                <span className="text-sm text-white">{p.user?.firstName} {p.user?.lastName}</span>
                <span className="text-xs text-gray-500 ml-2">{p.user?.email}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-green-400">{formatCFA(p.amount)}</span>
                <p className="text-[10px] text-gray-500">{new Date(p.createdAt).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const RefundsTab = ({ showToast, showConfirm }) => {
  const [refunds, setRefunds] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ paymentId: '', reason: '', amount: '', adminNote: '' })
  const [formLoading, setFormLoading] = useState(false)

  const fetchRefunds = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.admin.getRefunds({ page, limit: 20, status: statusFilter })
      setRefunds(data.refunds || [])
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (err) { showToast(err.message, 'error') }
    finally { setLoading(false) }
  }, [page, statusFilter, showToast])

  useEffect(() => { fetchRefunds() }, [fetchRefunds])

  const handleCreateRefund = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    try {
      await api.admin.createRefund({
        paymentId: formData.paymentId.trim(),
        reason: formData.reason,
        amount: formData.amount ? parseInt(formData.amount) : undefined,
        adminNote: formData.adminNote || undefined,
      })
      showToast('Remboursement créé')
      setShowForm(false)
      setFormData({ paymentId: '', reason: '', amount: '', adminNote: '' })
      fetchRefunds()
    } catch (err) { showToast(err.message, 'error') }
    finally { setFormLoading(false) }
  }

  const updateStatus = (id, newStatus, label) => {
    showConfirm(`${label} le remboursement ?`, `Confirmer : ${label}`,
      async () => {
        try {
          await api.admin.updateRefund(id, { status: newStatus })
          showToast(`Remboursement ${label.toLowerCase()}`)
          fetchRefunds()
        } catch (err) { showToast(err.message, 'error') }
      })
  }

  const statusBadge = (s) => {
    const colors = { pending: 'bg-yellow-500/20 text-yellow-400', approved: 'bg-blue-500/20 text-blue-400', processed: 'bg-green-500/20 text-green-400', rejected: 'bg-red-500/20 text-red-400' }
    const labels = { pending: 'En attente', approved: 'Approuvé', processed: 'Traité', rejected: 'Refusé' }
    return <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${colors[s] || 'bg-gray-500/20 text-gray-400'}`}>{labels[s] || s}</span>
  }

  return (
    <div>
      {/* Filters + Create */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 bg-white/5 border border-gray-800 rounded-lg text-sm text-white focus:outline-none">
          <option value="all">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="approved">Approuvés</option>
          <option value="processed">Traités</option>
          <option value="rejected">Refusés</option>
        </select>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#FF4757] text-white rounded-lg text-sm hover:bg-[#FF4757]/80">
          <Plus size={16} /> Nouveau remboursement
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreateRefund} className="bg-white/5 rounded-xl p-4 mb-6 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">ID du paiement *</label>
              <input value={formData.paymentId} onChange={(e) => setFormData(f => ({ ...f, paymentId: e.target.value }))} required
                placeholder="ID du paiement à rembourser"
                className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#FF4757]" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Montant (FCFA, vide = total)</label>
              <input value={formData.amount} onChange={(e) => setFormData(f => ({ ...f, amount: e.target.value }))} type="number"
                placeholder="Laisser vide pour remboursement total"
                className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#FF4757]" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Raison *</label>
            <input value={formData.reason} onChange={(e) => setFormData(f => ({ ...f, reason: e.target.value }))} required
              placeholder="Raison du remboursement"
              className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#FF4757]" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Note admin</label>
            <input value={formData.adminNote} onChange={(e) => setFormData(f => ({ ...f, adminNote: e.target.value }))}
              placeholder="Note interne (optionnelle)"
              className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#FF4757]" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={formLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-500 disabled:opacity-50">
              {formLoading ? <Loader2 size={16} className="animate-spin" /> : 'Créer'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-600">Annuler</button>
          </div>
        </form>
      )}

      {loading && <Spinner />}

      {!loading && (
        <div className="space-y-3">
          {refunds.length === 0 && <p className="text-gray-500 text-center py-8">Aucun remboursement</p>}
          {refunds.map((r) => (
            <div key={r.id} className="bg-white/5 rounded-xl p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {statusBadge(r.status)}
                  <span className="text-sm text-white font-medium">{r.user?.firstName} {r.user?.lastName}</span>
                  <span className="text-xs text-gray-500">{r.user?.email}</span>
                </div>
                <span className="text-lg font-bold text-orange-400">{formatCFA(r.amount)}</span>
              </div>
              <p className="text-xs text-gray-400 mb-1"><strong>Raison:</strong> {r.reason}</p>
              {r.adminNote && <p className="text-xs text-gray-500 mb-1"><strong>Note:</strong> {r.adminNote}</p>}
              <div className="flex items-center gap-3 text-[10px] text-gray-600 mb-2">
                <span>Paiement: {formatCFA(r.payment?.amount)} ({r.payment?.paymentMethod})</span>
                <span>Créé le {new Date(r.createdAt).toLocaleDateString('fr-FR')}</span>
                {r.processedAt && <span>Traité le {new Date(r.processedAt).toLocaleDateString('fr-FR')}</span>}
                {r.admin && <span>Par {r.admin.firstName}</span>}
              </div>
              {r.status === 'pending' && (
                <div className="flex gap-2 mt-2">
                  <button onClick={() => updateStatus(r.id, 'processed', 'Traiter')}
                    className="px-3 py-1 text-xs bg-green-600/20 text-green-400 rounded hover:bg-green-600/30">Traiter</button>
                  <button onClick={() => updateStatus(r.id, 'rejected', 'Refuser')}
                    className="px-3 py-1 text-xs bg-red-600/20 text-red-400 rounded hover:bg-red-600/30">Refuser</button>
                </div>
              )}
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 pt-4">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1 text-xs bg-white/5 rounded disabled:opacity-30 text-gray-400 hover:text-white">Précédent</button>
              <span className="text-xs text-gray-500">{page}/{totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1 text-xs bg-white/5 rounded disabled:opacity-30 text-gray-400 hover:text-white">Suivant</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// =============================================================================
// 11. TICKETS SECTION
// =============================================================================

const TicketsSection = ({ showToast, showConfirm }) => {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusCounts, setStatusCounts] = useState({})
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [ticketDetail, setTicketDetail] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [replyLoading, setReplyLoading] = useState(false)
  const searchTimeout = useRef(null)

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.admin.getTickets({ page, limit: 20, status: statusFilter, category: categoryFilter, priority: priorityFilter, search })
      setTickets(data.tickets || [])
      setStatusCounts(data.statusCounts || {})
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (err) { showToast(err.message, 'error') }
    finally { setLoading(false) }
  }, [page, statusFilter, categoryFilter, priorityFilter, search, showToast])

  useEffect(() => { fetchTickets() }, [fetchTickets])

  const handleSearch = (val) => {
    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => { setSearch(val); setPage(1) }, 400)
  }

  const loadTicketDetail = async (id) => {
    if (selectedTicket === id) { setSelectedTicket(null); return }
    setSelectedTicket(id)
    try {
      const data = await api.admin.getTicket(id)
      setTicketDetail(data)
    } catch (err) { showToast(err.message, 'error') }
  }

  const handleReply = async (ticketId) => {
    if (!replyText.trim()) return
    setReplyLoading(true)
    try {
      await api.admin.replyTicket(ticketId, replyText)
      showToast('Réponse envoyée')
      setReplyText('')
      const data = await api.admin.getTicket(ticketId)
      setTicketDetail(data)
      fetchTickets()
    } catch (err) { showToast(err.message, 'error') }
    finally { setReplyLoading(false) }
  }

  const updateTicket = async (id, data) => {
    try {
      await api.admin.updateTicket(id, data)
      showToast('Ticket mis à jour')
      fetchTickets()
      if (selectedTicket === id) {
        const d = await api.admin.getTicket(id)
        setTicketDetail(d)
      }
    } catch (err) { showToast(err.message, 'error') }
  }

  const deleteTicket = (id, subject) => {
    showConfirm('Supprimer le ticket', `Supprimer "${subject}" ?`,
      async () => {
        try {
          await api.admin.deleteTicket(id)
          showToast('Ticket supprimé')
          if (selectedTicket === id) setSelectedTicket(null)
          fetchTickets()
        } catch (err) { showToast(err.message, 'error') }
      })
  }

  const statusBadge = (s) => {
    const colors = { open: 'bg-blue-500/20 text-blue-400', in_progress: 'bg-yellow-500/20 text-yellow-400', resolved: 'bg-green-500/20 text-green-400', closed: 'bg-gray-500/20 text-gray-400' }
    const labels = { open: 'Ouvert', in_progress: 'En cours', resolved: 'Résolu', closed: 'Fermé' }
    return <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${colors[s] || 'bg-gray-500/20 text-gray-400'}`}>{labels[s] || s}</span>
  }

  const priorityBadge = (p) => {
    const colors = { low: 'text-gray-400', normal: 'text-blue-400', high: 'text-orange-400', urgent: 'text-red-400' }
    const labels = { low: 'Bas', normal: 'Normal', high: 'Haut', urgent: 'Urgent' }
    return <span className={`text-[10px] font-bold ${colors[p] || 'text-gray-400'}`}>{labels[p] || p}</span>
  }

  const categoryLabel = (c) => {
    const labels = { general: 'Général', bug: 'Bug', billing: 'Facturation', account: 'Compte', feature: 'Fonctionnalité' }
    return labels[c] || c
  }

  const totalOpen = (statusCounts.open || 0) + (statusCounts.in_progress || 0)

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Ticket size={24} className="text-[#FF4757]" /> Tickets Support
        {totalOpen > 0 && <span className="ml-2 px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">{totalOpen} ouverts</span>}
      </h2>

      {/* Status summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Ouverts', key: 'open', color: 'text-blue-400' },
          { label: 'En cours', key: 'in_progress', color: 'text-yellow-400' },
          { label: 'Résolus', key: 'resolved', color: 'text-green-400' },
          { label: 'Fermés', key: 'closed', color: 'text-gray-400' },
        ].map(s => (
          <div key={s.key} className="bg-white/5 rounded-xl p-3 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{statusCounts[s.key] || 0}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input onChange={(e) => handleSearch(e.target.value)} placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-gray-800 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#FF4757]" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 bg-white/5 border border-gray-800 rounded-lg text-sm text-white focus:outline-none">
          <option value="all">Tous statuts</option>
          <option value="open">Ouverts</option>
          <option value="in_progress">En cours</option>
          <option value="resolved">Résolus</option>
          <option value="closed">Fermés</option>
        </select>
        <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 bg-white/5 border border-gray-800 rounded-lg text-sm text-white focus:outline-none">
          <option value="all">Toutes catégories</option>
          <option value="general">Général</option>
          <option value="bug">Bug</option>
          <option value="billing">Facturation</option>
          <option value="account">Compte</option>
          <option value="feature">Fonctionnalité</option>
        </select>
        <select value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 bg-white/5 border border-gray-800 rounded-lg text-sm text-white focus:outline-none">
          <option value="all">Toutes priorités</option>
          <option value="urgent">Urgent</option>
          <option value="high">Haut</option>
          <option value="normal">Normal</option>
          <option value="low">Bas</option>
        </select>
      </div>

      {loading && <Spinner />}

      {!loading && (
        <div className="space-y-3">
          {tickets.length === 0 && <p className="text-gray-500 text-center py-8">Aucun ticket</p>}
          {tickets.map((t) => (
            <div key={t.id} className="bg-white/5 rounded-xl overflow-hidden">
              <div className="p-4 cursor-pointer hover:bg-white/5" onClick={() => loadTicketDetail(t.id)}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {statusBadge(t.status)}
                    {priorityBadge(t.priority)}
                    <span className="px-2 py-0.5 bg-white/10 text-gray-400 text-[10px] rounded">{categoryLabel(t.category)}</span>
                    <span className="text-sm text-white font-medium">{t.subject}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {t._count?.replies > 0 && (
                      <span className="flex items-center gap-1 text-xs text-gray-500"><MessageCircle size={12} />{t._count.replies}</span>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); deleteTicket(t.id, t.subject) }}
                      className="p-1 text-gray-600 hover:text-red-400"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-gray-500">
                  <span>De: {t.user?.firstName} {t.user?.lastName} ({t.user?.email})</span>
                  <span>{new Date(t.createdAt).toLocaleDateString('fr-FR')}</span>
                  {t.admin && <span>Assigné: {t.admin.firstName}</span>}
                </div>
              </div>

              {/* Expanded detail */}
              {selectedTicket === t.id && ticketDetail && (
                <div className="border-t border-gray-800 p-4 bg-white/[0.02]">
                  <p className="text-sm text-gray-300 mb-4 whitespace-pre-wrap">{ticketDetail.message}</p>

                  {/* Status/Priority controls */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <select value={ticketDetail.status} onChange={(e) => updateTicket(t.id, { status: e.target.value })}
                      className="px-2 py-1 bg-white/5 border border-gray-700 rounded text-xs text-white">
                      <option value="open">Ouvert</option>
                      <option value="in_progress">En cours</option>
                      <option value="resolved">Résolu</option>
                      <option value="closed">Fermé</option>
                    </select>
                    <select value={ticketDetail.priority} onChange={(e) => updateTicket(t.id, { priority: e.target.value })}
                      className="px-2 py-1 bg-white/5 border border-gray-700 rounded text-xs text-white">
                      <option value="low">Bas</option>
                      <option value="normal">Normal</option>
                      <option value="high">Haut</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  {/* Replies */}
                  {ticketDetail.replies && ticketDetail.replies.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <p className="text-xs text-gray-500 font-medium">Conversation :</p>
                      {ticketDetail.replies.map((r) => (
                        <div key={r.id} className={`p-3 rounded-lg text-sm ${r.isAdmin ? 'bg-[#FF4757]/10 border-l-2 border-[#FF4757]' : 'bg-white/5 border-l-2 border-blue-500'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-medium ${r.isAdmin ? 'text-[#FF4757]' : 'text-blue-400'}`}>
                              {r.user?.firstName} {r.user?.lastName} {r.isAdmin && '(Admin)'}
                            </span>
                            <span className="text-[10px] text-gray-500">{new Date(r.createdAt).toLocaleString('fr-FR')}</span>
                          </div>
                          <p className="text-gray-300 whitespace-pre-wrap">{r.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply form */}
                  {ticketDetail.status !== 'closed' && (
                    <div className="flex gap-2">
                      <input value={replyText} onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Répondre au ticket..."
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleReply(t.id)}
                        className="flex-1 px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#FF4757]" />
                      <button onClick={() => handleReply(t.id)} disabled={replyLoading || !replyText.trim()}
                        className="px-4 py-2 bg-[#FF4757] text-white rounded-lg text-sm hover:bg-[#FF4757]/80 disabled:opacity-50">
                        {replyLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 pt-4">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1 text-xs bg-white/5 rounded disabled:opacity-30 text-gray-400 hover:text-white">Précédent</button>
              <span className="text-xs text-gray-500">{page}/{totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1 text-xs bg-white/5 rounded disabled:opacity-30 text-gray-400 hover:text-white">Suivant</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
