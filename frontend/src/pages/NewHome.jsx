import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, BookOpen, Star, Award, 
  ArrowRight, Heart, Shield, Users, Crown
} from 'lucide-react';

const NewHome = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: '🧠',
      title: "IA Personnalisée",
      description: "S'adapte à ton niveau et ton style d'apprentissage",
      gradient: "from-purple-500 to-pink-500",
      stats: "4 profils cognitifs"
    },
    {
      icon: '⚡',
      title: "Progression Rapide",
      description: "Des résultats visibles en 7 jours",
      gradient: "from-amber-500 to-orange-500",
      stats: "Résultats garantis"
    },
    {
      icon: '🏆',
      title: "Gamification",
      description: "Apprendre en s'amusant avec des badges et défis",
      gradient: "from-blue-500 to-cyan-500",
      stats: "50+ badges à débloquer"
    }
  ];

  const subjects = [
    { name: "Maths", icon: "📐", gradient: "from-blue-500 to-blue-600", count: "600+" },
    { name: "Physique", icon: "⚛️", gradient: "from-purple-500 to-purple-600", count: "600+" },
    { name: "Chimie", icon: "🧪", gradient: "from-emerald-500 to-emerald-600", count: "600+" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated Background Circles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          
          {/* Badge Nouveau */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30 backdrop-blur-sm mb-8 animate-bounce">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium">Nouvelle plateforme 2026</span>
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </div>

          {/* Titre Principal avec Gradient Animé */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient" style={{
              backgroundSize: '200% 200%'
            }}>
              Réussis en Sciences
            </span>
            <br />
            <span className="text-white">Avec l'IA</span>
          </h1>

          <p className="text-xl sm:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto font-light">
            1800 exercices + IA personnalisée + 450 micro-leçons
            <br />
            <span className="text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text font-semibold">
              100% Gratuit · De la 2nde à la Terminale
            </span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              to="/register"
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl font-bold text-lg shadow-2xl shadow-blue-500/50 hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105"
            >
              <span className="flex items-center justify-center gap-2">
                Commencer Gratuitement
                <span className="group-hover:translate-x-1 transition-transform">🚀</span>
              </span>
            </Link>

            <Link
              to="/exercices"
              className="group px-8 py-4 bg-white/10 backdrop-blur-sm rounded-2xl font-semibold text-lg border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              <span className="flex items-center justify-center gap-2">
                Voir les 1800 Exercices
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { icon: <BookOpen className="w-6 h-6" />, value: "1,800+", label: "Exercices" },
              { icon: <Sparkles className="w-6 h-6" />, value: "450+", label: "Micro-Leçons" },
              { icon: <Award className="w-6 h-6" />, value: "18", label: "Chapitres" },
              { icon: <Heart className="w-6 h-6" />, value: "100%", label: "Gratuit" }
            ].map((stat, idx) => (
              <div 
                key={idx}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:scale-105"
              >
                <div className="text-purple-400 mb-2 flex justify-center">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white/50 rounded-full animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Pourquoi Koundoul ?
              </span>
            </h2>
            <p className="text-xl text-gray-400">Une expérience d'apprentissage révolutionnaire</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className={`relative group cursor-pointer transition-all duration-500 ${
                  activeFeature === idx ? 'scale-105' : 'scale-100 opacity-70'
                }`}
                onClick={() => setActiveFeature(idx)}
              >
                <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 border border-white/10 hover:border-purple-500/50 transition-all duration-300 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                  
                  <div className="relative z-10">
                    <div className="text-5xl mb-6">{feature.icon}</div>
                    <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-gray-400 mb-4">{feature.description}</p>
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <span className="text-green-400">✓</span>
                      <span className="text-green-400">{feature.stats}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Indicators */}
          <div className="flex justify-center gap-2">
            {features.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveFeature(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeFeature === idx 
                    ? 'w-8 bg-gradient-to-r from-blue-500 to-purple-500' 
                    : 'w-2 bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Subjects Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              Trois Matières, Un Objectif :
              <span className="block bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                Ta Réussite
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {subjects.map((subject, idx) => (
              <Link
                key={idx}
                to="/courses"
                className="group relative overflow-hidden rounded-3xl transition-all duration-500 hover:scale-105"
              >
                <div className={`bg-gradient-to-br ${subject.gradient} p-12 text-center relative overflow-hidden`}>
                  <div className="absolute inset-0 opacity-10" 
                       style={{
                         backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                         backgroundSize: '30px 30px'
                       }}>
                  </div>

                  <div className="relative z-10">
                    <div className="text-7xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                      {subject.icon}
                    </div>
                    <h3 className="text-3xl font-black mb-3">{subject.name}</h3>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
                      <Star className="w-4 h-4" />
                      <span className="font-bold">{subject.count} exercices</span>
                    </div>
                    
                    <div className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      Commencer
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-3xl p-12 border border-blue-500/30 backdrop-blur-sm">
            <div className="text-6xl mb-6 animate-pulse">🔥</div>
            
            <h2 className="text-4xl sm:text-5xl font-black mb-6">
              Prêt à Exceller
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                En Sciences ?
              </span>
            </h2>

            <p className="text-xl text-gray-300 mb-8">
              Rejoins des milliers d'élèves qui progressent chaque jour
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105"
              >
                <span className="flex items-center justify-center gap-2">
                  Créer Mon Compte Gratuit
                  <span className="group-hover:rotate-12 transition-transform">⚡</span>
                </span>
              </Link>

              <Link
                to="/login"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm rounded-2xl font-semibold text-lg border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                Se Connecter
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span>100% Gratuit</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>Des milliers d'élèves</span>
              </div>
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-purple-400" />
                <span>Résultats garantis</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-2xl font-black mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Koundoul
          </div>
          <p className="text-gray-400 mb-6">
            La plateforme d'apprentissage scientifique alimentée par l'IA
          </p>
          <div className="mt-8 text-sm text-gray-600">
            © 2026 Koundoul · Fait avec <Heart className="w-4 h-4 inline text-red-500" /> en France
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NewHome;
