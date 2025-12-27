/**
 * 👨‍💼 Dashboard Administrateur
 * Gestion des utilisateurs, abonnements et paiements
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  Shield, 
  Loader2,
  Search,
  Edit,
  CheckCircle,
  XCircle,
  Calendar
} from 'lucide-react'

const AdminDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  
  // Dashboard stats
  const [stats, setStats] = useState(null)
  
  // Users
  const [users, setUsers] = useState([])
  const [usersPage, setUsersPage] = useState(1)
  const [usersSearch, setUsersSearch] = useState('')
  
  // Subscriptions
  const [subscriptions, setSubscriptions] = useState([])
  const [subscriptionsPage, setSubscriptionsPage] = useState(1)
  
  // Payments
  const [payments, setPayments] = useState([])
  const [paymentsPage, setPaymentsPage] = useState(1)

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/')
      return
    }
    loadDashboard()
  }, [user, navigate])

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers()
    } else if (activeTab === 'subscriptions') {
      loadSubscriptions()
    } else if (activeTab === 'payments') {
      loadPayments()
    }
  }, [activeTab, usersPage, subscriptionsPage, paymentsPage, usersSearch])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const response = await api.admin.getDashboard()
      if (response.success) {
        setStats(response.data)
      }
    } catch (error) {
      console.error('Erreur chargement dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const response = await api.admin.getUsers({
        page: usersPage,
        limit: 20,
        search: usersSearch
      })
      if (response.success) {
        setUsers(response.data)
      }
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error)
    }
  }

  const loadSubscriptions = async () => {
    try {
      const response = await api.admin.getSubscriptions({
        page: subscriptionsPage,
        limit: 20
      })
      if (response.success) {
        setSubscriptions(response.data)
      }
    } catch (error) {
      console.error('Erreur chargement abonnements:', error)
    }
  }

  const loadPayments = async () => {
    try {
      const response = await api.admin.getPayments({
        page: paymentsPage,
        limit: 20
      })
      if (response.success) {
        setPayments(response.data)
      }
    } catch (error) {
      console.error('Erreur chargement paiements:', error)
    }
  }

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await api.admin.updateUser(userId, {
        isActive: !currentStatus
      })
      loadUsers()
    } catch (error) {
      console.error('Erreur mise à jour utilisateur:', error)
    }
  }

  const formatPrice = (amount, currency = 'xof') => {
    if (currency === 'xof') {
      return `${(amount / 1).toLocaleString('fr-FR')} FCFA`
    }
    return `${(amount / 100).toFixed(2)} €`
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              Administration
            </h1>
            <p className="text-gray-800 font-medium mt-1">
              Gestion des utilisateurs, abonnements et paiements
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'dashboard'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Tableau de bord
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Utilisateurs
              </button>
              <button
                onClick={() => setActiveTab('subscriptions')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'subscriptions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Abonnements
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'payments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Paiements
              </button>
              <button
                onClick={() => setActiveTab('plans')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'plans'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Plans d'abonnement
              </button>
            </nav>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : stats ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Utilisateurs totaux</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.users?.total || 0}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {stats.users?.active || 0} actifs
                        </p>
                      </div>
                      <Users className="h-12 w-12 text-blue-500" />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Abonnements</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">
                          {stats.subscriptions?.active || 0}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {stats.subscriptions?.total || 0} au total
                        </p>
                      </div>
                      <CreditCard className="h-12 w-12 text-green-500" />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Revenus totaux</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">
                          {formatPrice(stats.payments?.revenue || 0)}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {stats.payments?.total || 0} paiements
                        </p>
                      </div>
                      <TrendingUp className="h-12 w-12 text-purple-500" />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Taux de conversion</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">
                          {stats.users?.total > 0 
                            ? Math.round((stats.subscriptions?.active / stats.users?.total) * 100) 
                            : 0}%
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Utilisateurs premium
                        </p>
                      </div>
                      <TrendingUp className="h-12 w-12 text-orange-500" />
                    </div>
                  </div>
                </div>

                {/* Statistiques supplémentaires */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Nouveaux utilisateurs (7j)</span>
                        <span className="font-medium text-gray-900">-</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Abonnements (30j)</span>
                        <span className="font-medium text-gray-900">-</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Revenus (30j)</span>
                        <span className="font-medium text-gray-900">-</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => setActiveTab('users')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        Gérer les utilisateurs
                      </button>
                      <button
                        onClick={() => setActiveTab('plans')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        Gérer les plans d'abonnement
                      </button>
                      <button
                        onClick={() => setActiveTab('subscriptions')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        Voir tous les abonnements
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <p className="text-gray-500">Aucune donnée disponible</p>
                <button
                  onClick={loadDashboard}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Recharger
                </button>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Utilisateurs</h2>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      value={usersSearch}
                      onChange={(e) => {
                        setUsersSearch(e.target.value)
                        setUsersPage(1)
                      }}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inscription</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.users && users.users.length > 0 ? (
                    users.users.map((u) => (
                      <tr key={u.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{u.username}</div>
                        {u.firstName && u.lastName && (
                          <div className="text-sm text-gray-500">{u.firstName} {u.lastName}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          u.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {u.isActive ? 'Actif' : 'Inactif'}
                        </span>
                        {u.isAdmin && (
                          <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            Admin
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(u.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleUserStatus(u.id, u.isActive)}
                          className={`px-3 py-1 text-xs font-medium rounded ${
                            u.isActive
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {u.isActive ? 'Désactiver' : 'Activer'}
                        </button>
                      </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        Aucun utilisateur trouvé
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {users.pagination && (
              <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Page {users.pagination.page} sur {users.pagination.totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                    disabled={users.pagination.page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => setUsersPage(p => p + 1)}
                    disabled={users.pagination.page >= users.pagination.totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Subscriptions Tab */}
        {activeTab === 'subscriptions' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Abonnements</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date de fin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {subscriptions.subscriptions && subscriptions.subscriptions.length > 0 ? (
                    subscriptions.subscriptions.map((sub) => (
                    <tr key={sub.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{sub.user?.username || sub.user?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{sub.plan?.name}</div>
                        <div className="text-sm text-gray-500">{formatPrice(sub.plan?.price, sub.plan?.currency)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          sub.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          sub.status === 'EXPIRED' ? 'bg-red-100 text-red-800' :
                          sub.status === 'CANCELLED' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(sub.endDate)}
                      </td>
                    </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                        Aucun abonnement trouvé
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Paiements</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Méthode</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payments.payments && payments.payments.length > 0 ? (
                    payments.payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{payment.user?.username || payment.user?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {formatPrice(payment.amount, payment.currency)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.paymentType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          payment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          payment.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(payment.createdAt)}
                      </td>
                    </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        Aucun paiement trouvé
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Plans Tab */}
        {activeTab === 'plans' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Plans d'abonnement</h2>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                Créer un plan
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Plan Gratuit */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Gratuit</h3>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Actif
                    </span>
                  </div>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900">0</span>
                    <span className="text-gray-600 ml-2">FCFA</span>
                  </div>
                  <ul className="space-y-2 mb-6 text-sm text-gray-600">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Accès aux cours gratuits
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Exercices limités
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Forum communautaire
                    </li>
                  </ul>
                  <button className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                    Modifier
                  </button>
                </div>

                {/* Plan Premium */}
                <div className="border-2 border-blue-500 rounded-lg p-6 relative">
                  <div className="absolute top-4 right-4 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                    Populaire
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Premium</h3>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Actif
                    </span>
                  </div>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900">5 000</span>
                    <span className="text-gray-600 ml-2">FCFA/mois</span>
                  </div>
                  <ul className="space-y-2 mb-6 text-sm text-gray-600">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Tous les cours
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Exercices illimités
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Coach IA
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Support prioritaire
                    </li>
                  </ul>
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                    Modifier
                  </button>
                </div>

                {/* Plan Pro */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Pro</h3>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Actif
                    </span>
                  </div>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900">10 000</span>
                    <span className="text-gray-600 ml-2">FCFA/mois</span>
                  </div>
                  <ul className="space-y-2 mb-6 text-sm text-gray-600">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Tout Premium
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Sessions privées
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Analyses avancées
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Accès API
                    </li>
                  </ul>
                  <button className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                    Modifier
                  </button>
                </div>
              </div>

              <div className="mt-6 text-center text-gray-500 text-sm">
                Gérer les plans d'abonnement, leurs prix et fonctionnalités
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard

