/**
 * 🧭 Header Koundoul
 * Barre de navigation principale avec menu transversal
 */

import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LanguageSwitcher from '../LanguageSwitcher'
import { 
  Menu, 
  X, 
  User, 
  Settings, 
  LogOut, 
  Bell,
  Search,
  Brain,
  BookOpen,
  Home,
  Award,
  MessageSquare,
  Repeat,
  Calculator,
  Globe,
  Target,
  Lightbulb,
  Sparkles,
  Trophy,
  ListChecks
} from 'lucide-react'

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const navigate = useNavigate()
  const searchRef = useRef(null)

  // Fermer les résultats quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsProfileOpen(false)
  }

  // Fonction de recherche
  const handleSearch = (query) => {
    setSearchQuery(query)
    
    if (query.length < 2) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    // Rechercher dans les éléments de navigation
    const results = [
      ...navigation.filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase())
      ).map(item => ({ ...item, type: 'navigation' })),
      ...advancedFeatures.filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase())
      ).map(item => ({ ...item, type: 'feature' }))
    ]

    setSearchResults(results)
    setShowSearchResults(results.length > 0)
  }

  const handleResultClick = (href) => {
    navigate(href)
    setSearchQuery('')
    setShowSearchResults(false)
    setIsMenuOpen(false)
  }

  const navigation = [
    { name: 'Accueil', href: '/', icon: Home },
    { name: 'Cours', href: '/courses', icon: BookOpen },
    { name: 'Résolveur', href: '/solver', icon: Calculator },
    { name: 'Coach', href: '/coach', icon: Brain },
    { name: 'Quiz', href: '/quiz', icon: Brain },
    { name: 'Exercices', href: '/exercices', icon: ListChecks },
    { name: 'Challenge', href: '/challenge', icon: Trophy },
    { name: 'Révisions', href: '/flashcards', icon: Repeat },
    { name: 'Forum', href: '/forum', icon: MessageSquare },
    { name: 'Badges', href: '/badges', icon: Award },
    { name: 'Ressources', href: '/resources', icon: BookOpen },
  ]

  // Nouvelles fonctionnalités révolutionnaires
  const advancedFeatures = [
    { name: 'Visualisations', href: '/visualizations', icon: Globe },
    { name: 'Micro-Leçons', href: '/micro-lessons', icon: BookOpen },
    { name: 'Défi', href: '/defi', icon: Target },
    { name: 'Pourquoi ?', href: '/why-it-works', icon: Lightbulb },
    { name: 'Avancées', href: '/advanced-features', icon: Sparkles },
    { name: 'Mon Profil', href: '/profile', icon: User },
  ]

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Premier menu - Navigation principale */}
        <div className="flex justify-between items-center h-16 min-h-[4rem]">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/icons/icon.svg" 
                alt="Koundoul" 
                className="w-10 h-10 rounded-lg"
              />
              <span className="text-xl font-bold text-gray-900">Koundoul</span>
            </Link>
          </div>

          {/* Navigation Desktop - Premier menu */}
          <nav className="hidden lg:flex space-x-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center space-x-1 text-gray-800 hover:text-blue-600 px-2 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Actions utilisateur */}
          <div className="flex items-center space-x-4">
            {/* Bouton Rechercher */}
            <div className="hidden md:block relative" ref={searchRef}>
              <button
                onClick={() => setShowSearchResults(!showSearchResults)}
                className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:text-blue-600 hover:border-blue-500 transition-colors"
              >
                <Search className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Rechercher</span>
              </button>
              
              {/* Fenêtre de recherche */}
              {showSearchResults && (
                <div className="absolute top-full right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                  <div className="p-4">
                    <div className="mb-3 flex items-center">
                      <Search className="h-5 w-5 text-gray-400 mr-2" />
                      <input
                        type="text"
                        placeholder="Rechercher une page..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        autoFocus
                      />
                    </div>
                    
                    {/* Résultats */}
                    {searchQuery.length >= 2 && searchResults.length > 0 && (
                      <div className="max-h-80 overflow-y-auto">
                        {searchResults.map((result, index) => (
                          <div
                            key={index}
                            onClick={() => handleResultClick(result.href)}
                            className="px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors rounded-md"
                          >
                            <div className="flex items-center">
                              <result.icon className="h-4 w-4 mr-2 text-blue-600" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{result.name}</div>
                                <div className="text-xs text-gray-500">
                                  {result.type === 'navigation' ? 'Navigation' : 'Fonctionnalité'}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {searchQuery.length >= 2 && searchResults.length === 0 && (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        Aucun résultat trouvé
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <button className="p-2 text-gray-600 hover:text-gray-900 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/* Menu Profil */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {user?.username || 'Mon Profil'}
                </span>
              </button>

              {/* Dropdown Profil */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <Link
                    to="/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Mon Profil
                  </Link>
                  <Link
                    to="/parent-dashboard"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Espace Parents
                  </Link>
                  <div className="border-t border-gray-200 my-2"></div>
                  <div className="px-4 py-2">
                    <LanguageSwitcher />
                  </div>
                  <div className="border-t border-gray-200 my-2"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Menu mobile */}
          <div className="lg:hidden flex items-center space-x-3">
            {/* Bouton Rechercher Mobile */}
            <button
              onClick={() => setShowSearchResults(!showSearchResults)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Search className="h-5 w-5" />
            </button>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Deuxième menu - Fonctionnalités avancées */}
        <div className="hidden lg:block border-t border-gray-200 bg-gray-50">
          <div className="flex justify-center items-center h-12 px-4">
            <nav className="flex space-x-6">
              {advancedFeatures.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center space-x-1 text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap border-b-2 border-transparent hover:border-orange-400"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Fenêtre de recherche mobile */}
        {showSearchResults && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="p-4">
              <div className="mb-3 flex items-center">
                <Search className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Rechercher une page..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              
              {/* Résultats */}
              {searchQuery.length >= 2 && searchResults.length > 0 && (
                <div className="max-h-96 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      onClick={() => handleResultClick(result.href)}
                      className="px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors rounded-md"
                    >
                      <div className="flex items-center">
                        <result.icon className="h-4 w-4 mr-2 text-blue-600" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{result.name}</div>
                          <div className="text-xs text-gray-500">
                            {result.type === 'navigation' ? 'Navigation' : 'Fonctionnalité'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {searchQuery.length >= 2 && searchResults.length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Aucun résultat trouvé
                </div>
              )}
            </div>
          </div>
        )}

        {/* Menu mobile */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <nav className="py-4 space-y-1 px-4">
              {/* Navigation principale */}
              <div className="mb-4">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                  Navigation
                </div>
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center space-x-3 text-gray-800 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
              
              {/* Séparateur */}
              <div className="border-t border-gray-200 my-4"></div>
              
              {/* Nouvelles fonctionnalités */}
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                  Fonctionnalités
                </div>
                {advancedFeatures.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center space-x-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header