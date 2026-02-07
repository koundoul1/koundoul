/**
 * 🏠 NewHome - Page d'accueil moderne et révolutionnaire
 * Design mobile-first avec gradients animés et glassmorphism
 */

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Sparkles, 
  Zap, 
  Target, 
  Star, 
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Flame,
  BookOpen,
  Calculator,
  Brain,
  Trophy,
  Users,
  Award
} from 'lucide-react'

const NewHome = () => {
  const [currentFeature, setCurrentFeature] = useState(0)

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Résolveur IA Révolutionnaire",
      desc: "Résolvez vos problèmes avec l'IA la plus avancée. Mode guidé avec indices progressifs.",
      gradient: "from-blue-500 to-purple-500"
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "450 Micro-Leçons",
      desc: "Capsules de 5-10 min pour maîtriser tous les concepts. Structurées et progressives.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "1800 Exercices Corrigés",
      desc: "900 QCM + 900 Exercices avec corrections détaillées. Tous les chapitres du programme.",
      gradient: "from-pink-500 to-orange-500"
    }
  ]

  // Rotation automatique des features
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const stats = [
    { value: '1800+', label: 'Exercices', icon: '📝', color: 'blue' },
    { value: '450+', label: 'Micro-Leçons', icon: '📚', color: 'purple' },
    { value: '18', label: 'Chapitres', icon: '🎯', color: 'pink' },
    { value: '100%', label: 'Gratuit', icon: '✨', color: 'amber' }
  ]

  const subjects = [
    { 
      name: 'Mathématiques', 
      icon: '📐', 
      gradient: 'from-blue-500 to-cyan-500',
      topics: 'Algèbre, Géométrie, Analyse'
    },
    { 
      name: 'Physique', 
      icon: '⚛️', 
      gradient: 'from-purple-500 to-pink-500',
      topics: 'Mécanique, Électricité, Optique'
    },
    { 
      name: 'Chimie', 
      icon: '🧪', 
      gradient: 'from-pink-500 to-orange-500',
      topics: 'Atomes, Réactions, Organique'
    }
  ]

  const testimonials = [
    {
      name: 'Marie L.',
      level: 'Terminale S',
      text: "Le résolveur IA avec le mode guidé m'a sauvé la vie ! J'ai gagné 3 points en maths !",
      avatar: 'M',
      rating: 5
    },
    {
      name: 'Lucas D.',
      level: 'Première STI2D',
      text: "Les 1800 exercices corrigés sont une mine d'or. C'est comme avoir un prof particulier 24/7.",
      avatar: 'L',
      rating: 5
    },
    {
      name: 'Sarah K.',
      level: 'Seconde',
      text: "Le profil d'apprentissage visuel change tout ! Les graphiques interactifs m'aident vraiment.",
      avatar: 'S',
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-20 pb-32">
        {/* Animated background circles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          {/* Badge Nouveau */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30 mb-6 animate-float">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-semibold">Nouvelle plateforme 2026</span>
          </div>

          {/* Titre principal avec gradient */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
              Réussis en Sciences
            </span>
            <br />
            <span className="text-white">Avec l'IA</span>
          </h1>

          {/* Sous-titre */}
          <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            1800 exercices corrigés + 450 micro-leçons + Explications détaillées. 
            Progressez à votre rythme de la Seconde à la Terminale.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to="/register"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl font-bold shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5" />
              Commencer Gratuitement
            </Link>
            <Link
              to="/exercices"
              className="px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl font-bold hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Target className="w-5 h-5" />
              Voir les Exercices
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {stats.map((stat, index) => {
              const gradientClasses = {
                blue: 'bg-gradient-to-r from-blue-400 to-blue-600',
                purple: 'bg-gradient-to-r from-purple-400 to-purple-600',
                pink: 'bg-gradient-to-r from-pink-400 to-pink-600',
                amber: 'bg-gradient-to-r from-amber-400 to-amber-600'
              }
              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:scale-105"
                >
                  <div className="text-4xl mb-2">{stat.icon}</div>
                  <div className={`text-3xl font-black ${gradientClasses[stat.color]} bg-clip-text text-transparent mb-1`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400 font-medium">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Carousel */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Fonctionnalités Révolutionnaires
              </span>
            </h2>
            <p className="text-gray-400 text-lg">Tout ce dont vous avez besoin pour réussir</p>
          </div>

          <div className="relative h-64 sm:h-80">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`
                  absolute inset-0 transition-all duration-500
                  ${index === currentFeature 
                    ? 'opacity-100 scale-100 z-10' 
                    : 'opacity-0 scale-95 z-0'
                  }
                `}
              >
                <div className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 border border-white/10 h-full flex flex-col items-center justify-center text-center`}>
                  <div className={`w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-2xl`}>
                    <div className="text-white">{feature.icon}</div>
                  </div>
                  <h3 className="text-2xl font-black mb-3">{feature.title}</h3>
                  <p className="text-gray-400 text-lg">{feature.desc}</p>
                </div>
              </div>
            ))}

            {/* Dots indicator */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFeature(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentFeature ? 'bg-purple-500 w-8' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Subjects Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Trois Matières, Un Objectif
              </span>
            </h2>
            <p className="text-gray-400 text-lg">Mathématiques, Physique et Chimie au programme</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {subjects.map((subject, index) => (
              <Link
                key={index}
                to="/courses"
                className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 group`}
              >
                <div className={`text-6xl mb-4`}>{subject.icon}</div>
                <h3 className="text-2xl font-black mb-2 group-hover:text-purple-400 transition-colors">
                  {subject.name}
                </h3>
                <p className="text-gray-400 mb-4">{subject.topics}</p>
                <div className="flex items-center text-purple-400 font-semibold group-hover:translate-x-2 transition-transform">
                  <span>Explorer</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              <span className="bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
                Ils Ont Réussi Avec Koundoul
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 border border-white/10 hover:border-pink-500/50 transition-all duration-300"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold">{testimonial.name}</div>
                    <div className="text-sm text-gray-400">{testimonial.level}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-pink-500/20 animate-pulse"></div>
            <div className="relative z-10">
              <Flame className="w-16 h-16 mx-auto mb-6 text-yellow-400 animate-pulse" />
              <h2 className="text-4xl sm:text-5xl font-black mb-4">
                Prêt à Réussir ?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Rejoignez des milliers d'élèves qui progressent chaque jour
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-10 py-5 bg-white text-purple-600 rounded-2xl font-black text-lg hover:scale-105 transition-all duration-300 shadow-2xl"
              >
                <Zap className="w-6 h-6" />
                Commencer Maintenant
                <ArrowRight className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Minimal */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center text-gray-400">
          <p>© 2026 Koundoul. Fait avec ❤️ pour votre réussite.</p>
        </div>
      </footer>
    </div>
  )
}

export default NewHome

