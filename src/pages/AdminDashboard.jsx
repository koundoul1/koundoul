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

// ─── Confirm Modal ──────────────────────────────────────────────────────────

const ConfirmModal = ({ title, message, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <div className="bg-[#12122A] border border-gray-700 rounded-xl p-6 max-w-md w-full">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="text-red-500" size={24} />
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <p className="text-gray-300 text-sm mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button onClick={onCancel} disabled={loading} className="px-4 py-2 text-sm rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50">
          Annuler
        </button>
        <button onClick={onConfirm} disabled={loading} className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center gap-2">
          {loading && <Loader2 size={14} className="animate-spin" />}
          Confirmer
        </button>
      </div>
    </div>
  </div>
)

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
  { id: 'overview', label: 'Vue Generale', icon: LayoutDashboard },
  { id: 'users', label: 'Utilisateurs', icon: Users },
  { id: 'subscriptions', label: 'Abonnements', icon: CreditCard },
  { id: 'payments', label: 'Paiements', icon: Wallet },
  { id: 'content', label: 'Contenu', icon: BookOpen },
  { id: 'requests', label: 'Support', icon: HeadphonesIcon },
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

      {/* Confirm Modal */}
      {confirmModal && (
        <ConfirmModal
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
          {activeSection === 'requests' && <RequestsSection />}
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

  const kpis = [
    { label: 'Total Utilisateurs', value: stats?.totalUsers ?? 0, icon: Users, color: 'text-blue-400' },
    { label: 'Actifs Aujourd\'hui', value: stats?.activeToday ?? 0, icon: Activity, color: 'text-green-400' },
    { label: 'Revenu Mensuel', value: formatCFA(stats?.monthlyRevenue), icon: DollarSign, color: 'text-yellow-400' },
    { label: 'Abonnements Actifs', value: stats?.activeSubscriptions ?? 0, icon: CreditCard, color: 'text-purple-400' },
    { label: 'Lecons Terminees', value: stats?.lessonsCompleted ?? 0, icon: BookOpen, color: 'text-cyan-400' },
  ]

  const signups = stats?.recentSignups || []
  const maxSignup = Math.max(...signups.map((s) => s.count || 0), 1)

  const recentActivity = stats?.recentActivity || []

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Vue Generale</h2>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {kpis.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-[#12122A] border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Icon size={20} className={color} />
              <span className="text-xs text-gray-400">{label}</span>
            </div>
            <p className="text-xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Signups chart */}
        <div className="bg-[#12122A] border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Inscriptions Recentes</h3>
          {signups.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucune donnee</p>
          ) : (
            <div className="flex items-end gap-2 h-40">
              {signups.map((s, i) => {
                const pct = ((s.count || 0) / maxSignup) * 100
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-400">{s.count || 0}</span>
                    <div
                      className="w-full bg-[#FF4757] rounded-t"
                      style={{ height: `${Math.max(pct, 4)}%` }}
                    />
                    <span className="text-[10px] text-gray-500 truncate w-full text-center">
                      {s.label || s.date || ''}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div className="bg-[#12122A] border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Activite Recente</h3>
          {recentActivity.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucune activite</p>
          ) : (
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {recentActivity.slice(0, 10).map((act, i) => (
                <li key={i} className="flex items-start gap-3 text-sm py-1.5 border-b border-gray-800/50 last:border-0">
                  <Activity size={14} className="text-gray-500 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-gray-300 truncate block">{act.description || act.action || 'Action'}</span>
                    <span className="text-[11px] text-gray-500">{act.user || ''} {act.date ? `- ${formatDate(act.date)}` : ''}</span>
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
  const perPage = 20
  const searchTimeout = useRef(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, limit: perPage }
      if (search) params.search = search
      if (filter !== 'all') params.filter = filter
      const data = await api.admin.getUsers(params)
      setUsers(data.users || data.data || [])
      setTotalPages(data.totalPages || Math.ceil((data.total || 0) / perPage) || 1)
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
      showToast(`${u.name || u.email} ${u.is_admin ? 'n\'est plus' : 'est maintenant'} admin`)
      fetchUsers()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const toggleActive = async (u) => {
    const newStatus = u.status === 'active' ? 'suspended' : 'active'
    try {
      await api.admin.updateUser(u.id, { status: newStatus })
      showToast(`Utilisateur ${newStatus === 'active' ? 'active' : 'suspendu'}`)
      fetchUsers()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const deleteUser = (u) => {
    showConfirm(
      'Supprimer l\'utilisateur',
      `Voulez-vous vraiment supprimer ${u.name || u.email} ? Cette action est irreversible.`,
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
      u.name || '',
      u.email || '',
      u.level || '',
      u.xp ?? '',
      u.streak ?? '',
      u.subscription_status || u.subscriptionStatus || '',
      u.created_at || u.createdAt || '',
      u.status || '',
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
            placeholder="Rechercher par nom ou email..."
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
                      <td className="py-3 px-3 text-white font-medium">{u.name || '—'}</td>
                      <td className="py-3 px-3 text-gray-400">{u.email}</td>
                      <td className="py-3 px-3 hidden md:table-cell text-gray-400">{u.level || '—'}</td>
                      <td className="py-3 px-3 hidden md:table-cell text-gray-400">{u.xp ?? 0}</td>
                      <td className="py-3 px-3 hidden lg:table-cell text-gray-400">{u.streak ?? 0}</td>
                      <td className="py-3 px-3 hidden lg:table-cell">
                        <span className={`px-2 py-0.5 rounded text-xs ${statusColors[u.subscription_status || u.subscriptionStatus] || 'bg-gray-700 text-gray-400'}`}>
                          {statusLabel(u.subscription_status || u.subscriptionStatus || 'none')}
                        </span>
                      </td>
                      <td className="py-3 px-3 hidden xl:table-cell text-gray-500 text-xs">{formatDate(u.created_at || u.createdAt)}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-xs ${statusColors[u.status] || 'bg-gray-700 text-gray-400'}`}>
                          {statusLabel(u.status || 'active')}
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
                          <button onClick={() => toggleActive(u)} title={u.status === 'active' ? 'Suspendre' : 'Activer'} className="p-1.5 rounded hover:bg-gray-800 text-gray-400 hover:text-blue-400">
                            {u.status === 'active' || !u.status ? <UserX size={14} /> : <UserCheck size={14} />}
                          </button>
                          <button onClick={() => deleteUser(u)} title="Supprimer" className="p-1.5 rounded hover:bg-gray-800 text-gray-400 hover:text-red-400">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedUser === u.id && (
                      <tr className="bg-[#0A0A15]">
                        <td colSpan={9} className="p-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div><span className="text-gray-500 block text-xs">ID</span>{u.id}</div>
                            <div><span className="text-gray-500 block text-xs">Nom complet</span>{u.name || '—'}</div>
                            <div><span className="text-gray-500 block text-xs">Email</span>{u.email}</div>
                            <div><span className="text-gray-500 block text-xs">Niveau</span>{u.level || '—'}</div>
                            <div><span className="text-gray-500 block text-xs">XP</span>{u.xp ?? 0}</div>
                            <div><span className="text-gray-500 block text-xs">Streak</span>{u.streak ?? 0} jours</div>
                            <div><span className="text-gray-500 block text-xs">Admin</span>{u.is_admin ? 'Oui' : 'Non'}</div>
                            <div><span className="text-gray-500 block text-xs">Inscription</span>{formatDate(u.created_at || u.createdAt)}</div>
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
      `Voulez-vous vraiment annuler l'abonnement de ${sub.user_name || sub.userName || sub.user?.name || 'cet utilisateur'} ?`,
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
                    <td className="py-3 px-3 text-white">{s.user_name || s.userName || s.user?.name || '—'}</td>
                    <td className="py-3 px-3 text-gray-400">{s.plan_name || s.planName || s.plan?.name || '—'}</td>
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
      p.user_name || p.userName || p.user?.name || '',
      p.amount || '',
      p.created_at || p.createdAt || p.date || '',
      p.method || p.payment_method || '',
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
                    <td className="py-3 px-3 text-white">{p.user_name || p.userName || p.user?.name || '—'}</td>
                    <td className="py-3 px-3 text-gray-300 font-medium">{formatCFA(p.amount)}</td>
                    <td className="py-3 px-3 hidden md:table-cell text-gray-500 text-xs">{formatDate(p.created_at || p.createdAt || p.date)}</td>
                    <td className="py-3 px-3 text-gray-400 capitalize">{(p.method || p.payment_method || '—').replace('_', ' ')}</td>
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
      setPlans(plansData?.plans || plansData || [])
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
    { label: 'Micro-lecons', value: contentStats?.microlessons ?? '—', icon: BookOpen },
    { label: 'Lecons', value: contentStats?.lessons ?? '—', icon: Layers },
    { label: 'Exercices', value: contentStats?.exercises ?? '—', icon: Edit3 },
    { label: 'Quiz', value: contentStats?.quizzes ?? '—', icon: HelpCircle },
    { label: 'Badges', value: contentStats?.badges ?? '—', icon: Award },
    { label: 'Flashcards', value: contentStats?.flashcards ?? '—', icon: CreditCard },
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
        <button onClick={() => openPlanModal()} className="flex items-center gap-2 px-4 py-2 bg-[#FF4757] hover:bg-red-600 text-sm rounded-lg">
          <Plus size={14} /> Nouveau Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.length === 0 ? (
          <p className="text-gray-500 text-sm col-span-full text-center py-8">Aucun plan</p>
        ) : plans.map((plan) => (
          <div key={plan.id} className="bg-[#12122A] border border-gray-800 rounded-xl p-5">
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
// 6. REQUESTS / SUPPORT SECTION (Placeholder)
// =============================================================================

const RequestsSection = () => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="w-20 h-20 rounded-full bg-[#12122A] border border-gray-800 flex items-center justify-center mb-6">
      <HeadphonesIcon size={36} className="text-gray-600" />
    </div>
    <h2 className="text-xl font-bold mb-2">Support - Bientot disponible</h2>
    <p className="text-gray-500 text-sm max-w-md">
      Cette section regroupera prochainement la gestion des signalements du forum,
      les sessions de coaching, et les tickets de support.
    </p>
    <div className="flex flex-wrap justify-center gap-3 mt-6">
      {['Signalements Forum', 'Sessions Coach', 'Tickets Support'].map((item) => (
        <span key={item} className="px-3 py-1.5 bg-gray-800 text-gray-500 text-xs rounded-full">
          {item}
        </span>
      ))}
    </div>
  </div>
)

export default AdminDashboard
