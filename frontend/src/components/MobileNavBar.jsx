import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Brain, Trophy, User, Sparkles, Search, Bell } from 'lucide-react';

const MobileNavBar = () => {
  const location = useLocation();

  const navItems = [
    { 
      path: '/', 
      icon: Home, 
      label: 'Accueil',
      color: 'blue'
    },
    { 
      path: '/courses', 
      icon: BookOpen, 
      label: 'Cours',
      color: 'purple'
    },
    { 
      path: '/solver', 
      icon: Brain, 
      label: 'IA',
      color: 'pink',
      special: true
    },
    { 
      path: '/challenge', 
      icon: Trophy, 
      label: 'Défi',
      color: 'amber'
    },
    { 
      path: '/profile', 
      icon: User, 
      label: 'Profil',
      color: 'green'
    }
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path);

  const getColorClasses = (color, active) => {
    const colors = {
      blue: {
        bg: 'bg-blue-500/20',
        border: 'border-blue-500/40',
        text: 'text-blue-400'
      },
      purple: {
        bg: 'bg-purple-500/20',
        border: 'border-purple-500/40',
        text: 'text-purple-400'
      },
      pink: {
        bg: 'bg-pink-500/20',
        border: 'border-pink-500/40',
        text: 'text-pink-400'
      },
      amber: {
        bg: 'bg-amber-500/20',
        border: 'border-amber-500/40',
        text: 'text-amber-400'
      },
      green: {
        bg: 'bg-green-500/20',
        border: 'border-green-500/40',
        text: 'text-green-400'
      }
    };
    return colors[color] || colors.blue;
  };

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <div className="bg-gray-900/95 backdrop-blur-xl border-t border-white/10 shadow-2xl">
          <div className="max-w-md mx-auto px-2 py-2">
            <div className="flex items-center justify-around">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                const colorClasses = getColorClasses(item.color, active);
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 ${
                      active ? 'scale-110' : 'scale-100'
                    } ${item.special ? 'transform -translate-y-6' : ''}`}
                  >
                    {item.special ? (
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
                        <div className="relative w-14 h-14 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-2xl">
                          <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className={`relative w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 ${
                          active 
                            ? `${colorClasses.bg} border ${colorClasses.border}` 
                            : 'hover:bg-white/5'
                        }`}>
                          <Icon 
                            className={`w-6 h-6 transition-colors duration-300 ${
                              active ? colorClasses.text : 'text-gray-400'
                            }`}
                            strokeWidth={active ? 2.5 : 2}
                          />
                        </div>
                        <span className={`text-xs mt-1 font-medium transition-all duration-300 ${
                          active ? colorClasses.text : 'text-gray-500'
                        }`}>
                          {item.label}
                        </span>
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Desktop Top Navigation */}
      <header className="hidden lg:block fixed top-0 left-0 right-0 z-50">
        <div className="bg-gray-900/95 backdrop-blur-xl border-b border-white/10 shadow-xl">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Koundoul
                </span>
              </Link>

              <nav className="flex items-center gap-2">
                {navItems.filter(item => !item.special).map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  const colorClasses = getColorClasses(item.color, active);
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                        active 
                          ? `${colorClasses.bg} border ${colorClasses.border} ${colorClasses.text}` 
                          : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
                
                {/* Bouton IA spécial */}
                <Link
                  to="/solver"
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all duration-300 ${
                    isActive('/solver')
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white ring-2 ring-pink-400'
                      : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:scale-105'
                  }`}
                >
                  <Brain className="w-5 h-5" />
                  <span>IA</span>
                  <Sparkles className="w-4 h-4" />
                </Link>
              </nav>

              <div className="flex items-center gap-3">
                <button className="relative w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-all duration-300">
                  <Search className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                </button>
                
                <button className="relative w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-all duration-300">
                  <Bell className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                </button>

                <Link 
                  to="/profile"
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    isActive('/profile')
                      ? 'bg-green-500/20 border border-green-500/40 text-green-400'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span>Profil</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Spacers */}
      <div className="h-16 lg:h-20"></div>
      <div className="h-20 lg:hidden"></div>
    </>
  );
};

export default MobileNavBar;
